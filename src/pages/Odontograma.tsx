import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Printer, RotateCcw, Save, User, Smile, FileText } from 'lucide-react';
import { DentalArch } from '@/components/odontograma/DentalArch';
import { ToothConditionPanel } from '@/components/odontograma/ToothConditionPanel';
import { ToothCondition, conditionColors, conditionLabels } from '@/components/odontograma/teeth/toothUtils';
import { useResponsive } from '@/hooks/useResponsive';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// Mock data para pacientes
const mockPatients = [
  { id: '1', name: 'João Silva', cpf: '123.456.789-00', birthDate: '1985-03-15', prontuario: '2025000101' },
  { id: '2', name: 'Maria Santos', cpf: '987.654.321-00', birthDate: '1990-07-22', prontuario: '2025000102' },
  { id: '3', name: 'Pedro Oliveira', cpf: '456.789.123-00', birthDate: '1978-11-08', prontuario: '2025000103' },
];

// Estado inicial com algumas condições de exemplo
const initialConditions: Record<number, ToothCondition[]> = {
  16: [{ surface: 'oclusal', condition: 'restoration' }],
  26: [{ surface: 'mesial', condition: 'caries' }],
  36: [{ surface: 'all', condition: 'crown' }],
  18: [{ surface: 'all', condition: 'absent' }],
  28: [{ surface: 'all', condition: 'extraction' }],
  46: [{ surface: 'oclusal', condition: 'sealant' }],
  11: [{ surface: 'all', condition: 'endodontic' }],
  45: [{ surface: 'all', condition: 'implant' }],
};

const Odontograma: React.FC = () => {
  const { isMobile } = useResponsive();
  const [selectedPatient, setSelectedPatient] = useState<string>('1');
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
  const [teethConditions, setTeethConditions] = useState<Record<number, ToothCondition[]>>(initialConditions);

  const patient = mockPatients.find(p => p.id === selectedPatient);

  const handleToothClick = (toothNumber: number) => {
    setSelectedTooth(selectedTooth === toothNumber ? null : toothNumber);
  };

  const handleAddCondition = (surface: ToothCondition['surface'], condition: ToothCondition['condition']) => {
    if (!selectedTooth) return;

    setTeethConditions(prev => {
      const currentConditions = prev[selectedTooth] || [];
      
      // Remove condição existente na mesma superfície ou se for dente inteiro
      const filtered = surface === 'all' 
        ? [] 
        : currentConditions.filter(c => c.surface !== surface && c.surface !== 'all');
      
      return {
        ...prev,
        [selectedTooth]: [...filtered, { surface, condition }],
      };
    });
    
    toast.success(`Condição adicionada ao dente ${selectedTooth}`);
  };

  const handleRemoveCondition = (surface: ToothCondition['surface']) => {
    if (!selectedTooth) return;

    setTeethConditions(prev => {
      const currentConditions = prev[selectedTooth] || [];
      return {
        ...prev,
        [selectedTooth]: currentConditions.filter(c => c.surface !== surface),
      };
    });
  };

  const handleClearAll = () => {
    if (!selectedTooth) return;
    setTeethConditions(prev => {
      const newConditions = { ...prev };
      delete newConditions[selectedTooth];
      return newConditions;
    });
    toast.info(`Condições do dente ${selectedTooth} removidas`);
  };

  const handleReset = () => {
    setTeethConditions({});
    setSelectedTooth(null);
    toast.info('Odontograma resetado');
  };

  const handleSave = () => {
    console.log('Salvando odontograma:', teethConditions);
    toast.success('Odontograma salvo com sucesso!');
  };

  const handlePrint = () => {
    window.print();
  };

  // Resumo das condições
  const conditionsSummary = useMemo(() => {
    const summary: Record<string, number> = {};
    Object.values(teethConditions).forEach(conditions => {
      conditions.forEach(c => {
        summary[c.condition] = (summary[c.condition] || 0) + 1;
      });
    });
    return summary;
  }, [teethConditions]);

  return (
    <div className="p-4 md:p-6 space-y-6 print:p-0">
      {/* Header com seleção de paciente e ações */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-100">
            <Smile className="h-6 w-6 text-cyan-600" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-foreground">Odontograma</h1>
            <p className="text-sm text-muted-foreground">Registro de condições dentárias</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Select value={selectedPatient} onValueChange={setSelectedPatient}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Selecione o paciente" />
            </SelectTrigger>
            <SelectContent>
              {mockPatients.map(p => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-1" />
            Resetar
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-1" />
            Imprimir
          </Button>
          <Button size="sm" onClick={handleSave}>
            <Save className="h-4 w-4 mr-1" />
            Salvar
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
                <span className="font-medium">{patient.prontuario}</span>
              </div>
              <div>
                <span className="text-muted-foreground">CPF:</span>{' '}
                <span className="font-medium">{patient.cpf}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Área principal: Odontograma + Painel de condições */}
      <div className={cn('grid gap-4 md:gap-6', isMobile ? 'grid-cols-1' : 'grid-cols-[1fr_320px]')}>
        {/* Odontograma */}
        <Card className="print:shadow-none print:border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Arcada Dentária
            </CardTitle>
          </CardHeader>
          <CardContent className="px-2 sm:px-6">
            <div className="overflow-x-auto pb-4 -mx-2 px-2">
              <div className="flex justify-center py-2 md:py-4">
                <DentalArch
                  teethConditions={teethConditions}
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

        {/* Painel de condições - Desktop only as Card, Mobile uses Sheet inside the component */}
        {!isMobile && (
          <div className="print:hidden">
            <ToothConditionPanel
              toothNumber={selectedTooth}
              conditions={selectedTooth ? teethConditions[selectedTooth] || [] : []}
              onAddCondition={handleAddCondition}
              onRemoveCondition={handleRemoveCondition}
              onClearAll={handleClearAll}
              onClose={() => setSelectedTooth(null)}
            />
          </div>
        )}
      </div>

      {/* Mobile Panel - Sheet */}
      {isMobile && (
        <ToothConditionPanel
          toothNumber={selectedTooth}
          conditions={selectedTooth ? teethConditions[selectedTooth] || [] : []}
          onAddCondition={handleAddCondition}
          onRemoveCondition={handleRemoveCondition}
          onClearAll={handleClearAll}
          onClose={() => setSelectedTooth(null)}
        />
      )}
    </div>
  );
};

export default Odontograma;
