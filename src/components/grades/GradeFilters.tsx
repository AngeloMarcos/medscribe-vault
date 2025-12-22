import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useEspecialidades, useProfissionais, TURNOS } from '@/hooks/useGradesHorarios';

interface GradeFiltersProps {
  filters: {
    especialidade_id?: string;
    profissional_id?: string;
    turno?: string;
  };
  onFiltersChange: (filters: GradeFiltersProps['filters']) => void;
}

export function GradeFilters({ filters, onFiltersChange }: GradeFiltersProps) {
  const { data: especialidades } = useEspecialidades();
  const { data: profissionais } = useProfissionais();

  const hasFilters = filters.especialidade_id || filters.profissional_id || filters.turno;

  const clearFilters = () => {
    onFiltersChange({});
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Especialidade Filter */}
      <Select
        value={filters.especialidade_id || 'all'}
        onValueChange={(value) => 
          onFiltersChange({ ...filters, especialidade_id: value === 'all' ? undefined : value })
        }
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Especialidade" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas Especialidades</SelectItem>
          {especialidades?.map((esp) => (
            <SelectItem key={esp.id} value={esp.id}>
              <div className="flex items-center gap-2">
                {esp.cor_hex && (
                  <span 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: esp.cor_hex }}
                  />
                )}
                {esp.nome}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Profissional Filter */}
      <Select
        value={filters.profissional_id || 'all'}
        onValueChange={(value) => 
          onFiltersChange({ ...filters, profissional_id: value === 'all' ? undefined : value })
        }
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Profissional" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos Profissionais</SelectItem>
          {profissionais?.map((prof) => (
            <SelectItem key={prof.id} value={prof.id}>
              {prof.nome}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Turno Filter */}
      <Select
        value={filters.turno || 'all'}
        onValueChange={(value) => 
          onFiltersChange({ ...filters, turno: value === 'all' ? undefined : value })
        }
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Turno" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos Turnos</SelectItem>
          {TURNOS.map((turno) => (
            <SelectItem key={turno.value} value={turno.value}>
              {turno.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Clear Filters */}
      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          <X className="h-4 w-4 mr-1" />
          Limpar filtros
        </Button>
      )}
    </div>
  );
}
