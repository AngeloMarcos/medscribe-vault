export type SpecialtyType = 'medical' | 'dental';

export interface SpecialtyConfig {
  type: SpecialtyType;
  name: string;
  description: string;
  color: string;
}

export const SPECIALTIES: Record<SpecialtyType, SpecialtyConfig> = {
  medical: {
    type: 'medical',
    name: 'Ambulatório',
    description: 'Consultas médicas gerais e especializadas',
    color: '#009688',
  },
  dental: {
    type: 'dental',
    name: 'Odontologia',
    description: 'Tratamentos e procedimentos odontológicos',
    color: '#3B82F6',
  },
};

// Terminology mapping for different specialties
export const TERMINOLOGY: Record<SpecialtyType, Record<string, string>> = {
  medical: {
    appointment: 'Consulta',
    appointments: 'Consultas',
    schedule: 'Marcar Consulta',
    prescription: 'Prescrição Médica',
    treatment: 'Tratamento',
    professional: 'Médico',
  },
  dental: {
    appointment: 'Atendimento',
    appointments: 'Atendimentos',
    schedule: 'Agendar Atendimento',
    prescription: 'Plano de Tratamento',
    treatment: 'Procedimento',
    professional: 'Dentista',
  },
};
