import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Resolves an avatar reference (either a storage path or a legacy public URL)
 * to a short-lived signed URL usable in <img src>. The avatars bucket is
 * private, so we sign on demand.
 */
export function useAvatarUrl(reference: string | null | undefined): string | undefined {
  const [url, setUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    if (!reference) {
      setUrl(undefined);
      return;
    }

    // Extract storage path from either a legacy public URL or a raw path
    let path = reference;
    const marker = '/avatars/';
    const idx = reference.indexOf(marker);
    if (idx !== -1) {
      path = reference.slice(idx + marker.length);
    }

    supabase.storage
      .from('avatars')
      .createSignedUrl(path, 60 * 60)
      .then(({ data }) => {
        if (!cancelled) setUrl(data?.signedUrl);
      })
      .catch(() => {
        if (!cancelled) setUrl(undefined);
      });

    return () => {
      cancelled = true;
    };
  }, [reference]);

  return url;
}
