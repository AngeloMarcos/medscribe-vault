-- Tabela para permissões customizadas por tenant
CREATE TABLE public.tenant_user_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  
  -- Permissões concedidas além do role base
  granted_permissions TEXT[] DEFAULT '{}',
  
  -- Permissões negadas (sobrescreve o role base)
  denied_permissions TEXT[] DEFAULT '{}',
  
  -- Metadata
  notes TEXT,
  granted_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(tenant_id, user_id)
);

-- Índices
CREATE INDEX idx_tenant_user_permissions_tenant ON tenant_user_permissions(tenant_id);
CREATE INDEX idx_tenant_user_permissions_user ON tenant_user_permissions(user_id);

-- RLS
ALTER TABLE tenant_user_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own permissions"
  ON tenant_user_permissions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Owners and admins can manage permissions"
  ON tenant_user_permissions FOR ALL
  USING (is_tenant_owner(auth.uid(), tenant_id) OR has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (is_tenant_owner(auth.uid(), tenant_id) OR has_role(auth.uid(), 'admin'::app_role));

-- Trigger para updated_at
CREATE TRIGGER update_tenant_user_permissions_updated_at
  BEFORE UPDATE ON tenant_user_permissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Função para obter permissões efetivas de um usuário em um tenant
CREATE OR REPLACE FUNCTION public.get_user_effective_permissions(
  _user_id UUID,
  _tenant_id UUID
)
RETURNS TEXT[]
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  base_permissions TEXT[];
  granted TEXT[];
  denied TEXT[];
  user_role app_role;
BEGIN
  -- 1. Obter role base do usuário
  SELECT role INTO user_role
  FROM user_roles
  WHERE user_id = _user_id
  LIMIT 1;
  
  -- Admin tem todas as permissões
  IF user_role = 'admin' THEN
    RETURN ARRAY['all'];
  END IF;
  
  -- 2. Mapear role para permissões base
  base_permissions := CASE user_role
    WHEN 'medico' THEN ARRAY['prescribe', 'view_patients', 'clinical_docs', 'request_exams', 'view_prescriptions']
    WHEN 'enfermeiro' THEN ARRAY['administer_meds', 'view_prescriptions', 'vital_signs', 'nursing_notes', 'view_patients', 'scheduling']
    WHEN 'farmaceutico' THEN ARRAY['dispense', 'view_prescriptions', 'stock_control']
    WHEN 'tecnico_enfermagem' THEN ARRAY['administer_meds', 'vital_signs', 'view_prescriptions', 'view_patients']
    WHEN 'recepcao' THEN ARRAY['patient_registration', 'scheduling', 'view_patients']
    ELSE ARRAY[]::TEXT[]
  END;
  
  -- 3. Obter overrides do tenant
  SELECT 
    COALESCE(tup.granted_permissions, ARRAY[]::TEXT[]),
    COALESCE(tup.denied_permissions, ARRAY[]::TEXT[])
  INTO granted, denied
  FROM tenant_user_permissions tup
  WHERE tup.user_id = _user_id AND tup.tenant_id = _tenant_id;
  
  -- Se não encontrou registro, retorna permissões base
  IF granted IS NULL THEN
    granted := ARRAY[]::TEXT[];
  END IF;
  IF denied IS NULL THEN
    denied := ARRAY[]::TEXT[];
  END IF;
  
  -- 4. Aplicar overrides: (base + granted) - denied
  RETURN array(
    SELECT DISTINCT unnest
    FROM unnest(base_permissions || granted)
    WHERE unnest != ALL(denied)
  );
END;
$$;

-- Função para verificar se usuário tem permissão específica no tenant
CREATE OR REPLACE FUNCTION public.has_tenant_permission(
  _user_id UUID,
  _tenant_id UUID,
  _permission TEXT
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    'all' = ANY(get_user_effective_permissions(_user_id, _tenant_id))
    OR _permission = ANY(get_user_effective_permissions(_user_id, _tenant_id))
$$;