import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useMedicalAccess() {
  const [hasMedicalRole, setHasMedicalRole] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkMedicalAccess = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setHasMedicalRole(false);
          setIsLoading(false);
          return;
        }

        const { data, error } = await supabase.rpc("has_medical_role", {
          _user_id: user.id,
        });

        if (error) {
          console.error("Error checking medical access:", error);
          setHasMedicalRole(false);
        } else {
          setHasMedicalRole(data === true);
        }
      } catch (error) {
        console.error("Error checking medical access:", error);
        setHasMedicalRole(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkMedicalAccess();
  }, []);

  return { hasMedicalRole, isLoading };
}
