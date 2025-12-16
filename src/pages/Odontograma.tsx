import { useState, useMemo } from 'react';
import { Smile, Save, Printer, RotateCcw, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { ToothIcon, ToothCondition } from '@/components/odontograma/ToothIcon';
import { ToothConditionPanel } from '@/components/odontograma/ToothConditionPanel';
import { useResponsive } from '@/hooks/useResponsive';
import { cn } from '@/lib/utils';

// FDI notation - upper right (18-11), upper left (21-28), lower left (38-31), lower right (41-48)
const upperRightTeeth = [18, 17, 16, 15, 14, 13, 12, 11];
const upperLeftTeeth = [21, 22, 23, 24, 25, 26, 27, 28];
const lowerLeftTeeth = [38, 37, 36, 35, 34, 33, 32, 31];
const lowerRightTeeth = [41, 42, 43, 44, 45, 46, 47, 48];

// Mock patients for demo
const mockPatients = [
  { id: 'p1', name: 'Maria Silva Santos', prontuario: '2025000101' },
  { id: 'p2', name: 'João Carlos Oliveira', prontuario: '2025000102' },
  { id: 'p3', name: 'Ana Paula Ferreira', prontuario: '2025000103' },
];

// Initial demo conditions
const initialConditions: Record<number, ToothCondition[]> = {
  16: [{ surface: 'O', condition: 'restoration' }],
  26: [{ surface: 'M', condition: 'caries' }],
  36: [{ surface: 'full', condition: 'crown' }],
  46: [{ surface: 'O', condition: 'restoration' }, { surface: 'D', condition: 'caries' }],
  18: [{ surface: 'full', condition: 'absent' }],
  28: [{ surface: 'full', condition: 'absent' }],
  24: [{ surface: 'full', condition: 'endodontic' }],
};

export default function Odontograma() {
  const { isMobile } = useResponsive();
  const [selectedPatient, setSelectedPatient] = useState<string>('p1');
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
  const [teethConditions, setTeethConditions] = useState<Record<number, ToothCondition[]>>(initialConditions);

  const patient = mockPatients.find((p) => p.id === selectedPatient);

  const handleToothClick = (toothNumber: number) => {
    setSelectedTooth(selectedTooth === toothNumber ? null : toothNumber);
  };

  const handleAddCondition = (condition: ToothCondition) => {
    if (selectedTooth === null) return;

    setTeethConditions((prev) => {
      const current = prev[selectedTooth] || [];
      
      // If it's a full tooth condition like 'absent', replace all
      if (condition.surface === 'full' || condition.condition === 'absent') {
        return { ...prev, [selectedTooth]: [condition] };
      }

      // Otherwise, update or add the surface condition
      const filtered = current.filter((c) => c.surface !== condition.surface && c.surface !== 'full');
      return { ...prev, [selectedTooth]: [...filtered, condition] };
    });

    toast.success(`Condição adicionada ao dente ${selectedTooth}`);
  };

  const handleRemoveCondition = (surface: ToothCondition['surface']) => {
    if (selectedTooth === null) return;

    setTeethConditions((prev) => {
      const current = prev[selectedTooth] || [];
      const filtered = current.filter((c) => c.surface !== surface);
      return { ...prev, [selectedTooth]: filtered };
    });
  };

  const handleClearAll = () => {
    if (selectedTooth === null) return;
    setTeethConditions((prev) => {
      const newState = { ...prev };
      delete newState[selectedTooth];
      return newState;
    });
    toast.info(`Condições do dente ${selectedTooth} removidas`);
  };

  const handleReset = () => {
    setTeethConditions(initialConditions);
    setSelectedTooth(null);
    toast.info('Odontograma resetado');
  };

  const handleSave = () => {
    toast.success('Odontograma salvo com sucesso!');
  };

  const handlePrint = () => {
    window.print();
  };

  const renderTeethRow = (teeth: number[], label: string) => (
    <div className="flex flex-col items-center">
      <span className="text-xs text-muted-foreground mb-1">{label}</span>
      <div className="flex gap-1">
        {teeth.map((tooth) => (
          <ToothIcon
            key={tooth}
            toothNumber={tooth}
            conditions={teethConditions[tooth] || []}
            isSelected={selectedTooth === tooth}
            onClick={() => handleToothClick(tooth)}
          />
        ))}
      </div>
    </div>
  );

  const conditionsSummary = useMemo(() => {
    const summary = {
      caries: 0,
      restoration: 0,
      extraction: 0,
      endodontic: 0,
      crown: 0,
      implant: 0,
      absent: 0,
    };

    Object.values(teethConditions).forEach((conditions) => {
      conditions.forEach((c) => {
        if (c.condition in summary) {
          summary[c.condition as keyof typeof summary]++;
        }
      });
    });

    return summary;
  }, [teethConditions]);

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
              {mockPatients.map((p) => (
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

      {/* Patient info */}
      {patient && (
        <Card>
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
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main content */}
      <div className={cn('grid gap-6', isMobile ? 'grid-cols-1' : 'grid-cols-[1fr_300px]')}>
        {/* Odontogram */}
        <Card className="print:shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Arcada Dentária
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center space-y-6 py-4 overflow-x-auto">
              {/* Upper arch */}
              <div className="flex flex-col items-center space-y-2">
                <span className="text-sm font-medium text-muted-foreground">Arcada Superior</span>
                <div className="flex gap-4">
                  {renderTeethRow(upperRightTeeth, 'Direito')}
                  <div className="w-px bg-border" />
                  {renderTeethRow(upperLeftTeeth, 'Esquerdo')}
                </div>
              </div>

              {/* Divider */}
              <div className="w-full max-w-2xl border-t-2 border-dashed border-muted-foreground/30" />

              {/* Lower arch */}
              <div className="flex flex-col items-center space-y-2">
                <div className="flex gap-4">
                  {renderTeethRow(lowerRightTeeth, 'Direito')}
                  <div className="w-px bg-border" />
                  {renderTeethRow(lowerLeftTeeth, 'Esquerdo')}
                </div>
                <span className="text-sm font-medium text-muted-foreground">Arcada Inferior</span>
              </div>
            </div>

            {/* Summary stats */}
            <div className="mt-6 pt-4 border-t">
              <h4 className="text-sm font-medium mb-3">Resumo das Condições</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span>Cáries: {conditionsSummary.caries}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span>Restaurações: {conditionsSummary.restoration}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full bg-purple-500" />
                  <span>Canais: {conditionsSummary.endodontic}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <span>Coroas: {conditionsSummary.crown}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full bg-gray-800" />
                  <span>Ausentes: {conditionsSummary.absent}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span>Implantes: {conditionsSummary.implant}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full bg-gray-500" />
                  <span>Extrações: {conditionsSummary.extraction}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Condition panel */}
        <div className={cn(isMobile && 'order-first')}>
          <ToothConditionPanel
            toothNumber={selectedTooth}
            conditions={selectedTooth ? teethConditions[selectedTooth] || [] : []}
            onAddCondition={handleAddCondition}
            onRemoveCondition={handleRemoveCondition}
            onClearAll={handleClearAll}
            onClose={() => setSelectedTooth(null)}
          />
        </div>
      </div>
    </div>
  );
}
