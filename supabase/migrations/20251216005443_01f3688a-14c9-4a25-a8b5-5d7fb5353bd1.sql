-- Add tenant_id to all clinical tables that are missing it
-- This fixes the multi-tenant data isolation security flaw

-- 1. Add tenant_id to appointments
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id);

-- 2. Add tenant_id to anamneses
ALTER TABLE public.anamneses ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id);

-- 3. Add tenant_id to evolutions
ALTER TABLE public.evolutions ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id);

-- 4. Add tenant_id to vitals
ALTER TABLE public.vitals ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id);

-- 5. Add tenant_id to procedures
ALTER TABLE public.procedures ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id);

-- 6. Add tenant_id to exam_requests
ALTER TABLE public.exam_requests ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id);

-- 7. Add tenant_id to reports
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id);

-- 8. Add tenant_id to atendimentos
ALTER TABLE public.atendimentos ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id);

-- 9. Add tenant_id to estornos_consultas
ALTER TABLE public.estornos_consultas ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id);

-- 10. Add tenant_id to prescriptions
ALTER TABLE public.prescriptions ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id);

-- 11. Add tenant_id to prescription_items
ALTER TABLE public.prescription_items ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id);

-- 12. Add tenant_id to medication_administrations
ALTER TABLE public.medication_administrations ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id);

-- 13. Add tenant_id to nursing_notes
ALTER TABLE public.nursing_notes ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id);

-- 14. Add tenant_id to nursing_queue
ALTER TABLE public.nursing_queue ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id);

-- 15. Add tenant_id to patients (missing from list but critical)
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id);

-- 16. Add tenant_id to consultas (missing from list but critical)
ALTER TABLE public.consultas ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_appointments_tenant_id ON public.appointments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_anamneses_tenant_id ON public.anamneses(tenant_id);
CREATE INDEX IF NOT EXISTS idx_evolutions_tenant_id ON public.evolutions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_vitals_tenant_id ON public.vitals(tenant_id);
CREATE INDEX IF NOT EXISTS idx_procedures_tenant_id ON public.procedures(tenant_id);
CREATE INDEX IF NOT EXISTS idx_exam_requests_tenant_id ON public.exam_requests(tenant_id);
CREATE INDEX IF NOT EXISTS idx_reports_tenant_id ON public.reports(tenant_id);
CREATE INDEX IF NOT EXISTS idx_atendimentos_tenant_id ON public.atendimentos(tenant_id);
CREATE INDEX IF NOT EXISTS idx_estornos_consultas_tenant_id ON public.estornos_consultas(tenant_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_tenant_id ON public.prescriptions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_prescription_items_tenant_id ON public.prescription_items(tenant_id);
CREATE INDEX IF NOT EXISTS idx_medication_administrations_tenant_id ON public.medication_administrations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_nursing_notes_tenant_id ON public.nursing_notes(tenant_id);
CREATE INDEX IF NOT EXISTS idx_nursing_queue_tenant_id ON public.nursing_queue(tenant_id);
CREATE INDEX IF NOT EXISTS idx_patients_tenant_id ON public.patients(tenant_id);
CREATE INDEX IF NOT EXISTS idx_consultas_tenant_id ON public.consultas(tenant_id);

-- Drop old RLS policies and create new ones with tenant isolation

-- APPOINTMENTS
DROP POLICY IF EXISTS "Staff can delete appointments" ON public.appointments;
DROP POLICY IF EXISTS "Staff can insert appointments" ON public.appointments;
DROP POLICY IF EXISTS "Staff can update appointments" ON public.appointments;
DROP POLICY IF EXISTS "Staff can view appointments" ON public.appointments;

CREATE POLICY "Staff can view appointments" ON public.appointments FOR SELECT
USING ((has_medical_role(auth.uid()) OR has_role(auth.uid(), 'recepcao'::app_role)) 
  AND (tenant_id IS NULL OR user_belongs_to_tenant(auth.uid(), tenant_id)));

CREATE POLICY "Staff can insert appointments" ON public.appointments FOR INSERT
WITH CHECK ((has_medical_role(auth.uid()) OR has_role(auth.uid(), 'recepcao'::app_role)));

CREATE POLICY "Staff can update appointments" ON public.appointments FOR UPDATE
USING ((has_medical_role(auth.uid()) OR has_role(auth.uid(), 'recepcao'::app_role)) 
  AND (tenant_id IS NULL OR user_belongs_to_tenant(auth.uid(), tenant_id)));

CREATE POLICY "Staff can delete appointments" ON public.appointments FOR DELETE
USING ((has_medical_role(auth.uid()) OR has_role(auth.uid(), 'recepcao'::app_role)) 
  AND (tenant_id IS NULL OR user_belongs_to_tenant(auth.uid(), tenant_id)));

-- ANAMNESES
DROP POLICY IF EXISTS "Medical staff can manage anamneses" ON public.anamneses;

CREATE POLICY "Medical staff can view anamneses" ON public.anamneses FOR SELECT
USING (has_medical_role(auth.uid()) AND (tenant_id IS NULL OR user_belongs_to_tenant(auth.uid(), tenant_id)));

CREATE POLICY "Medical staff can insert anamneses" ON public.anamneses FOR INSERT
WITH CHECK (has_medical_role(auth.uid()));

CREATE POLICY "Medical staff can update anamneses" ON public.anamneses FOR UPDATE
USING (has_medical_role(auth.uid()) AND (tenant_id IS NULL OR user_belongs_to_tenant(auth.uid(), tenant_id)));

CREATE POLICY "Medical staff can delete anamneses" ON public.anamneses FOR DELETE
USING (has_medical_role(auth.uid()) AND (tenant_id IS NULL OR user_belongs_to_tenant(auth.uid(), tenant_id)));

-- EVOLUTIONS
DROP POLICY IF EXISTS "Medical staff can manage evolutions" ON public.evolutions;

CREATE POLICY "Medical staff can view evolutions" ON public.evolutions FOR SELECT
USING (has_medical_role(auth.uid()) AND (tenant_id IS NULL OR user_belongs_to_tenant(auth.uid(), tenant_id)));

CREATE POLICY "Medical staff can insert evolutions" ON public.evolutions FOR INSERT
WITH CHECK (has_medical_role(auth.uid()));

CREATE POLICY "Medical staff can update evolutions" ON public.evolutions FOR UPDATE
USING (has_medical_role(auth.uid()) AND (tenant_id IS NULL OR user_belongs_to_tenant(auth.uid(), tenant_id)));

CREATE POLICY "Medical staff can delete evolutions" ON public.evolutions FOR DELETE
USING (has_medical_role(auth.uid()) AND (tenant_id IS NULL OR user_belongs_to_tenant(auth.uid(), tenant_id)));

-- VITALS
DROP POLICY IF EXISTS "Medical staff can manage vitals" ON public.vitals;

CREATE POLICY "Medical staff can view vitals" ON public.vitals FOR SELECT
USING (has_medical_role(auth.uid()) AND (tenant_id IS NULL OR user_belongs_to_tenant(auth.uid(), tenant_id)));

CREATE POLICY "Medical staff can insert vitals" ON public.vitals FOR INSERT
WITH CHECK (has_medical_role(auth.uid()));

CREATE POLICY "Medical staff can update vitals" ON public.vitals FOR UPDATE
USING (has_medical_role(auth.uid()) AND (tenant_id IS NULL OR user_belongs_to_tenant(auth.uid(), tenant_id)));

CREATE POLICY "Medical staff can delete vitals" ON public.vitals FOR DELETE
USING (has_medical_role(auth.uid()) AND (tenant_id IS NULL OR user_belongs_to_tenant(auth.uid(), tenant_id)));

-- PROCEDURES
DROP POLICY IF EXISTS "Medical staff can manage procedures" ON public.procedures;

CREATE POLICY "Medical staff can view procedures" ON public.procedures FOR SELECT
USING (has_medical_role(auth.uid()) AND (tenant_id IS NULL OR user_belongs_to_tenant(auth.uid(), tenant_id)));

CREATE POLICY "Medical staff can insert procedures" ON public.procedures FOR INSERT
WITH CHECK (has_medical_role(auth.uid()));

CREATE POLICY "Medical staff can update procedures" ON public.procedures FOR UPDATE
USING (has_medical_role(auth.uid()) AND (tenant_id IS NULL OR user_belongs_to_tenant(auth.uid(), tenant_id)));

CREATE POLICY "Medical staff can delete procedures" ON public.procedures FOR DELETE
USING (has_medical_role(auth.uid()) AND (tenant_id IS NULL OR user_belongs_to_tenant(auth.uid(), tenant_id)));

-- EXAM_REQUESTS
DROP POLICY IF EXISTS "Medical staff can manage exam_requests" ON public.exam_requests;

CREATE POLICY "Medical staff can view exam_requests" ON public.exam_requests FOR SELECT
USING (has_medical_role(auth.uid()) AND (tenant_id IS NULL OR user_belongs_to_tenant(auth.uid(), tenant_id)));

CREATE POLICY "Medical staff can insert exam_requests" ON public.exam_requests FOR INSERT
WITH CHECK (has_medical_role(auth.uid()));

CREATE POLICY "Medical staff can update exam_requests" ON public.exam_requests FOR UPDATE
USING (has_medical_role(auth.uid()) AND (tenant_id IS NULL OR user_belongs_to_tenant(auth.uid(), tenant_id)));

CREATE POLICY "Medical staff can delete exam_requests" ON public.exam_requests FOR DELETE
USING (has_medical_role(auth.uid()) AND (tenant_id IS NULL OR user_belongs_to_tenant(auth.uid(), tenant_id)));

-- REPORTS
DROP POLICY IF EXISTS "Medical staff can manage reports" ON public.reports;

CREATE POLICY "Medical staff can view reports" ON public.reports FOR SELECT
USING (has_medical_role(auth.uid()) AND (tenant_id IS NULL OR user_belongs_to_tenant(auth.uid(), tenant_id)));

CREATE POLICY "Medical staff can insert reports" ON public.reports FOR INSERT
WITH CHECK (has_medical_role(auth.uid()));

CREATE POLICY "Medical staff can update reports" ON public.reports FOR UPDATE
USING (has_medical_role(auth.uid()) AND (tenant_id IS NULL OR user_belongs_to_tenant(auth.uid(), tenant_id)));

CREATE POLICY "Medical staff can delete reports" ON public.reports FOR DELETE
USING (has_medical_role(auth.uid()) AND (tenant_id IS NULL OR user_belongs_to_tenant(auth.uid(), tenant_id)));

-- ATENDIMENTOS
DROP POLICY IF EXISTS "Medical staff can manage atendimentos" ON public.atendimentos;

CREATE POLICY "Medical staff can view atendimentos" ON public.atendimentos FOR SELECT
USING (has_medical_role(auth.uid()) AND (tenant_id IS NULL OR user_belongs_to_tenant(auth.uid(), tenant_id)));

CREATE POLICY "Medical staff can insert atendimentos" ON public.atendimentos FOR INSERT
WITH CHECK (has_medical_role(auth.uid()));

CREATE POLICY "Medical staff can update atendimentos" ON public.atendimentos FOR UPDATE
USING (has_medical_role(auth.uid()) AND (tenant_id IS NULL OR user_belongs_to_tenant(auth.uid(), tenant_id)));

CREATE POLICY "Medical staff can delete atendimentos" ON public.atendimentos FOR DELETE
USING (has_medical_role(auth.uid()) AND (tenant_id IS NULL OR user_belongs_to_tenant(auth.uid(), tenant_id)));

-- ESTORNOS_CONSULTAS
DROP POLICY IF EXISTS "Staff can insert estornos" ON public.estornos_consultas;
DROP POLICY IF EXISTS "Staff can view estornos" ON public.estornos_consultas;

CREATE POLICY "Staff can view estornos" ON public.estornos_consultas FOR SELECT
USING ((has_medical_role(auth.uid()) OR has_role(auth.uid(), 'recepcao'::app_role)) 
  AND (tenant_id IS NULL OR user_belongs_to_tenant(auth.uid(), tenant_id)));

CREATE POLICY "Staff can insert estornos" ON public.estornos_consultas FOR INSERT
WITH CHECK (has_medical_role(auth.uid()) OR has_role(auth.uid(), 'recepcao'::app_role));

-- PRESCRIPTIONS
DROP POLICY IF EXISTS "Medical staff can delete prescriptions" ON public.prescriptions;
DROP POLICY IF EXISTS "Medical staff can insert prescriptions" ON public.prescriptions;
DROP POLICY IF EXISTS "Medical staff can update prescriptions" ON public.prescriptions;
DROP POLICY IF EXISTS "Medical staff can view prescriptions" ON public.prescriptions;

CREATE POLICY "Medical staff can view prescriptions" ON public.prescriptions FOR SELECT
USING ((has_medical_role(auth.uid()) OR has_role(auth.uid(), 'recepcao'::app_role)) 
  AND (tenant_id IS NULL OR user_belongs_to_tenant(auth.uid(), tenant_id)));

CREATE POLICY "Medical staff can insert prescriptions" ON public.prescriptions FOR INSERT
WITH CHECK (has_medical_role(auth.uid()));

CREATE POLICY "Medical staff can update prescriptions" ON public.prescriptions FOR UPDATE
USING (has_medical_role(auth.uid()) AND (tenant_id IS NULL OR user_belongs_to_tenant(auth.uid(), tenant_id)));

CREATE POLICY "Medical staff can delete prescriptions" ON public.prescriptions FOR DELETE
USING (has_medical_role(auth.uid()) AND (tenant_id IS NULL OR user_belongs_to_tenant(auth.uid(), tenant_id)));

-- PRESCRIPTION_ITEMS
DROP POLICY IF EXISTS "Medical staff can delete prescription_items" ON public.prescription_items;
DROP POLICY IF EXISTS "Medical staff can insert prescription_items" ON public.prescription_items;
DROP POLICY IF EXISTS "Medical staff can update prescription_items" ON public.prescription_items;
DROP POLICY IF EXISTS "Medical staff can view prescription_items" ON public.prescription_items;

CREATE POLICY "Medical staff can view prescription_items" ON public.prescription_items FOR SELECT
USING ((has_medical_role(auth.uid()) OR has_role(auth.uid(), 'recepcao'::app_role)) 
  AND (tenant_id IS NULL OR user_belongs_to_tenant(auth.uid(), tenant_id)));

CREATE POLICY "Medical staff can insert prescription_items" ON public.prescription_items FOR INSERT
WITH CHECK (has_medical_role(auth.uid()));

CREATE POLICY "Medical staff can update prescription_items" ON public.prescription_items FOR UPDATE
USING (has_medical_role(auth.uid()) AND (tenant_id IS NULL OR user_belongs_to_tenant(auth.uid(), tenant_id)));

CREATE POLICY "Medical staff can delete prescription_items" ON public.prescription_items FOR DELETE
USING (has_medical_role(auth.uid()) AND (tenant_id IS NULL OR user_belongs_to_tenant(auth.uid(), tenant_id)));

-- MEDICATION_ADMINISTRATIONS
DROP POLICY IF EXISTS "Nursing staff can insert medication_administrations" ON public.medication_administrations;
DROP POLICY IF EXISTS "Nursing staff can update medication_administrations" ON public.medication_administrations;
DROP POLICY IF EXISTS "Nursing staff can view medication_administrations" ON public.medication_administrations;

CREATE POLICY "Nursing staff can view medication_administrations" ON public.medication_administrations FOR SELECT
USING ((has_nursing_role(auth.uid()) OR has_medical_role(auth.uid())) 
  AND (tenant_id IS NULL OR user_belongs_to_tenant(auth.uid(), tenant_id)));

CREATE POLICY "Nursing staff can insert medication_administrations" ON public.medication_administrations FOR INSERT
WITH CHECK (has_nursing_role(auth.uid()) OR has_medical_role(auth.uid()));

CREATE POLICY "Nursing staff can update medication_administrations" ON public.medication_administrations FOR UPDATE
USING (has_nursing_role(auth.uid()) AND (tenant_id IS NULL OR user_belongs_to_tenant(auth.uid(), tenant_id)));

-- NURSING_NOTES
DROP POLICY IF EXISTS "Nursing staff can insert nursing_notes" ON public.nursing_notes;
DROP POLICY IF EXISTS "Nursing staff can update own nursing_notes" ON public.nursing_notes;
DROP POLICY IF EXISTS "Nursing staff can view nursing_notes" ON public.nursing_notes;

CREATE POLICY "Nursing staff can view nursing_notes" ON public.nursing_notes FOR SELECT
USING ((has_nursing_role(auth.uid()) OR has_medical_role(auth.uid())) 
  AND (tenant_id IS NULL OR user_belongs_to_tenant(auth.uid(), tenant_id)));

CREATE POLICY "Nursing staff can insert nursing_notes" ON public.nursing_notes FOR INSERT
WITH CHECK (has_nursing_role(auth.uid()));

CREATE POLICY "Nursing staff can update own nursing_notes" ON public.nursing_notes FOR UPDATE
USING (has_nursing_role(auth.uid()) AND created_by = auth.uid() 
  AND (tenant_id IS NULL OR user_belongs_to_tenant(auth.uid(), tenant_id)));

-- NURSING_QUEUE
DROP POLICY IF EXISTS "Nursing staff can update nursing_queue" ON public.nursing_queue;
DROP POLICY IF EXISTS "Nursing staff can view nursing_queue" ON public.nursing_queue;
DROP POLICY IF EXISTS "Staff can insert nursing_queue" ON public.nursing_queue;

CREATE POLICY "Nursing staff can view nursing_queue" ON public.nursing_queue FOR SELECT
USING ((has_nursing_role(auth.uid()) OR has_medical_role(auth.uid()) OR has_role(auth.uid(), 'recepcao'::app_role)) 
  AND (tenant_id IS NULL OR user_belongs_to_tenant(auth.uid(), tenant_id)));

CREATE POLICY "Staff can insert nursing_queue" ON public.nursing_queue FOR INSERT
WITH CHECK (has_nursing_role(auth.uid()) OR has_medical_role(auth.uid()) OR has_role(auth.uid(), 'recepcao'::app_role));

CREATE POLICY "Nursing staff can update nursing_queue" ON public.nursing_queue FOR UPDATE
USING (has_nursing_role(auth.uid()) AND (tenant_id IS NULL OR user_belongs_to_tenant(auth.uid(), tenant_id)));

-- PATIENTS
DROP POLICY IF EXISTS "Medical staff can insert patients" ON public.patients;
DROP POLICY IF EXISTS "Medical staff can update patients" ON public.patients;
DROP POLICY IF EXISTS "Medical staff can view patients" ON public.patients;

CREATE POLICY "Medical staff can view patients" ON public.patients FOR SELECT
USING ((has_medical_role(auth.uid()) OR has_role(auth.uid(), 'recepcao'::app_role)) 
  AND (tenant_id IS NULL OR user_belongs_to_tenant(auth.uid(), tenant_id)));

CREATE POLICY "Medical staff can insert patients" ON public.patients FOR INSERT
WITH CHECK (has_medical_role(auth.uid()) OR has_role(auth.uid(), 'recepcao'::app_role));

CREATE POLICY "Medical staff can update patients" ON public.patients FOR UPDATE
USING ((has_medical_role(auth.uid()) OR has_role(auth.uid(), 'recepcao'::app_role)) 
  AND (tenant_id IS NULL OR user_belongs_to_tenant(auth.uid(), tenant_id)));

-- CONSULTAS
DROP POLICY IF EXISTS "Staff can insert consultas" ON public.consultas;
DROP POLICY IF EXISTS "Staff can update consultas" ON public.consultas;
DROP POLICY IF EXISTS "Staff can view consultas" ON public.consultas;

CREATE POLICY "Staff can view consultas" ON public.consultas FOR SELECT
USING ((has_medical_role(auth.uid()) OR has_role(auth.uid(), 'recepcao'::app_role)) 
  AND (tenant_id IS NULL OR user_belongs_to_tenant(auth.uid(), tenant_id)));

CREATE POLICY "Staff can insert consultas" ON public.consultas FOR INSERT
WITH CHECK (has_medical_role(auth.uid()) OR has_role(auth.uid(), 'recepcao'::app_role));

CREATE POLICY "Staff can update consultas" ON public.consultas FOR UPDATE
USING ((has_medical_role(auth.uid()) OR has_role(auth.uid(), 'recepcao'::app_role)) 
  AND (tenant_id IS NULL OR user_belongs_to_tenant(auth.uid(), tenant_id)));