import React, { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Printer, RotateCcw, Smile, FileText, History } from 'lucide-react';
import { DentalArch } from '@/components/odontograma/DentalArch';
import { ToothConditionPanel } from '@/components/odontograma/ToothConditionPanel';
import { OdontogramaHistory } from '@/components/odontograma/OdontogramaHistory';
import { ToothCondition, conditionColors, conditionLabels } from '@/components/odontograma/teeth/toothUtils';
import { useResponsive } from '@/hooks/useResponsive';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useTenant } from '@/hooks/useTenant';
import { 
  useOdontogramaByPatient, 
  useOdontogramaHistorico,
  useSaveCondition,
  useRemoveCondition,
  useClearToothConditions,
} from '@/hooks/useOdontograma';

const Odontograma: React.FC = () => {
  const { isMobile } = useResponsive();
  const { tenant } = useTenant();
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
  const [localConditions, setLocalConditions] = useState<Record<number, ToothCondition[]>>({});

  // Fetch patients
  const { data: patients = [], isLoading: patientsLoading } = useQuery({
    queryKey: ['patients-odonto', tenant?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('patients')
        .select('id, name, cpf, birth_date, medical_record_number')
        .eq('tenant_id', tenant?.id)
        .order('name');
      if (error) throw error;
      return data || [];
    },
    enabled: !!tenant?.id,
  });

  // Fetch odontograma for selected patient
  const { data: odontograma, isLoading: odontogramaLoading } = useOdontogramaByPatient(selectedPatientId);
  
  // Fetch historico
  const { data: historico = [], isLoading: historicoLoading } = useOdontogramaHistorico(selectedPatientId);

  // Mutations
  const saveCondition = useSaveCondition();
  const removeCondition = useRemoveCondition();
  const clearConditions = useClearToothConditions();

  // Sync local conditions with database
  useEffect(() => {
    if (odontograma?.dados) {
      setLocalConditions(odontograma.dados);
    } else {
      setLocalConditions({});
    }
  }, [odontograma]);

  const patient = patients.find(p => p.id === selectedPatientId);

  const handleToothClick = (toothNumber: number) => {
    setSelectedTooth(selectedTooth === toothNumber ? null : toothNumber);
  };

  const handleAddCondition = async (surface: ToothCondition['surface'], condition: ToothCondition['condition']) => {
    if (!selectedTooth || !selectedPatientId) return;

    // Optimistic update
    const currentConditions = localConditions[selectedTooth] || [];
    const filtered = surface === 'all' 
      ? [] 
      : currentConditions.filter(c => c.surface !== surface && c.surface !== 'all');
    
    setLocalConditions(prev => ({
      ...prev,
      [selectedTooth]: [...filtered, { surface, condition }],
    }));

    // Save to database
    saveCondition.mutate({
      patientId: selectedPatientId,
      dente: selectedTooth,
      surface,
      condition,
      currentConditions: localConditions,
      odontogramaId: odontograma?.id,
    }, {
      onSuccess: () => {
        toast.success(`Condição adicionada ao dente ${selectedTooth}`);
      },
    });
  };

  const handleRemoveCondition = async (surface: ToothCondition['surface']) => {
    if (!selectedTooth || !selectedPatientId || !odontograma?.id) return;

    const conditionToRemove = localConditions[selectedTooth]?.find(c => c.surface === surface);
    if (!conditionToRemove) return;

    // Optimistic update
    setLocalConditions(prev => {
      const currentConditions = prev[selectedTooth] || [];
      return {
        ...prev,
        [selectedTooth]: currentConditions.filter(c => c.surface !== surface),
      };
    });

    // Save to database
    removeCondition.mutate({
      patientId: selectedPatientId,
      dente: selectedTooth,
      surface,
      condition: conditionToRemove.condition,
      currentConditions: localConditions,
      odontogramaId: odontograma.id,
    });
  };

  const handleClearAll = async () => {
    if (!selectedTooth || !selectedPatientId || !odontograma?.id) return;

    // Optimistic update
    setLocalConditions(prev => {
      const newConditions = { ...prev };
      delete newConditions[selectedTooth];
      return newConditions;
    });

    // Save to database
    clearConditions.mutate({
      patientId: selectedPatientId,
      dente: selectedTooth,
      currentConditions: localConditions,
      odontogramaId: odontograma.id,
    }, {
      onSuccess: () => {
        toast.info(`Condições do dente ${selectedTooth} removidas`);
      },
    });
  };

  const handleReset = () => {
    setSelectedTooth(null);
  };

  const handlePrint = () => {
    window.print();
  };

  // Resumo das condições
  const conditionsSummary = useMemo(() => {
    const summary: Record<string, number> = {};
    Object.values(localConditions).forEach(conditions => {
      conditions.forEach(c => {
        summary[c.condition] = (summary[c.condition] || 0) + 1;
      });
    });
    return summary;
  }, [localConditions]);

  return (
    <div className="p-4 md:p-6 space-y-6 print:p-0">
      {/* Header com seleção de paciente e ações */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-100 dark:bg-cyan-900">
            <Smile className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-foreground">Odontograma</h1>
            <p className="text-sm text-muted-foreground">Registro de condições dentárias</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Selecione o paciente" />
            </SelectTrigger>
            <SelectContent>
              {patientsLoading ? (
                <SelectItem value="" disabled>Carregando...</SelectItem>
              ) : patients.length === 0 ? (
                <SelectItem value="" disabled>Nenhum paciente</SelectItem>
              ) : (
                patients.map(p => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-1" />
            Limpar Seleção
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-1" />
            Imprimir
          </Button>
        </div>
      </div>

      {/* Info do paciente */}
      {patient && (
        <Card className="print:shadow-none print:border-0">
          <CardContent className="py-3">
            <div className="flex flex-wrap gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Paciente:</span>{' '}
                <span className="font-medium">{patient.name}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Prontuário:</span>{' '}
                <span className="font-medium">{patient.medical_record_number || '-'}</span>
              </div>
              <div>
                <span className="text-muted-foreground">CPF:</span>{' '}
                <span className="font-medium">{patient.cpf}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!selectedPatientId ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Smile className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-muted-foreground">Selecione um paciente para visualizar o odontograma</p>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="odontograma" className="space-y-4">
          <TabsList className="print:hidden">
            <TabsTrigger value="odontograma" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Arcada Dentária
            </TabsTrigger>
            <TabsTrigger value="historico" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Histórico
              {historico.length > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {historico.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="odontograma" className="mt-0">
            <div className={cn('grid gap-4 md:gap-6', isMobile ? 'grid-cols-1' : 'grid-cols-[1fr_320px]')}>
              {/* Odontograma */}
              <Card className="print:shadow-none print:border-0">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Arcada Dentária
                    {odontogramaLoading && (
                      <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-2 sm:px-6">
                  <div className="overflow-x-auto pb-4 -mx-2 px-2">
                    <div className="flex justify-center py-2 md:py-4">
                      <DentalArch
                        teethConditions={localConditions}
                        selectedTooth={selectedTooth}
                        onToothClick={handleToothClick}
                      />
                    </div>
                  </div>

                  {/* Legenda */}
                  <div className="mt-4 md:mt-6 pt-4 border-t">
                    <h3 className="text-sm font-medium mb-3">Legenda</h3>
                    <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-3">
                      {Object.entries(conditionLabels).map(([key, label]) => (
                        <div key={key} className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 sm:w-4 sm:h-4 rounded border flex-shrink-0"
                            style={{ backgroundColor: conditionColors[key as keyof typeof conditionColors] }}
                          />
                          <span className="text-xs text-muted-foreground truncate">{label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Resumo das condições */}
                  {Object.keys(conditionsSummary).length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <h3 className="text-sm font-medium mb-3">Resumo</h3>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(conditionsSummary).map(([condition, count]) => (
                          <Badge 
                            key={condition} 
                            variant="secondary"
                            className="text-xs"
                            style={{ 
                              backgroundColor: `${conditionColors[condition as keyof typeof conditionColors]}20`,
                              borderColor: conditionColors[condition as keyof typeof conditionColors],
                            }}
                          >
                            {conditionLabels[condition as keyof typeof conditionLabels]}: {count}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Painel de condições - Desktop */}
              {!isMobile && (
                <div className="print:hidden">
                  <ToothConditionPanel
                    toothNumber={selectedTooth}
                    conditions={selectedTooth ? localConditions[selectedTooth] || [] : []}
                    onAddCondition={handleAddCondition}
                    onRemoveCondition={handleRemoveCondition}
                    onClearAll={handleClearAll}
                    onClose={() => setSelectedTooth(null)}
                    patientId={selectedPatientId}
                  />
                </div>
              )}
            </div>

            {/* Mobile Panel - Sheet */}
            {isMobile && (
              <ToothConditionPanel
                toothNumber={selectedTooth}
                conditions={selectedTooth ? localConditions[selectedTooth] || [] : []}
                onAddCondition={handleAddCondition}
                onRemoveCondition={handleRemoveCondition}
                onClearAll={handleClearAll}
                onClose={() => setSelectedTooth(null)}
                patientId={selectedPatientId}
              />
            )}
          </TabsContent>

          <TabsContent value="historico" className="mt-0">
            <OdontogramaHistory 
              historico={historico} 
              isLoading={historicoLoading} 
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default Odontograma;
