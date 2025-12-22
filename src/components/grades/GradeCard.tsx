import { GradeHorario, getDiaSemanaLabel, getTurnoLabel } from '@/hooks/useGradesHorarios';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Pencil, 
  Trash2, 
  Clock, 
  MapPin, 
  Users, 
  Calendar,
  Building2
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface GradeCardProps {
  grade: GradeHorario;
  onEdit: (grade: GradeHorario) => void;
  onDelete: (grade: GradeHorario) => void;
  onToggleStatus: (grade: GradeHorario, ativo: boolean) => void;
}

export function GradeCard({ grade, onEdit, onDelete, onToggleStatus }: GradeCardProps) {
  const turnoColors: Record<string, string> = {
    manha: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
    tarde: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    noite: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
    integral: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
  };

  const especialidadeColor = grade.especialidade?.cor_hex || '#6366f1';

  return (
    <Card className={`transition-all hover:shadow-md ${!grade.ativo ? 'opacity-60' : ''}`}>
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate">
              {grade.profissional?.nome || 'Profissional não definido'}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span 
                className="inline-block w-2 h-2 rounded-full" 
                style={{ backgroundColor: especialidadeColor }}
              />
              <span className="text-sm text-muted-foreground">
                {grade.especialidade?.nome || 'Especialidade não definida'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={grade.ativo ?? true}
              onCheckedChange={(checked) => onToggleStatus(grade, checked)}
              aria-label="Ativar/Desativar grade"
            />
          </div>
        </div>

        {/* Info Grid */}
        <div className="space-y-2 text-sm">
          {/* Dia e Horário */}
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4 shrink-0" />
            <span className="font-medium text-foreground">
              {getDiaSemanaLabel(grade.dia_semana)}
            </span>
            <span>•</span>
            <Clock className="h-4 w-4 shrink-0" />
            <span>
              {grade.hora_inicio?.slice(0, 5)} - {grade.hora_fim?.slice(0, 5)}
            </span>
            {grade.turno && (
              <Badge variant="secondary" className={turnoColors[grade.turno] || ''}>
                {getTurnoLabel(grade.turno)}
              </Badge>
            )}
          </div>

          {/* Sala e Zona */}
          <div className="flex items-center gap-4 text-muted-foreground">
            {grade.sala && (
              <div className="flex items-center gap-1">
                <Building2 className="h-4 w-4" />
                <span>Sala {grade.sala.numero}</span>
              </div>
            )}
            {grade.zona && (
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{grade.zona.nome}</span>
              </div>
            )}
          </div>

          {/* Vagas e Duração */}
          <div className="flex items-center gap-4 text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{grade.vagas_totais || 0} vagas</span>
            </div>
            <span>•</span>
            <span>{grade.duracao_consulta || 30} min/consulta</span>
          </div>

          {/* Validade */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1 border-t">
            <span>Válido:</span>
            <span>
              {format(new Date(grade.data_inicio), 'dd/MM/yyyy', { locale: ptBR })}
              {grade.data_fim && (
                <> até {format(new Date(grade.data_fim), 'dd/MM/yyyy', { locale: ptBR })}</>
              )}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(grade)}
            className="h-8"
          >
            <Pencil className="h-4 w-4 mr-1" />
            Editar
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(grade)}
            className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Excluir
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
