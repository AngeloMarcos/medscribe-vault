
-- ============================================================
-- SECURITY FIXES
-- ============================================================

-- 1) PRIVATE SCHEMA FOR SECURITY DEFINER HELPERS ----------------
CREATE SCHEMA IF NOT EXISTS private;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

-- Move SECURITY DEFINER logic into private schema
CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id=_user_id AND role=_role)
$$;

CREATE OR REPLACE FUNCTION private.has_medical_role(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id=_user_id AND role IN ('admin','medico','enfermeiro'))
$$;

CREATE OR REPLACE FUNCTION private.has_nursing_role(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id=_user_id AND role IN ('admin','enfermeiro','tecnico_enfermagem'))
$$;

CREATE OR REPLACE FUNCTION private.has_admin_access(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id=_user_id AND role='admin')
$$;

CREATE OR REPLACE FUNCTION private.user_belongs_to_tenant(_user_id uuid, _tenant_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT EXISTS(SELECT 1 FROM public.tenant_users WHERE user_id=_user_id AND tenant_id=_tenant_id AND is_active=true)
$$;

CREATE OR REPLACE FUNCTION private.is_tenant_owner(_user_id uuid, _tenant_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT EXISTS(SELECT 1 FROM public.tenant_users WHERE user_id=_user_id AND tenant_id=_tenant_id AND is_owner=true AND is_active=true)
$$;

CREATE OR REPLACE FUNCTION private.get_user_tenant_id(_user_id uuid)
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT tenant_id FROM public.tenant_users WHERE user_id=_user_id AND is_active=true LIMIT 1
$$;

CREATE OR REPLACE FUNCTION private.has_permission(_user_id uuid, _permission text)
RETURNS boolean LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$
DECLARE user_role public.app_role;
BEGIN
  SELECT role INTO user_role FROM public.user_roles WHERE user_id=_user_id LIMIT 1;
  IF user_role='admin' THEN RETURN true; END IF;
  RETURN CASE _permission
    WHEN 'prescribe' THEN user_role='medico'
    WHEN 'view_patients' THEN user_role IN ('medico','enfermeiro','recepcao','tecnico_enfermagem')
    WHEN 'clinical_docs' THEN user_role IN ('medico','enfermeiro')
    WHEN 'request_exams' THEN user_role='medico'
    WHEN 'administer_meds' THEN user_role IN ('enfermeiro','tecnico_enfermagem')
    WHEN 'view_prescriptions' THEN user_role IN ('medico','enfermeiro','farmaceutico','tecnico_enfermagem')
    WHEN 'vital_signs' THEN user_role IN ('enfermeiro','tecnico_enfermagem')
    WHEN 'nursing_notes' THEN user_role IN ('enfermeiro','tecnico_enfermagem')
    WHEN 'dispense' THEN user_role='farmaceutico'
    WHEN 'stock_control' THEN user_role='farmaceutico'
    WHEN 'patient_registration' THEN user_role='recepcao'
    WHEN 'scheduling' THEN user_role IN ('recepcao','enfermeiro')
    ELSE false
  END;
END; $$;

CREATE OR REPLACE FUNCTION private.get_user_effective_permissions(_user_id uuid, _tenant_id uuid)
RETURNS text[] LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$
DECLARE base_permissions text[]; granted text[]; denied text[]; user_role public.app_role;
BEGIN
  SELECT role INTO user_role FROM public.user_roles WHERE user_id=_user_id LIMIT 1;
  IF user_role='admin' THEN RETURN ARRAY['all']; END IF;
  base_permissions := CASE user_role
    WHEN 'medico' THEN ARRAY['prescribe','view_patients','clinical_docs','request_exams','view_prescriptions']
    WHEN 'enfermeiro' THEN ARRAY['administer_meds','view_prescriptions','vital_signs','nursing_notes','view_patients','scheduling']
    WHEN 'farmaceutico' THEN ARRAY['dispense','view_prescriptions','stock_control']
    WHEN 'tecnico_enfermagem' THEN ARRAY['administer_meds','vital_signs','view_prescriptions','view_patients']
    WHEN 'recepcao' THEN ARRAY['patient_registration','scheduling','view_patients']
    ELSE ARRAY[]::text[]
  END;
  SELECT COALESCE(tup.granted_permissions, ARRAY[]::text[]), COALESCE(tup.denied_permissions, ARRAY[]::text[])
    INTO granted, denied
    FROM public.tenant_user_permissions tup
    WHERE tup.user_id=_user_id AND tup.tenant_id=_tenant_id;
  IF granted IS NULL THEN granted := ARRAY[]::text[]; END IF;
  IF denied IS NULL THEN denied := ARRAY[]::text[]; END IF;
  RETURN array(SELECT DISTINCT unnest FROM unnest(base_permissions||granted) WHERE unnest != ALL(denied));
END; $$;

CREATE OR REPLACE FUNCTION private.has_tenant_permission(_user_id uuid, _tenant_id uuid, _permission text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT 'all' = ANY(private.get_user_effective_permissions(_user_id,_tenant_id))
      OR _permission = ANY(private.get_user_effective_permissions(_user_id,_tenant_id))
$$;

-- Grants on private functions
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA private FROM PUBLIC;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA private TO authenticated, service_role;

-- 2) REPLACE PUBLIC HELPERS WITH SECURITY INVOKER WRAPPERS -------
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY INVOKER SET search_path=public AS $$ SELECT private.has_role(_user_id,_role) $$;

CREATE OR REPLACE FUNCTION public.has_medical_role(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY INVOKER SET search_path=public AS $$ SELECT private.has_medical_role(_user_id) $$;

CREATE OR REPLACE FUNCTION public.has_nursing_role(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY INVOKER SET search_path=public AS $$ SELECT private.has_nursing_role(_user_id) $$;

CREATE OR REPLACE FUNCTION public.has_admin_access(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY INVOKER SET search_path=public AS $$ SELECT private.has_admin_access(_user_id) $$;

CREATE OR REPLACE FUNCTION public.user_belongs_to_tenant(_user_id uuid, _tenant_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY INVOKER SET search_path=public AS $$ SELECT private.user_belongs_to_tenant(_user_id,_tenant_id) $$;

CREATE OR REPLACE FUNCTION public.is_tenant_owner(_user_id uuid, _tenant_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY INVOKER SET search_path=public AS $$ SELECT private.is_tenant_owner(_user_id,_tenant_id) $$;

CREATE OR REPLACE FUNCTION public.get_user_tenant_id(_user_id uuid)
RETURNS uuid LANGUAGE sql STABLE SECURITY INVOKER SET search_path=public AS $$ SELECT private.get_user_tenant_id(_user_id) $$;

CREATE OR REPLACE FUNCTION public.has_permission(_user_id uuid, _permission text)
RETURNS boolean LANGUAGE sql STABLE SECURITY INVOKER SET search_path=public AS $$ SELECT private.has_permission(_user_id,_permission) $$;

CREATE OR REPLACE FUNCTION public.has_tenant_permission(_user_id uuid, _tenant_id uuid, _permission text)
RETURNS boolean LANGUAGE sql STABLE SECURITY INVOKER SET search_path=public AS $$ SELECT private.has_tenant_permission(_user_id,_tenant_id,_permission) $$;

CREATE OR REPLACE FUNCTION public.get_user_effective_permissions(_user_id uuid, _tenant_id uuid)
RETURNS text[] LANGUAGE sql STABLE SECURITY INVOKER SET search_path=public AS $$ SELECT private.get_user_effective_permissions(_user_id,_tenant_id) $$;

-- 3) TRIGGER-ONLY SECURITY DEFINER FUNCTIONS: revoke user grants
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.gerar_numero_consulta() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_updated_at() FROM PUBLIC, anon, authenticated;

-- 4) CATALOG TABLES: restrict SELECT to authenticated -----------
DROP POLICY IF EXISTS "Authenticated can read exames_catalogo" ON public.exames_catalogo;
CREATE POLICY "Authenticated can read exames_catalogo" ON public.exames_catalogo
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated can read medicamentos_remume" ON public.medicamentos_remume;
CREATE POLICY "Authenticated can read medicamentos_remume" ON public.medicamentos_remume
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated can read procedimentos" ON public.procedimentos_odonto;
CREATE POLICY "Authenticated can read procedimentos" ON public.procedimentos_odonto
  FOR SELECT TO authenticated USING (true);

-- 5) profissionais: tenant-scoped SELECT ------------------------
DROP POLICY IF EXISTS "All staff can view profissionais" ON public.profissionais;
CREATE POLICY "Staff can view same-tenant profissionais" ON public.profissionais
  FOR SELECT TO authenticated
  USING (
    public.has_admin_access(auth.uid())
    OR user_id = auth.uid()
    OR EXISTS (
      SELECT 1
      FROM public.tenant_users tu_me
      JOIN public.tenant_users tu_prof
        ON tu_prof.tenant_id = tu_me.tenant_id
      WHERE tu_me.user_id = auth.uid()
        AND tu_me.is_active = true
        AND tu_prof.is_active = true
        AND tu_prof.user_id = profissionais.user_id
    )
  );

-- 6) receita_itens: tenant isolation via parent receitas --------
DROP POLICY IF EXISTS "Medical staff can view receita_itens" ON public.receita_itens;
DROP POLICY IF EXISTS "Medical staff can insert receita_itens" ON public.receita_itens;
DROP POLICY IF EXISTS "Medical staff can update receita_itens" ON public.receita_itens;
DROP POLICY IF EXISTS "Medical staff can delete receita_itens" ON public.receita_itens;

CREATE POLICY "Medical staff can view receita_itens" ON public.receita_itens
  FOR SELECT TO authenticated
  USING (
    public.has_medical_role(auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.receitas r
      WHERE r.id = receita_itens.receita_id
        AND (r.tenant_id IS NULL OR public.user_belongs_to_tenant(auth.uid(), r.tenant_id))
    )
  );
CREATE POLICY "Medical staff can insert receita_itens" ON public.receita_itens
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_medical_role(auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.receitas r
      WHERE r.id = receita_itens.receita_id
        AND (r.tenant_id IS NULL OR public.user_belongs_to_tenant(auth.uid(), r.tenant_id))
    )
  );
CREATE POLICY "Medical staff can update receita_itens" ON public.receita_itens
  FOR UPDATE TO authenticated
  USING (
    public.has_medical_role(auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.receitas r
      WHERE r.id = receita_itens.receita_id
        AND (r.tenant_id IS NULL OR public.user_belongs_to_tenant(auth.uid(), r.tenant_id))
    )
  );
CREATE POLICY "Medical staff can delete receita_itens" ON public.receita_itens
  FOR DELETE TO authenticated
  USING (
    public.has_medical_role(auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.receitas r
      WHERE r.id = receita_itens.receita_id
        AND (r.tenant_id IS NULL OR public.user_belongs_to_tenant(auth.uid(), r.tenant_id))
    )
  );

-- 7) solicitacao_exame_itens: tenant isolation via parent -------
DROP POLICY IF EXISTS "Medical staff can view solicitacao_exame_itens" ON public.solicitacao_exame_itens;
DROP POLICY IF EXISTS "Medical staff can insert solicitacao_exame_itens" ON public.solicitacao_exame_itens;
DROP POLICY IF EXISTS "Medical staff can update solicitacao_exame_itens" ON public.solicitacao_exame_itens;
DROP POLICY IF EXISTS "Medical staff can delete solicitacao_exame_itens" ON public.solicitacao_exame_itens;

CREATE POLICY "Medical staff can view solicitacao_exame_itens" ON public.solicitacao_exame_itens
  FOR SELECT TO authenticated
  USING (
    public.has_medical_role(auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.solicitacoes_exames s
      WHERE s.id = solicitacao_exame_itens.solicitacao_id
        AND (s.tenant_id IS NULL OR public.user_belongs_to_tenant(auth.uid(), s.tenant_id))
    )
  );
CREATE POLICY "Medical staff can insert solicitacao_exame_itens" ON public.solicitacao_exame_itens
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_medical_role(auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.solicitacoes_exames s
      WHERE s.id = solicitacao_exame_itens.solicitacao_id
        AND (s.tenant_id IS NULL OR public.user_belongs_to_tenant(auth.uid(), s.tenant_id))
    )
  );
CREATE POLICY "Medical staff can update solicitacao_exame_itens" ON public.solicitacao_exame_itens
  FOR UPDATE TO authenticated
  USING (
    public.has_medical_role(auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.solicitacoes_exames s
      WHERE s.id = solicitacao_exame_itens.solicitacao_id
        AND (s.tenant_id IS NULL OR public.user_belongs_to_tenant(auth.uid(), s.tenant_id))
    )
  );
CREATE POLICY "Medical staff can delete solicitacao_exame_itens" ON public.solicitacao_exame_itens
  FOR DELETE TO authenticated
  USING (
    public.has_medical_role(auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.solicitacoes_exames s
      WHERE s.id = solicitacao_exame_itens.solicitacao_id
        AND (s.tenant_id IS NULL OR public.user_belongs_to_tenant(auth.uid(), s.tenant_id))
    )
  );

-- 8) tenant_audit_log INSERT: enforce tenant membership ---------
DROP POLICY IF EXISTS "Authenticated users can insert audit logs" ON public.tenant_audit_log;
CREATE POLICY "Authenticated users can insert audit logs" ON public.tenant_audit_log
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND public.user_belongs_to_tenant(auth.uid(), tenant_id)
  );

-- 9) INSERT policies: add tenant membership check ---------------
DROP POLICY IF EXISTS "Medical staff can insert agendamentos_odonto" ON public.agendamentos_odonto;
CREATE POLICY "Medical staff can insert agendamentos_odonto" ON public.agendamentos_odonto
  FOR INSERT TO authenticated
  WITH CHECK ((public.has_medical_role(auth.uid()) OR public.has_role(auth.uid(),'recepcao'::app_role))
    AND (tenant_id IS NULL OR public.user_belongs_to_tenant(auth.uid(), tenant_id)));

DROP POLICY IF EXISTS "Medical staff can insert anamneses" ON public.anamneses;
CREATE POLICY "Medical staff can insert anamneses" ON public.anamneses
  FOR INSERT TO authenticated
  WITH CHECK (public.has_medical_role(auth.uid()) AND (tenant_id IS NULL OR public.user_belongs_to_tenant(auth.uid(), tenant_id)));

DROP POLICY IF EXISTS "Staff can insert appointments" ON public.appointments;
CREATE POLICY "Staff can insert appointments" ON public.appointments
  FOR INSERT TO authenticated
  WITH CHECK ((public.has_medical_role(auth.uid()) OR public.has_role(auth.uid(),'recepcao'::app_role))
    AND (tenant_id IS NULL OR public.user_belongs_to_tenant(auth.uid(), tenant_id)));

DROP POLICY IF EXISTS "Medical staff can insert atendimentos" ON public.atendimentos;
CREATE POLICY "Medical staff can insert atendimentos" ON public.atendimentos
  FOR INSERT TO authenticated
  WITH CHECK (public.has_medical_role(auth.uid()) AND (tenant_id IS NULL OR public.user_belongs_to_tenant(auth.uid(), tenant_id)));

DROP POLICY IF EXISTS "Medical staff can insert atestados" ON public.atestados;
CREATE POLICY "Medical staff can insert atestados" ON public.atestados
  FOR INSERT TO authenticated
  WITH CHECK (public.has_medical_role(auth.uid()) AND (tenant_id IS NULL OR public.user_belongs_to_tenant(auth.uid(), tenant_id)));

DROP POLICY IF EXISTS "Staff can insert consultas" ON public.consultas;
CREATE POLICY "Staff can insert consultas" ON public.consultas
  FOR INSERT TO authenticated
  WITH CHECK ((public.has_medical_role(auth.uid()) OR public.has_role(auth.uid(),'recepcao'::app_role))
    AND (tenant_id IS NULL OR public.user_belongs_to_tenant(auth.uid(), tenant_id)));

DROP POLICY IF EXISTS "Medical staff can insert encaminhamentos" ON public.encaminhamentos;
CREATE POLICY "Medical staff can insert encaminhamentos" ON public.encaminhamentos
  FOR INSERT TO authenticated
  WITH CHECK (public.has_medical_role(auth.uid()) AND (tenant_id IS NULL OR public.user_belongs_to_tenant(auth.uid(), tenant_id)));

DROP POLICY IF EXISTS "Medical staff can insert evolucoes_odonto" ON public.evolucoes_odonto;
CREATE POLICY "Medical staff can insert evolucoes_odonto" ON public.evolucoes_odonto
  FOR INSERT TO authenticated
  WITH CHECK (public.has_medical_role(auth.uid()) AND (tenant_id IS NULL OR public.user_belongs_to_tenant(auth.uid(), tenant_id)));

DROP POLICY IF EXISTS "Medical staff can insert evolutions" ON public.evolutions;
CREATE POLICY "Medical staff can insert evolutions" ON public.evolutions
  FOR INSERT TO authenticated
  WITH CHECK (public.has_medical_role(auth.uid()) AND (tenant_id IS NULL OR public.user_belongs_to_tenant(auth.uid(), tenant_id)));

DROP POLICY IF EXISTS "Medical staff can insert exam_requests" ON public.exam_requests;
CREATE POLICY "Medical staff can insert exam_requests" ON public.exam_requests
  FOR INSERT TO authenticated
  WITH CHECK (public.has_medical_role(auth.uid()) AND (tenant_id IS NULL OR public.user_belongs_to_tenant(auth.uid(), tenant_id)));

DROP POLICY IF EXISTS "Medical staff can insert itens" ON public.itens_plano_tratamento;
CREATE POLICY "Medical staff can insert itens" ON public.itens_plano_tratamento
  FOR INSERT TO authenticated
  WITH CHECK (public.has_medical_role(auth.uid()) AND (tenant_id IS NULL OR public.user_belongs_to_tenant(auth.uid(), tenant_id)));

DROP POLICY IF EXISTS "Nursing staff can insert medication_administrations" ON public.medication_administrations;
CREATE POLICY "Nursing staff can insert medication_administrations" ON public.medication_administrations
  FOR INSERT TO authenticated
  WITH CHECK ((public.has_nursing_role(auth.uid()) OR public.has_medical_role(auth.uid()))
    AND (tenant_id IS NULL OR public.user_belongs_to_tenant(auth.uid(), tenant_id)));

DROP POLICY IF EXISTS "Nursing staff can insert nursing_notes" ON public.nursing_notes;
CREATE POLICY "Nursing staff can insert nursing_notes" ON public.nursing_notes
  FOR INSERT TO authenticated
  WITH CHECK (public.has_nursing_role(auth.uid()) AND (tenant_id IS NULL OR public.user_belongs_to_tenant(auth.uid(), tenant_id)));

DROP POLICY IF EXISTS "Medical staff can insert historico" ON public.odontograma_historico;
CREATE POLICY "Medical staff can insert historico" ON public.odontograma_historico
  FOR INSERT TO authenticated
  WITH CHECK (public.has_medical_role(auth.uid()) AND (tenant_id IS NULL OR public.user_belongs_to_tenant(auth.uid(), tenant_id)));

DROP POLICY IF EXISTS "Medical staff can insert odontogramas" ON public.odontogramas;
CREATE POLICY "Medical staff can insert odontogramas" ON public.odontogramas
  FOR INSERT TO authenticated
  WITH CHECK (public.has_medical_role(auth.uid()) AND (tenant_id IS NULL OR public.user_belongs_to_tenant(auth.uid(), tenant_id)));

DROP POLICY IF EXISTS "Medical staff can insert patients" ON public.patients;
CREATE POLICY "Medical staff can insert patients" ON public.patients
  FOR INSERT TO authenticated
  WITH CHECK ((public.has_medical_role(auth.uid()) OR public.has_role(auth.uid(),'recepcao'::app_role))
    AND (tenant_id IS NULL OR public.user_belongs_to_tenant(auth.uid(), tenant_id)));

DROP POLICY IF EXISTS "Medical staff can insert planos" ON public.planos_tratamento_odonto;
CREATE POLICY "Medical staff can insert planos" ON public.planos_tratamento_odonto
  FOR INSERT TO authenticated
  WITH CHECK (public.has_medical_role(auth.uid()) AND (tenant_id IS NULL OR public.user_belongs_to_tenant(auth.uid(), tenant_id)));

DROP POLICY IF EXISTS "Medical staff can insert prescription_items" ON public.prescription_items;
CREATE POLICY "Medical staff can insert prescription_items" ON public.prescription_items
  FOR INSERT TO authenticated
  WITH CHECK (public.has_medical_role(auth.uid()) AND (tenant_id IS NULL OR public.user_belongs_to_tenant(auth.uid(), tenant_id)));

DROP POLICY IF EXISTS "Medical staff can insert prescriptions" ON public.prescriptions;
CREATE POLICY "Medical staff can insert prescriptions" ON public.prescriptions
  FOR INSERT TO authenticated
  WITH CHECK (public.has_medical_role(auth.uid()) AND (tenant_id IS NULL OR public.user_belongs_to_tenant(auth.uid(), tenant_id)));

DROP POLICY IF EXISTS "Medical staff can insert procedures" ON public.procedures;
CREATE POLICY "Medical staff can insert procedures" ON public.procedures
  FOR INSERT TO authenticated
  WITH CHECK (public.has_medical_role(auth.uid()) AND (tenant_id IS NULL OR public.user_belongs_to_tenant(auth.uid(), tenant_id)));

DROP POLICY IF EXISTS "Medical staff can insert receitas" ON public.receitas;
CREATE POLICY "Medical staff can insert receitas" ON public.receitas
  FOR INSERT TO authenticated
  WITH CHECK (public.has_medical_role(auth.uid()) AND (tenant_id IS NULL OR public.user_belongs_to_tenant(auth.uid(), tenant_id)));

DROP POLICY IF EXISTS "Medical staff can insert reports" ON public.reports;
CREATE POLICY "Medical staff can insert reports" ON public.reports
  FOR INSERT TO authenticated
  WITH CHECK (public.has_medical_role(auth.uid()) AND (tenant_id IS NULL OR public.user_belongs_to_tenant(auth.uid(), tenant_id)));

DROP POLICY IF EXISTS "Medical staff can insert solicitacoes_exames" ON public.solicitacoes_exames;
CREATE POLICY "Medical staff can insert solicitacoes_exames" ON public.solicitacoes_exames
  FOR INSERT TO authenticated
  WITH CHECK (public.has_medical_role(auth.uid()) AND (tenant_id IS NULL OR public.user_belongs_to_tenant(auth.uid(), tenant_id)));

DROP POLICY IF EXISTS "Medical staff can insert vitals" ON public.vitals;
CREATE POLICY "Medical staff can insert vitals" ON public.vitals
  FOR INSERT TO authenticated
  WITH CHECK (public.has_medical_role(auth.uid()) AND (tenant_id IS NULL OR public.user_belongs_to_tenant(auth.uid(), tenant_id)));

-- 10) STORAGE: remove listing on public avatars bucket ----------
-- Public buckets serve files via public URL without needing a SELECT RLS row-check.
-- Removing the broad SELECT policy prevents anon clients from enumerating objects
-- via the storage list API while public GET URLs continue to work.
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
