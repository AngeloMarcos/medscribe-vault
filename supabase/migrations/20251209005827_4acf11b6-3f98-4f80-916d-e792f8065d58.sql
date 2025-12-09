-- Create prescriptions table
CREATE TABLE public.prescriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.patients(id),
  consulta_id UUID REFERENCES public.consultas(id),
  prescription_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expected_discharge_date DATE,
  is_pediatric BOOLEAN DEFAULT false,
  validity_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  validity_end TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '24 hours'),
  status VARCHAR(20) DEFAULT 'pending',
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create prescription_items table
CREATE TABLE public.prescription_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  prescription_id UUID NOT NULL REFERENCES public.prescriptions(id) ON DELETE CASCADE,
  item_type VARCHAR(50) NOT NULL,
  sequence_order INTEGER NOT NULL DEFAULT 0,
  description TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'active',
  is_high_risk BOOLEAN DEFAULT false,
  observation TEXT,
  item_details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescription_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for prescriptions
CREATE POLICY "Medical staff can view prescriptions"
ON public.prescriptions FOR SELECT
USING (has_medical_role(auth.uid()) OR has_role(auth.uid(), 'recepcao'::app_role));

CREATE POLICY "Medical staff can insert prescriptions"
ON public.prescriptions FOR INSERT
WITH CHECK (has_medical_role(auth.uid()));

CREATE POLICY "Medical staff can update prescriptions"
ON public.prescriptions FOR UPDATE
USING (has_medical_role(auth.uid()));

CREATE POLICY "Medical staff can delete prescriptions"
ON public.prescriptions FOR DELETE
USING (has_medical_role(auth.uid()));

-- RLS Policies for prescription_items
CREATE POLICY "Medical staff can view prescription_items"
ON public.prescription_items FOR SELECT
USING (has_medical_role(auth.uid()) OR has_role(auth.uid(), 'recepcao'::app_role));

CREATE POLICY "Medical staff can insert prescription_items"
ON public.prescription_items FOR INSERT
WITH CHECK (has_medical_role(auth.uid()));

CREATE POLICY "Medical staff can update prescription_items"
ON public.prescription_items FOR UPDATE
USING (has_medical_role(auth.uid()));

CREATE POLICY "Medical staff can delete prescription_items"
ON public.prescription_items FOR DELETE
USING (has_medical_role(auth.uid()));

-- Create indexes for better performance
CREATE INDEX idx_prescriptions_patient_id ON public.prescriptions(patient_id);
CREATE INDEX idx_prescriptions_consulta_id ON public.prescriptions(consulta_id);
CREATE INDEX idx_prescriptions_status ON public.prescriptions(status);
CREATE INDEX idx_prescription_items_prescription_id ON public.prescription_items(prescription_id);
CREATE INDEX idx_prescription_items_item_type ON public.prescription_items(item_type);

-- Trigger for updated_at
CREATE TRIGGER update_prescriptions_updated_at
BEFORE UPDATE ON public.prescriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_prescription_items_updated_at
BEFORE UPDATE ON public.prescription_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();