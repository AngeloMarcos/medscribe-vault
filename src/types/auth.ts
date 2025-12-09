// Tipos de autenticação e perfis - alinhados com schema Supabase

/**
 * Enum de roles do sistema - espelha exatamente o enum app_role do banco
 */
export type AppRole = 
  | 'admin'
  | 'medico'
  | 'enfermeiro'
  | 'recepcao'
  | 'farmaceutico'
  | 'tecnico_enfermagem';

/**
 * Interface para tabela profiles
 */
export interface Profile {
  id: string;
  email: string;
  full_name: string;
  professional_id?: string | null;
  phone?: string | null;
  avatar_url?: string | null;
  is_active?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
}

/**
 * Interface para tabela user_roles
 */
export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at?: string | null;
}

/**
 * Interface para tabela user_activity_log
 */
export interface UserActivityLog {
  id: string;
  user_id: string | null;
  action: string;
  resource?: string | null;
  resource_id?: string | null;
  details?: Record<string, unknown> | null;
  ip_address?: string | null;
  user_agent?: string | null;
  created_at?: string | null;
}

/**
 * Credenciais de login
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Dados para registro de novo usuário
 */
export interface RegisterData {
  email: string;
  password: string;
  full_name: string;
  role?: AppRole;
  professional_id?: string;
  phone?: string;
}

/**
 * Usuário autenticado com perfil e roles
 */
export interface AuthUser {
  id: string;
  email: string;
  profile: Profile | null;
  roles: AppRole[];
}

/**
 * Contexto de autenticação
 */
export interface AuthContextType {
  user: AuthUser | null;
  profile: Profile | null;
  roles: AppRole[];
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
  hasPermission: (permission: Permission) => boolean;
  hasRole: (role: AppRole) => boolean;
  isAdmin: boolean;
  isMedico: boolean;
  isEnfermeiro: boolean;
}

/**
 * Constantes de permissões do sistema
 */
export const PERMISSIONS = {
  ALL: 'all',
  PRESCRIBE: 'prescribe',
  VIEW_PATIENTS: 'view_patients',
  CLINICAL_DOCS: 'clinical_docs',
  REQUEST_EXAMS: 'request_exams',
  ADMINISTER_MEDS: 'administer_meds',
  VIEW_PRESCRIPTIONS: 'view_prescriptions',
  VITAL_SIGNS: 'vital_signs',
  NURSING_NOTES: 'nursing_notes',
  DISPENSE: 'dispense',
  STOCK_CONTROL: 'stock_control',
  PATIENT_REGISTRATION: 'patient_registration',
  SCHEDULING: 'scheduling',
  VIEW_OWN_DATA: 'view_own_data',
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

/**
 * Labels amigáveis para exibição de roles na UI
 */
export const ROLE_LABELS: Record<AppRole, string> = {
  admin: 'Administrador',
  medico: 'Médico',
  enfermeiro: 'Enfermeiro',
  recepcao: 'Recepcionista',
  farmaceutico: 'Farmacêutico',
  tecnico_enfermagem: 'Técnico de Enfermagem',
};

/**
 * Mapeamento de permissões por role - espelha a função has_permission do SQL
 */
export const ROLE_PERMISSIONS: Record<AppRole, Permission[]> = {
  admin: [PERMISSIONS.ALL],
  medico: [
    PERMISSIONS.PRESCRIBE,
    PERMISSIONS.VIEW_PATIENTS,
    PERMISSIONS.CLINICAL_DOCS,
    PERMISSIONS.REQUEST_EXAMS,
    PERMISSIONS.VIEW_PRESCRIPTIONS,
  ],
  enfermeiro: [
    PERMISSIONS.ADMINISTER_MEDS,
    PERMISSIONS.VIEW_PRESCRIPTIONS,
    PERMISSIONS.VITAL_SIGNS,
    PERMISSIONS.NURSING_NOTES,
    PERMISSIONS.VIEW_PATIENTS,
    PERMISSIONS.SCHEDULING,
  ],
  farmaceutico: [
    PERMISSIONS.DISPENSE,
    PERMISSIONS.VIEW_PRESCRIPTIONS,
    PERMISSIONS.STOCK_CONTROL,
  ],
  tecnico_enfermagem: [
    PERMISSIONS.ADMINISTER_MEDS,
    PERMISSIONS.VITAL_SIGNS,
    PERMISSIONS.VIEW_PRESCRIPTIONS,
    PERMISSIONS.VIEW_PATIENTS,
  ],
  recepcao: [
    PERMISSIONS.PATIENT_REGISTRATION,
    PERMISSIONS.SCHEDULING,
    PERMISSIONS.VIEW_PATIENTS,
  ],
};

/**
 * Verifica se um role possui determinada permissão
 */
export function roleHasPermission(role: AppRole, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  return permissions.includes(PERMISSIONS.ALL) || permissions.includes(permission);
}

/**
 * Verifica se qualquer um dos roles possui a permissão
 */
export function rolesHavePermission(roles: AppRole[], permission: Permission): boolean {
  return roles.some(role => roleHasPermission(role, permission));
}
