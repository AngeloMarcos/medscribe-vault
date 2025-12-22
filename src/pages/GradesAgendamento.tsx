import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Calendar, AlertCircle } from 'lucide-react';
import {
  useGradesHorarios,
  useCreateGrade,
  useUpdateGrade,
  useDeleteGrade,
  useToggleGradeStatus,
  GradeHorario,
  GradeFormData,
} from '@/hooks/useGradesHorarios';
import { GradeCard } from '@/components/grades/GradeCard';
import { GradeFilters } from '@/components/grades/GradeFilters';
import { GradeFormDialog } from '@/components/grades/GradeFormDialog';

export default function GradesAgendamento() {
  const [filters, setFilters] = useState<{
    especialidade_id?: string;
    profissional_id?: string;
    turno?: string;
  }>({});

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState<GradeHorario | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [gradeToDelete, setGradeToDelete] = useState<GradeHorario | null>(null);

  const { data: grades, isLoading, error } = useGradesHorarios(filters);
  const createGrade = useCreateGrade();
  const updateGrade = useUpdateGrade();
  const deleteGrade = useDeleteGrade();
  const toggleStatus = useToggleGradeStatus();

  const handleNewGrade = () => {
    setSelectedGrade(null);
    setDialogOpen(true);
  };

  const handleEditGrade = (grade: GradeHorario) => {
    setSelectedGrade(grade);
    setDialogOpen(true);
  };

  const handleDeleteGrade = (grade: GradeHorario) => {
    setGradeToDelete(grade);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (gradeToDelete) {
      await deleteGrade.mutateAsync(gradeToDelete.id);
      setDeleteDialogOpen(false);
      setGradeToDelete(null);
    }
  };

  const handleToggleStatus = async (grade: GradeHorario, ativo: boolean) => {
    await toggleStatus.mutateAsync({ id: grade.id, ativo });
  };

  const handleSubmit = async (data: GradeFormData) => {
    if (selectedGrade) {
      await updateGrade.mutateAsync({ id: selectedGrade.id, data });
    } else {
      await createGrade.mutateAsync(data);
    }
    setDialogOpen(false);
    setSelectedGrade(null);
  };

  // Group grades by professional
  const groupedGrades = grades?.reduce((acc, grade) => {
    const profId = grade.profissional_id;
    if (!acc[profId]) {
      acc[profId] = {
        profissional: grade.profissional,
        grades: [],
      };
    }
    acc[profId].grades.push(grade);
    return acc;
  }, {} as Record<string, { profissional: GradeHorario['profissional']; grades: GradeHorario[] }>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Calendar className="h-6 w-6" />
            Grades de Agendamento
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie as grades de horários dos profissionais
          </p>
        </div>
        <Button onClick={handleNewGrade}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Grade
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <GradeFilters filters={filters} onFiltersChange={setFilters} />
        </CardContent>
      </Card>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-destructive">
              <AlertCircle className="h-12 w-12 mx-auto mb-4" />
              <p>Erro ao carregar grades: {error.message}</p>
            </div>
          </CardContent>
        </Card>
      ) : !grades?.length ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Nenhuma grade cadastrada</h3>
              <p className="mb-4">
                Crie sua primeira grade de agendamento para começar a organizar os horários.
              </p>
              <Button onClick={handleNewGrade}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeira Grade
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedGrades || {}).map(([profId, group]) => (
            <div key={profId}>
              <h2 className="text-lg font-semibold mb-3 text-foreground">
                {group.profissional?.nome || 'Profissional não identificado'}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {group.grades.map((grade) => (
                  <GradeCard
                    key={grade.id}
                    grade={grade}
                    onEdit={handleEditGrade}
                    onDelete={handleDeleteGrade}
                    onToggleStatus={handleToggleStatus}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      {grades && grades.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Resumo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Total de grades:</span>{' '}
                <span className="font-medium">{grades.length}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Ativas:</span>{' '}
                <span className="font-medium text-green-600">
                  {grades.filter((g) => g.ativo).length}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Inativas:</span>{' '}
                <span className="font-medium text-orange-600">
                  {grades.filter((g) => !g.ativo).length}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Total de vagas:</span>{' '}
                <span className="font-medium">
                  {grades.reduce((sum, g) => sum + (g.vagas_totais || 0), 0)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Form Dialog */}
      <GradeFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        grade={selectedGrade}
        onSubmit={handleSubmit}
        isLoading={createGrade.isPending || updateGrade.isPending}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta grade de atendimento? Esta ação não pode ser
              desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
