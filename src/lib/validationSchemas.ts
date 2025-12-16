import { z } from 'zod';

// CPF validation (Brazilian format: 000.000.000-00 or just digits)
const cpfRegex = /^(\d{3}\.?\d{3}\.?\d{3}-?\d{2})$/;

const validateCPF = (cpf: string): boolean => {
  const digits = cpf.replace(/\D/g, '');
  if (digits.length !== 11) return false;
  
  // Check for known invalid patterns
  if (/^(\d)\1+$/.test(digits)) return false;
  
  // Validate first check digit
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(digits[i]) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  if (remainder !== parseInt(digits[9])) return false;
  
  // Validate second check digit
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(digits[i]) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  if (remainder !== parseInt(digits[10])) return false;
  
  return true;
};

export const patientSchema = z.object({
  name: z.string()
    .trim()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(255, 'Nome deve ter no máximo 255 caracteres'),
  cpf: z.string()
    .regex(cpfRegex, 'CPF inválido. Use o formato 000.000.000-00')
    .refine(validateCPF, 'CPF inválido'),
  birth_date: z.string().optional().or(z.literal('')),
  phone: z.string().max(20, 'Telefone deve ter no máximo 20 caracteres').optional().or(z.literal('')),
  insurance: z.string().max(100, 'Convênio deve ter no máximo 100 caracteres').optional().or(z.literal('')),
  medical_record_number: z.string().max(50, 'Número do prontuário deve ter no máximo 50 caracteres').optional().or(z.literal('')),
});

export const appointmentSchema = z.object({
  patient_id: z.string().uuid('Selecione um paciente válido'),
  date_time: z.string().min(1, 'Data e hora são obrigatórios'),
  type: z.enum(['consulta', 'procedimento'], { errorMap: () => ({ message: 'Tipo inválido' }) }),
  description: z.string().max(1000, 'Descrição deve ter no máximo 1000 caracteres').optional().or(z.literal('')),
  status: z.enum(['agendado', 'realizado', 'cancelado'], { errorMap: () => ({ message: 'Status inválido' }) }),
});

export const examRequestSchema = z.object({
  exams_list: z.string()
    .trim()
    .min(1, 'Lista de exames é obrigatória')
    .max(2000, 'Lista de exames deve ter no máximo 2000 caracteres'),
  justification: z.string().max(1000, 'Justificativa deve ter no máximo 1000 caracteres').optional().or(z.literal('')),
});

export const procedureSchema = z.object({
  date_time: z.string().min(1, 'Data e hora são obrigatórios'),
  description: z.string()
    .trim()
    .min(1, 'Descrição é obrigatória')
    .max(500, 'Descrição deve ter no máximo 500 caracteres'),
  professional: z.string().max(255, 'Nome do profissional deve ter no máximo 255 caracteres').optional().or(z.literal('')),
  notes: z.string().max(2000, 'Observações devem ter no máximo 2000 caracteres').optional().or(z.literal('')),
});

export const reportSchema = z.object({
  type: z.enum(['atestado', 'relatorio', 'prescricao'], { errorMap: () => ({ message: 'Tipo inválido' }) }),
  text: z.string()
    .trim()
    .min(1, 'Texto é obrigatório')
    .max(10000, 'Texto deve ter no máximo 10000 caracteres'),
});

export const authSchema = z.object({
  email: z.string().trim().email('Email inválido').max(255, 'Email deve ter no máximo 255 caracteres'),
  password: z.string()
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .max(128, 'Senha deve ter no máximo 128 caracteres')
    .regex(/[A-Z]/, 'Senha deve conter ao menos uma letra maiúscula')
    .regex(/[a-z]/, 'Senha deve conter ao menos uma letra minúscula')
    .regex(/[0-9]/, 'Senha deve conter ao menos um número')
    .regex(/[^A-Za-z0-9]/, 'Senha deve conter ao menos um caractere especial'),
});

// Clinical attendance validation
export const atendimentoSchema = z.object({
  anamnese: z.string().max(10000, 'Anamnese deve ter no máximo 10000 caracteres').optional().or(z.literal('')),
  evolucao: z.string().max(10000, 'Evolução deve ter no máximo 10000 caracteres').optional().or(z.literal('')),
  prescricao: z.string().max(10000, 'Prescrição deve ter no máximo 10000 caracteres').optional().or(z.literal('')),
});

export const vitalsSchema = z.object({
  blood_pressure: z.string()
    .max(20, 'Pressão arterial deve ter no máximo 20 caracteres')
    .refine((val) => !val || /^\d{2,3}\/\d{2,3}$/.test(val), 'Formato inválido. Use ex: 120/80')
    .optional().or(z.literal('')),
  heart_rate: z.string()
    .max(10, 'Frequência cardíaca deve ter no máximo 10 caracteres')
    .refine((val) => !val || /^\d{1,3}$/.test(val), 'Use apenas números (ex: 72)')
    .optional().or(z.literal('')),
  respiratory_rate: z.string()
    .max(10, 'Frequência respiratória deve ter no máximo 10 caracteres')
    .refine((val) => !val || /^\d{1,3}$/.test(val), 'Use apenas números (ex: 16)')
    .optional().or(z.literal('')),
  temperature: z.string()
    .max(10, 'Temperatura deve ter no máximo 10 caracteres')
    .refine((val) => !val || /^\d{2}([.,]\d)?$/.test(val), 'Formato inválido. Use ex: 36.5')
    .optional().or(z.literal('')),
  o2_sat: z.string()
    .max(10, 'Saturação O2 deve ter no máximo 10 caracteres')
    .refine((val) => !val || /^\d{1,3}$/.test(val), 'Use apenas números (ex: 98)')
    .optional().or(z.literal('')),
});

export const finishAttendanceSchema = z.object({
  conduta: z.string()
    .trim()
    .min(1, 'A conduta é obrigatória')
    .max(2000, 'Conduta deve ter no máximo 2000 caracteres'),
  destino: z.string().min(1, 'Selecione o destino do paciente'),
  setorEncaminhamento: z.string().max(100, 'Setor deve ter no máximo 100 caracteres').optional().or(z.literal('')),
  observacoes: z.string().max(2000, 'Observações devem ter no máximo 2000 caracteres').optional().or(z.literal('')),
});

export type PatientFormData = z.infer<typeof patientSchema>;
export type AppointmentFormData = z.infer<typeof appointmentSchema>;
export type ExamRequestFormData = z.infer<typeof examRequestSchema>;
export type ProcedureFormData = z.infer<typeof procedureSchema>;
export type ReportFormData = z.infer<typeof reportSchema>;
export type AuthFormData = z.infer<typeof authSchema>;
export type AtendimentoFormData = z.infer<typeof atendimentoSchema>;
export type VitalsFormData = z.infer<typeof vitalsSchema>;
export type FinishAttendanceFormData = z.infer<typeof finishAttendanceSchema>;
