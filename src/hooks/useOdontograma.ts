import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Odontograma, OdontogramaHistorico } from '@/types/dental';
import { ToothCondition } from '@/components/odontograma/teeth/toothUtils';
import { useTenant } from '@/hooks/useTenant';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Json } from '@/integrations/supabase/types';

// Helper to convert Record<number, ToothCondition[]> to Json-compatible format
function conditionsToJson(conditions: Record<number, ToothCondition[]>): Json {
  const result: Record<string, unknown> = {};
  Object.entries(conditions).forEach(([key, value]) => {
    result[key] = value;
  });
  return result as Json;
}

// Helper to parse Json to Record<number, ToothCondition[]>
function jsonToConditions(json: Json | null): Record<number, ToothCondition[]> {
  if (!json || typeof json !== 'object' || Array.isArray(json)) return {};
  const result: Record<number, ToothCondition[]> = {};
  Object.entries(json as Record<string, unknown>).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      result[parseInt(key)] = value as unknown as ToothCondition[];
    }
  });
  return result;
}

// ==================== FETCH HOOKS ====================

export function useOdontogramaByPatient(patientId: string | undefined) {
  const { tenant } = useTenant();

  return useQuery({
    queryKey: ['odontograma', patientId, tenant?.id],
    queryFn: async () => {
      if (!patientId) return null;

      const { data, error } = await supabase
        .from('odontogramas')
        .select('*')
        .eq('patient_id', patientId)
        .eq('tenant_id', tenant?.id)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        const parsedData: Odontograma = {
          ...data,
          dados: jsonToConditions(data.dados),
        };
        return parsedData;
      }
      return null;
    },
    enabled: !!patientId && !!tenant?.id,
  });
}

export function useOdontogramaHistorico(patientId: string | undefined) {
  const { tenant } = useTenant();

  return useQuery({
    queryKey: ['odontograma-historico', patientId, tenant?.id],
    queryFn: async () => {
      if (!patientId) return [];

      const { data, error } = await supabase
        .from('odontograma_historico')
        .select(`
          *,
          profissional:profissional_id (nome)
        `)
        .eq('patient_id', patientId)
        .eq('tenant_id', tenant?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as OdontogramaHistorico[];
    },
    enabled: !!patientId && !!tenant?.id,
  });
}

export function useHistoricoByDente(patientId: string | undefined, dente: number | null) {
  const { tenant } = useTenant();

  return useQuery({
    queryKey: ['odontograma-historico-dente', patientId, dente, tenant?.id],
    queryFn: async () => {
      if (!patientId || !dente) return [];

      const { data, error } = await supabase
        .from('odontograma_historico')
        .select(`
          *,
          profissional:profissional_id (nome)
        `)
        .eq('patient_id', patientId)
        .eq('dente', dente)
        .eq('tenant_id', tenant?.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return (data || []) as OdontogramaHistorico[];
    },
    enabled: !!patientId && !!dente && !!tenant?.id,
  });
}

// ==================== MUTATION HOOKS ====================

interface SaveConditionInput {
  patientId: string;
  dente: number;
  surface: ToothCondition['surface'];
  condition: ToothCondition['condition'];
  currentConditions: Record<number, ToothCondition[]>;
  odontogramaId?: string;
}

export function useSaveCondition() {
  const queryClient = useQueryClient();
  const { tenant } = useTenant();
  const { user, profile } = useAuth();

  return useMutation({
    mutationFn: async ({ patientId, dente, surface, condition, currentConditions, odontogramaId }: SaveConditionInput) => {
      // Get profissional_id from profile
      const profissionalId = profile?.professional_id || null;

      // Update conditions
      const toothConditions = currentConditions[dente] || [];
      const filtered = surface === 'all' 
        ? [] 
        : toothConditions.filter(c => c.surface !== surface && c.surface !== 'all');
      
      const newConditions = {
        ...currentConditions,
        [dente]: [...filtered, { surface, condition }],
      };

      let resultOdontogramaId = odontogramaId;

      if (odontogramaId) {
        // Update existing odontograma
        const { error } = await supabase
          .from('odontogramas')
          .update({ dados: conditionsToJson(newConditions) })
          .eq('id', odontogramaId);

        if (error) throw error;
      } else {
        // Create new odontograma
        const { data, error } = await supabase
          .from('odontogramas')
          .insert([{
            patient_id: patientId,
            tenant_id: tenant?.id,
            profissional_id: profissionalId,
            dados: conditionsToJson(newConditions),
          }])
          .select('id')
          .single();

        if (error) throw error;
        resultOdontogramaId = data.id;
      }

      // Log history
      const { error: histError } = await supabase
        .from('odontograma_historico')
        .insert({
          odontograma_id: resultOdontogramaId,
          patient_id: patientId,
          profissional_id: profissionalId,
          tenant_id: tenant?.id,
          dente,
          superficie: surface,
          condicao: condition,
          acao: 'add',
          created_by: user?.id,
        });

      if (histError) console.error('Error logging history:', histError);

      return { newConditions, odontogramaId: resultOdontogramaId };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['odontograma', variables.patientId] });
      queryClient.invalidateQueries({ queryKey: ['odontograma-historico', variables.patientId] });
      queryClient.invalidateQueries({ queryKey: ['odontograma-historico-dente', variables.patientId] });
    },
    onError: (error) => {
      console.error('Error saving condition:', error);
      toast.error('Erro ao salvar condição');
    },
  });
}

interface RemoveConditionInput {
  patientId: string;
  dente: number;
  surface: ToothCondition['surface'];
  condition: ToothCondition['condition'];
  currentConditions: Record<number, ToothCondition[]>;
  odontogramaId: string;
}

export function useRemoveCondition() {
  const queryClient = useQueryClient();
  const { tenant } = useTenant();
  const { user, profile } = useAuth();

  return useMutation({
    mutationFn: async ({ patientId, dente, surface, condition, currentConditions, odontogramaId }: RemoveConditionInput) => {
      const profissionalId = profile?.professional_id || null;

      // Remove condition
      const toothConditions = currentConditions[dente] || [];
      const newToothConditions = toothConditions.filter(c => c.surface !== surface);
      
      const newConditions = { ...currentConditions };
      if (newToothConditions.length === 0) {
        delete newConditions[dente];
      } else {
        newConditions[dente] = newToothConditions;
      }

      // Update odontograma
      const { error } = await supabase
        .from('odontogramas')
        .update({ dados: conditionsToJson(newConditions) })
        .eq('id', odontogramaId);

      if (error) throw error;

      // Log history
      const { error: histError } = await supabase
        .from('odontograma_historico')
        .insert({
          odontograma_id: odontogramaId,
          patient_id: patientId,
          profissional_id: profissionalId,
          tenant_id: tenant?.id,
          dente,
          superficie: surface,
          condicao: condition,
          acao: 'remove',
          created_by: user?.id,
        });

      if (histError) console.error('Error logging history:', histError);

      return { newConditions };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['odontograma', variables.patientId] });
      queryClient.invalidateQueries({ queryKey: ['odontograma-historico', variables.patientId] });
      queryClient.invalidateQueries({ queryKey: ['odontograma-historico-dente', variables.patientId] });
    },
    onError: (error) => {
      console.error('Error removing condition:', error);
      toast.error('Erro ao remover condição');
    },
  });
}

interface ClearToothInput {
  patientId: string;
  dente: number;
  currentConditions: Record<number, ToothCondition[]>;
  odontogramaId: string;
}

export function useClearToothConditions() {
  const queryClient = useQueryClient();
  const { tenant } = useTenant();
  const { user, profile } = useAuth();

  return useMutation({
    mutationFn: async ({ patientId, dente, currentConditions, odontogramaId }: ClearToothInput) => {
      const profissionalId = profile?.professional_id || null;
      const toothConditions = currentConditions[dente] || [];

      // Clear all conditions for tooth
      const newConditions = { ...currentConditions };
      delete newConditions[dente];

      // Update odontograma
      const { error } = await supabase
        .from('odontogramas')
        .update({ dados: conditionsToJson(newConditions) })
        .eq('id', odontogramaId);

      if (error) throw error;

      // Log history for each removed condition
      for (const cond of toothConditions) {
        await supabase
          .from('odontograma_historico')
          .insert({
            odontograma_id: odontogramaId,
            patient_id: patientId,
            profissional_id: profissionalId,
            tenant_id: tenant?.id,
            dente,
            superficie: cond.surface,
            condicao: cond.condition,
            acao: 'remove',
            created_by: user?.id,
          });
      }

      return { newConditions };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['odontograma', variables.patientId] });
      queryClient.invalidateQueries({ queryKey: ['odontograma-historico', variables.patientId] });
      queryClient.invalidateQueries({ queryKey: ['odontograma-historico-dente', variables.patientId] });
    },
    onError: (error) => {
      console.error('Error clearing conditions:', error);
      toast.error('Erro ao limpar condições');
    },
  });
}
