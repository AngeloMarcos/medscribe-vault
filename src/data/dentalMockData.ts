export interface ProcedimentoOdontologico {
  id: string;
  nome: string;
  duracao: number; // em minutos
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
