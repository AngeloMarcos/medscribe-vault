-- Tabela de catálogo de procedimentos odontológicos
CREATE TABLE public.procedimentos_odonto (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo VARCHAR(20) NOT NULL UNIQUE,
  nome VARCHAR(200) NOT NULL,
  categoria VARCHAR(50) NOT NULL,
  duracao_minutos INTEGER DEFAULT 30,
  preco_padrao DECIMAL(10,2) DEFAULT 0,
  descricao TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de planos de tratamento odontológico
CREATE TABLE public.planos_tratamento_odonto (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  profissional_id UUID REFERENCES public.profissionais(id),
  tenant_id UUID REFERENCES public.tenants(id),
  data_inicio DATE NOT NULL DEFAULT CURRENT_DATE,
  data_previsao_fim DATE,
  status VARCHAR(20) DEFAULT 'orcamento',
  observacoes_gerais TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de itens do plano de tratamento
CREATE TABLE public.itens_plano_tratamento (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plano_id UUID NOT NULL REFERENCES public.planos_tratamento_odonto(id) ON DELETE CASCADE,
  procedimento_id UUID NOT NULL REFERENCES public.procedimentos_odonto(id),
  profissional_id UUID REFERENCES public.profissionais(id),
  tenant_id UUID REFERENCES public.tenants(id),
  dente INTEGER,
  superficie VARCHAR(100),
  valor_unitario DECIMAL(10,2) NOT NULL,
  desconto_percentual DECIMAL(5,2) DEFAULT 0,
  valor_final DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'planejado',
  urgencia VARCHAR(10) DEFAULT 'baixa',
  ordem_prioridade INTEGER DEFAULT 0,
  data_realizacao DATE,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_planos_patient ON public.planos_tratamento_odonto(patient_id);
CREATE INDEX idx_planos_tenant ON public.planos_tratamento_odonto(tenant_id);
CREATE INDEX idx_itens_plano ON public.itens_plano_tratamento(plano_id);
CREATE INDEX idx_itens_tenant ON public.itens_plano_tratamento(tenant_id);
CREATE INDEX idx_procedimentos_categoria ON public.procedimentos_odonto(categoria);

-- Enable RLS
ALTER TABLE public.procedimentos_odonto ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planos_tratamento_odonto ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itens_plano_tratamento ENABLE ROW LEVEL SECURITY;

-- RLS Policies for procedimentos_odonto (read-only for authenticated)
CREATE POLICY "Authenticated can read procedimentos"
  ON public.procedimentos_odonto FOR SELECT
  USING (true);

-- RLS Policies for planos_tratamento_odonto
CREATE POLICY "Medical staff can view planos"
  ON public.planos_tratamento_odonto FOR SELECT
  USING (has_medical_role(auth.uid()) AND (tenant_id IS NULL OR user_belongs_to_tenant(auth.uid(), tenant_id)));

CREATE POLICY "Medical staff can insert planos"
  ON public.planos_tratamento_odonto FOR INSERT
  WITH CHECK (has_medical_role(auth.uid()));

CREATE POLICY "Medical staff can update planos"
  ON public.planos_tratamento_odonto FOR UPDATE
  USING (has_medical_role(auth.uid()) AND (tenant_id IS NULL OR user_belongs_to_tenant(auth.uid(), tenant_id)));

CREATE POLICY "Medical staff can delete planos"
  ON public.planos_tratamento_odonto FOR DELETE
  USING (has_medical_role(auth.uid()) AND (tenant_id IS NULL OR user_belongs_to_tenant(auth.uid(), tenant_id)));

-- RLS Policies for itens_plano_tratamento
CREATE POLICY "Medical staff can view itens"
  ON public.itens_plano_tratamento FOR SELECT
  USING (has_medical_role(auth.uid()) AND (tenant_id IS NULL OR user_belongs_to_tenant(auth.uid(), tenant_id)));

CREATE POLICY "Medical staff can insert itens"
  ON public.itens_plano_tratamento FOR INSERT
  WITH CHECK (has_medical_role(auth.uid()));

CREATE POLICY "Medical staff can update itens"
  ON public.itens_plano_tratamento FOR UPDATE
  USING (has_medical_role(auth.uid()) AND (tenant_id IS NULL OR user_belongs_to_tenant(auth.uid(), tenant_id)));

CREATE POLICY "Medical staff can delete itens"
  ON public.itens_plano_tratamento FOR DELETE
  USING (has_medical_role(auth.uid()) AND (tenant_id IS NULL OR user_belongs_to_tenant(auth.uid(), tenant_id)));

-- Trigger for updated_at
CREATE TRIGGER update_planos_tratamento_updated_at
  BEFORE UPDATE ON public.planos_tratamento_odonto
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_itens_plano_updated_at
  BEFORE UPDATE ON public.itens_plano_tratamento
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Seed procedimentos odontológicos
INSERT INTO public.procedimentos_odonto (codigo, nome, categoria, duracao_minutos, preco_padrao) VALUES
  ('AVAL-01', 'Avaliação Inicial', 'avaliacaoInicial', 30, 150),
  ('EXAM-01', 'Exame Clínico Completo', 'avaliacaoInicial', 45, 200),
  ('PANO-01', 'Radiografia Panorâmica', 'avaliacaoInicial', 15, 120),
  ('PERI-01', 'Radiografia Periapical', 'avaliacaoInicial', 10, 50),
  ('PROF-01', 'Limpeza (Profilaxia)', 'preventivos', 30, 180),
  ('FLUO-01', 'Aplicação de Flúor', 'preventivos', 15, 80),
  ('SELA-01', 'Selante', 'preventivos', 20, 120),
  ('REST-1F', 'Restauração Resina (1 face)', 'restauradores', 40, 250),
  ('REST-2F', 'Restauração Resina (2 faces)', 'restauradores', 50, 350),
  ('REST-3F', 'Restauração Resina (3 faces)', 'restauradores', 60, 450),
  ('REST-AM', 'Restauração Amálgama', 'restauradores', 40, 200),
  ('NUCL-01', 'Núcleo de Preenchimento', 'restauradores', 45, 300),
  ('ENDO-ANT', 'Tratamento de Canal (Anterior)', 'endodontia', 60, 800),
  ('ENDO-PRE', 'Tratamento de Canal (Pré-molar)', 'endodontia', 90, 1000),
  ('ENDO-MOL', 'Tratamento de Canal (Molar)', 'endodontia', 120, 1200),
  ('RETR-01', 'Retratamento Endodôntico', 'endodontia', 120, 1500),
  ('RASP-01', 'Raspagem Supragengival', 'periodontia', 45, 250),
  ('RASP-02', 'Raspagem Subgengival (por quadrante)', 'periodontia', 60, 350),
  ('GENG-01', 'Gengivoplastia', 'periodontia', 60, 500),
  ('GENG-02', 'Gengivectomia', 'periodontia', 60, 550),
  ('EXOD-SI', 'Extração Simples', 'cirurgia', 30, 200),
  ('EXOD-CO', 'Extração Complexa', 'cirurgia', 60, 400),
  ('SISO-01', 'Extração de Siso (incluso)', 'cirurgia', 90, 800),
  ('SISO-02', 'Extração de Siso (semi-incluso)', 'cirurgia', 60, 600),
  ('FREN-01', 'Frenectomia', 'cirurgia', 45, 450),
  ('BIOPSIA', 'Biópsia', 'cirurgia', 30, 350),
  ('COPM-01', 'Coroa Metalocerâmica', 'protese', 60, 1200),
  ('COPL-01', 'Coroa Porcelana Pura', 'protese', 60, 1800),
  ('PONT-01', 'Ponte Fixa (3 elementos)', 'protese', 90, 3500),
  ('PROT-PP', 'Prótese Parcial Removível', 'protese', 60, 1500),
  ('PROT-PT', 'Prótese Total', 'protese', 90, 2000),
  ('FACET', 'Faceta de Porcelana', 'protese', 60, 1500),
  ('ORTO-DOC', 'Documentação Ortodôntica', 'ortodontia', 30, 400),
  ('ORTO-FIX', 'Aparelho Fixo Metálico', 'ortodontia', 90, 3000),
  ('ORTO-EST', 'Aparelho Fixo Estético', 'ortodontia', 90, 4500),
  ('ORTO-MOV', 'Aparelho Móvel', 'ortodontia', 45, 800),
  ('ORTO-CON', 'Contenção', 'ortodontia', 30, 400),
  ('ORTO-MAN', 'Manutenção Ortodôntica', 'ortodontia', 30, 250),
  ('CLAR-01', 'Clareamento Consultório', 'estetica', 90, 800),
  ('CLAR-02', 'Clareamento Caseiro (moldeiras)', 'estetica', 30, 500);