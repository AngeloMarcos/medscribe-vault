-- Tabela principal: Estado atual do odontograma do paciente
CREATE TABLE public.odontogramas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  profissional_id UUID REFERENCES public.profissionais(id),
  tenant_id UUID REFERENCES public.tenants(id),
  dados JSONB NOT NULL DEFAULT '{}',
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(patient_id, tenant_id)
);

-- Tabela de histórico: Log de todas as alterações
CREATE TABLE public.odontograma_historico (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  odontograma_id UUID NOT NULL REFERENCES public.odontogramas(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES public.patients(id),
  profissional_id UUID REFERENCES public.profissionais(id),
  tenant_id UUID REFERENCES public.tenants(id),
  dente INTEGER NOT NULL,
  superficie VARCHAR(20),
  condicao VARCHAR(30) NOT NULL,
  acao VARCHAR(10) NOT NULL CHECK (acao IN ('add', 'remove')),
  observacao TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID
);

-- Índices para performance
CREATE INDEX idx_odontogramas_patient ON public.odontogramas(patient_id);
CREATE INDEX idx_odontogramas_tenant ON public.odontogramas(tenant_id);
CREATE INDEX idx_historico_odontograma ON public.odontograma_historico(odontograma_id);
CREATE INDEX idx_historico_patient ON public.odontograma_historico(patient_id);
CREATE INDEX idx_historico_dente ON public.odontograma_historico(dente);
CREATE INDEX idx_historico_data ON public.odontograma_historico(created_at DESC);

-- Habilitar RLS
ALTER TABLE public.odontogramas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.odontograma_historico ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para odontogramas
CREATE POLICY "Medical staff can view odontogramas"
  ON public.odontogramas FOR SELECT
  USING (has_medical_role(auth.uid()) AND (tenant_id IS NULL OR user_belongs_to_tenant(auth.uid(), tenant_id)));

CREATE POLICY "Medical staff can insert odontogramas"
  ON public.odontogramas FOR INSERT
  WITH CHECK (has_medical_role(auth.uid()));

CREATE POLICY "Medical staff can update odontogramas"
  ON public.odontogramas FOR UPDATE
  USING (has_medical_role(auth.uid()) AND (tenant_id IS NULL OR user_belongs_to_tenant(auth.uid(), tenant_id)));

CREATE POLICY "Medical staff can delete odontogramas"
  ON public.odontogramas FOR DELETE
  USING (has_medical_role(auth.uid()) AND (tenant_id IS NULL OR user_belongs_to_tenant(auth.uid(), tenant_id)));

-- Políticas RLS para histórico
CREATE POLICY "Medical staff can view historico"
  ON public.odontograma_historico FOR SELECT
  USING (has_medical_role(auth.uid()) AND (tenant_id IS NULL OR user_belongs_to_tenant(auth.uid(), tenant_id)));

CREATE POLICY "Medical staff can insert historico"
  ON public.odontograma_historico FOR INSERT
  WITH CHECK (has_medical_role(auth.uid()));

-- Trigger para updated_at
CREATE TRIGGER update_odontogramas_updated_at
  BEFORE UPDATE ON public.odontogramas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();