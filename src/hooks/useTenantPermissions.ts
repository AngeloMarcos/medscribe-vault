import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useTenant } from '@/contexts/TenantContext';
import { Permission, ROLE_PERMISSIONS, AppRole } from '@/types/auth';
import type { TenantUserPermissions, EffectivePermissions } from '@/types/tenantPermissions';

export function useTenantPermissions() {
  const { user, roles, isAdmin, hasPermission: baseHasPermission } = useAuth();
  const { tenant } = useTenant();
  const [tenantPermissions, setTenantPermissions] = useState<TenantUserPermissions | null>(null);
  const [effectivePermissions, setEffectivePermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Calcular permissões base do role
  const getBasePermissions = useCallback((): Permission[] => {
    if (isAdmin) return ['all'] as Permission[];
    
    const allPermissions = new Set<Permission>();
    roles.forEach(role => {
      ROLE_PERMISSIONS[role]?.forEach(permission => {
        allPermissions.add(permission);
      });
    });
    return Array.from(allPermissions);
  }, [roles, isAdmin]);

  // Buscar permissões do tenant
  const fetchTenantPermissions = useCallback(async () => {
    if (!user?.id || !tenant?.id) {
      setTenantPermissions(null);
      setEffectivePermissions(getBasePermissions());
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('tenant_user_permissions')
        .select('*')
        .eq('tenant_id', tenant.id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching tenant permissions:', error);
        setEffectivePermissions(getBasePermissions());
      } else if (data) {
        setTenantPermissions(data as TenantUserPermissions);
        
        // Calcular permissões efetivas
        const base = getBasePermissions();
        const granted = (data.granted_permissions || []) as Permission[];
        const denied = (data.denied_permissions || []) as Permission[];
        
        // (base + granted) - denied
        const combined = [...new Set([...base, ...granted])];
        const effective = combined.filter(p => !denied.includes(p));
        setEffectivePermissions(effective);
      } else {
        setTenantPermissions(null);
        setEffectivePermissions(getBasePermissions());
      }
    } catch (err) {
      console.error('Error in fetchTenantPermissions:', err);
      setEffectivePermissions(getBasePermissions());
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, tenant?.id, getBasePermissions]);

  useEffect(() => {
    fetchTenantPermissions();
  }, [fetchTenantPermissions]);

  // Verificar se tem permissão (considerando overrides do tenant)
  const can = useCallback((permission: Permission): boolean => {
    if (isAdmin) return true;
    if (effectivePermissions.includes('all' as Permission)) return true;
    return effectivePermissions.includes(permission);
  }, [effectivePermissions, isAdmin]);

  // Verificar se tem qualquer uma das permissões
  const canAny = useCallback((permissions: Permission[]): boolean => {
    return permissions.some(p => can(p));
  }, [can]);

  // Verificar se tem todas as permissões
  const canAll = useCallback((permissions: Permission[]): boolean => {
    return permissions.every(p => can(p));
  }, [can]);

  // Verificar se permissão foi explicitamente concedida
  const isPermissionGranted = useCallback((permission: Permission): boolean => {
    return tenantPermissions?.granted_permissions?.includes(permission) ?? false;
  }, [tenantPermissions]);

  // Verificar se permissão foi explicitamente negada
  const isPermissionDenied = useCallback((permission: Permission): boolean => {
    return tenantPermissions?.denied_permissions?.includes(permission) ?? false;
  }, [tenantPermissions]);

  // Obter detalhes completos das permissões
  const getPermissionDetails = useCallback((): EffectivePermissions => {
    return {
      baseRole: roles[0] || null,
      basePermissions: getBasePermissions(),
      grantedOverrides: (tenantPermissions?.granted_permissions || []) as Permission[],
      deniedOverrides: (tenantPermissions?.denied_permissions || []) as Permission[],
      effectivePermissions,
    };
  }, [roles, getBasePermissions, tenantPermissions, effectivePermissions]);

  return {
    // Verificações
    can,
    canAny,
    canAll,
    isPermissionGranted,
    isPermissionDenied,
    
    // Dados
    tenantPermissions,
    effectivePermissions,
    basePermissions: getBasePermissions(),
    permissionDetails: getPermissionDetails(),
    
    // Estado
    isLoading,
    refetch: fetchTenantPermissions,
  };
}
