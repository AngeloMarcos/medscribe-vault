import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { NursingQueueItem } from '@/types/nursing';
import { PatientCard } from './PatientCard';
import { Users } from 'lucide-react';

interface NursingQueueProps {
  items: NursingQueueItem[];
  isLoading?: boolean;
  selectedItem?: NursingQueueItem | null;
  onSelectItem?: (item: NursingQueueItem) => void;
  onStartAttendance?: (id: string) => void;
  onCompleteAttendance?: (id: string) => void;
  onCancel?: (id: string) => void;
}

export function NursingQueue({
  items,
  isLoading,
  selectedItem,
  onSelectItem,
  onStartAttendance,
  onCompleteAttendance,
  onCancel,
}: NursingQueueProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Users className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-1">
          Nenhum paciente na fila
        </h3>
        <p className="text-sm text-muted-foreground">
          Tudo em ordem por aqui!
        </p>
      </div>
    );
  }

  // Separate by status
  const inProgress = items.filter(i => i.status === 'in_progress');
  const waiting = items.filter(i => i.status === 'waiting');

  return (
    <ScrollArea className="h-[calc(100vh-280px)]">
      <div className="space-y-4 pr-4">
        {/* In Progress Section */}
        {inProgress.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-primary mb-2 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              Em Atendimento ({inProgress.length})
            </h4>
            <div className="space-y-2">
              {inProgress.map((item) => (
                <PatientCard
                  key={item.id}
                  item={item}
                  isSelected={selectedItem?.id === item.id}
                  onSelect={onSelectItem}
                  onStartAttendance={onStartAttendance}
                  onCompleteAttendance={onCompleteAttendance}
                  onCancel={onCancel}
                />
              ))}
            </div>
          </div>
        )}

        {/* Waiting Section */}
        {waiting.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground mb-2">
              Aguardando ({waiting.length})
            </h4>
            <div className="space-y-2">
              {waiting.map((item) => (
                <PatientCard
                  key={item.id}
                  item={item}
                  isSelected={selectedItem?.id === item.id}
                  onSelect={onSelectItem}
                  onStartAttendance={onStartAttendance}
                  onCompleteAttendance={onCompleteAttendance}
                  onCancel={onCancel}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
