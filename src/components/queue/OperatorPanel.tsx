import { useState } from 'react';
import {
  Phone,
  Play,
  CheckCircle,
  XCircle,
  RefreshCw,
  Users,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useQueueTickets } from '@/hooks/useQueueTickets';
import {
  QueueTicket,
  QueueSector,
  TICKET_TYPE_LABELS,
  TICKET_TYPE_COLORS,
  SECTOR_LABELS,
} from '@/types/queue';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function OperatorPanel() {
  const [guiche, setGuiche] = useState('Guichê 01');
  const [selectedSector, setSelectedSector] = useState<QueueSector | 'all'>('all');
  const {
    tickets,
    isLoading,
    callTicket,
    startService,
    completeService,
    markNoShow,
    refetch,
  } = useQueueTickets(selectedSector === 'all' ? undefined : selectedSector);

  // Separate tickets by status
  const waitingTickets = tickets
    .filter((t) => t.status === 'waiting')
    .sort((a, b) => {
      // Priority order: priority > elderly > disability > normal
      const priorityOrder = { priority: 0, elderly: 1, disability: 2, normal: 3 };
      const priorityDiff =
        priorityOrder[a.ticket_type] - priorityOrder[b.ticket_type];
      if (priorityDiff !== 0) return priorityDiff;
      // Then by time
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });

  const calledTickets = tickets.filter((t) => t.status === 'called');
  const inServiceTickets = tickets.filter((t) => t.status === 'in_service');

  const handleCallNext = async () => {
    if (waitingTickets.length === 0) return;
    const nextTicket = waitingTickets[0];
    await callTicket.mutateAsync({ ticketId: nextTicket.id, guiche });
  };

  const handleCallSpecific = async (ticket: QueueTicket) => {
    await callTicket.mutateAsync({ ticketId: ticket.id, guiche });
  };

  const handleStartService = async (ticket: QueueTicket) => {
    await startService.mutateAsync(ticket.id);
  };

  const handleComplete = async (ticket: QueueTicket) => {
    await completeService.mutateAsync(ticket.id);
  };

  const handleNoShow = async (ticket: QueueTicket) => {
    await markNoShow.mutateAsync(ticket.id);
  };

  const TicketCard = ({
    ticket,
    showActions,
  }: {
    ticket: QueueTicket;
    showActions: 'call' | 'service' | 'complete';
  }) => (
    <div
      className={cn(
        'flex items-center justify-between p-3 rounded-lg border bg-card',
        ticket.status === 'called' && 'border-primary bg-primary/5'
      )}
    >
      <div className="flex items-center gap-3">
        <span
          className={cn(
            'text-lg font-bold px-3 py-1 rounded-lg',
            TICKET_TYPE_COLORS[ticket.ticket_type]
          )}
        >
          {ticket.ticket_number}
        </span>
        <div>
          {ticket.patient_name && (
            <p className="font-medium text-sm">{ticket.patient_name}</p>
          )}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {formatDistanceToNow(new Date(ticket.created_at), {
              addSuffix: true,
              locale: ptBR,
            })}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="text-xs">
          {SECTOR_LABELS[ticket.sector as QueueSector]}
        </Badge>
        {showActions === 'call' && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleCallSpecific(ticket)}
            disabled={callTicket.isPending}
          >
            <Phone className="h-4 w-4" />
          </Button>
        )}
        {showActions === 'service' && (
          <>
            <Button
              size="sm"
              variant="default"
              onClick={() => handleStartService(ticket)}
              disabled={startService.isPending}
            >
              <Play className="h-4 w-4 mr-1" />
              Iniciar
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleNoShow(ticket)}
              disabled={markNoShow.isPending}
            >
              <XCircle className="h-4 w-4" />
            </Button>
          </>
        )}
        {showActions === 'complete' && (
          <Button
            size="sm"
            variant="default"
            onClick={() => handleComplete(ticket)}
            disabled={completeService.isPending}
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            Concluir
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Operator settings */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <span>Painel do Operador</span>
            <Button variant="ghost" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Guichê / Sala</Label>
              <Input
                value={guiche}
                onChange={(e) => setGuiche(e.target.value)}
                placeholder="Ex: Guichê 01, Sala 02"
              />
            </div>
            <div className="space-y-2">
              <Label>Filtrar por Setor</Label>
              <Select
                value={selectedSector}
                onValueChange={(v) => setSelectedSector(v as QueueSector | 'all')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Setores</SelectItem>
                  {(Object.keys(SECTOR_LABELS) as QueueSector[]).map((s) => (
                    <SelectItem key={s} value={s}>
                      {SECTOR_LABELS[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Call next button */}
          <Button
            className="w-full h-16 text-lg"
            onClick={handleCallNext}
            disabled={waitingTickets.length === 0 || callTicket.isPending}
          >
            <Phone className="h-6 w-6 mr-2" />
            Chamar Próxima Senha
            {waitingTickets.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {waitingTickets[0].ticket_number}
              </Badge>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Called tickets - waiting for patient */}
      {calledTickets.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Phone className="h-4 w-4 text-primary" />
              Chamados ({calledTickets.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {calledTickets.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} showActions="service" />
            ))}
          </CardContent>
        </Card>
      )}

      {/* In service tickets */}
      {inServiceTickets.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Play className="h-4 w-4 text-green-600" />
              Em Atendimento ({inServiceTickets.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {inServiceTickets.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} showActions="complete" />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Waiting queue */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4" />
            Fila de Espera ({waitingTickets.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {waitingTickets.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhum paciente na fila
            </p>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {waitingTickets.map((ticket) => (
                <TicketCard key={ticket.id} ticket={ticket} showActions="call" />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
