import { useState } from 'react';
import { Ticket, UserPlus, Baby, Accessibility, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useQueueTickets } from '@/hooks/useQueueTickets';
import {
  TicketType,
  QueueSector,
  TICKET_TYPE_LABELS,
  SECTOR_LABELS,
  TICKET_TYPE_COLORS,
} from '@/types/queue';
import { cn } from '@/lib/utils';

const TICKET_TYPE_ICONS: Record<TicketType, React.ElementType> = {
  normal: Users,
  priority: UserPlus,
  elderly: Baby,
  disability: Accessibility,
};

export function TicketGenerator() {
  const [sector, setSector] = useState<QueueSector>('reception');
  const [patientName, setPatientName] = useState('');
  const { generateTicket, getWaitingCount } = useQueueTickets();
  const waitingCount = getWaitingCount();

  const handleGenerateTicket = async (ticketType: TicketType) => {
    await generateTicket.mutateAsync({
      ticketType,
      sector,
      patientName: patientName.trim() || undefined,
    });
    setPatientName('');
  };

  const ticketTypes: TicketType[] = ['normal', 'priority', 'elderly', 'disability'];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5" />
            Gerador de Senhas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Sector selection */}
          <div className="space-y-2">
            <Label>Setor de Atendimento</Label>
            <Select value={sector} onValueChange={(v) => setSector(v as QueueSector)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(SECTOR_LABELS) as QueueSector[]).map((s) => (
                  <SelectItem key={s} value={s}>
                    {SECTOR_LABELS[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Optional patient name */}
          <div className="space-y-2">
            <Label>Nome do Paciente (opcional)</Label>
            <Input
              placeholder="Digite o nome do paciente"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
            />
          </div>

          {/* Ticket type buttons */}
          <div className="grid grid-cols-2 gap-4">
            {ticketTypes.map((type) => {
              const Icon = TICKET_TYPE_ICONS[type];
              const count =
                type === 'normal'
                  ? waitingCount.normal
                  : type === 'priority'
                  ? waitingCount.priority
                  : type === 'elderly'
                  ? waitingCount.elderly
                  : waitingCount.disability;

              return (
                <Button
                  key={type}
                  variant="outline"
                  className={cn(
                    'h-24 flex-col gap-2 relative',
                    TICKET_TYPE_COLORS[type]
                  )}
                  onClick={() => handleGenerateTicket(type)}
                  disabled={generateTicket.isPending}
                >
                  <Icon className="h-8 w-8" />
                  <span className="font-semibold">{TICKET_TYPE_LABELS[type]}</span>
                  {count > 0 && (
                    <span className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                      {count}
                    </span>
                  )}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Queue summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Resumo da Fila</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total aguardando:</span>
            <span className="font-bold text-2xl">{waitingCount.total}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4 text-sm">
            <div className="flex justify-between">
              <span>Normal:</span>
              <span className="font-medium">{waitingCount.normal}</span>
            </div>
            <div className="flex justify-between">
              <span>Prioritário:</span>
              <span className="font-medium">{waitingCount.priority}</span>
            </div>
            <div className="flex justify-between">
              <span>Idoso:</span>
              <span className="font-medium">{waitingCount.elderly}</span>
            </div>
            <div className="flex justify-between">
              <span>PCD:</span>
              <span className="font-medium">{waitingCount.disability}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
