-- Criar tabela de tenants (clínicas/estabelecimentos)
CREATE TABLE public.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'clinica_geral', -- 'clinica_geral', 'consultorio_medico', 'consultorio_odonto', 'policlinica', 'hospital'
  settings JSONB DEFAULT '{}',
  logo_url TEXT,
  theme JSONB DEFAULT '{"primary": "#009688"}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Criar tabela de vinculação usuário-tenant
CREATE TABLE public.tenant_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_owner BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, user_id)
);

-- Habilitar RLS
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_users ENABLE ROW LEVEL SECURITY;

-- Função para obter tenant_id do usuário atual
CREATE OR REPLACE FUNCTION public.get_user_tenant_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT tenant_id
  FROM public.tenant_users
  WHERE user_id = _user_id
    AND is_active = true
  LIMIT 1
$$;

-- Função para verificar se usuário pertence a um tenant
CREATE OR REPLACE FUNCTION public.user_belongs_to_tenant(_user_id UUID, _tenant_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.tenant_users
    WHERE user_id = _user_id
      AND tenant_id = _tenant_id
      AND is_active = true
  )
$$;

-- Função para verificar se usuário é owner do tenant
CREATE OR REPLACE FUNCTION public.is_tenant_owner(_user_id UUID, _tenant_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.tenant_users
    WHERE user_id = _user_id
      AND tenant_id = _tenant_id
      AND is_owner = true
      AND is_active = true
  )
$$;

-- RLS Policies para tenants
CREATE POLICY "Users can view their own tenants"
ON public.tenants
FOR SELECT
USING (
  public.user_belongs_to_tenant(auth.uid(), id)
  OR public.has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Owners and admins can update tenants"
ON public.tenants
FOR UPDATE
USING (
  public.is_tenant_owner(auth.uid(), id)
  OR public.has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Only super admins can insert tenants"
ON public.tenants
FOR INSERT
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Only super admins can delete tenants"
ON public.tenants
FOR DELETE
USING (
  public.has_role(auth.uid(), 'admin'::app_role)
);

-- RLS Policies para tenant_users
CREATE POLICY "Users can view tenant_users of their tenant"
ON public.tenant_users
FOR SELECT
USING (
  public.user_belongs_to_tenant(auth.uid(), tenant_id)
  OR auth.uid() = user_id
  OR public.has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Owners and admins can insert tenant_users"
ON public.tenant_users
FOR INSERT
WITH CHECK (
  public.is_tenant_owner(auth.uid(), tenant_id)
  OR public.has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Owners and admins can update tenant_users"
ON public.tenant_users
FOR UPDATE
USING (
  public.is_tenant_owner(auth.uid(), tenant_id)
  OR public.has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Owners and admins can delete tenant_users"
ON public.tenant_users
FOR DELETE
USING (
  public.is_tenant_owner(auth.uid(), tenant_id)
  OR public.has_role(auth.uid(), 'admin'::app_role)
);

-- Trigger para atualizar updated_at em tenants
CREATE TRIGGER update_tenants_updated_at
BEFORE UPDATE ON public.tenants
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

-- Índices para performance
CREATE INDEX idx_tenant_users_user_id ON public.tenant_users(user_id);
CREATE INDEX idx_tenant_users_tenant_id ON public.tenant_users(tenant_id);
CREATE INDEX idx_tenants_slug ON public.tenants(slug);
CREATE INDEX idx_tenants_is_active ON public.tenants(is_active);