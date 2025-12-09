import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useMedicalAccess } from "@/hooks/useMedicalAccess";
import { useAdminAccess } from "@/hooks/useAdminAccess";
import { AlertTriangle, ShieldX } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ProtectedRouteProps {
  children: ReactNode;
  requireMedical?: boolean;
  requireAdmin?: boolean;
}

function LoadingSpinner() {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );
}

function AccessDenied({ message }: { message: string }) {
  return (
    <div className="flex min-h-[400px] items-center justify-center p-6">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <ShieldX className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">Acesso Negado</h2>
            <p className="text-muted-foreground">{message}</p>
            <Button variant="outline" onClick={() => window.history.back()}>
              Voltar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function ProtectedRoute({ 
  children, 
  requireMedical = false, 
  requireAdmin = false 
}: ProtectedRouteProps) {
  const { hasMedicalRole, isLoading: loadingMedical } = useMedicalAccess();
  const { isAdmin, isLoading: loadingAdmin } = useAdminAccess();

  // Only check relevant loading states
  const isLoading = (requireMedical && loadingMedical) || (requireAdmin && loadingAdmin);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (requireMedical && !hasMedicalRole) {
    return <AccessDenied message="Acesso restrito a profissionais médicos (médico ou enfermeiro)." />;
  }

  if (requireAdmin && !isAdmin) {
    return <AccessDenied message="Acesso restrito a administradores." />;
  }

  return <>{children}</>;
}
