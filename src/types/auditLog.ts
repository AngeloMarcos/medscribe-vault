export type AuditEntityType = 'permission' | 'module' | 'user' | 'tenant_settings';

export type AuditAction = 
  | 'grant' | 'revoke'           // Permissões
  | 'enable' | 'disable'         // Módulos
  | 'add' | 'remove' | 'update'; // Usuários/Configurações

export interface TenantAuditLog {
  id: string;
  tenant_id: string;
  user_id: string;
  entity_type: AuditEntityType;
  entity_id: string | null;
  action: AuditAction;
  target_user_id: string | null;
  before_value: Record<string, unknown> | null;
  after_value: Record<string, unknown> | null;
  description: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface AuditLogFilter {
  entityType?: AuditEntityType;
  action?: AuditAction;
  targetUserId?: string;
  startDate?: string;
  endDate?: string;
}

export interface AuditLogWithUser extends TenantAuditLog {
  user_name?: string;
  user_email?: string;
  target_user_name?: string;
}
