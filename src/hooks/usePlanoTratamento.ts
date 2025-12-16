import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/hooks/useTenant';
import { toast } from 'sonner';
import type {
  ProcedimentoOdonto,
  PlanoTratamentoOdonto,
  ItemPlanoTratamento,
  CreatePlanoInput,
  CreateItemInput,
  UpdateItemInput,
  StatusItemTratamento,
  StatusPlanoTratamento,
} from '@/types/dental';

// Fetch all dental procedures (catalog)
export function useProcedimentosOdonto() {
  return useQuery({
    queryKey: ['procedimentos-odonto'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('procedimentos_odonto')
        .select('*')
        .eq('ativo', true)
        .order('categoria', { ascending: true })
        .order('nome', { ascending: true });

      if (error) throw error;
      return data as ProcedimentoOdonto[];
    },
    staleTime: 1000 * 60 * 30, // 30 minutes - catalog rarely changes
  });
}

// Fetch procedures grouped by category
export function useProcedimentosByCategoria() {
  const { data: procedimentos, ...rest } = useProcedimentosOdonto();

  const grouped = procedimentos?.reduce((acc, proc) => {
    if (!acc[proc.categoria]) {
      acc[proc.categoria] = [];
    }
    acc[proc.categoria].push(proc);
    return acc;
  }, {} as Record<string, ProcedimentoOdonto[]>);

  return { data: grouped, procedimentos, ...rest };
}

// Fetch treatment plans for a patient
export function usePlanosByPatient(patientId: string | null) {
  const { tenant } = useTenant();

  return useQuery({
    queryKey: ['planos-tratamento', patientId, tenant?.id],
    queryFn: async () => {
      if (!patientId) return [];

      const { data, error } = await supabase
        .from('planos_tratamento_odonto')
        .select(`
          *,
          patient:patients(id, name, cpf, birth_date, medical_record_number),
          profissional:profissionais(id, nome, registro_profissional)
        `)
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as PlanoTratamentoOdonto[];
    },
    enabled: !!patientId,
  });
}

// Fetch a specific treatment plan with items
export function usePlanoComItens(planoId: string | null) {
  return useQuery({
    queryKey: ['plano-tratamento', planoId],
    queryFn: async () => {
      if (!planoId) return null;

      // Fetch the plan
      const { data: plano, error: planoError } = await supabase
        .from('planos_tratamento_odonto')
        .select(`
          *,
          patient:patients(id, name, cpf, birth_date, medical_record_number),
          profissional:profissionais(id, nome, registro_profissional)
        `)
        .eq('id', planoId)
        .single();

      if (planoError) throw planoError;

      // Fetch items
      const { data: itens, error: itensError } = await supabase
        .from('itens_plano_tratamento')
        .select(`
          *,
          procedimento:procedimentos_odonto(*),
          profissional:profissionais(id, nome, registro_profissional)
        `)
        .eq('plano_id', planoId)
        .order('ordem_prioridade', { ascending: true });

      if (itensError) throw itensError;

      return {
        ...plano,
        itens: itens as ItemPlanoTratamento[],
      } as PlanoTratamentoOdonto;
    },
    enabled: !!planoId,
  });
}

// Create a new treatment plan
export function useCreatePlano() {
  const queryClient = useQueryClient();
  const { tenant } = useTenant();

  return useMutation({
    mutationFn: async (input: Omit<CreatePlanoInput, 'tenant_id'>) => {
      const { data, error } = await supabase
        .from('planos_tratamento_odonto')
        .insert({
          ...input,
          tenant_id: tenant?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data as PlanoTratamentoOdonto;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['planos-tratamento', data.patient_id] });
      toast.success('Plano de tratamento criado');
    },
    onError: (error) => {
      console.error('Error creating plan:', error);
      toast.error('Erro ao criar plano de tratamento');
    },
  });
}

// Add item to treatment plan
export function useAddItem() {
  const queryClient = useQueryClient();
  const { tenant } = useTenant();

  return useMutation({
    mutationFn: async (input: Omit<CreateItemInput, 'tenant_id'>) => {
      const { data, error } = await supabase
        .from('itens_plano_tratamento')
        .insert({
          ...input,
          tenant_id: tenant?.id,
        })
        .select(`
          *,
          procedimento:procedimentos_odonto(*),
          profissional:profissionais(id, nome, registro_profissional)
        `)
        .single();

      if (error) throw error;
      return data as ItemPlanoTratamento;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['plano-tratamento', data.plano_id] });
      toast.success('Procedimento adicionado ao plano');
    },
    onError: (error) => {
      console.error('Error adding item:', error);
      toast.error('Erro ao adicionar procedimento');
    },
  });
}

// Update item status
export function useUpdateItemStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      itemId, 
      planoId,
      updates 
    }: { 
      itemId: string; 
      planoId: string;
      updates: UpdateItemInput;
    }) => {
      const { data, error } = await supabase
        .from('itens_plano_tratamento')
        .update(updates)
        .eq('id', itemId)
        .select()
        .single();

      if (error) throw error;
      return { ...data, planoId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['plano-tratamento', data.planoId] });
    },
    onError: (error) => {
      console.error('Error updating item:', error);
      toast.error('Erro ao atualizar status');
    },
  });
}

// Delete item from plan
export function useDeleteItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ itemId, planoId }: { itemId: string; planoId: string }) => {
      const { error } = await supabase
        .from('itens_plano_tratamento')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
      return { planoId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['plano-tratamento', data.planoId] });
      toast.success('Procedimento removido do plano');
    },
    onError: (error) => {
      console.error('Error deleting item:', error);
      toast.error('Erro ao remover procedimento');
    },
  });
}

// Update plan status (approve, cancel, etc.)
export function useUpdatePlanoStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      planoId, 
      patientId,
      status 
    }: { 
      planoId: string;
      patientId: string;
      status: StatusPlanoTratamento;
    }) => {
      const { data, error } = await supabase
        .from('planos_tratamento_odonto')
        .update({ status })
        .eq('id', planoId)
        .select()
        .single();

      if (error) throw error;
      return { ...data, patientId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['plano-tratamento', data.id] });
      queryClient.invalidateQueries({ queryKey: ['planos-tratamento', data.patientId] });
      
      const messages: Record<StatusPlanoTratamento, string> = {
        orcamento: 'Plano retornado para orçamento',
        aprovado: 'Orçamento aprovado com sucesso!',
        em_andamento: 'Tratamento iniciado',
        concluido: 'Tratamento concluído',
        cancelado: 'Plano cancelado',
      };
      toast.success(messages[data.status as StatusPlanoTratamento] || 'Status atualizado');
    },
    onError: (error) => {
      console.error('Error updating plan:', error);
      toast.error('Erro ao atualizar plano');
    },
  });
}

// Fetch dentists (professionals with dental specialty)
export function useDentistas() {
  return useQuery({
    queryKey: ['dentistas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profissionais')
        .select('id, nome, registro_profissional, tipo_registro, especialidade:especialidades(nome)')
        .eq('ativo', true)
        .order('nome');

      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}
