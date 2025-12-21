import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { differenceInYears } from "date-fns";
import { useTenant } from "@/hooks/useTenant";

interface PatientBasicData {
  id: string;
  name: string;
  cpf: string;
  birth_date: string | null;
  phone: string | null;
  insurance: string | null;
  medical_record_number: string | null;
}

interface Allergy {
  id: string;
  description: string;
}

interface ActiveConsulta {
  id: string;
  numero_consulta: string;
  data_consulta: string;
  hora_inicio: string;
  status: string | null;
  profissional_id: string | null;
  sala_id: string | null;
}

interface VitalsData {
  id: string;
  blood_pressure: string | null;
  heart_rate: string | null;
  respiratory_rate: string | null;
  temperature: string | null;
  o2_sat: string | null;
  created_at: string;
}

interface ActivePrescription {
  id: string;
  prescription_date: string;
  validity_start: string;
  validity_end: string;
  is_pediatric: boolean | null;
  expected_discharge_date: string | null;
  status: string | null;
}

export interface PatientData extends PatientBasicData {
  age: number | null;
  allergies: Allergy[];
  activeConsulta: ActiveConsulta | null;
  activePrescription: ActivePrescription | null;
  latestVitals: VitalsData | null;
}

// Helper to calculate age from birth date
export function calculateAge(birthDate: string | null): number | null {
  if (!birthDate) return null;
  try {
    return differenceInYears(new Date(), new Date(birthDate));
  } catch {
    return null;
  }
}

export function usePatientData(patientId: string | undefined) {
  const { tenant } = useTenant();

  // Query for basic patient data
  const patientQuery = useQuery({
    queryKey: ['patient', patientId, tenant?.id],
    queryFn: async () => {
      if (!patientId) throw new Error('Patient ID is required');
      
      let query = supabase
        .from('patients')
        .select('*')
        .eq('id', patientId);
      
      if (tenant?.id) {
        query = query.eq('tenant_id', tenant.id);
      }
      
      const { data, error } = await query.maybeSingle();
      
      if (error) throw error;
      return data as PatientBasicData | null;
    },
    enabled: !!patientId,
  });

  // Query for active consultation (em_atendimento status)
  const consultaQuery = useQuery({
    queryKey: ['patient-consulta', patientId, tenant?.id],
    queryFn: async () => {
      if (!patientId) return null;
      
      let query = supabase
        .from('consultas')
        .select('id, numero_consulta, data_consulta, hora_inicio, status, profissional_id, sala_id')
        .eq('paciente_id', patientId)
        .eq('status', 'em_atendimento')
        .order('data_consulta', { ascending: false })
        .limit(1);
      
      if (tenant?.id) {
        query = query.eq('tenant_id', tenant.id);
      }
      
      const { data, error } = await query.maybeSingle();
      
      if (error) throw error;
      return data as ActiveConsulta | null;
    },
    enabled: !!patientId,
  });

  // Query for active prescription
  const prescriptionQuery = useQuery({
    queryKey: ['patient-prescription', patientId, tenant?.id],
    queryFn: async () => {
      if (!patientId) return null;
      
      let query = supabase
        .from('prescriptions')
        .select('id, prescription_date, validity_start, validity_end, is_pediatric, expected_discharge_date, status')
        .eq('patient_id', patientId)
        .in('status', ['pending', 'confirmed'])
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (tenant?.id) {
        query = query.eq('tenant_id', tenant.id);
      }
      
      const { data, error } = await query.maybeSingle();
      
      if (error) throw error;
      return data as ActivePrescription | null;
    },
    enabled: !!patientId,
  });

  // Query for allergies from prescription items
  const allergiesQuery = useQuery({
    queryKey: ['patient-allergies', patientId, tenant?.id],
    queryFn: async () => {
      if (!patientId) return [];
      
      let prescriptionQuery = supabase
        .from('prescriptions')
        .select('id')
        .eq('patient_id', patientId)
        .in('status', ['pending', 'confirmed'])
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (tenant?.id) {
        prescriptionQuery = prescriptionQuery.eq('tenant_id', tenant.id);
      }
      
      const { data: prescription } = await prescriptionQuery.maybeSingle();
      
      if (!prescription) return [];
      
      const { data, error } = await supabase
        .from('prescription_items')
        .select('id, description')
        .eq('prescription_id', prescription.id)
        .eq('item_type', 'allergy')
        .eq('status', 'active');
      
      if (error) throw error;
      return (data || []) as Allergy[];
    },
    enabled: !!patientId,
  });

  // Query for latest vitals
  const vitalsQuery = useQuery({
    queryKey: ['patient-vitals', patientId, tenant?.id],
    queryFn: async () => {
      if (!patientId) return null;
      
      let query = supabase
        .from('vitals')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (tenant?.id) {
        query = query.eq('tenant_id', tenant.id);
      }
      
      const { data, error } = await query.maybeSingle();
      
      if (error) throw error;
      return data as VitalsData | null;
    },
    enabled: !!patientId,
  });

  // Combine all data
  const patientData: PatientData | null = patientQuery.data
    ? {
        ...patientQuery.data,
        age: calculateAge(patientQuery.data.birth_date),
        allergies: allergiesQuery.data || [],
        activeConsulta: consultaQuery.data || null,
        activePrescription: prescriptionQuery.data || null,
        latestVitals: vitalsQuery.data || null,
      }
    : null;

  const isLoading = 
    patientQuery.isLoading || 
    consultaQuery.isLoading || 
    prescriptionQuery.isLoading ||
    allergiesQuery.isLoading ||
    vitalsQuery.isLoading;

  const error = 
    patientQuery.error || 
    consultaQuery.error || 
    prescriptionQuery.error ||
    allergiesQuery.error ||
    vitalsQuery.error;

  const refetchAll = () => {
    patientQuery.refetch();
    consultaQuery.refetch();
    prescriptionQuery.refetch();
    allergiesQuery.refetch();
    vitalsQuery.refetch();
  };

  return {
    patient: patientData,
    isLoading,
    error,
    refetch: refetchAll,
    queries: {
      patient: patientQuery,
      consulta: consultaQuery,
      prescription: prescriptionQuery,
      allergies: allergiesQuery,
      vitals: vitalsQuery,
    },
  };
}
