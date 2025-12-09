import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useMedicalAccess } from '@/hooks/useMedicalAccess';
import { useAdminAccess } from '@/hooks/useAdminAccess';
import { ShieldX, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AppRole, Permission, rolesHavePermission, ROLE_LABELS } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredPermission?: Permission;
  requiredRole?: AppRole;
  requireMedical?: boolean;
  requireAdmin?: boolean;
}

function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground text-sm">Verificando acesso...</p>
      </div>
    </div>
  );
}

function AccessDenied({ title, message }: { title: string; message: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <Card className="max-w-md w-full shadow-lg">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <ShieldX className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">{title}</h2>
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
  requiredPermission,
  requiredRole,
  requireMedical = false,
  requireAdmin = false,
}: ProtectedRouteProps) {
  const { hasMedicalRole, isLoading: loadingMedical } = useMedicalAccess();
  const { isAdmin, isLoading: loadingAdmin } = useAdminAccess();
  
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userRoles, setUserRoles] = useState<AppRole[]>([]);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    // Setup auth listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session?.user);
      
      if (session?.user) {
        // Defer role fetching to avoid deadlock
        setTimeout(() => {
          fetchUserRoles(session.user.id);
        }, 0);
      } else {
        setUserRoles([]);
        setLoadingAuth(false);
      }
    });

    // Then check existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session?.user);
      
      if (session?.user) {
        fetchUserRoles(session.user.id);
      } else {
        setLoadingAuth(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRoles = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (!error && data) {
        setUserRoles(data.map(r => r.role as AppRole));
      }
    } catch (err) {
      console.error('Error fetching user roles:', err);
    } finally {
      setLoadingAuth(false);
    }
  };

  // Determine if still loading
  const isLoading = 
    loadingAuth || 
    (requireMedical && loadingMedical) || 
    (requireAdmin && loadingAdmin);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Not authenticated - redirect to login
  if (isAuthenticated === false) {
    return <Navigate to="/auth" replace />;
  }

  // Check medical role requirement
  if (requireMedical && !hasMedicalRole) {
    return (
      <AccessDenied
        title="Acesso Restrito"
        message="Esta funcionalidade é restrita a profissionais médicos (médico ou enfermeiro)."
      />
    );
  }

  // Check admin role requirement
  if (requireAdmin && !isAdmin) {
    return (
      <AccessDenied
        title="Acesso Restrito"
        message="Esta funcionalidade é restrita a administradores."
      />
    );
  }

  // Check specific role requirement
  if (requiredRole && !userRoles.includes(requiredRole)) {
    const roleLabel = ROLE_LABELS[requiredRole] || requiredRole;
    return (
      <AccessDenied
        title="Acesso Restrito"
        message={`Esta funcionalidade é restrita para ${roleLabel}.`}
      />
    );
  }

  // Check specific permission requirement
  if (requiredPermission && !rolesHavePermission(userRoles, requiredPermission)) {
    return (
      <AccessDenied
        title="Permissão Negada"
        message="Você não tem permissão para acessar esta funcionalidade."
      />
    );
  }

  return <>{children}</>;
}

export default ProtectedRoute;
