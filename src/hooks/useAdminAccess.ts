import { useAuth } from "@/contexts/AuthContext";

export function useAdminAccess() {
  const { isAdmin, isLoading } = useAuth();

  return { isAdmin, isLoading };
}
