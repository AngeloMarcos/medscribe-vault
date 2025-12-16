// Types for dental treatment plan module

export type StatusItemTratamento = 'planejado' | 'em_andamento' | 'concluido' | 'cancelado';
export type StatusPlanoTratamento = 'orcamento' | 'aprovado' | 'em_andamento' | 'concluido' | 'cancelado';
export type UrgenciaTratamento = 'baixa' | 'media' | 'alta';

export interface ProcedimentoOdonto {
  id: string;
  codigo: string;
  nome: string;
  categoria: string;
  duracao_minutos: number;
  preco_padrao: number;
  descricao?: string;
  ativo: boolean;
  created_at: string;
}

export interface PlanoTratamentoOdonto {
  id: string;
  patient_id: string;
  profissional_id?: string;
  tenant_id?: string;
  data_inicio: string;
  data_previsao_fim?: string;
  status: StatusPlanoTratamento;
  observacoes_gerais?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  // Relations
  patient?: {
    id: string;
    name: string;
    cpf: string;
    birth_date?: string;
    medical_record_number?: string;
  };
  profissional?: {
    id: string;
    nome: string;
    registro_profissional: string;
  };
  itens?: ItemPlanoTratamento[];
}

export interface ItemPlanoTratamento {
  id: string;
  plano_id: string;
  procedimento_id: string;
  profissional_id?: string;
  tenant_id?: string;
  dente?: number;
  superficie?: string;
  valor_unitario: number;
  desconto_percentual: number;
  valor_final: number;
  status: StatusItemTratamento;
  urgencia: UrgenciaTratamento;
  ordem_prioridade: number;
  data_realizacao?: string;
  observacoes?: string;
  created_at: string;
  updated_at: string;
  // Relations
  procedimento?: ProcedimentoOdonto;
  profissional?: {
    id: string;
    nome: string;
    registro_profissional: string;
  };
}

export interface CreatePlanoInput {
  patient_id: string;
  profissional_id?: string;
  tenant_id?: string;
  data_inicio?: string;
  data_previsao_fim?: string;
  status?: StatusPlanoTratamento;
  observacoes_gerais?: string;
  created_by?: string;
}

export interface CreateItemInput {
  plano_id: string;
  procedimento_id: string;
  profissional_id?: string;
  tenant_id?: string;
  dente?: number;
  superficie?: string;
  valor_unitario: number;
  desconto_percentual?: number;
  valor_final: number;
  status?: StatusItemTratamento;
  urgencia?: UrgenciaTratamento;
  ordem_prioridade?: number;
  observacoes?: string;
}

export interface UpdateItemInput {
  status?: StatusItemTratamento;
  data_realizacao?: string;
  observacoes?: string;
  profissional_id?: string;
}

// Category colors for UI
export const categoriasOdontoConfig: Record<string, { nome: string; cor: string }> = {
  avaliacaoInicial: { nome: 'Avaliação', cor: 'bg-blue-500' },
  preventivos: { nome: 'Preventivo', cor: 'bg-green-500' },
  restauradores: { nome: 'Restauração', cor: 'bg-orange-500' },
  endodontia: { nome: 'Endodontia', cor: 'bg-red-500' },
  periodontia: { nome: 'Periodontia', cor: 'bg-purple-500' },
  cirurgia: { nome: 'Cirurgia', cor: 'bg-rose-500' },
  protese: { nome: 'Prótese', cor: 'bg-amber-500' },
  ortodontia: { nome: 'Ortodontia', cor: 'bg-cyan-500' },
  estetica: { nome: 'Estética', cor: 'bg-pink-500' },
};
