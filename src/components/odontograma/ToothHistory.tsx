import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Plus, Minus, Clock } from 'lucide-react';
import { OdontogramaHistorico } from '@/types/dental';
import { conditionLabels, conditionColors } from './teeth/toothUtils';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ToothHistoryProps {
  historico: OdontogramaHistorico[];
  isLoading?: boolean;
  maxItems?: number;
}

const surfaceLabels: Record<string, string> = {
  all: 'Inteiro',
  oclusal: 'Oclusal',
  mesial: 'Mesial',
  distal: 'Distal',
  vestibular: 'Vestibular',
  lingual: 'Lingual',
};

export const ToothHistory: React.FC<ToothHistoryProps> = ({
  historico,
  isLoading,
  maxItems = 5,
}) => {
  if (isLoading) {
    return (
      <div className="text-xs text-muted-foreground animate-pulse py-2">
        Carregando histórico...
      </div>
    );
  }

  if (historico.length === 0) {
    return (
      <div className="text-xs text-muted-foreground py-2 text-center">
        Sem histórico de alterações
      </div>
    );
  }

  const displayItems = historico.slice(0, maxItems);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
        <Clock className="h-3 w-3" />
        <span>Últimas alterações</span>
      </div>
      
      <div className="space-y-1.5">
        {displayItems.map((item) => {
          const isAdd = item.acao === 'add';
          const conditionLabel = conditionLabels[item.condicao as keyof typeof conditionLabels] || item.condicao;
          const conditionColor = conditionColors[item.condicao as keyof typeof conditionColors] || '#888';
          const surfaceLabel = surfaceLabels[item.superficie || 'all'] || item.superficie;

          return (
            <div 
              key={item.id} 
              className="flex items-center gap-2 p-1.5 rounded bg-muted/30 text-xs"
            >
              <div className={`p-0.5 rounded ${isAdd ? 'bg-green-500/20 text-green-600' : 'bg-red-500/20 text-red-600'}`}>
                {isAdd ? <Plus className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
              </div>
              <div 
                className="w-2 h-2 rounded flex-shrink-0"
                style={{ backgroundColor: conditionColor }}
              />
              <span className="font-medium truncate">{conditionLabel}</span>
              <Badge variant="outline" className="text-[10px] h-4 px-1">
                {surfaceLabel}
              </Badge>
              <span className="text-muted-foreground ml-auto whitespace-nowrap">
                {format(parseISO(item.created_at), "dd/MM HH:mm")}
              </span>
            </div>
          );
        })}
      </div>

      {historico.length > maxItems && (
        <div className="text-xs text-muted-foreground text-center pt-1">
          +{historico.length - maxItems} mais alterações
        </div>
      )}
    </div>
  );
};
