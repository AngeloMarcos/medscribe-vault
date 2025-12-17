export type TicketType = 'normal' | 'priority' | 'elderly' | 'disability';
export type TicketStatus = 'waiting' | 'called' | 'in_service' | 'completed' | 'cancelled' | 'no_show';
export type QueueSector = 'reception' | 'nursing' | 'medical' | 'pharmacy' | 'exam';

export interface QueueTicket {
  id: string;
  tenant_id: string | null;
  ticket_number: string;
  ticket_type: TicketType;
  patient_id: string | null;
  patient_name: string | null;
  sector: QueueSector;
  status: TicketStatus;
  guiche: string | null;
  called_at: string | null;
  called_by: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface QueueCallHistory {
  id: string;
  tenant_id: string | null;
  ticket_id: string | null;
  ticket_number: string;
  guiche: string;
  called_at: string;
}

export const TICKET_TYPE_LABELS: Record<TicketType, string> = {
  normal: 'Normal',
  priority: 'Prioritário',
  elderly: 'Idoso',
  disability: 'PCD',
};

export const TICKET_TYPE_PREFIX: Record<TicketType, string> = {
  normal: 'N',
  priority: 'P',
  elderly: 'I',
  disability: 'D',
};

export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
  waiting: 'Aguardando',
  called: 'Chamado',
  in_service: 'Em Atendimento',
  completed: 'Concluído',
  cancelled: 'Cancelado',
  no_show: 'Não Compareceu',
};

export const SECTOR_LABELS: Record<QueueSector, string> = {
  reception: 'Recepção',
  nursing: 'Enfermagem',
  medical: 'Consultório',
  pharmacy: 'Farmácia',
  exam: 'Exames',
};

export const TICKET_TYPE_COLORS: Record<TicketType, string> = {
  normal: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  priority: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  elderly: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  disability: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
};
