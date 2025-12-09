import { useAuth } from '@/contexts/AuthContext';
import { Permission, AppRole, ROLE_PERMISSIONS, PERMISSIONS } from '@/types/auth';

export function usePermission() {
  const { 
    hasPermission, 
    hasRole,
    isAdmin, 
    isMedico, 
    isEnfermeiro, 
    hasMedicalRole,
    roles 
  } = useAuth();

  /**
   * Verifica se o usuário tem uma permissão específica
   */
  const can = (permission: Permission): boolean => {
    return hasPermission(permission);
  };

  /**
   * Verifica se o usuário tem QUALQUER uma das permissões listadas
   */
  const canAny = (permissions: Permission[]): boolean => {
    return permissions.some((p) => hasPermission(p));
  };

  /**
   * Verifica se o usuário tem TODAS as permissões listadas
   */
  const canAll = (permissions: Permission[]): boolean => {
    return permissions.every((p) => hasPermission(p));
  };

  /**
   * Verifica se o usuário tem um role específico
   */
  const isRole = (role: AppRole): boolean => {
    return hasRole(role);
  };

  /**
   * Retorna lista de todas as permissões do usuário (derivadas dos roles)
   */
  const getAllPermissions = (): Permission[] => {
    const allPermissions = new Set<Permission>();
    roles.forEach(role => {
      ROLE_PERMISSIONS[role]?.forEach(permission => {
        allPermissions.add(permission);
      });
    });
    return Array.from(allPermissions);
  };

  return {
    // Funções de verificação
    can,
    canAny,
    canAll,
    isRole,
    
    // Atalhos de role
    isAdmin,
    isMedico,
    isEnfermeiro,
    hasMedicalRole,
    
    // Dados
    roles,
    permissions: getAllPermissions(),
    
    // Constantes (re-exportadas para conveniência)
    PERMISSIONS,
  };
}
