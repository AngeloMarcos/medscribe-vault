
-- Restore standard column grants; RLS alone gates access to full row
GRANT SELECT ON public.profissionais TO authenticated;

-- Remove the redundant same-tenant public-cols policy (RLS now single: admin+self)
DROP POLICY IF EXISTS "Same-tenant staff can view profissionais (public cols)" ON public.profissionais;
