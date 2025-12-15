import { useModules } from '@/hooks/useModules';
import type { ModuleKey } from '@/types/modules';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface ModuleGuardProps {
  moduleKey: ModuleKey;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ModuleGuard({ moduleKey, children, fallback }: ModuleGuardProps) {
  const { isModuleEnabled, isLoading } = useModules();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!isModuleEnabled(moduleKey)) {
    return fallback ?? (
      <div className="flex items-center justify-center min-h-[400px] p-8">
        <Alert variant="destructive" className="max-w-md">
          <Lock className="h-5 w-5" />
          <AlertTitle>Módulo Não Disponível</AlertTitle>
          <AlertDescription className="mt-2">
            Este módulo não está habilitado para sua clínica. 
            Entre em contato com o administrador para ativá-lo.
          </AlertDescription>
          <Button 
            variant="outline" 
            className="mt-4" 
            onClick={() => navigate('/')}
          >
            Voltar ao Início
          </Button>
        </Alert>
      </div>
    );
  }

  return <>{children}</>;
}
