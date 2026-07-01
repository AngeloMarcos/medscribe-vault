
-- Tighten avatars SELECT policy: only authenticated users can read
DROP POLICY IF EXISTS "Public can view avatars" ON storage.objects;
CREATE POLICY "Authenticated can view avatars" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'avatars');

-- Lock down get_profissional_full so anon cannot call it
REVOKE EXECUTE ON FUNCTION public.get_profissional_full(uuid) FROM anon, PUBLIC;
