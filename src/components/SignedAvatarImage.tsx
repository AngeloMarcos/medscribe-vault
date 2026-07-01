import { AvatarImage } from '@/components/ui/avatar';
import { useAvatarUrl } from '@/hooks/useAvatarUrl';

interface SignedAvatarImageProps {
  reference?: string | null;
  alt?: string;
  className?: string;
}

/**
 * <AvatarImage> variant that resolves the avatars bucket (private) to a
 * short-lived signed URL. Accepts either a stored storage path or a legacy
 * public URL still saved on `profiles.avatar_url`.
 */
export function SignedAvatarImage({ reference, alt, className }: SignedAvatarImageProps) {
  const url = useAvatarUrl(reference);
  if (!url) return null;
  return <AvatarImage src={url} alt={alt} className={className} />;
}
