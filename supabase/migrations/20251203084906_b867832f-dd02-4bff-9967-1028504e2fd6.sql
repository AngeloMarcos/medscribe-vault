-- =============================================
-- SISTEMA DE PRONTUÁRIO ELETRÔNICO - SCHEMA COMPLETO
-- =============================================

-- Tabela: especialidades
CREATE TABLE IF NOT EXISTS public.especialidades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(100) UNIQUE NOT NULL,
  codigo VARCHAR(10) UNIQUE NOT NULL,
  descricao TEXT,
  cor_hex VARCHAR(7) DEFAULT '#00A896',
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dados iniciais de especialidades
INSERT INTO public.especialidades (nome, codigo, cor_hex) VALUES
  ('Oftalmologia', 'OPT', '#00A896'),
  ('Cardiologia', 'CARDIO', '#EF4444'),
  ('Ortopedia', 'ORTOP', '#F59E0B'),
  ('Pediatria', 'PEDIA', '#3B82F6'),
  ('Dermatologia', 'DERMA', '#10B981'),
  ('Neurologia', 'NEURO', '#8B5CF6'),
  ('Ginecologia', 'GINECO', '#EC4899'),
  ('Clínica Geral', 'GERAL', '#6B7280'),
  ('Urologia', 'URO', '#0EA5E9'),
  ('Geriatria', 'GERIA', '#A855F7'),
  ('Endocrinologia', 'ENDO', '#F97316'),
  ('Psiquiatria', 'PSIQ', '#14B8A6')
ON CONFLICT (codigo) DO NOTHING;

-- Tabela: equipes
CREATE TABLE IF NOT EXISTS public.equipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(150) NOT NULL,
  especialidade_id UUID REFERENCES public.especialidades(id),
  descricao TEXT,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela: profissionais
CREATE TABLE IF NOT EXISTS public.profissionais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  nome VARCHAR(255) NOT NULL,
  cpf VARCHAR(14) UNIQUE NOT NULL,
  registro_profissional VARCHAR(30) NOT NULL,
  tipo_registro VARCHAR(10) NOT NULL,
  especialidade_id UUID REFERENCES public.especialidades(id),
  equipe_id UUID REFERENCES public.equipes(id),
  telefone VARCHAR(20),
  email VARCHAR(255) UNIQUE,
  assinatura_digital TEXT,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profissionais_registro ON public.profissionais(registro_profissional);

-- Tabela: salas
CREATE TABLE IF NOT EXISTS public.salas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero VARCHAR(10) UNIQUE NOT NULL,
  nome VARCHAR(100),
  andar VARCHAR(10),
  tipo VARCHAR(50) CHECK (tipo IN ('consultorio', 'cirurgia', 'exame', 'emergencia')),
  capacidade INTEGER DEFAULT 1,
  equipamentos TEXT[],
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dados iniciais de salas
INSERT INTO public.salas (numero, nome, tipo) VALUES
  ('05', 'Consultório 05', 'consultorio'),
  ('08', 'Consultório 08', 'consultorio'),
  ('12', 'Consultório 12', 'consultorio'),
  ('15', 'Consultório 15', 'consultorio'),
  ('18', 'Consultório 18', 'consultorio'),
  ('22', 'Consultório 22', 'consultorio'),
  ('25', 'Consultório 25', 'consultorio'),
  ('30', 'Consultório 30', 'consultorio'),
  ('39', 'Consultório 39', 'consultorio'),
  ('45', 'Sala de Exames 45', 'exame'),
  ('78', 'Consultório 78', 'consultorio')
ON CONFLICT (numero) DO NOTHING;

-- Tabela: zonas
CREATE TABLE IF NOT EXISTS public.zonas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(100) UNIQUE NOT NULL,
  codigo VARCHAR(20) UNIQUE NOT NULL,
  descricao TEXT,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dados iniciais de zonas
INSERT INTO public.zonas (nome, codigo) VALUES
  ('Ambulatório de Egressos', 'AMB_EGRESS'),
  ('Ambulatório Geral', 'AMB_GERAL'),
  ('Ambulatório de Especialidades', 'AMB_ESP'),
  ('Ambulatório Pediátrico', 'AMB_PED'),
  ('Ambulatório Cirúrgico', 'AMB_CIR')
ON CONFLICT (codigo) DO NOTHING;

-- Tabela: grades_horarios
CREATE TABLE IF NOT EXISTS public.grades_horarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profissional_id UUID NOT NULL REFERENCES public.profissionais(id),
  especialidade_id UUID NOT NULL REFERENCES public.especialidades(id),
  equipe_id UUID REFERENCES public.equipes(id),
  sala_id UUID REFERENCES public.salas(id),
  zona_id UUID REFERENCES public.zonas(id),
  dia_semana INTEGER CHECK (dia_semana BETWEEN 0 AND 6),
  hora_inicio TIME NOT NULL,
  hora_fim TIME NOT NULL,
  duracao_consulta INTEGER DEFAULT 30,
  vagas_totais INTEGER DEFAULT 10,
  data_inicio DATE NOT NULL,
  data_fim DATE,
  turno VARCHAR(10) CHECK (turno IN ('manha', 'tarde', 'noite')),
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_grades_profissional ON public.grades_horarios(profissional_id);
CREATE INDEX IF NOT EXISTS idx_grades_data ON public.grades_horarios(data_inicio, data_fim);

-- Tabela: consultas (nova versão mais completa)
CREATE TABLE IF NOT EXISTS public.consultas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id UUID NOT NULL REFERENCES public.patients(id),
  profissional_id UUID REFERENCES public.profissionais(id),
  especialidade_id UUID REFERENCES public.especialidades(id),
  equipe_id UUID REFERENCES public.equipes(id),
  sala_id UUID REFERENCES public.salas(id),
  zona_id UUID REFERENCES public.zonas(id),
  grade_id UUID REFERENCES public.grades_horarios(id),
  data_consulta DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fim TIME,
  numero_consulta VARCHAR(20) UNIQUE NOT NULL,
  status VARCHAR(30) DEFAULT 'agendado' CHECK (status IN (
    'agendado', 'aguardando', 'em_atendimento', 'atendido', 'ausente', 'cancelado', 'pendente'
  )),
  tipo_consulta VARCHAR(30) DEFAULT 'rotina' CHECK (tipo_consulta IN (
    'rotina', 'retorno', 'urgencia', 'primeira_vez'
  )),
  hora_chegada TIMESTAMPTZ,
  hora_inicio_atendimento TIMESTAMPTZ,
  hora_fim_atendimento TIMESTAMPTZ,
  motivo_consulta TEXT,
  observacoes TEXT,
  faltou_paciente BOOLEAN DEFAULT FALSE,
  faltou_profissional BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_consultas_paciente ON public.consultas(paciente_id);
CREATE INDEX IF NOT EXISTS idx_consultas_data ON public.consultas(data_consulta);
CREATE INDEX IF NOT EXISTS idx_consultas_status ON public.consultas(status);
CREATE INDEX IF NOT EXISTS idx_consultas_numero ON public.consultas(numero_consulta);

-- Tabela: atendimentos
CREATE TABLE IF NOT EXISTS public.atendimentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consulta_id UUID NOT NULL REFERENCES public.consultas(id) ON DELETE CASCADE,
  paciente_id UUID NOT NULL REFERENCES public.patients(id),
  profissional_id UUID REFERENCES public.profissionais(id),
  anamnese TEXT,
  evolucao TEXT,
  cid_principal VARCHAR(10),
  cids_secundarios VARCHAR(10)[],
  procedimentos_realizados JSONB DEFAULT '[]'::jsonb,
  prescricao TEXT,
  atestado TEXT,
  atestado_dias INTEGER,
  relatorio TEXT,
  encaminhamentos TEXT,
  retorno_previsto DATE,
  observacoes TEXT,
  assinado BOOLEAN DEFAULT FALSE,
  data_assinatura TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_atendimentos_consulta ON public.atendimentos(consulta_id);
CREATE INDEX IF NOT EXISTS idx_atendimentos_paciente ON public.atendimentos(paciente_id);

-- Tabela: cids (Classificação Internacional de Doenças)
CREATE TABLE IF NOT EXISTS public.cids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo VARCHAR(10) UNIQUE NOT NULL,
  descricao TEXT NOT NULL,
  categoria VARCHAR(100),
  ativo BOOLEAN DEFAULT TRUE
);

-- Dados iniciais de CIDs comuns
INSERT INTO public.cids (codigo, descricao, categoria) VALUES
  ('H52.1', 'Miopia', 'Oftalmologia'),
  ('H52.2', 'Astigmatismo', 'Oftalmologia'),
  ('H52.4', 'Presbiopia', 'Oftalmologia'),
  ('H40.1', 'Glaucoma primário de ângulo aberto', 'Oftalmologia'),
  ('Z00.0', 'Exame médico geral', 'Geral'),
  ('Z00.1', 'Exame de rotina da criança', 'Pediatria'),
  ('I10', 'Hipertensão essencial (primária)', 'Cardiologia'),
  ('I25.1', 'Doença aterosclerótica do coração', 'Cardiologia'),
  ('E11', 'Diabetes mellitus tipo 2', 'Endocrinologia'),
  ('E78.0', 'Hipercolesterolemia pura', 'Endocrinologia'),
  ('J06.9', 'Infecção aguda das vias aéreas superiores', 'Geral'),
  ('M54.5', 'Dor lombar baixa', 'Ortopedia'),
  ('M17.1', 'Gonartrose primária unilateral', 'Ortopedia'),
  ('K29.7', 'Gastrite, não especificada', 'Geral'),
  ('F32.1', 'Episódio depressivo moderado', 'Psiquiatria'),
  ('F41.1', 'Ansiedade generalizada', 'Psiquiatria')
ON CONFLICT (codigo) DO NOTHING;

-- Tabela: estornos_consultas
CREATE TABLE IF NOT EXISTS public.estornos_consultas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consulta_id UUID NOT NULL REFERENCES public.consultas(id),
  usuario_id UUID REFERENCES auth.users(id),
  motivo TEXT NOT NULL,
  status_anterior VARCHAR(30),
  data_estorno TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Função para gerar número de consulta
CREATE OR REPLACE FUNCTION public.gerar_numero_consulta()
RETURNS TRIGGER AS $$
DECLARE
  ano_atual VARCHAR(4);
  ultimo_numero INTEGER;
  novo_numero VARCHAR(20);
BEGIN
  ano_atual := EXTRACT(YEAR FROM CURRENT_DATE)::VARCHAR;
  
  SELECT COALESCE(MAX(CAST(SUBSTRING(numero_consulta FROM 5) AS INTEGER)), 0)
  INTO ultimo_numero
  FROM public.consultas
  WHERE numero_consulta LIKE ano_atual || '%';
  
  novo_numero := ano_atual || LPAD((ultimo_numero + 1)::VARCHAR, 6, '0');
  NEW.numero_consulta := novo_numero;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_gerar_numero_consulta
BEFORE INSERT ON public.consultas
FOR EACH ROW
WHEN (NEW.numero_consulta IS NULL)
EXECUTE FUNCTION public.gerar_numero_consulta();

-- Trigger para atualizar updated_at
CREATE TRIGGER update_consultas_updated_at
BEFORE UPDATE ON public.consultas
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_atendimentos_updated_at
BEFORE UPDATE ON public.atendimentos
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_profissionais_updated_at
BEFORE UPDATE ON public.profissionais
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- =============================================
-- RLS POLICIES
-- =============================================

ALTER TABLE public.especialidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profissionais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zonas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades_horarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.atendimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estornos_consultas ENABLE ROW LEVEL SECURITY;

-- Policies para leitura (authenticated users podem ler)
CREATE POLICY "Authenticated users can read especialidades" ON public.especialidades
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read equipes" ON public.equipes
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read profissionais" ON public.profissionais
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read salas" ON public.salas
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read zonas" ON public.zonas
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read grades_horarios" ON public.grades_horarios
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read consultas" ON public.consultas
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read atendimentos" ON public.atendimentos
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read cids" ON public.cids
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read estornos" ON public.estornos_consultas
  FOR SELECT TO authenticated USING (true);

-- Policies para escrita (authenticated users podem inserir/atualizar)
CREATE POLICY "Authenticated users can insert consultas" ON public.consultas
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update consultas" ON public.consultas
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert atendimentos" ON public.atendimentos
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update atendimentos" ON public.atendimentos
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert estornos" ON public.estornos_consultas
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can insert profissionais" ON public.profissionais
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update profissionais" ON public.profissionais
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert equipes" ON public.equipes
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update equipes" ON public.equipes
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert grades" ON public.grades_horarios
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update grades" ON public.grades_horarios
  FOR UPDATE TO authenticated USING (true);