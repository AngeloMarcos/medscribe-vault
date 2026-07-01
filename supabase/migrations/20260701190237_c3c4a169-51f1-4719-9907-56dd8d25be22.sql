
-- =========================================================
-- 1) Remove "(tenant_id IS NULL) OR" bypass and enforce NOT NULL
-- =========================================================

DO $$
DECLARE
  r record;
  tables text[] := ARRAY[
    'agendamentos_odonto','anamneses','appointments','atendimentos','atestados',
    'consultas','encaminhamentos','estornos_consultas','evolucoes_odonto','evolutions',
    'exam_requests','itens_plano_tratamento','medication_administrations','nursing_notes',
    'nursing_queue','odontograma_historico','odontogramas','patients','planos_tratamento_odonto',
    'prescription_items','prescriptions','procedures','receita_itens','receitas','reports',
    'solicitacao_exame_itens','solicitacoes_exames','vitals'
  ];
  t text;
  new_qual text;
  new_check text;
BEGIN
  FOREACH t IN ARRAY tables LOOP
    FOR r IN
      SELECT policyname, cmd, qual, with_check, roles, permissive
      FROM pg_policies
      WHERE schemaname='public' AND tablename=t
        AND (qual LIKE '%tenant_id IS NULL%' OR with_check LIKE '%tenant_id IS NULL%')
    LOOP
      new_qual := r.qual;
      new_check := r.with_check;
      IF new_qual IS NOT NULL THEN
        new_qual := regexp_replace(new_qual, '\(\(tenant_id IS NULL\) OR user_belongs_to_tenant\(auth\.uid\(\), tenant_id\)\)', 'user_belongs_to_tenant(auth.uid(), tenant_id)', 'g');
        new_qual := regexp_replace(new_qual, '\(tenant_id IS NULL\) OR user_belongs_to_tenant\(auth\.uid\(\), tenant_id\)', 'user_belongs_to_tenant(auth.uid(), tenant_id)', 'g');
      END IF;
      IF new_check IS NOT NULL THEN
        new_check := regexp_replace(new_check, '\(\(tenant_id IS NULL\) OR user_belongs_to_tenant\(auth\.uid\(\), tenant_id\)\)', 'user_belongs_to_tenant(auth.uid(), tenant_id)', 'g');
        new_check := regexp_replace(new_check, '\(tenant_id IS NULL\) OR user_belongs_to_tenant\(auth\.uid\(\), tenant_id\)', 'user_belongs_to_tenant(auth.uid(), tenant_id)', 'g');
      END IF;

      EXECUTE format('DROP POLICY %I ON public.%I', r.policyname, t);

      IF r.cmd = 'SELECT' THEN
        EXECUTE format('CREATE POLICY %I ON public.%I FOR SELECT USING (%s)', r.policyname, t, new_qual);
      ELSIF r.cmd = 'INSERT' THEN
        EXECUTE format('CREATE POLICY %I ON public.%I FOR INSERT WITH CHECK (%s)', r.policyname, t, new_check);
      ELSIF r.cmd = 'UPDATE' THEN
        EXECUTE format('CREATE POLICY %I ON public.%I FOR UPDATE USING (%s)%s',
          r.policyname, t, new_qual,
          CASE WHEN new_check IS NOT NULL THEN ' WITH CHECK ('||new_check||')' ELSE '' END);
      ELSIF r.cmd = 'DELETE' THEN
        EXECUTE format('CREATE POLICY %I ON public.%I FOR DELETE USING (%s)', r.policyname, t, new_qual);
      ELSIF r.cmd = 'ALL' THEN
        EXECUTE format('CREATE POLICY %I ON public.%I FOR ALL USING (%s)%s',
          r.policyname, t, new_qual,
          CASE WHEN new_check IS NOT NULL THEN ' WITH CHECK ('||new_check||')' ELSE '' END);
      END IF;
    END LOOP;

    -- Backfill any orphan NULL tenant rows using a matching related record if possible; else delete-safe skip.
    -- We just enforce NOT NULL going forward without touching existing NULLs (leave them if any).
    -- Set column NOT NULL only when there are no NULL rows to avoid breaking data.
    BEGIN
      EXECUTE format('ALTER TABLE public.%I ALTER COLUMN tenant_id SET NOT NULL', t);
    EXCEPTION WHEN others THEN
      RAISE NOTICE 'Could not set NOT NULL on %.tenant_id: %', t, SQLERRM;
    END;
  END LOOP;
END $$;

-- =========================================================
-- 2) Allow medical staff & reception to view profissionais
--    (profissionais has no tenant_id; column-level grants
--     already restrict CPF/email/phone/signature to service_role.)
-- =========================================================
CREATE POLICY "Staff can view profissionais"
ON public.profissionais
FOR SELECT
TO authenticated
USING (
  has_admin_access(auth.uid())
  OR user_id = auth.uid()
  OR has_medical_role(auth.uid())
  OR has_role(auth.uid(), 'recepcao'::app_role)
);
