export type Prioridade = 'Normal' | 'Prioridade' | 'Emergencia';
export type StatusFila = 'Aguardando' | 'Em Atendimento' | 'Finalizado' | 'Cancelado';
export type TipoDocumento = 'atestado' | 'receita_simples' | 'receita_especial' | 'pedido_exame' | 'encaminhamento';

export interface PacienteFila {
  id: string;
  patient_id: string;
  nome_paciente: string;
  data_entrada: string;
  prioridades: string[];
  modulo: string;
  status: StatusFila;
}

export interface DocumentoClinico {
  tipo: TipoDocumento;
  titulo: string;
  conteudo: string;
  paciente_nome: string;
  paciente_cpf: string;
  data: string;
  medico_nome: string;
  medico_crm: string;
}

export interface DadosFinalizacao {
  cids: string[];
  conduta: string;
  destino: 'alta' | 'internacao' | 'encaminhamento';
  setor_encaminhamento?: string;
  observacoes?: string;
}

export const getPriorityColor = (prioridades: string[]) => {
  if (prioridades.includes('Emergencia')) return 'border-l-4 border-l-destructive bg-destructive/5';
  if (prioridades.length > 0) return 'border-l-4 border-l-warning bg-warning/5';
  return 'border-l-4 border-l-success bg-success/5';
};

export const getDocumentTypeLabel = (tipo: TipoDocumento): string => {
  const labels: Record<TipoDocumento, string> = {
    atestado: 'Atestado Médico',
    receita_simples: 'Receita Simples',
    receita_especial: 'Receita Controle Especial',
    pedido_exame: 'Pedido de Exame',
    encaminhamento: 'Encaminhamento',
  };
  return labels[tipo];
};
