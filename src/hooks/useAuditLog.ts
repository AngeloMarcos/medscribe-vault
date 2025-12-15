import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useTenant } from '@/contexts/TenantContext';
import type { AuditEntityType, AuditAction } from '@/types/auditLog';
import type { Json } from '@/integrations/supabase/types';

interface LogActionParams {
  entityType: AuditEntityType;
  entityId?: string;
  action: AuditAction;
  targetUserId?: string;
  beforeValue?: Json;
  afterValue?: Json;
  description?: string;
}

export function useAuditLog() {
  const { user } = useAuth();
  const { tenant } = useTenant();

  const logAction = useCallback(async (params: LogActionParams) => {
    if (!user?.id || !tenant?.id) return;

    try {
      await supabase.from('tenant_audit_log').insert([{
        tenant_id: tenant.id,
        user_id: user.id,
        entity_type: params.entityType,
        entity_id: params.entityId || null,
        action: params.action,
        target_user_id: params.targetUserId || null,
        before_value: params.beforeValue || null,
        after_value: params.afterValue || null,
        description: params.description || null,
        user_agent: navigator.userAgent,
      }]);
    } catch (error) {
      console.error('Error logging audit action:', error);
    }
  }, [user?.id, tenant?.id]);

  const logPermissionChange = useCallback((params: Omit<LogActionParams, 'entityType'>) => {
    return logAction({ ...params, entityType: 'permission' });
  }, [logAction]);

  const logModuleChange = useCallback((params: Omit<LogActionParams, 'entityType'>) => {
    return logAction({ ...params, entityType: 'module' });
  }, [logAction]);

  const logUserChange = useCallback((params: Omit<LogActionParams, 'entityType'>) => {
    return logAction({ ...params, entityType: 'user' });
  }, [logAction]);

  const logSettingsChange = useCallback((params: Omit<LogActionParams, 'entityType'>) => {
    return logAction({ ...params, entityType: 'tenant_settings' });
  }, [logAction]);

  return {
    logAction,
    logPermissionChange,
    logModuleChange,
    logUserChange,
    logSettingsChange,
  };
}
