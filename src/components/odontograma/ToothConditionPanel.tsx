import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { X, Trash2 } from 'lucide-react';
import { 
  ToothCondition, 
  conditionColors, 
  conditionLabels 
} from './teeth/toothUtils';
import { useResponsive } from '@/hooks/useResponsive';

interface ToothConditionPanelProps {
  toothNumber: number | null;
  conditions: ToothCondition[];
  onAddCondition: (surface: ToothCondition['surface'], condition: ToothCondition['condition']) => void;
  onRemoveCondition: (surface: ToothCondition['surface']) => void;
  onClearAll: () => void;
  onClose: () => void;
}

const surfaceOptions: Array<{ value: ToothCondition['surface']; label: string }> = [
  { value: 'all', label: 'Dente Inteiro' },
  { value: 'oclusal', label: 'Oclusal/Incisal' },
  { value: 'mesial', label: 'Mesial' },
  { value: 'distal', label: 'Distal' },
  { value: 'vestibular', label: 'Vestibular' },
  { value: 'lingual', label: 'Lingual/Palatina' },
];

const conditionOptions: Array<{ value: ToothCondition['condition']; label: string; requiresAllSurface?: boolean }> = [
  { value: 'caries', label: 'Cárie' },
  { value: 'restoration', label: 'Restauração' },
  { value: 'sealant', label: 'Selante' },
  { value: 'crown', label: 'Coroa', requiresAllSurface: true },
  { value: 'endodontic', label: 'Tratamento de Canal', requiresAllSurface: true },
  { value: 'extraction', label: 'Extração Indicada', requiresAllSurface: true },
  { value: 'absent', label: 'Ausente', requiresAllSurface: true },
  { value: 'implant', label: 'Implante', requiresAllSurface: true },
];

export const ToothConditionPanel: React.FC<ToothConditionPanelProps> = ({
  toothNumber,
  conditions,
  onAddCondition,
  onRemoveCondition,
  onClearAll,
  onClose,
}) => {
  const { isMobile } = useResponsive();
  const [selectedSurface, setSelectedSurface] = React.useState<ToothCondition['surface']>('oclusal');

  const getQuadrantName = (tooth: number) => {
    const quadrant = Math.floor(tooth / 10);
    const names: Record<number, string> = {
      1: 'Superior Direito',
      2: 'Superior Esquerdo',
      3: 'Inferior Esquerdo',
      4: 'Inferior Direito',
    };
    return names[quadrant] || '';
  };

  const getToothTypeName = (tooth: number) => {
    const unit = tooth % 10;
    if (unit === 1 || unit === 2) return 'Incisivo';
    if (unit === 3) return 'Canino';
    if (unit === 4 || unit === 5) return 'Pré-molar';
    return 'Molar';
  };

  const panelContent = (
    <div className="space-y-4">
      {/* Condições atuais */}
      {conditions.length > 0 && (
        <div>
          <Label className="text-sm font-medium mb-2 block">Condições Atuais</Label>
          <div className="space-y-2">
            {conditions.map((condition, idx) => (
              <div 
                key={idx}
                className="flex items-center justify-between p-2 rounded-lg border"
                style={{ borderColor: conditionColors[condition.condition] }}
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <div 
                    className="w-3 h-3 rounded flex-shrink-0"
                    style={{ backgroundColor: conditionColors[condition.condition] }}
                  />
                  <span className="text-sm">{conditionLabels[condition.condition]}</span>
                  <Badge variant="outline" className="text-xs">
                    {surfaceOptions.find(s => s.value === condition.surface)?.label}
                  </Badge>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 flex-shrink-0"
                  onClick={() => onRemoveCondition(condition.surface)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full mt-2"
            onClick={onClearAll}
          >
            <Trash2 className="h-3 w-3 mr-2" />
            Limpar Todas
          </Button>
        </div>
      )}

      {/* Adicionar condição */}
      <div>
        <Label className="text-sm font-medium mb-2 block">Adicionar Condição</Label>
        
        {/* Seleção de superfície */}
        <div className="mb-3">
          <label className="text-xs text-muted-foreground mb-1 block">Superfície</label>
          <div className="flex flex-wrap gap-1">
            {surfaceOptions.map(surface => (
              <Button
                key={surface.value}
                variant={selectedSurface === surface.value ? 'default' : 'outline'}
                size="sm"
                className="text-xs h-7"
                onClick={() => setSelectedSurface(surface.value)}
              >
                {surface.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Botões de condição */}
        <div className="grid grid-cols-2 gap-2">
          {conditionOptions.map(option => {
            const isDisabled = option.requiresAllSurface && selectedSurface !== 'all';
            return (
              <Button
                key={option.value}
                variant="outline"
                size="sm"
                className="justify-start text-xs h-9"
                disabled={isDisabled}
                onClick={() => {
                  const surface = option.requiresAllSurface ? 'all' : selectedSurface;
                  onAddCondition(surface, option.value);
                }}
                title={isDisabled ? 'Esta condição requer selecionar "Dente Inteiro"' : undefined}
              >
                <div 
                  className="w-3 h-3 rounded mr-2 flex-shrink-0"
                  style={{ backgroundColor: conditionColors[option.value] }}
                />
                <span className="truncate">{option.label}</span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Dica */}
      <div className="pt-3 border-t">
        <p className="text-xs text-muted-foreground">
          💡 Condições como Coroa, Canal, Extração, Ausente e Implante são aplicadas ao dente inteiro automaticamente.
        </p>
      </div>
    </div>
  );

  // Empty state when no tooth is selected
  if (!toothNumber) {
    if (isMobile) return null;
    
    return (
      <Card className="h-fit">
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground py-8">
            <p className="text-sm">Clique em um dente para visualizar e editar suas condições</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Mobile: Use Sheet/Drawer
  if (isMobile) {
    return (
      <Sheet open={!!toothNumber} onOpenChange={(open) => !open && onClose()}>
        <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto">
          <SheetHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <SheetTitle>Dente {toothNumber}</SheetTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  {getToothTypeName(toothNumber)} • {getQuadrantName(toothNumber)}
                </p>
              </div>
            </div>
          </SheetHeader>
          {panelContent}
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop: Use Card
  return (
    <Card className="h-fit sticky top-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Dente {toothNumber}</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              {getToothTypeName(toothNumber)} • {getQuadrantName(toothNumber)}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {panelContent}
      </CardContent>
    </Card>
  );
};