-- Tabela para armazenar módulos habilitados por tenant
CREATE TABLE public.tenant_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  module_key VARCHAR(50) NOT NULL,
  is_enabled BOOLEAN DEFAULT true,
  config JSONB DEFAULT '{}',
  enabled_at TIMESTAMPTZ DEFAULT now(),
  disabled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, module_key)
);

-- Habilitar RLS
ALTER TABLE public.tenant_modules ENABLE ROW LEVEL SECURITY;

-- Política para visualização - usuários podem ver módulos do seu tenant
CREATE POLICY "Users can view their tenant modules"
  ON public.tenant_modules FOR SELECT
  USING (user_belongs_to_tenant(auth.uid(), tenant_id));

-- Política para gerenciamento - owners e admins podem gerenciar
CREATE POLICY "Owners and admins can manage modules"
  ON public.tenant_modules FOR ALL
  USING (is_tenant_owner(auth.uid(), tenant_id) OR has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (is_tenant_owner(auth.uid(), tenant_id) OR has_role(auth.uid(), 'admin'::app_role));

-- Trigger para updated_at
CREATE TRIGGER update_tenant_modules_updated_at
  BEFORE UPDATE ON public.tenant_modules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Inserir módulos padrão para o tenant MentoArk Health (policlínica = todos os módulos)
INSERT INTO public.tenant_modules (tenant_id, module_key, is_enabled)
SELECT id, unnest(ARRAY[
  'dashboard', 'ambulatorio', 'odontologia', 'pacientes', 
  'prescricao', 'enfermagem', 'farmacia', 'agendamento',
  'sisreg', 'relatorios', 'administracao'
]), true
FROM public.tenants WHERE slug = 'mentoark-health';