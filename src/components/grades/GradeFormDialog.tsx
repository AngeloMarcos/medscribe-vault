import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  GradeHorario,
  GradeFormData,
  useProfissionais,
  useEspecialidades,
  useSalas,
  useEquipes,
  useZonas,
  DIAS_SEMANA,
  TURNOS,
} from '@/hooks/useGradesHorarios';
import { Loader2 } from 'lucide-react';

interface GradeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  grade?: GradeHorario | null;
  onSubmit: (data: GradeFormData) => void;
  isLoading?: boolean;
}

export function GradeFormDialog({
  open,
  onOpenChange,
  grade,
  onSubmit,
  isLoading,
}: GradeFormDialogProps) {
  const { data: profissionais, isLoading: loadingProf } = useProfissionais();
  const { data: especialidades, isLoading: loadingEsp } = useEspecialidades();
  const { data: salas, isLoading: loadingSalas } = useSalas();
  const { data: equipes, isLoading: loadingEquipes } = useEquipes();
  const { data: zonas, isLoading: loadingZonas } = useZonas();

  const [formData, setFormData] = useState<GradeFormData>({
    profissional_id: '',
    especialidade_id: '',
    equipe_id: null,
    sala_id: null,
    zona_id: null,
    dias_semana: [],
    hora_inicio: '08:00',
    hora_fim: '12:00',
    duracao_consulta: 30,
    vagas_totais: 10,
    data_inicio: new Date().toISOString().split('T')[0],
    data_fim: null,
    turno: 'manha',
    ativo: true,
  });

  const isEditing = !!grade;

  useEffect(() => {
    if (grade) {
      setFormData({
        profissional_id: grade.profissional_id,
        especialidade_id: grade.especialidade_id,
        equipe_id: grade.equipe_id,
        sala_id: grade.sala_id,
        zona_id: grade.zona_id,
        dias_semana: grade.dia_semana !== null ? [grade.dia_semana] : [],
        hora_inicio: grade.hora_inicio?.slice(0, 5) || '08:00',
        hora_fim: grade.hora_fim?.slice(0, 5) || '12:00',
        duracao_consulta: grade.duracao_consulta || 30,
        vagas_totais: grade.vagas_totais || 10,
        data_inicio: grade.data_inicio,
        data_fim: grade.data_fim,
        turno: grade.turno,
        ativo: grade.ativo ?? true,
      });
    } else {
      setFormData({
        profissional_id: '',
        especialidade_id: '',
        equipe_id: null,
        sala_id: null,
        zona_id: null,
        dias_semana: [],
        hora_inicio: '08:00',
        hora_fim: '12:00',
        duracao_consulta: 30,
        vagas_totais: 10,
        data_inicio: new Date().toISOString().split('T')[0],
        data_fim: null,
        turno: 'manha',
        ativo: true,
      });
    }
  }, [grade, open]);

  const handleDiaToggle = (dia: number) => {
    setFormData((prev) => ({
      ...prev,
      dias_semana: prev.dias_semana.includes(dia)
        ? prev.dias_semana.filter((d) => d !== dia)
        : [...prev.dias_semana, dia].sort(),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.profissional_id || !formData.especialidade_id || formData.dias_semana.length === 0) {
      return;
    }
    onSubmit(formData);
  };

  const isLoadingData = loadingProf || loadingEsp || loadingSalas || loadingEquipes || loadingZonas;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Grade de Atendimento' : 'Nova Grade de Atendimento'}
          </DialogTitle>
        </DialogHeader>

        {isLoadingData ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profissional e Especialidade */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="profissional">Profissional *</Label>
                <Select
                  value={formData.profissional_id}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, profissional_id: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o profissional" />
                  </SelectTrigger>
                  <SelectContent>
                    {!profissionais?.length ? (
                      <div className="px-2 py-1.5 text-sm text-muted-foreground">
                        Nenhum profissional cadastrado
                      </div>
                    ) : (
                      profissionais.map((prof) => (
                        <SelectItem key={prof.id} value={prof.id}>
                          {prof.nome} ({prof.tipo_registro} {prof.registro_profissional})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="especialidade">Especialidade *</Label>
                <Select
                  value={formData.especialidade_id}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, especialidade_id: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a especialidade" />
                  </SelectTrigger>
                  <SelectContent>
                    {!especialidades?.length ? (
                      <div className="px-2 py-1.5 text-sm text-muted-foreground">
                        Nenhuma especialidade cadastrada
                      </div>
                    ) : (
                      especialidades.map((esp) => (
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
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Dias da Semana */}
            <div className="space-y-2">
              <Label>Dias da Semana *</Label>
              <div className="flex flex-wrap gap-2">
                {DIAS_SEMANA.map((dia) => (
                  <label
                    key={dia.value}
                    className={`
                      flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors
                      ${
                        formData.dias_semana.includes(dia.value)
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-background border-border hover:bg-accent'
                      }
                    `}
                  >
                    <Checkbox
                      checked={formData.dias_semana.includes(dia.value)}
                      onCheckedChange={() => handleDiaToggle(dia.value)}
                      className="sr-only"
                    />
                    <span className="text-sm font-medium">{dia.short}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Horários e Turno */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hora_inicio">Hora Início *</Label>
                <Input
                  id="hora_inicio"
                  type="time"
                  value={formData.hora_inicio}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, hora_inicio: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hora_fim">Hora Fim *</Label>
                <Input
                  id="hora_fim"
                  type="time"
                  value={formData.hora_fim}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, hora_fim: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="turno">Turno</Label>
                <Select
                  value={formData.turno || 'none'}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, turno: value === 'none' ? null : value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum</SelectItem>
                    {TURNOS.map((turno) => (
                      <SelectItem key={turno.value} value={turno.value}>
                        {turno.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duracao">Duração (min)</Label>
                <Select
                  value={String(formData.duracao_consulta)}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, duracao_consulta: Number(value) }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 min</SelectItem>
                    <SelectItem value="20">20 min</SelectItem>
                    <SelectItem value="30">30 min</SelectItem>
                    <SelectItem value="45">45 min</SelectItem>
                    <SelectItem value="60">60 min</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Vagas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vagas">Vagas Totais</Label>
                <Input
                  id="vagas"
                  type="number"
                  min="1"
                  max="100"
                  value={formData.vagas_totais}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, vagas_totais: Number(e.target.value) }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="equipe">Equipe</Label>
                <Select
                  value={formData.equipe_id || 'none'}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, equipe_id: value === 'none' ? null : value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhuma</SelectItem>
                    {equipes?.map((equipe) => (
                      <SelectItem key={equipe.id} value={equipe.id}>
                        {equipe.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Zona e Sala */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="zona">Zona</Label>
                <Select
                  value={formData.zona_id || 'none'}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, zona_id: value === 'none' ? null : value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhuma</SelectItem>
                    {zonas?.map((zona) => (
                      <SelectItem key={zona.id} value={zona.id}>
                        {zona.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sala">Sala</Label>
                <Select
                  value={formData.sala_id || 'none'}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, sala_id: value === 'none' ? null : value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhuma</SelectItem>
                    {salas?.map((sala) => (
                      <SelectItem key={sala.id} value={sala.id}>
                        {sala.nome ? `${sala.nome} (${sala.numero})` : `Sala ${sala.numero}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Validade */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="data_inicio">Data Início *</Label>
                <Input
                  id="data_inicio"
                  type="date"
                  value={formData.data_inicio}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, data_inicio: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="data_fim">Data Fim (opcional)</Label>
                <Input
                  id="data_fim"
                  type="date"
                  value={formData.data_fim || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, data_fim: e.target.value || null }))
                  }
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={
                  isLoading ||
                  !formData.profissional_id ||
                  !formData.especialidade_id ||
                  formData.dias_semana.length === 0
                }
              >
                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {isEditing ? 'Salvar Alterações' : 'Criar Grade'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
