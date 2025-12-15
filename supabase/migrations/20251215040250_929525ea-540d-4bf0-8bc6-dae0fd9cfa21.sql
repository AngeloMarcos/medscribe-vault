-- Tabela de administração de medicamentos (aprazamento)
CREATE TABLE public.medication_administrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prescription_item_id UUID NOT NULL REFERENCES public.prescription_items(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  scheduled_time TIMESTAMPTZ NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'administered', 'missed', 'suspended', 'refused')),
  administered_at TIMESTAMPTZ,
  administered_by UUID,
  observation TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de anotações de enfermagem
CREATE TABLE public.nursing_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  consulta_id UUID REFERENCES public.consultas(id) ON DELETE SET NULL,
  note_type VARCHAR(50) CHECK (note_type IN ('evolution', 'observation', 'intercurrence', 'procedure', 'vital_signs')),
  content TEXT NOT NULL,
  is_critical BOOLEAN DEFAULT false,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de fila de enfermagem
CREATE TABLE public.nursing_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  consulta_id UUID REFERENCES public.consultas(id) ON DELETE SET NULL,
  sector VARCHAR(50) NOT NULL CHECK (sector IN ('medication_room', 'observation', 'vitals', 'procedures', 'dressing')),
  priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('emergency', 'priority', 'normal')),
  status VARCHAR(20) DEFAULT 'waiting' CHECK (status IN ('waiting', 'in_progress', 'completed', 'cancelled')),
  referred_from VARCHAR(100),
  notes TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  attended_by UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_medication_administrations_patient ON public.medication_administrations(patient_id);
CREATE INDEX idx_medication_administrations_scheduled ON public.medication_administrations(scheduled_time);
CREATE INDEX idx_medication_administrations_status ON public.medication_administrations(status);
CREATE INDEX idx_nursing_notes_patient ON public.nursing_notes(patient_id);
CREATE INDEX idx_nursing_queue_status ON public.nursing_queue(status);
CREATE INDEX idx_nursing_queue_sector ON public.nursing_queue(sector);
CREATE INDEX idx_nursing_queue_priority ON public.nursing_queue(priority);

-- RLS
ALTER TABLE public.medication_administrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nursing_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nursing_queue ENABLE ROW LEVEL SECURITY;

-- Função helper para verificar role de enfermagem
CREATE OR REPLACE FUNCTION public.has_nursing_role(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin', 'enfermeiro', 'tecnico_enfermagem')
  )
$$;

-- Políticas para medication_administrations
CREATE POLICY "Nursing staff can view medication_administrations"
ON public.medication_administrations FOR SELECT
USING (has_nursing_role(auth.uid()) OR has_medical_role(auth.uid()));

CREATE POLICY "Nursing staff can insert medication_administrations"
ON public.medication_administrations FOR INSERT
WITH CHECK (has_nursing_role(auth.uid()) OR has_medical_role(auth.uid()));

CREATE POLICY "Nursing staff can update medication_administrations"
ON public.medication_administrations FOR UPDATE
USING (has_nursing_role(auth.uid()));

-- Políticas para nursing_notes
CREATE POLICY "Nursing staff can view nursing_notes"
ON public.nursing_notes FOR SELECT
USING (has_nursing_role(auth.uid()) OR has_medical_role(auth.uid()));

CREATE POLICY "Nursing staff can insert nursing_notes"
ON public.nursing_notes FOR INSERT
WITH CHECK (has_nursing_role(auth.uid()));

CREATE POLICY "Nursing staff can update own nursing_notes"
ON public.nursing_notes FOR UPDATE
USING (has_nursing_role(auth.uid()) AND created_by = auth.uid());

-- Políticas para nursing_queue
CREATE POLICY "Nursing staff can view nursing_queue"
ON public.nursing_queue FOR SELECT
USING (has_nursing_role(auth.uid()) OR has_medical_role(auth.uid()) OR has_role(auth.uid(), 'recepcao'));

CREATE POLICY "Staff can insert nursing_queue"
ON public.nursing_queue FOR INSERT
WITH CHECK (has_nursing_role(auth.uid()) OR has_medical_role(auth.uid()) OR has_role(auth.uid(), 'recepcao'));

CREATE POLICY "Nursing staff can update nursing_queue"
ON public.nursing_queue FOR UPDATE
USING (has_nursing_role(auth.uid()));

-- Habilitar realtime para nursing_queue
ALTER PUBLICATION supabase_realtime ADD TABLE public.nursing_queue;

-- Trigger para updated_at
CREATE TRIGGER update_medication_administrations_updated_at
BEFORE UPDATE ON public.medication_administrations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();