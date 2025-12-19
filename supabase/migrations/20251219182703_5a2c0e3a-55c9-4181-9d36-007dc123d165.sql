-- Tabela de Medicamentos REMUME
CREATE TABLE public.medicamentos_remume (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo VARCHAR(20) UNIQUE NOT NULL,
  nome_generico VARCHAR(200) NOT NULL,
  nome_comercial VARCHAR(200),
  apresentacao VARCHAR(300) NOT NULL,
  forma_farmaceutica VARCHAR(100),
  concentracao VARCHAR(100),
  unidade_medida VARCHAR(20),
  via_padrao VARCHAR(50),
  categoria VARCHAR(100),
  controlado BOOLEAN DEFAULT false,
  tipo_receita VARCHAR(50) DEFAULT 'simples',
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS para medicamentos_remume
ALTER TABLE public.medicamentos_remume ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read medicamentos_remume"
ON public.medicamentos_remume FOR SELECT
USING (true);

-- Tabela de Receitas
CREATE TABLE public.receitas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consulta_id UUID REFERENCES public.consultas(id),
  paciente_id UUID NOT NULL REFERENCES public.patients(id),
  profissional_id UUID REFERENCES public.profissionais(id),
  tenant_id UUID REFERENCES public.tenants(id),
  tipo VARCHAR(20) DEFAULT 'simples',
  status VARCHAR(20) DEFAULT 'ativa',
  data_emissao DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.receitas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Medical staff can view receitas"
ON public.receitas FOR SELECT
USING (has_medical_role(auth.uid()) AND (tenant_id IS NULL OR user_belongs_to_tenant(auth.uid(), tenant_id)));

CREATE POLICY "Medical staff can insert receitas"
ON public.receitas FOR INSERT
WITH CHECK (has_medical_role(auth.uid()));

CREATE POLICY "Medical staff can update receitas"
ON public.receitas FOR UPDATE
USING (has_medical_role(auth.uid()) AND (tenant_id IS NULL OR user_belongs_to_tenant(auth.uid(), tenant_id)));

CREATE POLICY "Medical staff can delete receitas"
ON public.receitas FOR DELETE
USING (has_medical_role(auth.uid()) AND (tenant_id IS NULL OR user_belongs_to_tenant(auth.uid(), tenant_id)));

-- Tabela de Itens da Receita
CREATE TABLE public.receita_itens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receita_id UUID NOT NULL REFERENCES public.receitas(id) ON DELETE CASCADE,
  medicamento_id UUID REFERENCES public.medicamentos_remume(id),
  medicamento_nome VARCHAR(300) NOT NULL,
  dose VARCHAR(50) NOT NULL,
  unidade VARCHAR(20) NOT NULL,
  via VARCHAR(50) NOT NULL,
  frequencia VARCHAR(100) NOT NULL,
  duracao_dias INTEGER,
  duracao_texto VARCHAR(100),
  quantidade_total INTEGER,
  orientacoes TEXT,
  ordem INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.receita_itens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Medical staff can view receita_itens"
ON public.receita_itens FOR SELECT
USING (has_medical_role(auth.uid()));

CREATE POLICY "Medical staff can insert receita_itens"
ON public.receita_itens FOR INSERT
WITH CHECK (has_medical_role(auth.uid()));

CREATE POLICY "Medical staff can update receita_itens"
ON public.receita_itens FOR UPDATE
USING (has_medical_role(auth.uid()));

CREATE POLICY "Medical staff can delete receita_itens"
ON public.receita_itens FOR DELETE
USING (has_medical_role(auth.uid()));

-- Tabela de Atestados
CREATE TABLE public.atestados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consulta_id UUID REFERENCES public.consultas(id),
  paciente_id UUID NOT NULL REFERENCES public.patients(id),
  profissional_id UUID REFERENCES public.profissionais(id),
  tenant_id UUID REFERENCES public.tenants(id),
  data_emissao DATE DEFAULT CURRENT_DATE,
  data_inicio DATE NOT NULL,
  data_fim DATE NOT NULL,
  dias_afastamento INTEGER NOT NULL,
  cid_codigo VARCHAR(10),
  motivo TEXT,
  observacoes TEXT,
  impresso BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.atestados ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Medical staff can view atestados"
ON public.atestados FOR SELECT
USING (has_medical_role(auth.uid()) AND (tenant_id IS NULL OR user_belongs_to_tenant(auth.uid(), tenant_id)));

CREATE POLICY "Medical staff can insert atestados"
ON public.atestados FOR INSERT
WITH CHECK (has_medical_role(auth.uid()));

CREATE POLICY "Medical staff can update atestados"
ON public.atestados FOR UPDATE
USING (has_medical_role(auth.uid()) AND (tenant_id IS NULL OR user_belongs_to_tenant(auth.uid(), tenant_id)));

CREATE POLICY "Medical staff can delete atestados"
ON public.atestados FOR DELETE
USING (has_medical_role(auth.uid()) AND (tenant_id IS NULL OR user_belongs_to_tenant(auth.uid(), tenant_id)));

-- Tabela de Catálogo de Exames
CREATE TABLE public.exames_catalogo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo VARCHAR(20) UNIQUE NOT NULL,
  nome VARCHAR(300) NOT NULL,
  categoria VARCHAR(100),
  tipo VARCHAR(50),
  preparo TEXT,
  prazo_resultado VARCHAR(50),
  requer_autorizacao BOOLEAN DEFAULT false,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.exames_catalogo ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read exames_catalogo"
ON public.exames_catalogo FOR SELECT
USING (true);

-- Tabela de Solicitações de Exames
CREATE TABLE public.solicitacoes_exames (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consulta_id UUID REFERENCES public.consultas(id),
  paciente_id UUID NOT NULL REFERENCES public.patients(id),
  profissional_id UUID REFERENCES public.profissionais(id),
  tenant_id UUID REFERENCES public.tenants(id),
  cid_justificativa VARCHAR(10),
  hipotese_diagnostica TEXT,
  urgencia VARCHAR(20) DEFAULT 'normal',
  status VARCHAR(20) DEFAULT 'solicitado',
  data_solicitacao DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.solicitacoes_exames ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Medical staff can view solicitacoes_exames"
ON public.solicitacoes_exames FOR SELECT
USING (has_medical_role(auth.uid()) AND (tenant_id IS NULL OR user_belongs_to_tenant(auth.uid(), tenant_id)));

CREATE POLICY "Medical staff can insert solicitacoes_exames"
ON public.solicitacoes_exames FOR INSERT
WITH CHECK (has_medical_role(auth.uid()));

CREATE POLICY "Medical staff can update solicitacoes_exames"
ON public.solicitacoes_exames FOR UPDATE
USING (has_medical_role(auth.uid()) AND (tenant_id IS NULL OR user_belongs_to_tenant(auth.uid(), tenant_id)));

CREATE POLICY "Medical staff can delete solicitacoes_exames"
ON public.solicitacoes_exames FOR DELETE
USING (has_medical_role(auth.uid()) AND (tenant_id IS NULL OR user_belongs_to_tenant(auth.uid(), tenant_id)));

-- Tabela de Itens de Solicitação de Exames
CREATE TABLE public.solicitacao_exame_itens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  solicitacao_id UUID NOT NULL REFERENCES public.solicitacoes_exames(id) ON DELETE CASCADE,
  exame_id UUID REFERENCES public.exames_catalogo(id),
  exame_nome VARCHAR(300) NOT NULL,
  observacao TEXT,
  status VARCHAR(20) DEFAULT 'pendente',
  data_realizacao DATE,
  resultado TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.solicitacao_exame_itens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Medical staff can view solicitacao_exame_itens"
ON public.solicitacao_exame_itens FOR SELECT
USING (has_medical_role(auth.uid()));

CREATE POLICY "Medical staff can insert solicitacao_exame_itens"
ON public.solicitacao_exame_itens FOR INSERT
WITH CHECK (has_medical_role(auth.uid()));

CREATE POLICY "Medical staff can update solicitacao_exame_itens"
ON public.solicitacao_exame_itens FOR UPDATE
USING (has_medical_role(auth.uid()));

CREATE POLICY "Medical staff can delete solicitacao_exame_itens"
ON public.solicitacao_exame_itens FOR DELETE
USING (has_medical_role(auth.uid()));