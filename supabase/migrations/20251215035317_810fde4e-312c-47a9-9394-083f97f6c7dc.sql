-- Tabela de auditoria para tenants
CREATE TABLE public.tenant_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  
  -- Tipo de entidade alterada
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID,
  
  -- Ação realizada
  action VARCHAR(50) NOT NULL,
  
  -- Dados da alteração
  target_user_id UUID,
  before_value JSONB,
  after_value JSONB,
  
  -- Metadata
  description TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para consultas eficientes
CREATE INDEX idx_tenant_audit_tenant ON tenant_audit_log(tenant_id);
CREATE INDEX idx_tenant_audit_user ON tenant_audit_log(user_id);
CREATE INDEX idx_tenant_audit_entity ON tenant_audit_log(entity_type, entity_id);
CREATE INDEX idx_tenant_audit_created ON tenant_audit_log(created_at DESC);
CREATE INDEX idx_tenant_audit_target_user ON tenant_audit_log(target_user_id);

-- RLS
ALTER TABLE tenant_audit_log ENABLE ROW LEVEL SECURITY;

-- Usuários podem ver logs do seu tenant
CREATE POLICY "Users can view their tenant audit logs"
  ON tenant_audit_log FOR SELECT
  USING (user_belongs_to_tenant(auth.uid(), tenant_id));

-- Usuários autenticados podem inserir logs
CREATE POLICY "Authenticated users can insert audit logs"
  ON tenant_audit_log FOR INSERT
  WITH CHECK (auth.uid() = user_id);