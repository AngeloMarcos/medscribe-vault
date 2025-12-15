import { Permission, AppRole } from '@/types/auth';

export interface TenantUserPermissions {
  id: string;
  tenant_id: string;
  user_id: string;
  granted_permissions: Permission[];
  denied_permissions: Permission[];
  notes: string | null;
  granted_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface EffectivePermissions {
  baseRole: AppRole | null;
  basePermissions: Permission[];
  grantedOverrides: Permission[];
  deniedOverrides: Permission[];
  effectivePermissions: Permission[];
}

export interface UserWithPermissions {
  id: string;
  email: string;
  full_name: string;
  role: AppRole | null;
  basePermissions: Permission[];
  tenantPermissions: TenantUserPermissions | null;
  effectivePermissions: Permission[];
}
