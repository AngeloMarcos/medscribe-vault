
CREATE SCHEMA IF NOT EXISTS private;

CREATE OR REPLACE FUNCTION private.get_profissional_full(_id uuid)
RETURNS TABLE (
  id uuid, user_id uuid, nome text, cpf text,
  registro_profissional text, tipo_registro text,
  telefone text, email text,
  especialidade_id uuid, equipe_id uuid, ativo boolean,
  created_at timestamptz, updated_at timestamptz
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

REVOKE ALL ON FUNCTION private.get_profissional_full(uuid) FROM PUBLIC, anon, authenticated;

-- Replace public function with SECURITY INVOKER wrapper
DROP FUNCTION IF EXISTS public.get_profissional_full(uuid);
CREATE OR REPLACE FUNCTION public.get_profissional_full(_id uuid)
RETURNS TABLE (
  id uuid, user_id uuid, nome text, cpf text,
  registro_profissional text, tipo_registro text,
  telefone text, email text,
  especialidade_id uuid, equipe_id uuid, ativo boolean,
  created_at timestamptz, updated_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$ SELECT * FROM private.get_profissional_full(_id) $$;

REVOKE ALL ON FUNCTION public.get_profissional_full(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_profissional_full(uuid) TO authenticated;
