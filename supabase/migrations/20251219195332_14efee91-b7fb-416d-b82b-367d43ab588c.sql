-- ==================== FUNÇÃO DE ATUALIZAÇÃO DE TIMESTAMP ====================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- ==================== AGENDAMENTOS ODONTOLÓGICOS ====================

-- Tabela principal de agendamentos
CREATE TABLE public.agendamentos_odonto (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  profissional_id UUID REFERENCES public.profissionais(id),
  tenant_id UUID REFERENCES public.tenants(id),
  data DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fim TIME,
  duracao_minutos INTEGER DEFAULT 30,
  cadeira VARCHAR(50),
  status VARCHAR(20) DEFAULT 'agendado',
  hora_chegada TIME,
  observacoes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de procedimentos por agendamento (N:N)
CREATE TABLE public.agendamento_procedimentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agendamento_id UUID NOT NULL REFERENCES public.agendamentos_odonto(id) ON DELETE CASCADE,
  procedimento_id UUID NOT NULL REFERENCES public.procedimentos_odonto(id),
  ordem INTEGER DEFAULT 0
);

-- ==================== EVOLUÇÕES ODONTOLÓGICAS ====================

CREATE TABLE public.evolucoes_odonto (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agendamento_id UUID REFERENCES public.agendamentos_odonto(id),
  paciente_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  profissional_id UUID REFERENCES public.profissionais(id),
  tenant_id UUID REFERENCES public.tenants(id),
  queixa_principal TEXT,
  evolucao TEXT,
  procedimentos_realizados JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ==================== INDEXES ====================

CREATE INDEX idx_agendamentos_odonto_data ON public.agendamentos_odonto(data);
CREATE INDEX idx_agendamentos_odonto_paciente ON public.agendamentos_odonto(paciente_id);
CREATE INDEX idx_agendamentos_odonto_profissional ON public.agendamentos_odonto(profissional_id);
CREATE INDEX idx_agendamentos_odonto_status ON public.agendamentos_odonto(status);
CREATE INDEX idx_evolucoes_odonto_paciente ON public.evolucoes_odonto(paciente_id);
CREATE INDEX idx_evolucoes_odonto_agendamento ON public.evolucoes_odonto(agendamento_id);

-- ==================== RLS POLICIES ====================

ALTER TABLE public.agendamentos_odonto ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agendamento_procedimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evolucoes_odonto ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Medical staff can view agendamentos_odonto"
ON public.agendamentos_odonto FOR SELECT
USING (
  (has_medical_role(auth.uid()) OR has_role(auth.uid(), 'recepcao'::app_role))
  AND ((tenant_id IS NULL) OR user_belongs_to_tenant(auth.uid(), tenant_id))
);

CREATE POLICY "Medical staff can insert agendamentos_odonto"
ON public.agendamentos_odonto FOR INSERT
WITH CHECK (has_medical_role(auth.uid()) OR has_role(auth.uid(), 'recepcao'::app_role));

CREATE POLICY "Medical staff can update agendamentos_odonto"
ON public.agendamentos_odonto FOR UPDATE
USING (
  (has_medical_role(auth.uid()) OR has_role(auth.uid(), 'recepcao'::app_role))
  AND ((tenant_id IS NULL) OR user_belongs_to_tenant(auth.uid(), tenant_id))
);

CREATE POLICY "Medical staff can delete agendamentos_odonto"
ON public.agendamentos_odonto FOR DELETE
USING (
  (has_medical_role(auth.uid()) OR has_role(auth.uid(), 'recepcao'::app_role))
  AND ((tenant_id IS NULL) OR user_belongs_to_tenant(auth.uid(), tenant_id))
);

CREATE POLICY "Medical staff can view agendamento_procedimentos"
ON public.agendamento_procedimentos FOR SELECT
USING (has_medical_role(auth.uid()) OR has_role(auth.uid(), 'recepcao'::app_role));

CREATE POLICY "Medical staff can insert agendamento_procedimentos"
ON public.agendamento_procedimentos FOR INSERT
WITH CHECK (has_medical_role(auth.uid()) OR has_role(auth.uid(), 'recepcao'::app_role));

CREATE POLICY "Medical staff can delete agendamento_procedimentos"
ON public.agendamento_procedimentos FOR DELETE
USING (has_medical_role(auth.uid()) OR has_role(auth.uid(), 'recepcao'::app_role));

CREATE POLICY "Medical staff can view evolucoes_odonto"
ON public.evolucoes_odonto FOR SELECT
USING (
  has_medical_role(auth.uid())
  AND ((tenant_id IS NULL) OR user_belongs_to_tenant(auth.uid(), tenant_id))
);

CREATE POLICY "Medical staff can insert evolucoes_odonto"
ON public.evolucoes_odonto FOR INSERT
WITH CHECK (has_medical_role(auth.uid()));

CREATE POLICY "Medical staff can update evolucoes_odonto"
ON public.evolucoes_odonto FOR UPDATE
USING (
  has_medical_role(auth.uid())
  AND ((tenant_id IS NULL) OR user_belongs_to_tenant(auth.uid(), tenant_id))
);

-- ==================== TRIGGER ====================

CREATE TRIGGER update_agendamentos_odonto_updated_at
BEFORE UPDATE ON public.agendamentos_odonto
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();