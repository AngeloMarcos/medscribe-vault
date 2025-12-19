import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { toast } from 'sonner';

// Types
export interface AgendamentoOdonto {
  id: string;
  paciente_id: string;
  profissional_id: string | null;
  tenant_id: string | null;
  data: string;
  hora_inicio: string;
  hora_fim: string | null;
  duracao_minutos: number;
  cadeira: string | null;
  status: 'agendado' | 'aguardando' | 'em_atendimento' | 'atendido' | 'ausente' | 'cancelado';
  hora_chegada: string | null;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
  // Relations
  paciente?: {
    id: string;
    name: string;
    cpf: string;
    birth_date: string | null;
    medical_record_number: string | null;
    phone: string | null;
  };
  profissional?: {
    id: string;
    nome: string;
    registro_profissional: string;
    especialidade?: { nome: string };
  };
  procedimentos?: {
    id: string;
    procedimento_id: string;
    procedimento?: {
      id: string;
      codigo: string;
      nome: string;
      categoria: string;
      duracao_minutos: number;
    };
  }[];
}

export interface CreateAgendamentoInput {
  paciente_id: string;
  profissional_id?: string;
  tenant_id?: string;
  data: string;
  hora_inicio: string;
  hora_fim?: string;
  duracao_minutos?: number;
  cadeira?: string;
  status?: string;
  observacoes?: string;
  procedimentos_ids?: string[];
}

// Fetch agendamentos by date
export function useAgendamentosOdontoByDate(date: Date | null) {
  const dateStr = date ? format(date, 'yyyy-MM-dd') : null;

  return useQuery({
    queryKey: ['agendamentos-odonto', 'by-date', dateStr],
    queryFn: async () => {
      if (!dateStr) return [];

      const { data, error } = await supabase
        .from('agendamentos_odonto')
        .select(`
          *,
          paciente:patients(id, name, cpf, birth_date, medical_record_number, phone),
          profissional:profissionais(id, nome, registro_profissional, especialidade:especialidades(nome)),
          procedimentos:agendamento_procedimentos(
            id,
            procedimento_id,
            procedimento:procedimentos_odonto(id, codigo, nome, categoria, duracao_minutos)
          )
        `)
        .eq('data', dateStr)
        .order('hora_inicio', { ascending: true });

      if (error) throw error;
      return data as AgendamentoOdonto[];
    },
    enabled: !!dateStr,
  });
}

// Fetch single agendamento
export function useAgendamentoOdonto(id: string | null) {
  return useQuery({
    queryKey: ['agendamentos-odonto', id],
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await supabase
        .from('agendamentos_odonto')
        .select(`
          *,
          paciente:patients(id, name, cpf, birth_date, medical_record_number, phone),
          profissional:profissionais(id, nome, registro_profissional, especialidade:especialidades(nome)),
          procedimentos:agendamento_procedimentos(
            id,
            procedimento_id,
            procedimento:procedimentos_odonto(id, codigo, nome, categoria, duracao_minutos)
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as AgendamentoOdonto;
    },
    enabled: !!id,
  });
}

// Fetch agendamentos by patient
export function useAgendamentosOdontoByPatient(patientId: string | null) {
  return useQuery({
    queryKey: ['agendamentos-odonto', 'by-patient', patientId],
    queryFn: async () => {
      if (!patientId) return [];

      const { data, error } = await supabase
        .from('agendamentos_odonto')
        .select(`
          *,
          profissional:profissionais(id, nome, registro_profissional),
          procedimentos:agendamento_procedimentos(
            id,
            procedimento_id,
            procedimento:procedimentos_odonto(id, codigo, nome, categoria, duracao_minutos)
          )
        `)
        .eq('paciente_id', patientId)
        .order('data', { ascending: false })
        .order('hora_inicio', { ascending: false });

      if (error) throw error;
      return data as AgendamentoOdonto[];
    },
    enabled: !!patientId,
  });
}

// Create agendamento
export function useCreateAgendamentoOdonto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateAgendamentoInput) => {
      const { procedimentos_ids, ...agendamentoData } = input;

      // Create agendamento
      const { data: agendamento, error: agendamentoError } = await supabase
        .from('agendamentos_odonto')
        .insert(agendamentoData)
        .select()
        .single();

      if (agendamentoError) throw agendamentoError;

      // Add procedimentos if provided
      if (procedimentos_ids && procedimentos_ids.length > 0) {
        const procedimentosInsert = procedimentos_ids.map((procId, index) => ({
          agendamento_id: agendamento.id,
          procedimento_id: procId,
          ordem: index,
        }));

        const { error: procError } = await supabase
          .from('agendamento_procedimentos')
          .insert(procedimentosInsert);

        if (procError) throw procError;
      }

      return agendamento;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agendamentos-odonto'] });
      toast.success('Agendamento criado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error('Erro ao criar agendamento: ' + error.message);
    },
  });
}

// Update agendamento status
export function useUpdateAgendamentoStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
      hora_chegada,
    }: {
      id: string;
      status: AgendamentoOdonto['status'];
      hora_chegada?: string;
    }) => {
      const updateData: { status: string; hora_chegada?: string } = { status };
      if (hora_chegada) updateData.hora_chegada = hora_chegada;

      const { data, error } = await supabase
        .from('agendamentos_odonto')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agendamentos-odonto'] });
    },
    onError: (error: Error) => {
      toast.error('Erro ao atualizar status: ' + error.message);
    },
  });
}

// Cancel agendamento
export function useCancelAgendamentoOdonto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('agendamentos_odonto')
        .update({ status: 'cancelado' })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agendamentos-odonto'] });
      toast.info('Agendamento cancelado');
    },
    onError: (error: Error) => {
      toast.error('Erro ao cancelar agendamento: ' + error.message);
    },
  });
}

// Delete agendamento
export function useDeleteAgendamentoOdonto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('agendamentos_odonto')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agendamentos-odonto'] });
      toast.success('Agendamento excluído');
    },
    onError: (error: Error) => {
      toast.error('Erro ao excluir agendamento: ' + error.message);
    },
  });
}
