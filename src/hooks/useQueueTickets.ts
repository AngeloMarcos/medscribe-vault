import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import type { QueueTicket, QueueCallHistory, TicketType, QueueSector } from '@/types/queue';
import { TICKET_TYPE_PREFIX } from '@/types/queue';

export function useQueueTickets(sector?: QueueSector) {
  const { tenant } = useTenant();
  const queryClient = useQueryClient();
  const [realtimeEnabled, setRealtimeEnabled] = useState(true);

  // Fetch waiting and called tickets
  const { data: tickets = [], isLoading, error, refetch } = useQuery({
    queryKey: ['queue-tickets', tenant?.id, sector],
    queryFn: async () => {
      if (!tenant?.id) return [];

      let query = supabase
        .from('queue_tickets')
        .select('*')
        .eq('tenant_id', tenant.id)
        .in('status', ['waiting', 'called', 'in_service'])
        .order('created_at', { ascending: true });

      if (sector) {
        query = query.eq('sector', sector);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as QueueTicket[];
    },
    enabled: !!tenant?.id,
  });

  // Realtime subscription
  useEffect(() => {
    if (!tenant?.id || !realtimeEnabled) return;

    const channel = supabase
      .channel('queue-tickets-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'queue_tickets',
          filter: `tenant_id=eq.${tenant.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['queue-tickets'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tenant?.id, realtimeEnabled, queryClient]);

  // Generate new ticket
  const generateTicket = useMutation({
    mutationFn: async ({
      ticketType,
      sector: ticketSector,
      patientId,
      patientName,
    }: {
      ticketType: TicketType;
      sector: QueueSector;
      patientId?: string;
      patientName?: string;
    }) => {
      if (!tenant?.id) throw new Error('Tenant não encontrado');

      // Get the last ticket number for today
      const today = new Date().toISOString().split('T')[0];
      const prefix = TICKET_TYPE_PREFIX[ticketType];

      const { data: lastTicket } = await supabase
        .from('queue_tickets')
        .select('ticket_number')
        .eq('tenant_id', tenant.id)
        .like('ticket_number', `${prefix}%`)
        .gte('created_at', today)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      let nextNumber = 1;
      if (lastTicket) {
        const lastNum = parseInt(lastTicket.ticket_number.substring(1), 10);
        nextNumber = lastNum + 1;
      }

      const ticketNumber = `${prefix}${nextNumber.toString().padStart(3, '0')}`;

      const { data, error } = await supabase
        .from('queue_tickets')
        .insert({
          tenant_id: tenant.id,
          ticket_number: ticketNumber,
          ticket_type: ticketType,
          sector: ticketSector,
          patient_id: patientId || null,
          patient_name: patientName || null,
          status: 'waiting',
        })
        .select()
        .single();

      if (error) throw error;
      return data as QueueTicket;
    },
    onSuccess: (data) => {
      toast.success(`Senha ${data.ticket_number} gerada com sucesso!`);
      queryClient.invalidateQueries({ queryKey: ['queue-tickets'] });
    },
    onError: (error) => {
      console.error('Error generating ticket:', error);
      toast.error('Erro ao gerar senha');
    },
  });

  // Call next ticket
  const callTicket = useMutation({
    mutationFn: async ({
      ticketId,
      guiche,
    }: {
      ticketId: string;
      guiche: string;
    }) => {
      const { data: ticket, error: fetchError } = await supabase
        .from('queue_tickets')
        .select('*')
        .eq('id', ticketId)
        .single();

      if (fetchError) throw fetchError;

      const { data, error } = await supabase
        .from('queue_tickets')
        .update({
          status: 'called',
          guiche,
          called_at: new Date().toISOString(),
        })
        .eq('id', ticketId)
        .select()
        .single();

      if (error) throw error;

      // Add to call history
      await supabase.from('queue_call_history').insert({
        tenant_id: ticket.tenant_id,
        ticket_id: ticketId,
        ticket_number: ticket.ticket_number,
        guiche,
      });

      return data as QueueTicket;
    },
    onSuccess: (data) => {
      toast.success(`Chamando senha ${data.ticket_number} no ${data.guiche}`);
      queryClient.invalidateQueries({ queryKey: ['queue-tickets'] });
      queryClient.invalidateQueries({ queryKey: ['queue-call-history'] });
    },
    onError: (error) => {
      console.error('Error calling ticket:', error);
      toast.error('Erro ao chamar senha');
    },
  });

  // Start service
  const startService = useMutation({
    mutationFn: async (ticketId: string) => {
      const { data, error } = await supabase
        .from('queue_tickets')
        .update({ status: 'in_service' })
        .eq('id', ticketId)
        .select()
        .single();

      if (error) throw error;
      return data as QueueTicket;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['queue-tickets'] });
    },
    onError: (error) => {
      console.error('Error starting service:', error);
      toast.error('Erro ao iniciar atendimento');
    },
  });

  // Complete service
  const completeService = useMutation({
    mutationFn: async (ticketId: string) => {
      const { data, error } = await supabase
        .from('queue_tickets')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', ticketId)
        .select()
        .single();

      if (error) throw error;
      return data as QueueTicket;
    },
    onSuccess: () => {
      toast.success('Atendimento concluído');
      queryClient.invalidateQueries({ queryKey: ['queue-tickets'] });
    },
    onError: (error) => {
      console.error('Error completing service:', error);
      toast.error('Erro ao concluir atendimento');
    },
  });

  // Mark as no-show
  const markNoShow = useMutation({
    mutationFn: async (ticketId: string) => {
      const { data, error } = await supabase
        .from('queue_tickets')
        .update({ status: 'no_show' })
        .eq('id', ticketId)
        .select()
        .single();

      if (error) throw error;
      return data as QueueTicket;
    },
    onSuccess: () => {
      toast.info('Paciente marcado como não compareceu');
      queryClient.invalidateQueries({ queryKey: ['queue-tickets'] });
    },
    onError: (error) => {
      console.error('Error marking no-show:', error);
      toast.error('Erro ao marcar não comparecimento');
    },
  });

  // Get waiting count by type
  const getWaitingCount = () => {
    const waiting = tickets.filter((t) => t.status === 'waiting');
    return {
      total: waiting.length,
      normal: waiting.filter((t) => t.ticket_type === 'normal').length,
      priority: waiting.filter((t) => t.ticket_type === 'priority').length,
      elderly: waiting.filter((t) => t.ticket_type === 'elderly').length,
      disability: waiting.filter((t) => t.ticket_type === 'disability').length,
    };
  };

  return {
    tickets,
    isLoading,
    error,
    refetch,
    generateTicket,
    callTicket,
    startService,
    completeService,
    markNoShow,
    getWaitingCount,
    setRealtimeEnabled,
  };
}

export function useCallHistory() {
  const { tenant } = useTenant();
  const queryClient = useQueryClient();

  const { data: history = [], isLoading } = useQuery({
    queryKey: ['queue-call-history', tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return [];

      const { data, error } = await supabase
        .from('queue_call_history')
        .select('*')
        .eq('tenant_id', tenant.id)
        .order('called_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data as QueueCallHistory[];
    },
    enabled: !!tenant?.id,
  });

  // Realtime subscription
  useEffect(() => {
    if (!tenant?.id) return;

    const channel = supabase
      .channel('queue-call-history-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'queue_call_history',
          filter: `tenant_id=eq.${tenant.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['queue-call-history'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tenant?.id, queryClient]);

  return { history, isLoading };
}
