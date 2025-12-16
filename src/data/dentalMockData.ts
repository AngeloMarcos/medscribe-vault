export interface ProcedimentoOdontologico {
  id: string;
  nome: string;
  duracao: number;
  codigo: string;
}

export interface CategoriaOdontologica {
  id: string;
  nome: string;
  procedimentos: ProcedimentoOdontologico[];
}

export interface Dentista {
  id: string;
  nome: string;
  cro: string;
  especialidade: string;
}

export const procedimentosOdontologicos: Record<string, ProcedimentoOdontologico[]> = {
  avaliacaoInicial: [
    { id: 'aval-1', nome: 'Avaliação Inicial', duracao: 30, codigo: 'AVAL-01' },
    { id: 'aval-2', nome: 'Exame Clínico Completo', duracao: 45, codigo: 'EXAM-01' },
    { id: 'aval-3', nome: 'Radiografia Panorâmica', duracao: 15, codigo: 'RX-PAN' },
    { id: 'aval-4', nome: 'Radiografia Periapical', duracao: 10, codigo: 'RX-PER' },
  ],
  preventivos: [
    { id: 'prev-1', nome: 'Limpeza (Profilaxia)', duracao: 30, codigo: 'PROF-01' },
    { id: 'prev-2', nome: 'Aplicação de Flúor', duracao: 15, codigo: 'FLUOR-01' },
    { id: 'prev-3', nome: 'Selante', duracao: 20, codigo: 'SEL-01' },
    { id: 'prev-4', nome: 'Orientação de Higiene Bucal', duracao: 15, codigo: 'OHB-01' },
  ],
  restauradores: [
    { id: 'rest-1', nome: 'Restauração Resina (1 face)', duracao: 40, codigo: 'REST-1F' },
    { id: 'rest-2', nome: 'Restauração Resina (2 faces)', duracao: 50, codigo: 'REST-2F' },
    { id: 'rest-3', nome: 'Restauração Resina (3+ faces)', duracao: 60, codigo: 'REST-3F' },
    { id: 'rest-4', nome: 'Restauração Amálgama', duracao: 45, codigo: 'REST-AM' },
    { id: 'rest-5', nome: 'Núcleo de Preenchimento', duracao: 40, codigo: 'NUC-01' },
  ],
  endodontia: [
    { id: 'endo-1', nome: 'Tratamento de Canal (Anterior)', duracao: 60, codigo: 'ENDO-ANT' },
    { id: 'endo-2', nome: 'Tratamento de Canal (Pré-molar)', duracao: 90, codigo: 'ENDO-PM' },
    { id: 'endo-3', nome: 'Tratamento de Canal (Molar)', duracao: 120, codigo: 'ENDO-MOL' },
    { id: 'endo-4', nome: 'Retratamento Endodôntico', duracao: 90, codigo: 'ENDO-RET' },
  ],
  periodontia: [
    { id: 'perio-1', nome: 'Raspagem Supragengival', duracao: 30, codigo: 'RASP-SUP' },
    { id: 'perio-2', nome: 'Raspagem Subgengival', duracao: 45, codigo: 'RASP-SUB' },
    { id: 'perio-3', nome: 'Cirurgia Periodontal', duracao: 90, codigo: 'CIR-PERIO' },
    { id: 'perio-4', nome: 'Enxerto Gengival', duracao: 60, codigo: 'ENX-GENG' },
  ],
  cirurgia: [
    { id: 'cir-1', nome: 'Exodontia Simples', duracao: 30, codigo: 'EXO-SIMP' },
    { id: 'cir-2', nome: 'Exodontia Siso Incluso', duracao: 60, codigo: 'EXO-SISO' },
    { id: 'cir-3', nome: 'Exodontia Múltipla', duracao: 45, codigo: 'EXO-MULT' },
    { id: 'cir-4', nome: 'Frenectomia', duracao: 45, codigo: 'FREN-01' },
    { id: 'cir-5', nome: 'Biópsia', duracao: 30, codigo: 'BIOP-01' },
  ],
  protese: [
    { id: 'prot-1', nome: 'Prótese Total', duracao: 60, codigo: 'PT-TOTAL' },
    { id: 'prot-2', nome: 'Prótese Parcial Removível', duracao: 45, codigo: 'PPR-01' },
    { id: 'prot-3', nome: 'Coroa Unitária', duracao: 60, codigo: 'COROA-01' },
    { id: 'prot-4', nome: 'Faceta de Porcelana', duracao: 60, codigo: 'FAC-01' },
    { id: 'prot-5', nome: 'Prótese sobre Implante', duracao: 90, codigo: 'PROT-IMP' },
  ],
  ortodontia: [
    { id: 'orto-1', nome: 'Instalação de Aparelho Fixo', duracao: 60, codigo: 'ORTO-FIX' },
    { id: 'orto-2', nome: 'Manutenção Ortodôntica', duracao: 30, codigo: 'ORTO-MAN' },
    { id: 'orto-3', nome: 'Instalação de Alinhadores', duracao: 45, codigo: 'ORTO-ALI' },
    { id: 'orto-4', nome: 'Remoção de Aparelho', duracao: 40, codigo: 'ORTO-REM' },
    { id: 'orto-5', nome: 'Contenção', duracao: 30, codigo: 'ORTO-CONT' },
  ],
};

export const categoriasOdontologicas = [
  { id: 'avaliacaoInicial', nome: 'Avaliação', icone: 'ClipboardCheck', cor: 'bg-blue-500' },
  { id: 'preventivos', nome: 'Preventivo', icone: 'Shield', cor: 'bg-green-500' },
  { id: 'restauradores', nome: 'Restauração', icone: 'Wrench', cor: 'bg-orange-500' },
  { id: 'endodontia', nome: 'Endodontia', icone: 'Syringe', cor: 'bg-red-500' },
  { id: 'periodontia', nome: 'Periodontia', icone: 'Layers', cor: 'bg-purple-500' },
  { id: 'cirurgia', nome: 'Cirurgia', icone: 'Scissors', cor: 'bg-rose-500' },
  { id: 'protese', nome: 'Prótese', icone: 'Crown', cor: 'bg-amber-500' },
  { id: 'ortodontia', nome: 'Ortodontia', icone: 'Smile', cor: 'bg-cyan-500' },
];

export const dentistas: Dentista[] = [
  { id: '1', nome: 'Dr. Lucas Mendes', cro: 'CRO-RJ 12345', especialidade: 'Clínico Geral' },
  { id: '2', nome: 'Dra. Patrícia Lima', cro: 'CRO-RJ 23456', especialidade: 'Endodontista' },
  { id: '3', nome: 'Dr. Ricardo Souza', cro: 'CRO-RJ 34567', especialidade: 'Ortodontista' },
  { id: '4', nome: 'Dra. Camila Rocha', cro: 'CRO-RJ 45678', especialidade: 'Periodontista' },
  { id: '5', nome: 'Dr. Fernando Costa', cro: 'CRO-RJ 56789', especialidade: 'Cirurgião Bucomaxilofacial' },
  { id: '6', nome: 'Dra. Juliana Santos', cro: 'CRO-RJ 67890', especialidade: 'Protesista' },
];

export const horariosDisponiveis = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
];

export interface PacienteOdonto {
  id: string;
  nome: string;
  prontuario: string;
  idade: number;
  telefone?: string;
  cpf: string;
}

export interface AgendamentoOdonto {
  id: string;
  paciente: PacienteOdonto;
  dentista: Dentista;
  procedimentos: ProcedimentoOdontologico[];
  data: string;
  hora: string;
  duracao: number;
  cadeira: string;
  status: 'agendado' | 'aguardando' | 'em_atendimento' | 'atendido' | 'ausente' | 'cancelado';
  horaChegada?: string;
  observacoes?: string;
}

export const cadeirasOdonto = ['Cadeira 1', 'Cadeira 2', 'Cadeira 3', 'Cadeira 4'];

export const pacientesOdontoMock: PacienteOdonto[] = [
  { id: 'p1', nome: 'Maria Silva Santos', prontuario: '2025000101', idade: 34, telefone: '(21) 99999-1111', cpf: '111.222.333-44' },
  { id: 'p2', nome: 'João Carlos Oliveira', prontuario: '2025000102', idade: 45, telefone: '(21) 99999-2222', cpf: '222.333.444-55' },
  { id: 'p3', nome: 'Ana Paula Ferreira', prontuario: '2025000103', idade: 28, telefone: '(21) 99999-3333', cpf: '333.444.555-66' },
  { id: 'p4', nome: 'Pedro Henrique Costa', prontuario: '2025000104', idade: 52, telefone: '(21) 99999-4444', cpf: '444.555.666-77' },
  { id: 'p5', nome: 'Carla Beatriz Lima', prontuario: '2025000105', idade: 19, telefone: '(21) 99999-5555', cpf: '555.666.777-88' },
  { id: 'p6', nome: 'Ricardo Almeida Souza', prontuario: '2025000106', idade: 67, telefone: '(21) 99999-6666', cpf: '666.777.888-99' },
  { id: 'p7', nome: 'Fernanda Rodrigues', prontuario: '2025000107', idade: 41, telefone: '(21) 99999-7777', cpf: '777.888.999-00' },
  { id: 'p8', nome: 'Lucas Gabriel Martins', prontuario: '2025000108', idade: 8, telefone: '(21) 99999-8888', cpf: '888.999.000-11' },
];

const hoje = new Date().toISOString().split('T')[0];

export const agendamentosOdontoMock: AgendamentoOdonto[] = [
  {
    id: 'ag1',
    paciente: pacientesOdontoMock[0],
    dentista: dentistas[0],
    procedimentos: [procedimentosOdontologicos.preventivos[0], procedimentosOdontologicos.preventivos[1]],
    data: hoje,
    hora: '08:00',
    duracao: 45,
    cadeira: 'Cadeira 1',
    status: 'atendido',
    horaChegada: '07:52',
  },
  {
    id: 'ag2',
    paciente: pacientesOdontoMock[1],
    dentista: dentistas[1],
    procedimentos: [procedimentosOdontologicos.endodontia[0]],
    data: hoje,
    hora: '08:30',
    duracao: 60,
    cadeira: 'Cadeira 2',
    status: 'em_atendimento',
    horaChegada: '08:25',
  },
  {
    id: 'ag3',
    paciente: pacientesOdontoMock[2],
    dentista: dentistas[2],
    procedimentos: [procedimentosOdontologicos.ortodontia[1]],
    data: hoje,
    hora: '09:00',
    duracao: 30,
    cadeira: 'Cadeira 3',
    status: 'aguardando',
    horaChegada: '08:55',
  },
  {
    id: 'ag4',
    paciente: pacientesOdontoMock[3],
    dentista: dentistas[0],
    procedimentos: [procedimentosOdontologicos.restauradores[1], procedimentosOdontologicos.restauradores[2]],
    data: hoje,
    hora: '09:30',
    duracao: 110,
    cadeira: 'Cadeira 1',
    status: 'agendado',
  },
  {
    id: 'ag5',
    paciente: pacientesOdontoMock[4],
    dentista: dentistas[4],
    procedimentos: [procedimentosOdontologicos.cirurgia[0]],
    data: hoje,
    hora: '10:00',
    duracao: 30,
    cadeira: 'Cadeira 4',
    status: 'agendado',
  },
  {
    id: 'ag6',
    paciente: pacientesOdontoMock[5],
    dentista: dentistas[5],
    procedimentos: [procedimentosOdontologicos.protese[2]],
    data: hoje,
    hora: '10:30',
    duracao: 60,
    cadeira: 'Cadeira 2',
    status: 'agendado',
  },
  {
    id: 'ag7',
    paciente: pacientesOdontoMock[6],
    dentista: dentistas[3],
    procedimentos: [procedimentosOdontologicos.periodontia[0], procedimentosOdontologicos.periodontia[1]],
    data: hoje,
    hora: '11:00',
    duracao: 75,
    cadeira: 'Cadeira 3',
    status: 'agendado',
  },
  {
    id: 'ag8',
    paciente: pacientesOdontoMock[7],
    dentista: dentistas[0],
    procedimentos: [procedimentosOdontologicos.avaliacaoInicial[0]],
    data: hoje,
    hora: '14:00',
    duracao: 30,
    cadeira: 'Cadeira 1',
    status: 'agendado',
  },
  {
    id: 'ag9',
    paciente: pacientesOdontoMock[0],
    dentista: dentistas[1],
    procedimentos: [procedimentosOdontologicos.endodontia[2]],
    data: hoje,
    hora: '14:30',
    duracao: 120,
    cadeira: 'Cadeira 2',
    status: 'ausente',
  },
  {
    id: 'ag10',
    paciente: pacientesOdontoMock[2],
    dentista: dentistas[2],
    procedimentos: [procedimentosOdontologicos.ortodontia[0]],
    data: hoje,
    hora: '15:00',
    duracao: 60,
    cadeira: 'Cadeira 3',
    status: 'cancelado',
    observacoes: 'Paciente solicitou cancelamento',
  },
];

// ============= PLANO DE TRATAMENTO =============

export type StatusItemTratamento = 'planejado' | 'em_andamento' | 'concluido' | 'cancelado';
export type StatusPlanoTratamento = 'orcamento' | 'aprovado' | 'em_andamento' | 'concluido' | 'cancelado';
export type UrgenciaTratamento = 'baixa' | 'media' | 'alta';

export interface ItemPlanoTratamento {
  id: string;
  dente: number | null;
  superficie?: string;
  procedimento: ProcedimentoOdontologico;
  dentista?: Dentista;
  valorUnitario: number;
  desconto: number;
  valorFinal: number;
  status: StatusItemTratamento;
  dataRealizacao?: string;
  observacoes?: string;
  urgencia: UrgenciaTratamento;
  ordemPrioridade: number;
}

export interface PlanoTratamento {
  id: string;
  paciente: PacienteOdonto;
  dataInicio: string;
  dataPrevisaoFim?: string;
  status: StatusPlanoTratamento;
  itens: ItemPlanoTratamento[];
  observacoesGerais?: string;
  createdAt: string;
  updatedAt: string;
}

export const precosOdontologicos: Record<string, number> = {
  'aval-1': 150,
  'aval-2': 200,
  'aval-3': 180,
  'aval-4': 80,
  'prev-1': 180,
  'prev-2': 100,
  'prev-3': 120,
  'prev-4': 80,
  'rest-1': 250,
  'rest-2': 320,
  'rest-3': 400,
  'rest-4': 200,
  'rest-5': 350,
  'endo-1': 800,
  'endo-2': 1000,
  'endo-3': 1200,
  'endo-4': 1400,
  'perio-1': 200,
  'perio-2': 300,
  'perio-3': 1500,
  'perio-4': 1200,
  'cir-1': 300,
  'cir-2': 800,
  'cir-3': 500,
  'cir-4': 600,
  'cir-5': 400,
  'prot-1': 2500,
  'prot-2': 1800,
  'prot-3': 1500,
  'prot-4': 1800,
  'prot-5': 3500,
  'orto-1': 3000,
  'orto-2': 200,
  'orto-3': 5000,
  'orto-4': 300,
  'orto-5': 400,
};

export const planosTratamentoMock: PlanoTratamento[] = [
  {
    id: 'plan-1',
    paciente: pacientesOdontoMock[0],
    dataInicio: '2025-01-10',
    dataPrevisaoFim: '2025-03-15',
    status: 'em_andamento',
    observacoesGerais: 'Paciente com sensibilidade nos molares superiores',
    createdAt: '2025-01-10T10:00:00Z',
    updatedAt: '2025-01-15T14:30:00Z',
    itens: [
      {
        id: 'item-1',
        dente: 16,
        superficie: 'Oclusal',
        procedimento: procedimentosOdontologicos.restauradores[0],
        dentista: dentistas[0],
        valorUnitario: 250,
        desconto: 10,
        valorFinal: 225,
        status: 'concluido',
        dataRealizacao: '2025-01-12',
        urgencia: 'media',
        ordemPrioridade: 1,
      },
      {
        id: 'item-2',
        dente: 26,
        superficie: 'Mesial, Oclusal',
        procedimento: procedimentosOdontologicos.endodontia[2],
        dentista: dentistas[1],
        valorUnitario: 1200,
        desconto: 0,
        valorFinal: 1200,
        status: 'em_andamento',
        urgencia: 'alta',
        ordemPrioridade: 2,
      },
      {
        id: 'item-3',
        dente: 18,
        procedimento: procedimentosOdontologicos.cirurgia[1],
        dentista: dentistas[4],
        valorUnitario: 800,
        desconto: 0,
        valorFinal: 800,
        status: 'planejado',
        urgencia: 'baixa',
        ordemPrioridade: 3,
        observacoes: 'Siso parcialmente incluso',
      },
      {
        id: 'item-4',
        dente: null,
        procedimento: procedimentosOdontologicos.preventivos[0],
        dentista: dentistas[0],
        valorUnitario: 180,
        desconto: 0,
        valorFinal: 180,
        status: 'planejado',
        urgencia: 'baixa',
        ordemPrioridade: 4,
      },
    ],
  },
  {
    id: 'plan-2',
    paciente: pacientesOdontoMock[1],
    dataInicio: '2025-01-08',
    status: 'orcamento',
    createdAt: '2025-01-08T09:00:00Z',
    updatedAt: '2025-01-08T09:00:00Z',
    itens: [
      {
        id: 'item-5',
        dente: 36,
        superficie: 'Oclusal, Distal',
        procedimento: procedimentosOdontologicos.restauradores[1],
        valorUnitario: 320,
        desconto: 15,
        valorFinal: 272,
        status: 'planejado',
        urgencia: 'media',
        ordemPrioridade: 1,
      },
      {
        id: 'item-6',
        dente: 46,
        superficie: 'Oclusal',
        procedimento: procedimentosOdontologicos.restauradores[0],
        valorUnitario: 250,
        desconto: 15,
        valorFinal: 212.50,
        status: 'planejado',
        urgencia: 'media',
        ordemPrioridade: 2,
      },
    ],
  },
  {
    id: 'plan-3',
    paciente: pacientesOdontoMock[2],
    dataInicio: '2024-12-01',
    dataPrevisaoFim: '2024-12-20',
    status: 'concluido',
    createdAt: '2024-12-01T08:00:00Z',
    updatedAt: '2024-12-18T16:00:00Z',
    itens: [
      {
        id: 'item-7',
        dente: 11,
        superficie: 'Vestibular',
        procedimento: procedimentosOdontologicos.protese[3],
        dentista: dentistas[5],
        valorUnitario: 1800,
        desconto: 0,
        valorFinal: 1800,
        status: 'concluido',
        dataRealizacao: '2024-12-18',
        urgencia: 'alta',
        ordemPrioridade: 1,
        observacoes: 'Faceta estética',
      },
    ],
  },
];

export const getPreco = (procedimentoId: string): number => {
  return precosOdontologicos[procedimentoId] || 0;
};

export const getAllProcedimentos = (): ProcedimentoOdontologico[] => {
  return Object.values(procedimentosOdontologicos).flat();
};
