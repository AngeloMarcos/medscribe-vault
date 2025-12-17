import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { toast } from 'sonner';
import type { Encaminhamento, ReferralType, ReferralUrgency, TransportType } from '@/types/referral';

interface CreateEncaminhamentoData {
  consulta_id?: string;
  paciente_id: string;
  profissional_id?: string;
  tipo: ReferralType;
  especialidade_destino?: string;
  unidade_destino?: string;
  profissional_destino?: string;
  justificativa: string;
  hipotese_diagnostica?: string;
  cid_principal?: string;
  observacoes?: string;
  urgencia: ReferralUrgency;
  transporte?: TransportType;
}

export function useEncaminhamentos(pacienteId?: string, consultaId?: string) {
  const { tenant } = useTenant();
  const queryClient = useQueryClient();

  // Fetch encaminhamentos for a patient or consultation
  const { data: encaminhamentos = [], isLoading, error, refetch } = useQuery({
    queryKey: ['encaminhamentos', pacienteId, consultaId],
    queryFn: async () => {
      let query = supabase
        .from('encaminhamentos')
        .select(`
          *,
          profissionais:profissional_id (nome, registro_profissional, tipo_registro)
        `)
        .order('created_at', { ascending: false });

      if (consultaId) {
        query = query.eq('consulta_id', consultaId);
      } else if (pacienteId) {
        query = query.eq('paciente_id', pacienteId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as (Encaminhamento & { profissionais?: { nome: string; registro_profissional: string; tipo_registro: string } })[];
    },
    enabled: !!pacienteId || !!consultaId,
  });

  // Create new encaminhamento
  const createEncaminhamento = useMutation({
    mutationFn: async (data: CreateEncaminhamentoData) => {
      const { data: result, error } = await supabase
        .from('encaminhamentos')
        .insert({
          ...data,
          tenant_id: tenant?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return result as Encaminhamento;
    },
    onSuccess: () => {
      toast.success('Encaminhamento criado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['encaminhamentos'] });
    },
    onError: (error) => {
      console.error('Error creating encaminhamento:', error);
      toast.error('Erro ao criar encaminhamento');
    },
  });

  // Update encaminhamento status
  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data, error } = await supabase
        .from('encaminhamentos')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Encaminhamento;
    },
    onSuccess: () => {
      toast.success('Status atualizado');
      queryClient.invalidateQueries({ queryKey: ['encaminhamentos'] });
    },
    onError: (error) => {
      console.error('Error updating status:', error);
      toast.error('Erro ao atualizar status');
    },
  });

  // Delete encaminhamento
  const deleteEncaminhamento = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('encaminhamentos')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Encaminhamento removido');
      queryClient.invalidateQueries({ queryKey: ['encaminhamentos'] });
    },
    onError: (error) => {
      console.error('Error deleting encaminhamento:', error);
      toast.error('Erro ao remover encaminhamento');
    },
  });

  return {
    encaminhamentos,
    isLoading,
    error,
    refetch,
    createEncaminhamento,
    updateStatus,
    deleteEncaminhamento,
  };
}
