import { ReactNode } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Building2, Loader2, Plus, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTenant } from '@/hooks/useTenant';
import { useAuth } from '@/contexts/AuthContext';

interface TenantGuardProps {
  children: ReactNode;
  requireTenant?: boolean;
  requireOwner?: boolean;
}

function LoadingTenant() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground text-sm">Carregando tenant...</p>
      </div>
    </div>
  );
}

function NoTenantAssigned() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <Card className="max-w-md w-full shadow-lg">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-warning/10 flex items-center justify-center">
              <Building2 className="h-8 w-8 text-warning" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">Sem Clínica Associada</h2>
            <p className="text-muted-foreground">
              Você ainda não está associado a nenhuma clínica ou estabelecimento de saúde.
            </p>
            
            <div className="w-full space-y-3 pt-4">
              <Button 
                className="w-full" 
                onClick={() => navigate('/onboarding')}
              >
                <Plus className="h-4 w-4 mr-2" />
                Criar Meu Estabelecimento
              </Button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">ou</span>
                </div>
              </div>
              
              <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-muted/50 text-muted-foreground text-sm">
                <Clock className="h-4 w-4" />
                <span>Aguardando convite de um administrador</span>
              </div>
            </div>
            
            <div className="pt-2">
              <Button variant="ghost" size="sm" onClick={() => logout()}>
                Sair da conta
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function NotOwner() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <Card className="max-w-md w-full shadow-lg">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <Building2 className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">Acesso Restrito</h2>
            <p className="text-muted-foreground">
              Esta funcionalidade é restrita aos proprietários do estabelecimento.
            </p>
            <Button variant="outline" onClick={() => window.history.back()}>
              Voltar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function TenantGuard({
  children,
  requireTenant = true,
  requireOwner = false,
}: TenantGuardProps) {
  const { tenant, tenantUser, isLoading, hasTenant, isOwner } = useTenant();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  // Wait for auth to load first
  if (authLoading) {
    return <LoadingTenant />;
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  // Wait for tenant to load
  if (isLoading) {
    return <LoadingTenant />;
  }

  // Check if tenant is required
  if (requireTenant && !hasTenant) {
    return <NoTenantAssigned />;
  }

  // Check if owner is required
  if (requireOwner && !isOwner) {
    return <NotOwner />;
  }

  return <>{children}</>;
}

export default TenantGuard;
