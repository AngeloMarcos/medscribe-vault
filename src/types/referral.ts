export type ReferralType = 'especialista' | 'ubs' | 'pronto_atendimento' | 'internacao';
export type ReferralUrgency = 'eletivo' | 'urgente' | 'emergencia';
export type ReferralStatus = 'pendente' | 'encaminhado' | 'concluido' | 'cancelado';
export type TransportType = 'proprio' | 'ambulancia' | 'uti_movel';

export interface Encaminhamento {
  id: string;
  consulta_id: string | null;
  paciente_id: string;
  profissional_id: string | null;
  tenant_id: string | null;
  tipo: ReferralType;
  especialidade_destino: string | null;
  unidade_destino: string | null;
  profissional_destino: string | null;
  justificativa: string;
  hipotese_diagnostica: string | null;
  cid_principal: string | null;
  observacoes: string | null;
  urgencia: ReferralUrgency;
  transporte: TransportType | null;
  status: ReferralStatus;
  data_encaminhamento: string;
  created_at: string;
  updated_at: string;
}

export const REFERRAL_TYPE_LABELS: Record<ReferralType, string> = {
  especialista: 'Especialista',
  ubs: 'UBS / Atenção Básica',
  pronto_atendimento: 'Pronto Atendimento',
  internacao: 'Internação Hospitalar',
};

export const REFERRAL_TYPE_DESCRIPTIONS: Record<ReferralType, string> = {
  especialista: 'Encaminhamento para consulta com médico especialista',
  ubs: 'Retorno para acompanhamento na Unidade Básica de Saúde',
  pronto_atendimento: 'Encaminhamento para avaliação de urgência/emergência',
  internacao: 'Solicitação de internação hospitalar',
};

export const REFERRAL_URGENCY_LABELS: Record<ReferralUrgency, string> = {
  eletivo: 'Eletivo',
  urgente: 'Urgente',
  emergencia: 'Emergência',
};

export const REFERRAL_URGENCY_COLORS: Record<ReferralUrgency, string> = {
  eletivo: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  urgente: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  emergencia: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

export const REFERRAL_STATUS_LABELS: Record<ReferralStatus, string> = {
  pendente: 'Pendente',
  encaminhado: 'Encaminhado',
  concluido: 'Concluído',
  cancelado: 'Cancelado',
};

export const TRANSPORT_LABELS: Record<TransportType, string> = {
  proprio: 'Meios Próprios',
  ambulancia: 'Ambulância',
  uti_movel: 'UTI Móvel',
};

// Common specialties for referral
export const COMMON_SPECIALTIES = [
  'Cardiologia',
  'Dermatologia',
  'Endocrinologia',
  'Gastroenterologia',
  'Ginecologia',
  'Neurologia',
  'Oftalmologia',
  'Ortopedia',
  'Otorrinolaringologia',
  'Pediatria',
  'Pneumologia',
  'Psiquiatria',
  'Reumatologia',
  'Urologia',
];
