-- Table for referrals (encaminhamentos)
CREATE TABLE encaminhamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consulta_id UUID REFERENCES consultas(id),
  paciente_id UUID REFERENCES patients(id) NOT NULL,
  profissional_id UUID REFERENCES profissionais(id),
  tenant_id UUID REFERENCES tenants(id),
  tipo VARCHAR(50) NOT NULL, -- 'especialista', 'ubs', 'pronto_atendimento', 'internacao'
  especialidade_destino VARCHAR(100),
  unidade_destino VARCHAR(200),
  profissional_destino VARCHAR(200),
  justificativa TEXT NOT NULL,
  hipotese_diagnostica TEXT,
  cid_principal VARCHAR(10),
  observacoes TEXT,
  urgencia VARCHAR(20) NOT NULL DEFAULT 'eletivo', -- 'eletivo', 'urgente', 'emergencia'
  transporte VARCHAR(50), -- 'proprio', 'ambulancia', 'uti_movel'
  status VARCHAR(20) NOT NULL DEFAULT 'pendente', -- 'pendente', 'encaminhado', 'concluido', 'cancelado'
  data_encaminhamento DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT valid_tipo CHECK (tipo IN ('especialista', 'ubs', 'pronto_atendimento', 'internacao')),
  CONSTRAINT valid_urgencia CHECK (urgencia IN ('eletivo', 'urgente', 'emergencia')),
  CONSTRAINT valid_status CHECK (status IN ('pendente', 'encaminhado', 'concluido', 'cancelado'))
);

-- Indexes
CREATE INDEX idx_encaminhamentos_tenant ON encaminhamentos(tenant_id);
CREATE INDEX idx_encaminhamentos_paciente ON encaminhamentos(paciente_id);
CREATE INDEX idx_encaminhamentos_consulta ON encaminhamentos(consulta_id);
CREATE INDEX idx_encaminhamentos_status ON encaminhamentos(status);

-- Enable RLS
ALTER TABLE encaminhamentos ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Medical staff can view encaminhamentos"
  ON encaminhamentos FOR SELECT
  USING (has_medical_role(auth.uid()) AND ((tenant_id IS NULL) OR user_belongs_to_tenant(auth.uid(), tenant_id)));

CREATE POLICY "Medical staff can insert encaminhamentos"
  ON encaminhamentos FOR INSERT
  WITH CHECK (has_medical_role(auth.uid()));

CREATE POLICY "Medical staff can update encaminhamentos"
  ON encaminhamentos FOR UPDATE
  USING (has_medical_role(auth.uid()) AND ((tenant_id IS NULL) OR user_belongs_to_tenant(auth.uid(), tenant_id)));

CREATE POLICY "Medical staff can delete encaminhamentos"
  ON encaminhamentos FOR DELETE
  USING (has_medical_role(auth.uid()) AND ((tenant_id IS NULL) OR user_belongs_to_tenant(auth.uid(), tenant_id)));

-- Trigger for updated_at
CREATE TRIGGER update_encaminhamentos_updated_at
  BEFORE UPDATE ON encaminhamentos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();