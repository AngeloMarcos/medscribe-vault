import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  NursingQueueItem,
  PRIORITY_LABELS,
  SECTOR_LABELS,
  STATUS_LABELS,
  calculateAge,
  calculateWaitTime,
  getPriorityColor,
  getStatusColor,
} from '@/types/nursing';
import { Clock, Play, CheckCircle, User, FileText, X } from 'lucide-react';

interface PatientCardProps {
  item: NursingQueueItem;
  onStartAttendance?: (id: string) => void;
  onCompleteAttendance?: (id: string) => void;
  onCancel?: (id: string) => void;
  onSelect?: (item: NursingQueueItem) => void;
  isSelected?: boolean;
  showActions?: boolean;
}

export function PatientCard({
  item,
  onStartAttendance,
  onCompleteAttendance,
  onCancel,
  onSelect,
  isSelected = false,
  showActions = true,
}: PatientCardProps) {
  const age = item.patient?.birth_date ? calculateAge(item.patient.birth_date) : null;
  const waitTime = calculateWaitTime(item.created_at);

  return (
    <Card
      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
        isSelected ? 'ring-2 ring-primary border-primary' : 'border-border/60'
      } ${item.priority === 'emergency' ? 'border-l-4 border-l-destructive' : ''}`}
      onClick={() => onSelect?.(item)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Patient Info */}
            <div className="flex items-center gap-2 mb-2">
              <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <h4 className="font-semibold text-foreground truncate">
                  {item.patient?.name || 'Paciente'}
                </h4>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {item.patient?.medical_record_number && (
                    <span>Pront: {item.patient.medical_record_number}</span>
                  )}
                  {age !== null && <span>• {age} anos</span>}
                </div>
              </div>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-1.5 mb-2">
              <Badge variant="outline" className={getPriorityColor(item.priority)}>
                {PRIORITY_LABELS[item.priority]}
              </Badge>
              <Badge variant="outline" className={getStatusColor(item.status)}>
                {STATUS_LABELS[item.status]}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {SECTOR_LABELS[item.sector]}
              </Badge>
            </div>

            {/* Wait Time & Notes */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>Espera: {waitTime}</span>
              </div>
              {item.referred_from && (
                <div className="flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  <span>De: {item.referred_from}</span>
                </div>
              )}
            </div>

            {item.notes && (
              <p className="text-xs text-muted-foreground mt-2 line-clamp-2 bg-muted/50 p-2 rounded">
                {item.notes}
              </p>
            )}
          </div>

          {/* Actions */}
          {showActions && (
            <div className="flex flex-col gap-1">
              {item.status === 'waiting' && onStartAttendance && (
                <Button
                  size="sm"
                  variant="default"
                  onClick={(e) => {
                    e.stopPropagation();
                    onStartAttendance(item.id);
                  }}
                  className="gap-1"
                >
                  <Play className="h-3 w-3" />
                  Iniciar
                </Button>
              )}
              {item.status === 'in_progress' && onCompleteAttendance && (
                <Button
                  size="sm"
                  variant="default"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCompleteAttendance(item.id);
                  }}
                  className="gap-1 bg-success hover:bg-success/90"
                >
                  <CheckCircle className="h-3 w-3" />
                  Concluir
                </Button>
              )}
              {(item.status === 'waiting' || item.status === 'in_progress') && onCancel && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCancel(item.id);
                  }}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
