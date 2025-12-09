-- Fix infinite recursion in user_roles RLS policy
-- The current policy queries user_roles table to check admin status,
-- which causes infinite recursion. Replace with has_role() security definer function.

DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;

CREATE POLICY "Admins can manage all roles" ON public.user_roles
  FOR ALL 
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));