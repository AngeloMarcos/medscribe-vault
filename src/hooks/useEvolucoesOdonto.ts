import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Types
export interface ProcedimentoRealizado {
  procedimento_id: string;
  procedimento_nome: string;
  dente?: number;
  observacao?: string;
}

export interface EvolucaoOdonto {
  id: string;
  agendamento_id: string | null;
  paciente_id: string;
  profissional_id: string | null;
  tenant_id: string | null;
  queixa_principal: string | null;
  evolucao: string | null;
  procedimentos_realizados: ProcedimentoRealizado[];
  created_at: string;
  // Relations
  profissional?: {
    id: string;
    nome: string;
    registro_profissional: string;
  };
}

export interface CreateEvolucaoInput {
  agendamento_id?: string;
  paciente_id: string;
  profissional_id?: string;
  tenant_id?: string;
  queixa_principal?: string;
  evolucao?: string;
  procedimentos_realizados?: ProcedimentoRealizado[];
}

// Fetch evoluções by patient
export function useEvolucoesOdontoByPatient(patientId: string | null) {
  return useQuery({
    queryKey: ['evolucoes-odonto', 'by-patient', patientId],
    queryFn: async () => {
      if (!patientId) return [];

      const { data, error } = await supabase
        .from('evolucoes_odonto')
        .select(`
          *,
          profissional:profissionais(id, nome, registro_profissional)
        `)
        .eq('paciente_id', patientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return (data || []).map(item => ({
        ...item,
        procedimentos_realizados: (Array.isArray(item.procedimentos_realizados) 
          ? item.procedimentos_realizados 
          : []) as ProcedimentoRealizado[],
      })) as EvolucaoOdonto[];
    },
    enabled: !!patientId,
  });
}

// Fetch evoluções by agendamento
export function useEvolucoesOdontoByAgendamento(agendamentoId: string | null) {
  return useQuery({
    queryKey: ['evolucoes-odonto', 'by-agendamento', agendamentoId],
    queryFn: async () => {
      if (!agendamentoId) return [];

      const { data, error } = await supabase
        .from('evolucoes_odonto')
        .select(`
          *,
          profissional:profissionais(id, nome, registro_profissional)
        `)
        .eq('agendamento_id', agendamentoId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return (data || []).map(item => ({
        ...item,
        procedimentos_realizados: (Array.isArray(item.procedimentos_realizados) 
          ? item.procedimentos_realizados 
          : []) as ProcedimentoRealizado[],
      })) as EvolucaoOdonto[];
    },
    enabled: !!agendamentoId,
  });
}

// Create evolução
export function useCreateEvolucaoOdonto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateEvolucaoInput) => {
      const { procedimentos_realizados, ...rest } = input;
      const { data, error } = await supabase
        .from('evolucoes_odonto')
        .insert({
          ...rest,
          procedimentos_realizados: JSON.parse(JSON.stringify(procedimentos_realizados || [])),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evolucoes-odonto'] });
      toast.success('Evolução registrada com sucesso!');
    },
    onError: (error: Error) => {
      toast.error('Erro ao registrar evolução: ' + error.message);
    },
  });
}

// Update evolução
export function useUpdateEvolucaoOdonto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      procedimentos_realizados,
      ...updateData
    }: Partial<CreateEvolucaoInput> & { id: string }) => {
      const updatePayload = {
        ...updateData,
        ...(procedimentos_realizados && { 
          procedimentos_realizados: JSON.parse(JSON.stringify(procedimentos_realizados)) 
        }),
      };
      const { data, error } = await supabase
        .from('evolucoes_odonto')
        .update(updatePayload)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evolucoes-odonto'] });
      toast.success('Evolução atualizada!');
    },
    onError: (error: Error) => {
      toast.error('Erro ao atualizar evolução: ' + error.message);
    },
  });
}
