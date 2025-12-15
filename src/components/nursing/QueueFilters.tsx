import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  NursingSector,
  QueuePriority,
  SECTOR_LABELS,
  PRIORITY_LABELS,
} from '@/types/nursing';
import { Syringe, Eye, Activity, Stethoscope, Bandage, AlertTriangle, AlertCircle, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QueueFiltersProps {
  selectedSector: NursingSector | 'all';
  selectedPriority: QueuePriority | 'all';
  onSectorChange: (sector: NursingSector | 'all') => void;
  onPriorityChange: (priority: QueuePriority | 'all') => void;
  stats?: Record<NursingSector, number>;
}

const SECTOR_ICONS: Record<NursingSector, React.ReactNode> = {
  medication_room: <Syringe className="h-4 w-4" />,
  observation: <Eye className="h-4 w-4" />,
  vitals: <Activity className="h-4 w-4" />,
  procedures: <Stethoscope className="h-4 w-4" />,
  dressing: <Bandage className="h-4 w-4" />,
};

const PRIORITY_ICONS: Record<QueuePriority, React.ReactNode> = {
  emergency: <AlertTriangle className="h-4 w-4" />,
  priority: <AlertCircle className="h-4 w-4" />,
  normal: <User className="h-4 w-4" />,
};

export function QueueFilters({
  selectedSector,
  selectedPriority,
  onSectorChange,
  onPriorityChange,
  stats,
}: QueueFiltersProps) {
  const sectors: (NursingSector | 'all')[] = ['all', 'medication_room', 'observation', 'vitals', 'procedures', 'dressing'];
  const priorities: (QueuePriority | 'all')[] = ['all', 'emergency', 'priority', 'normal'];

  return (
    <div className="space-y-4">
      {/* Sector Filters */}
      <div>
        <h4 className="text-sm font-medium text-muted-foreground mb-2">Setor</h4>
        <div className="flex flex-wrap gap-2">
          {sectors.map((sector) => (
            <Button
              key={sector}
              variant={selectedSector === sector ? 'default' : 'outline'}
              size="sm"
              onClick={() => onSectorChange(sector)}
              className={cn(
                'gap-1.5',
                selectedSector === sector && 'bg-primary text-primary-foreground'
              )}
            >
              {sector === 'all' ? (
                <>Todos</>
              ) : (
                <>
                  {SECTOR_ICONS[sector]}
                  <span className="hidden sm:inline">{SECTOR_LABELS[sector]}</span>
                  {stats && stats[sector] > 0 && (
                    <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                      {stats[sector]}
                    </Badge>
                  )}
                </>
              )}
            </Button>
          ))}
        </div>
      </div>

      {/* Priority Filters */}
      <div>
        <h4 className="text-sm font-medium text-muted-foreground mb-2">Prioridade</h4>
        <div className="flex flex-wrap gap-2">
          {priorities.map((priority) => (
            <Button
              key={priority}
              variant={selectedPriority === priority ? 'default' : 'outline'}
              size="sm"
              onClick={() => onPriorityChange(priority)}
              className={cn(
                'gap-1.5',
                selectedPriority === priority && priority === 'emergency' && 'bg-destructive text-destructive-foreground',
                selectedPriority === priority && priority === 'priority' && 'bg-warning text-warning-foreground',
                selectedPriority === priority && priority === 'normal' && 'bg-primary text-primary-foreground'
              )}
            >
              {priority === 'all' ? (
                <>Todas</>
              ) : (
                <>
                  {PRIORITY_ICONS[priority]}
                  <span className="hidden sm:inline">{PRIORITY_LABELS[priority]}</span>
                </>
              )}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
