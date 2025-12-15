// Status de administração de medicamento
export type AdministrationStatus = 'pending' | 'administered' | 'missed' | 'suspended' | 'refused';

// Tipo de anotação de enfermagem
export type NursingNoteType = 'evolution' | 'observation' | 'intercurrence' | 'procedure' | 'vital_signs';

// Setores de enfermagem
export type NursingSector = 'medication_room' | 'observation' | 'vitals' | 'procedures' | 'dressing';

// Prioridade na fila
export type QueuePriority = 'emergency' | 'priority' | 'normal';

// Status na fila
export type QueueStatus = 'waiting' | 'in_progress' | 'completed' | 'cancelled';

// Labels para exibição
export const SECTOR_LABELS: Record<NursingSector, string> = {
  medication_room: 'Sala de Medicação',
  observation: 'Observação',
  vitals: 'Sinais Vitais',
  procedures: 'Procedimentos',
  dressing: 'Curativos',
};

export const PRIORITY_LABELS: Record<QueuePriority, string> = {
  emergency: 'Emergência',
  priority: 'Prioridade',
  normal: 'Normal',
};

export const STATUS_LABELS: Record<QueueStatus, string> = {
  waiting: 'Aguardando',
  in_progress: 'Em Atendimento',
  completed: 'Concluído',
  cancelled: 'Cancelado',
};

export const ADMINISTRATION_STATUS_LABELS: Record<AdministrationStatus, string> = {
  pending: 'Pendente',
  administered: 'Administrado',
  missed: 'Atrasado',
  suspended: 'Suspenso',
  refused: 'Recusado',
};

export const NOTE_TYPE_LABELS: Record<NursingNoteType, string> = {
  evolution: 'Evolução',
  observation: 'Observação',
  intercurrence: 'Intercorrência',
  procedure: 'Procedimento',
  vital_signs: 'Sinais Vitais',
};

// Interface para administração de medicamento
export interface MedicationAdministration {
  id: string;
  prescription_item_id: string;
  patient_id: string;
  scheduled_time: string;
  status: AdministrationStatus;
  administered_at: string | null;
  administered_by: string | null;
  observation: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  prescription_item?: {
    description: string;
    item_details: Record<string, unknown>;
    is_high_risk: boolean;
  };
  patient?: {
    name: string;
    medical_record_number: string | null;
  };
}

// Interface para anotação de enfermagem
export interface NursingNote {
  id: string;
  patient_id: string;
  consulta_id: string | null;
  note_type: NursingNoteType;
  content: string;
  is_critical: boolean;
  created_by: string;
  created_at: string;
  // Joined data
  creator?: {
    full_name: string;
  };
}

// Interface para item da fila de enfermagem
export interface NursingQueueItem {
  id: string;
  patient_id: string;
  consulta_id: string | null;
  sector: NursingSector;
  priority: QueuePriority;
  status: QueueStatus;
  referred_from: string | null;
  notes: string | null;
  started_at: string | null;
  completed_at: string | null;
  attended_by: string | null;
  created_at: string;
  // Joined data
  patient?: {
    id: string;
    name: string;
    birth_date: string | null;
    medical_record_number: string | null;
    cpf: string;
  };
  attendant?: {
    full_name: string;
  };
}

// Helpers
export function calculateWaitTime(createdAt: string): string {
  const now = new Date();
  const created = new Date(createdAt);
  const diffMs = now.getTime() - created.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'Agora';
  if (diffMins < 60) return `${diffMins} min`;
  
  const hours = Math.floor(diffMins / 60);
  const mins = diffMins % 60;
  return `${hours}h ${mins}min`;
}

export function calculateAge(birthDate: string | null): number | null {
  if (!birthDate) return null;
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

export function getPriorityColor(priority: QueuePriority): string {
  switch (priority) {
    case 'emergency': return 'bg-destructive text-destructive-foreground';
    case 'priority': return 'bg-warning text-warning-foreground';
    case 'normal': return 'bg-muted text-muted-foreground';
  }
}

export function getStatusColor(status: QueueStatus): string {
  switch (status) {
    case 'waiting': return 'bg-warning/20 text-warning';
    case 'in_progress': return 'bg-primary/20 text-primary';
    case 'completed': return 'bg-success/20 text-success';
    case 'cancelled': return 'bg-muted text-muted-foreground';
  }
}
