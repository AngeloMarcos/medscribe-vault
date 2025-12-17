import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Send,
  MoreVertical,
  Check,
  X,
  Printer,
  Trash2,
  ArrowRight,
  Building2,
  Hospital,
  BedDouble,
} from 'lucide-react';
import { useEncaminhamentos } from '@/hooks/useEncaminhamentos';
import {
  Encaminhamento,
  ReferralType,
  REFERRAL_TYPE_LABELS,
  REFERRAL_URGENCY_LABELS,
  REFERRAL_URGENCY_COLORS,
  REFERRAL_STATUS_LABELS,
} from '@/types/referral';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface ReferralListProps {
  pacienteId: string;
  consultaId?: string;
}

const TYPE_ICONS: Record<ReferralType, React.ElementType> = {
  especialista: ArrowRight,
  ubs: Building2,
  pronto_atendimento: Hospital,
  internacao: BedDouble,
};

export function ReferralList({ pacienteId, consultaId }: ReferralListProps) {
  const { encaminhamentos, isLoading, updateStatus, deleteEncaminhamento } = useEncaminhamentos(
    pacienteId,
    consultaId
  );
  const [deleteId, setDeleteId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (encaminhamentos.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Send className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p>Nenhum encaminhamento registrado</p>
      </div>
    );
  }

  const handleStatusChange = async (id: string, status: string) => {
    await updateStatus.mutateAsync({ id, status });
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteEncaminhamento.mutateAsync(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <>
      <div className="space-y-3">
        {encaminhamentos.map((enc) => {
          const Icon = TYPE_ICONS[enc.tipo as ReferralType];
          const statusColor =
            enc.status === 'concluido'
              ? 'bg-green-100 text-green-800'
              : enc.status === 'cancelado'
              ? 'bg-red-100 text-red-800'
              : enc.status === 'encaminhado'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-gray-100 text-gray-800';

          return (
            <Card key={enc.id} className="overflow-hidden">
              <div className="flex items-stretch">
                <div
                  className={cn(
                    'w-1',
                    enc.urgencia === 'emergencia'
                      ? 'bg-red-500'
                      : enc.urgencia === 'urgente'
                      ? 'bg-amber-500'
                      : 'bg-green-500'
                  )}
                />
                <div className="flex-1 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium">
                            {REFERRAL_TYPE_LABELS[enc.tipo as ReferralType]}
                          </span>
                          {enc.especialidade_destino && (
                            <span className="text-muted-foreground">
                              → {enc.especialidade_destino}
                            </span>
                          )}
                        </div>
                        {enc.unidade_destino && (
                          <p className="text-sm text-muted-foreground">
                            {enc.unidade_destino}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <Badge
                            className={cn(
                              'text-xs',
                              REFERRAL_URGENCY_COLORS[enc.urgencia as keyof typeof REFERRAL_URGENCY_COLORS]
                            )}
                          >
                            {REFERRAL_URGENCY_LABELS[enc.urgencia as keyof typeof REFERRAL_URGENCY_LABELS]}
                          </Badge>
                          <Badge variant="outline" className={cn('text-xs', statusColor)}>
                            {REFERRAL_STATUS_LABELS[enc.status as keyof typeof REFERRAL_STATUS_LABELS]}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {format(parseISO(enc.created_at), 'dd/MM/yyyy HH:mm')}
                          </span>
                        </div>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="shrink-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {enc.status === 'pendente' && (
                          <DropdownMenuItem
                            onClick={() => handleStatusChange(enc.id, 'encaminhado')}
                          >
                            <Send className="h-4 w-4 mr-2" />
                            Marcar como Encaminhado
                          </DropdownMenuItem>
                        )}
                        {(enc.status === 'pendente' || enc.status === 'encaminhado') && (
                          <DropdownMenuItem
                            onClick={() => handleStatusChange(enc.id, 'concluido')}
                          >
                            <Check className="h-4 w-4 mr-2" />
                            Marcar como Concluído
                          </DropdownMenuItem>
                        )}
                        {enc.status !== 'cancelado' && enc.status !== 'concluido' && (
                          <DropdownMenuItem
                            onClick={() => handleStatusChange(enc.id, 'cancelado')}
                          >
                            <X className="h-4 w-4 mr-2" />
                            Cancelar
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => setDeleteId(enc.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {enc.justificativa && (
                    <p className="text-sm mt-3 text-muted-foreground line-clamp-2">
                      {enc.justificativa}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este encaminhamento? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
