import { useAuth } from "@/contexts/AuthContext";

export function useMedicalAccess() {
  const { hasMedicalRole, isLoading } = useAuth();

  return { hasMedicalRole, isLoading };
}
