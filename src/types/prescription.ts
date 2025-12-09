/**
 * Sistema de Prescrição Médica - Tipos TypeScript
 */

// ============================================
// Type Aliases
// ============================================

/** Status da prescrição */
export type PrescriptionStatus = 'pending' | 'confirmed' | 'suspended' | 'cancelled';

/** Tipos de itens de prescrição */
export type PrescriptionItemType = 
  | 'diet' 
  | 'medication' 
  | 'solution' 
  | 'care' 
  | 'consultation' 
  | 'hemotherapy' 
  | 'procedure' 
  | 'diagnosis' 
  | 'allergy';

/** Status do item de prescrição */
export type PrescriptionItemStatus = 'active' | 'suspended' | 'deleted';

/** Tipos de template */
export type TemplateType = 'institutional' | 'specialty' | 'unit' | 'personal';

// ============================================
// Interfaces de Detalhes (por tipo de item)
// ============================================

/** Detalhes de medicamento */
export interface Medication {
  id: string;
  prescription_item_id: string;
  /** Nome do medicamento */
  medication_name: string;
  /** Dose prescrita */
  dose: string;
  /** Unidade de medida (mg, ml, etc.) */
  unit: string;
  /** Via de administração (VO, EV, IM, etc.) */
  route: string;
  /** Permite todas as vias */
  all_routes: boolean;
  /** Frequência de administração */
  frequency: string;
  /** Tipo de aprazamento */
  scheduling_type: string;
  /** Diluente utilizado */
  diluent?: string;
  /** Volume em mililitros */
  volume_ml?: number;
  /** Tempo de infusão */
  run_time?: string;
  /** Unidade de tempo (min, h) */
  time_unit?: string;
  /** Velocidade de infusão */
  infusion_rate?: string;
  /** Unidade de velocidade de infusão */
  infusion_unit?: string;
  /** Utiliza bomba de infusão */
  use_infusion_pump: boolean;
  /** Início da administração */
  administration_start?: string;
}

/** Detalhes de dieta */
export interface Diet {
  id: string;
  prescription_item_id: string;
  /** Item da dieta */
  diet_item: string;
  /** Quantidade */
  quantity: string;
  /** Unidade de medida */
  unit: string;
  /** Frequência */
  frequency: string;
  /** Tipo de aprazamento */
  scheduling_type: string;
  /** Número de vezes */
  number_of_times: number;
  /** Utiliza bomba de infusão */
  use_infusion_pump: boolean;
}

/** Detalhes de solução/soro */
export interface Solution {
  id: string;
  prescription_item_id: string;
  /** Nome da solução */
  solution_name: string;
  /** Volume em mililitros */
  volume_ml: number;
  /** Frequência */
  frequency: string;
  /** Tipo de armazenamento */
  storage_type: string;
  /** Tempo de infusão */
  run_time?: string;
  /** Observações */
  observation?: string;
}

/** Detalhes de cuidado/procedimento de enfermagem */
export interface CareProcedure {
  id: string;
  prescription_item_id: string;
  /** Descrição do cuidado */
  care_description: string;
  /** Frequência */
  frequency: string;
}

/** Detalhes de interconsulta */
export interface Consultation {
  id: string;
  prescription_item_id: string;
  /** Descrição da interconsulta */
  consultation_description: string;
}

// ============================================
// Interfaces Principais
// ============================================

/** Item de prescrição */
export interface PrescriptionItem {
  id: string;
  prescription_id: string;
  /** Tipo do item */
  item_type: PrescriptionItemType;
  /** Ordem de sequência na prescrição */
  sequence_order: number;
  /** Descrição do item */
  description: string;
  /** Status do item */
  status: PrescriptionItemStatus;
  /** Indica se é item de alto risco */
  is_high_risk: boolean;
  /** Observações adicionais */
  observation?: string;
  created_at: string;
  updated_at: string;
  /** Detalhes do medicamento (quando item_type = 'medication') */
  medication?: Medication;
  /** Detalhes da dieta (quando item_type = 'diet') */
  diet?: Diet;
  /** Detalhes da solução (quando item_type = 'solution') */
  solution?: Solution;
  /** Detalhes do cuidado (quando item_type = 'care') */
  care?: CareProcedure;
  /** Detalhes da interconsulta (quando item_type = 'consultation') */
  consultation?: Consultation;
}

/** Prescrição médica */
export interface Prescription {
  id: string;
  /** ID do paciente */
  patient_id: string;
  /** ID do atendimento */
  attendance_id: string;
  /** Número do prontuário */
  medical_record: string;
  /** Leito */
  bed: string;
  /** Quarto/Enfermaria */
  room: string;
  /** Unidade funcional */
  functional_unit: string;
  /** Data da prescrição (ISO 8601) */
  prescription_date: string;
  /** Data prevista de alta (ISO 8601) */
  expected_discharge_date?: string;
  /** Indica se é prescrição pediátrica */
  is_pediatric: boolean;
  /** Início da vigência (ISO 8601) */
  validity_start: string;
  /** Fim da vigência (ISO 8601) */
  validity_end: string;
  /** Status da prescrição */
  status: PrescriptionStatus;
  /** ID do profissional que criou */
  created_by: string;
  created_at: string;
  updated_at: string;
  /** Itens da prescrição */
  items?: PrescriptionItem[];
}

// ============================================
// Interfaces de Templates
// ============================================

/** União de tipos de dados de item para templates */
export type TemplateItemData = 
  | Omit<Medication, 'id' | 'prescription_item_id'>
  | Omit<Diet, 'id' | 'prescription_item_id'>
  | Omit<Solution, 'id' | 'prescription_item_id'>
  | Omit<CareProcedure, 'id' | 'prescription_item_id'>
  | Omit<Consultation, 'id' | 'prescription_item_id'>;

/** Item de template */
export interface TemplateItem {
  id: string;
  template_id: string;
  /** Tipo do item */
  item_type: PrescriptionItemType;
  /** Dados do item (tipagem forte) */
  item_data: TemplateItemData;
  /** Ordem de sequência */
  sequence_order: number;
}

/** Template de prescrição */
export interface PrescriptionTemplate {
  id: string;
  /** Nome do template */
  template_name: string;
  /** Tipo do template */
  template_type: TemplateType;
  /** Especialidade (quando template_type = 'specialty') */
  specialty?: string;
  /** Unidade (quando template_type = 'unit') */
  unit?: string;
  /** ID do profissional que criou */
  created_by: string;
  /** Indica se está ativo */
  is_active: boolean;
  created_at: string;
  /** Itens do template */
  items?: TemplateItem[];
}

// ============================================
// Interfaces Auxiliares
// ============================================

/** Texto padrão reutilizável */
export interface StandardText {
  id: string;
  /** Categoria do texto */
  category: string;
  /** Conteúdo do texto */
  text_content: string;
  /** Indica se está ativo */
  is_active: boolean;
  /** ID do profissional que criou */
  created_by: string;
  created_at: string;
}

/** Aprazamento/Administração */
export interface Scheduling {
  id: string;
  prescription_item_id: string;
  /** Horário agendado (ISO 8601) */
  scheduled_time: string;
  /** Indica se foi administrado */
  was_administered: boolean;
  /** Data/hora da administração (ISO 8601) */
  administered_at?: string;
  /** ID do profissional que administrou */
  administered_by?: string;
  /** Observações */
  observation?: string;
}

// ============================================
// Tipos de Formulário (para React Hook Form/Zod)
// ============================================

/** Dados do formulário de prescrição */
export type PrescriptionFormData = Omit<Prescription, 'id' | 'created_at' | 'updated_at' | 'items'>;

/** Dados do formulário de item de prescrição */
export type PrescriptionItemFormData = Omit<PrescriptionItem, 'id' | 'prescription_id' | 'created_at' | 'updated_at' | 'medication' | 'diet' | 'solution' | 'care' | 'consultation'>;

/** Dados do formulário de medicamento */
export type MedicationFormData = Omit<Medication, 'id' | 'prescription_item_id'>;

/** Dados do formulário de dieta */
export type DietFormData = Omit<Diet, 'id' | 'prescription_item_id'>;

/** Dados do formulário de solução */
export type SolutionFormData = Omit<Solution, 'id' | 'prescription_item_id'>;

/** Dados do formulário de template */
export type PrescriptionTemplateFormData = Omit<PrescriptionTemplate, 'id' | 'created_at' | 'items'>;
