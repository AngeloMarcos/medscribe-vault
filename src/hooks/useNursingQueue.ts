import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { NursingQueueItem, NursingSector, QueuePriority, QueueStatus } from '@/types/nursing';
import { useAuth } from '@/contexts/AuthContext';
import { useTenant } from '@/hooks/useTenant';
import { toast } from 'sonner';

interface UseNursingQueueOptions {
  sector?: NursingSector;
  status?: QueueStatus;
  priority?: QueuePriority;
}

export function useNursingQueue(options: UseNursingQueueOptions = {}) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { tenant } = useTenant();
  const [realtimeEnabled, setRealtimeEnabled] = useState(true);

  // Fetch queue items
  const {
    data: queueItems = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['nursing-queue', options],
    queryFn: async () => {
      let query = supabase
        .from('nursing_queue')
        .select(`
          *,
          patient:patients(id, name, birth_date, medical_record_number, cpf)
        `)
        .in('status', ['waiting', 'in_progress'])
        .order('priority', { ascending: true })
        .order('created_at', { ascending: true });

      if (options.sector) {
        query = query.eq('sector', options.sector);
      }
      if (options.status) {
        query = query.eq('status', options.status);
      }
      if (options.priority) {
        query = query.eq('priority', options.priority);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Sort by priority order: emergency > priority > normal
      const priorityOrder = { emergency: 0, priority: 1, normal: 2 };
      return (data as NursingQueueItem[]).sort((a, b) => {
        const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      });
    },
  });

  // Realtime subscription
  useEffect(() => {
    if (!realtimeEnabled) return;

    const channel = supabase
      .channel('nursing-queue-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'nursing_queue',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['nursing-queue'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, realtimeEnabled]);

  // Add to queue
  const addToQueue = useMutation({
    mutationFn: async (item: {
      patient_id: string;
      sector: NursingSector;
      priority?: QueuePriority;
      consulta_id?: string;
      referred_from?: string;
      notes?: string;
    }) => {
      const { data, error } = await supabase
        .from('nursing_queue')
        .insert({
          patient_id: item.patient_id,
          sector: item.sector,
          priority: item.priority || 'normal',
          consulta_id: item.consulta_id || null,
          referred_from: item.referred_from || null,
          notes: item.notes || null,
          status: 'waiting',
          tenant_id: tenant?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nursing-queue'] });
      toast.success('Paciente adicionado à fila');
    },
    onError: (error) => {
      toast.error('Erro ao adicionar à fila: ' + error.message);
    },
  });

  // Start attendance
  const startAttendance = useMutation({
    mutationFn: async (queueId: string) => {
      const { data, error } = await supabase
        .from('nursing_queue')
        .update({
          status: 'in_progress',
          started_at: new Date().toISOString(),
          attended_by: user?.id,
        })
        .eq('id', queueId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nursing-queue'] });
      toast.success('Atendimento iniciado');
    },
    onError: (error) => {
      toast.error('Erro ao iniciar atendimento: ' + error.message);
    },
  });

  // Complete attendance
  const completeAttendance = useMutation({
    mutationFn: async (queueId: string) => {
      const { data, error } = await supabase
        .from('nursing_queue')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', queueId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nursing-queue'] });
      toast.success('Atendimento concluído');
    },
    onError: (error) => {
      toast.error('Erro ao concluir atendimento: ' + error.message);
    },
  });

  // Cancel queue item
  const cancelQueueItem = useMutation({
    mutationFn: async (queueId: string) => {
      const { data, error } = await supabase
        .from('nursing_queue')
        .update({
          status: 'cancelled',
        })
        .eq('id', queueId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nursing-queue'] });
      toast.success('Item removido da fila');
    },
    onError: (error) => {
      toast.error('Erro ao cancelar: ' + error.message);
    },
  });

  // Stats
  const stats = {
    total: queueItems.length,
    waiting: queueItems.filter(i => i.status === 'waiting').length,
    inProgress: queueItems.filter(i => i.status === 'in_progress').length,
    emergency: queueItems.filter(i => i.priority === 'emergency').length,
    bySector: Object.fromEntries(
      ['medication_room', 'observation', 'vitals', 'procedures', 'dressing'].map(sector => [
        sector,
        queueItems.filter(i => i.sector === sector).length,
      ])
    ) as Record<NursingSector, number>,
  };

  return {
    queueItems,
    isLoading,
    error,
    refetch,
    addToQueue,
    startAttendance,
    completeAttendance,
    cancelQueueItem,
    stats,
    setRealtimeEnabled,
  };
}
