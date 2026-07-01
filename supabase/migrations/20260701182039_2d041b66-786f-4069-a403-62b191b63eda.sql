
-- Fix estornos_consultas INSERT: enforce tenant isolation
DROP POLICY IF EXISTS "Staff can insert estornos" ON public.estornos_consultas;
CREATE POLICY "Staff can insert estornos" ON public.estornos_consultas
FOR INSERT TO authenticated
WITH CHECK (
  (public.has_medical_role(auth.uid()) OR public.has_role(auth.uid(), 'recepcao'::app_role))
  AND public.user_belongs_to_tenant(auth.uid(), tenant_id)
);

-- Fix nursing_queue INSERT: enforce tenant isolation
DROP POLICY IF EXISTS "Staff can insert nursing_queue" ON public.nursing_queue;
CREATE POLICY "Staff can insert nursing_queue" ON public.nursing_queue
FOR INSERT TO authenticated
WITH CHECK (
  (public.has_nursing_role(auth.uid()) OR public.has_medical_role(auth.uid()) OR public.has_role(auth.uid(), 'recepcao'::app_role))
  AND public.user_belongs_to_tenant(auth.uid(), tenant_id)
);

-- Fix profissionais: restrict sensitive columns via column-level privileges.
-- Tighten SELECT policy so only admins or the record owner can read the full row.
DROP POLICY IF EXISTS "Staff can view same-tenant profissionais" ON public.profissionais;

-- Full row access for admins and the professional themselves
CREATE POLICY "Admins and self can view profissionais" ON public.profissionais
FOR SELECT TO authenticated
USING (
  public.has_admin_access(auth.uid())
  OR user_id = auth.uid()
);

-- Same-tenant staff may still read a professional row, but only the non-sensitive
-- columns are granted at the column level (cpf/email/telefone/assinatura excluded).
CREATE POLICY "Same-tenant staff can view profissionais (public cols)" ON public.profissionais
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.tenant_users tu_me
    JOIN public.tenant_users tu_prof ON tu_prof.tenant_id = tu_me.tenant_id
    WHERE tu_me.user_id = auth.uid()
      AND tu_me.is_active = true
      AND tu_prof.is_active = true
      AND tu_prof.user_id = public.profissionais.user_id
  )
);

-- Restrict column-level SELECT on sensitive columns to service_role only.
REVOKE SELECT ON public.profissionais FROM authenticated, anon;
GRANT SELECT (
  id, user_id, nome, registro_profissional, tipo_registro,
  especialidade_id, equipe_id, ativo, created_at, updated_at
) ON public.profissionais TO authenticated;
GRANT ALL ON public.profissionais TO service_role;

-- Secure RPC for admins/self to retrieve full record including sensitive fields
CREATE OR REPLACE FUNCTION public.get_profissional_full(_id uuid)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  nome text,
  cpf text,
  registro_profissional text,
  tipo_registro text,
  telefone text,
  email text,
  especialidade_id uuid,
  equipe_id uuid,
  ativo boolean,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, p.user_id, p.nome, p.cpf, p.registro_profissional, p.tipo_registro,
         p.telefone, p.email, p.especialidade_id, p.equipe_id, p.ativo,
         p.created_at, p.updated_at
  FROM public.profissionais p
  WHERE p.id = _id
    AND (public.has_admin_access(auth.uid()) OR p.user_id = auth.uid());
$$;

REVOKE ALL ON FUNCTION public.get_profissional_full(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_profissional_full(uuid) TO authenticated;

-- Storage: document intent for avatars bucket with an explicit SELECT policy
DROP POLICY IF EXISTS "Public can view avatars" ON storage.objects;
CREATE POLICY "Public can view avatars" ON storage.objects
FOR SELECT
USING (bucket_id = 'avatars');
