export interface Tenant {
  id: string;
  name: string;
  slug: string;
  type: TenantType;
  settings: Record<string, unknown>;
  logo_url: string | null;
  theme: { primary: string; [key: string]: string };
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TenantUser {
  id: string;
  tenant_id: string;
  user_id: string;
  is_owner: boolean;
  is_active: boolean;
  created_at: string;
}

export type TenantType = 
  | 'clinica_geral' 
  | 'consultorio_medico' 
  | 'consultorio_odonto' 
  | 'policlinica' 
  | 'hospital';

export const TENANT_TYPE_LABELS: Record<TenantType, string> = {
  clinica_geral: 'Clínica Geral',
  consultorio_medico: 'Consultório Médico',
  consultorio_odonto: 'Consultório Odontológico',
  policlinica: 'Policlínica',
  hospital: 'Hospital',
};
