import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { NursingQueue } from '@/components/nursing/NursingQueue';
import { NursingStats } from '@/components/nursing/NursingStats';
import { QueueFilters } from '@/components/nursing/QueueFilters';
import { AddToQueueDialog } from '@/components/nursing/AddToQueueDialog';
import { useNursingQueue } from '@/hooks/useNursingQueue';
import { NursingQueueItem, NursingSector, QueuePriority } from '@/types/nursing';
import { Plus, RefreshCw, Syringe } from 'lucide-react';

export default function Enfermagem() {
  const [selectedSector, setSelectedSector] = useState<NursingSector | 'all'>('all');
  const [selectedPriority, setSelectedPriority] = useState<QueuePriority | 'all'>('all');
  const [selectedItem, setSelectedItem] = useState<NursingQueueItem | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const {
    queueItems,
    isLoading,
    refetch,
    addToQueue,
    startAttendance,
    completeAttendance,
    cancelQueueItem,
    stats,
  } = useNursingQueue({
    sector: selectedSector !== 'all' ? selectedSector : undefined,
    priority: selectedPriority !== 'all' ? selectedPriority : undefined,
  });

  const handleAddToQueue = (data: {
    patient_id: string;
    sector: NursingSector;
    priority: QueuePriority;
    referred_from?: string;
    notes?: string;
  }) => {
    addToQueue.mutate(data, {
      onSuccess: () => setAddDialogOpen(false),
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Syringe className="h-6 w-6 text-primary" />
            Enfermagem
          </h1>
          <p className="text-muted-foreground">
            Gestão de filas e atendimentos de enfermagem
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline">Atualizar</span>
          </Button>
          <Button onClick={() => setAddDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Adicionar à Fila
          </Button>
        </div>
      </div>

      {/* Stats */}
      <NursingStats stats={stats} />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Queue List */}
        <div className="lg:col-span-2">
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Fila de Pacientes</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <QueueFilters
                selectedSector={selectedSector}
                selectedPriority={selectedPriority}
                onSectorChange={setSelectedSector}
                onPriorityChange={setSelectedPriority}
                stats={stats.bySector}
              />

              <Separator className="my-4" />

              {/* Queue */}
              <NursingQueue
                items={queueItems}
                isLoading={isLoading}
                selectedItem={selectedItem}
                onSelectItem={setSelectedItem}
                onStartAttendance={(id) => startAttendance.mutate(id)}
                onCompleteAttendance={(id) => completeAttendance.mutate(id)}
                onCancel={(id) => cancelQueueItem.mutate(id)}
              />
            </CardContent>
          </Card>
        </div>

        {/* Patient Details Sidebar */}
        <div className="lg:col-span-1">
          <Card className="border-border/60 sticky top-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Detalhes do Paciente</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedItem ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Nome</p>
                    <p className="font-medium">{selectedItem.patient?.name}</p>
                  </div>
                  {selectedItem.patient?.medical_record_number && (
                    <div>
                      <p className="text-sm text-muted-foreground">Prontuário</p>
                      <p className="font-medium">{selectedItem.patient.medical_record_number}</p>
                    </div>
                  )}
                  {selectedItem.patient?.cpf && (
                    <div>
                      <p className="text-sm text-muted-foreground">CPF</p>
                      <p className="font-medium">{selectedItem.patient.cpf}</p>
                    </div>
                  )}
                  {selectedItem.referred_from && (
                    <div>
                      <p className="text-sm text-muted-foreground">Encaminhado de</p>
                      <p className="font-medium">{selectedItem.referred_from}</p>
                    </div>
                  )}
                  {selectedItem.notes && (
                    <div>
                      <p className="text-sm text-muted-foreground">Observações</p>
                      <p className="text-sm bg-muted p-2 rounded">{selectedItem.notes}</p>
                    </div>
                  )}

                  <Separator />

                  {/* Actions */}
                  <div className="space-y-2">
                    {selectedItem.status === 'waiting' && (
                      <Button
                        className="w-full"
                        onClick={() => startAttendance.mutate(selectedItem.id)}
                      >
                        Iniciar Atendimento
                      </Button>
                    )}
                    {selectedItem.status === 'in_progress' && (
                      <Button
                        className="w-full bg-success hover:bg-success/90"
                        onClick={() => completeAttendance.mutate(selectedItem.id)}
                      >
                        Concluir Atendimento
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Selecione um paciente para ver os detalhes</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add to Queue Dialog */}
      <AddToQueueDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onAdd={handleAddToQueue}
        isLoading={addToQueue.isPending}
      />
    </div>
  );
}
