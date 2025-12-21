import { LucideIcon } from 'lucide-react';

// Chaves únicas de cada módulo
export type ModuleKey = 
  | 'dashboard'       // Painel Geral
  | 'ambulatorio'     // Consultas médicas
  | 'odontologia'     // Atendimento odontológico
  | 'pacientes'       // Cadastro de pacientes
  | 'prescricao'      // Prescrição médica
  | 'enfermagem'      // Cuidados de enfermagem
  | 'farmacia'        // Dispensação e estoque
  | 'agendamento'     // Grades de agendamento
  | 'sisreg'          // Importação SISREG
  | 'relatorios'      // Relatórios
  | 'administracao';  // Administração do sistema

// Configuração de cada módulo
export interface ModuleConfig {
  key: ModuleKey;
  name: string;
  description: string;
  icon: LucideIcon;
  routes: string[];
  requiredPermissions?: string[];
  dependencies?: ModuleKey[];
  defaultEnabled: boolean;
  category: 'clinical' | 'administrative' | 'core';
  canDisable: boolean; // Se false, módulo é obrigatório
}

// Registro de módulo ativo de um tenant
export interface TenantModule {
  id: string;
  tenant_id: string;
  module_key: ModuleKey;
  is_enabled: boolean;
  config: Record<string, unknown>;
  enabled_at: string | null;
  disabled_at: string | null;
  created_at: string;
  updated_at: string;
}

// Templates por tipo de estabelecimento
export interface EstablishmentTemplate {
  type: string;
  name: string;
  modules: ModuleKey[];
  description: string;
}
