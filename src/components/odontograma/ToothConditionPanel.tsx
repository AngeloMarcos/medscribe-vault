import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { X } from 'lucide-react';
import { ToothCondition } from './ToothIcon';

interface ToothConditionPanelProps {
  toothNumber: number | null;
  conditions: ToothCondition[];
  onAddCondition: (condition: ToothCondition) => void;
  onRemoveCondition: (surface: ToothCondition['surface']) => void;
  onClearAll: () => void;
  onClose: () => void;
}

const conditionOptions: { value: ToothCondition['condition']; label: string; color: string }[] = [
  { value: 'healthy', label: 'Saudável', color: 'bg-gray-200' },
  { value: 'caries', label: 'Cárie', color: 'bg-red-500' },
  { value: 'restoration', label: 'Restauração', color: 'bg-blue-500' },
  { value: 'extraction', label: 'Extração Indicada', color: 'bg-gray-500' },
  { value: 'endodontic', label: 'Tratamento de Canal', color: 'bg-purple-500' },
  { value: 'crown', label: 'Coroa', color: 'bg-amber-500' },
  { value: 'implant', label: 'Implante', color: 'bg-green-500' },
  { value: 'absent', label: 'Ausente', color: 'bg-gray-800' },
];

const surfaceOptions: { value: ToothCondition['surface']; label: string }[] = [
  { value: 'O', label: 'Oclusal (O)' },
  { value: 'M', label: 'Mesial (M)' },
  { value: 'D', label: 'Distal (D)' },
  { value: 'V', label: 'Vestibular (V)' },
  { value: 'L', label: 'Lingual (L)' },
  { value: 'full', label: 'Dente Inteiro' },
];

export const ToothConditionPanel = ({
  toothNumber,
  conditions,
  onAddCondition,
  onRemoveCondition,
  onClearAll,
  onClose,
}: ToothConditionPanelProps) => {
  if (toothNumber === null) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full text-muted-foreground">
          <p>Selecione um dente para editar</p>
        </CardContent>
      </Card>
    );
  }

  const handleConditionSelect = (condition: ToothCondition['condition'], surface: ToothCondition['surface']) => {
    onAddCondition({ surface, condition });
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Dente {toothNumber}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current conditions */}
        {conditions.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Condições atuais:</Label>
            <div className="flex flex-wrap gap-2">
              {conditions.map((c, idx) => {
                const opt = conditionOptions.find((o) => o.value === c.condition);
                return (
                  <Badge
                    key={idx}
                    variant="outline"
                    className="cursor-pointer hover:bg-destructive/10"
                    onClick={() => onRemoveCondition(c.surface)}
                  >
                    {c.surface}: {opt?.label}
                    <X className="h-3 w-3 ml-1" />
                  </Badge>
                );
              })}
            </div>
            <Button variant="ghost" size="sm" onClick={onClearAll} className="text-destructive">
              Limpar todas
            </Button>
          </div>
        )}

        {/* Add condition */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Adicionar condição:</Label>
          
          <div className="grid grid-cols-2 gap-2">
            {conditionOptions.map((opt) => (
              <div key={opt.value} className="space-y-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start gap-2"
                  onClick={() => {
                    // Quick add to full tooth
                    handleConditionSelect(opt.value, 'full');
                  }}
                >
                  <div className={`w-3 h-3 rounded-full ${opt.color}`} />
                  {opt.label}
                </Button>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t">
            <Label className="text-sm font-medium mb-2 block">Por superfície:</Label>
            <div className="grid grid-cols-3 gap-1">
              {surfaceOptions.slice(0, -1).map((surf) => (
                <Button
                  key={surf.value}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => {
                    const activeCondition = conditions.length > 0 ? conditions[0].condition : 'caries';
                    handleConditionSelect(activeCondition, surf.value);
                  }}
                >
                  {surf.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="pt-3 border-t">
          <Label className="text-sm font-medium mb-2 block">Legenda:</Label>
          <div className="grid grid-cols-2 gap-1 text-xs">
            {conditionOptions.map((opt) => (
              <div key={opt.value} className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${opt.color}`} />
                <span className="text-muted-foreground">{opt.label}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
