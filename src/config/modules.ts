import {
  Activity, CalendarHeart, Smile, UserRound, ClipboardList,
  Syringe, Pill, CalendarDays, FileUp, ClipboardCheck, ShieldCheck
} from 'lucide-react';
import type { ModuleConfig, ModuleKey, EstablishmentTemplate } from '@/types/modules';

// Todos os módulos disponíveis no sistema
export const AVAILABLE_MODULES: ModuleConfig[] = [
  {
    key: 'dashboard',
    name: 'Painel Geral',
    description: 'Dashboard com visão geral e indicadores',
    icon: Activity,
    routes: ['/'],
    defaultEnabled: true,
    category: 'core',
    canDisable: false, // Obrigatório
  },
  {
    key: 'ambulatorio',
    name: 'Ambulatório',
    description: 'Consultas médicas, agendamento e atendimento',
    icon: CalendarHeart,
    routes: ['/marcar-consulta', '/lista-pacientes', '/atendimento', '/estornar-consulta'],
    defaultEnabled: true,
    category: 'clinical',
    canDisable: true,
  },
  {
    key: 'odontologia',
    name: 'Odontologia',
    description: 'Atendimento odontológico e odontograma',
    icon: Smile,
    routes: ['/odonto/agendar', '/odonto/pacientes', '/odonto/odontograma', '/odonto/tratamento'],
    defaultEnabled: false,
    category: 'clinical',
    canDisable: true,
  },
  {
    key: 'pacientes',
    name: 'Pacientes',
    description: 'Cadastro e gestão de pacientes',
    icon: UserRound,
    routes: ['/patients', '/patient'],
    defaultEnabled: true,
    category: 'core',
    canDisable: false, // Obrigatório
  },
  {
    key: 'prescricao',
    name: 'Prescrição Médica',
    description: 'Prescrições, receitas e documentos clínicos',
    icon: ClipboardList,
    routes: ['/prescription'],
    defaultEnabled: true,
    category: 'clinical',
    canDisable: true,
  },
  {
    key: 'enfermagem',
    name: 'Enfermagem',
    description: 'Cuidados de enfermagem e sinais vitais',
    icon: Syringe,
    routes: ['/nursing'],
    defaultEnabled: true,
    category: 'clinical',
    canDisable: true,
  },
  {
    key: 'farmacia',
    name: 'Farmácia',
    description: 'Dispensação de medicamentos e controle de estoque',
    icon: Pill,
    routes: ['/pharmacy'],
    defaultEnabled: false,
    category: 'clinical',
    canDisable: true,
  },
  {
    key: 'agendamento',
    name: 'Agendamento',
    description: 'Grades de horários e agendamento de consultas',
    icon: CalendarDays,
    routes: ['/appointments'],
    defaultEnabled: true,
    category: 'administrative',
    canDisable: true,
  },
  {
    key: 'sisreg',
    name: 'SISREG',
    description: 'Importação de dados do SISREG',
    icon: FileUp,
    routes: ['/sisreg'],
    defaultEnabled: false,
    category: 'administrative',
    canDisable: true,
  },
  {
    key: 'relatorios',
    name: 'Relatórios',
    description: 'Relatórios gerenciais e estatísticas',
    icon: ClipboardCheck,
    routes: ['/reports'],
    defaultEnabled: true,
    category: 'administrative',
    canDisable: true,
  },
  {
    key: 'administracao',
    name: 'Administração',
    description: 'Configurações do sistema e gestão de usuários',
    icon: ShieldCheck,
    routes: ['/usuarios', '/admin'],
    defaultEnabled: true,
    category: 'administrative',
    canDisable: false, // Obrigatório
  },
];

// Templates de módulos por tipo de estabelecimento
export const MODULE_TEMPLATES: Record<string, ModuleKey[]> = {
  clinica_geral: ['dashboard', 'ambulatorio', 'pacientes', 'prescricao', 'enfermagem', 'agendamento', 'relatorios', 'administracao'],
  consultorio_medico: ['dashboard', 'ambulatorio', 'pacientes', 'prescricao', 'agendamento', 'relatorios', 'administracao'],
  consultorio_odonto: ['dashboard', 'odontologia', 'pacientes', 'agendamento', 'relatorios', 'administracao'],
  policlinica: ['dashboard', 'ambulatorio', 'odontologia', 'pacientes', 'prescricao', 'enfermagem', 'farmacia', 'agendamento', 'sisreg', 'relatorios', 'administracao'],
  hospital: ['dashboard', 'ambulatorio', 'pacientes', 'prescricao', 'enfermagem', 'farmacia', 'agendamento', 'relatorios', 'administracao'],
  ubs: ['dashboard', 'ambulatorio', 'pacientes', 'prescricao', 'enfermagem', 'agendamento', 'sisreg', 'relatorios', 'administracao'],
};

// Templates por tipo de estabelecimento
export const ESTABLISHMENT_TEMPLATES: EstablishmentTemplate[] = [
  {
    type: 'clinica_geral',
    name: 'Clínica Geral',
    description: 'Módulos para clínicas médicas gerais',
    modules: ['dashboard', 'ambulatorio', 'pacientes', 'prescricao', 'agendamento', 'relatorios'],
  },
  {
    type: 'consultorio_odonto',
    name: 'Consultório Odontológico',
    description: 'Módulos específicos para odontologia',
    modules: ['dashboard', 'odontologia', 'pacientes', 'agendamento', 'relatorios'],
  },
  {
    type: 'policlinica',
    name: 'Policlínica',
    description: 'Todos os módulos clínicos disponíveis',
    modules: ['dashboard', 'ambulatorio', 'odontologia', 'pacientes', 'prescricao', 'enfermagem', 'farmacia', 'agendamento', 'sisreg', 'relatorios', 'administracao'],
  },
  {
    type: 'ubs',
    name: 'UBS - Unidade Básica de Saúde',
    description: 'Módulos para unidades básicas de saúde',
    modules: ['dashboard', 'ambulatorio', 'pacientes', 'prescricao', 'enfermagem', 'agendamento', 'sisreg', 'relatorios'],
  },
];

// Helpers
export const getModuleByKey = (key: ModuleKey): ModuleConfig | undefined =>
  AVAILABLE_MODULES.find(m => m.key === key);

export const getModulesByCategory = (category: ModuleConfig['category']): ModuleConfig[] =>
  AVAILABLE_MODULES.filter(m => m.category === category);

export const getTemplateByType = (type: string): EstablishmentTemplate | undefined =>
  ESTABLISHMENT_TEMPLATES.find(t => t.type === type);
