import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { History, Plus, Minus, Filter } from 'lucide-react';
import { OdontogramaHistorico } from '@/types/dental';
import { conditionLabels, conditionColors } from './teeth/toothUtils';
import { format, isToday, isYesterday, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface OdontogramaHistoryProps {
  historico: OdontogramaHistorico[];
  isLoading?: boolean;
}

const surfaceLabels: Record<string, string> = {
  all: 'Dente Inteiro',
  oclusal: 'Oclusal',
  mesial: 'Mesial',
  distal: 'Distal',
  vestibular: 'Vestibular',
  lingual: 'Lingual',
};

export const OdontogramaHistory: React.FC<OdontogramaHistoryProps> = ({
  historico,
  isLoading,
}) => {
  const [filterDente, setFilterDente] = useState<string>('all');
  const [filterAcao, setFilterAcao] = useState<string>('all');

  // Get unique teeth from historico
  const uniqueTeeth = useMemo(() => {
    const teeth = new Set(historico.map(h => h.dente));
    return Array.from(teeth).sort((a, b) => a - b);
  }, [historico]);

  // Filter historico
  const filteredHistorico = useMemo(() => {
    return historico.filter(h => {
      if (filterDente !== 'all' && h.dente !== parseInt(filterDente)) return false;
      if (filterAcao !== 'all' && h.acao !== filterAcao) return false;
      return true;
    });
  }, [historico, filterDente, filterAcao]);

  // Group by date
  const groupedHistorico = useMemo(() => {
    const groups: Record<string, OdontogramaHistorico[]> = {};
    
    filteredHistorico.forEach(h => {
      const date = format(parseISO(h.created_at), 'yyyy-MM-dd');
      if (!groups[date]) groups[date] = [];
      groups[date].push(h);
    });

    return groups;
  }, [filteredHistorico]);

  const formatDateHeader = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (isToday(date)) return 'Hoje';
    if (isYesterday(date)) return 'Ontem';
    return format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center text-muted-foreground">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mr-2" />
            Carregando histórico...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <History className="h-4 w-4" />
            Histórico de Alterações
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            {filteredHistorico.length} registro{filteredHistorico.length !== 1 ? 's' : ''}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          <Select value={filterDente} onValueChange={setFilterDente}>
            <SelectTrigger className="w-[140px] h-8 text-xs">
              <Filter className="h-3 w-3 mr-1" />
              <SelectValue placeholder="Dente" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os dentes</SelectItem>
              {uniqueTeeth.map(tooth => (
                <SelectItem key={tooth} value={tooth.toString()}>
                  Dente {tooth}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex gap-1">
            <Button
              variant={filterAcao === 'all' ? 'default' : 'outline'}
              size="sm"
              className="h-8 text-xs"
              onClick={() => setFilterAcao('all')}
            >
              Todos
            </Button>
            <Button
              variant={filterAcao === 'add' ? 'default' : 'outline'}
              size="sm"
              className="h-8 text-xs"
              onClick={() => setFilterAcao('add')}
            >
              <Plus className="h-3 w-3 mr-1" />
              Adições
            </Button>
            <Button
              variant={filterAcao === 'remove' ? 'default' : 'outline'}
              size="sm"
              className="h-8 text-xs"
              onClick={() => setFilterAcao('remove')}
            >
              <Minus className="h-3 w-3 mr-1" />
              Remoções
            </Button>
          </div>
        </div>

        {/* Timeline */}
        <ScrollArea className="h-[400px] pr-4">
          {Object.keys(groupedHistorico).length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhuma alteração registrada</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(groupedHistorico).map(([date, items]) => (
                <div key={date}>
                  <h4 className="text-xs font-medium text-muted-foreground mb-2 sticky top-0 bg-card py-1">
                    {formatDateHeader(date)}
                  </h4>
                  <div className="space-y-2 pl-3 border-l-2 border-border">
                    {items.map((item) => (
                      <HistoryItem key={item.id} item={item} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

interface HistoryItemProps {
  item: OdontogramaHistorico;
}

const HistoryItem: React.FC<HistoryItemProps> = ({ item }) => {
  const isAdd = item.acao === 'add';
  const conditionLabel = conditionLabels[item.condicao as keyof typeof conditionLabels] || item.condicao;
  const conditionColor = conditionColors[item.condicao as keyof typeof conditionColors] || '#888';
  const surfaceLabel = surfaceLabels[item.superficie || 'all'] || item.superficie;

  return (
    <div className="relative pl-4 pb-2">
      {/* Dot */}
      <div 
        className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-background flex items-center justify-center ${
          isAdd ? 'bg-green-500' : 'bg-red-500'
        }`}
      >
        {isAdd ? (
          <Plus className="h-2.5 w-2.5 text-white" />
        ) : (
          <Minus className="h-2.5 w-2.5 text-white" />
        )}
      </div>

      {/* Content */}
      <div className="bg-muted/50 rounded-lg p-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-xs font-mono">
                Dente {item.dente}
              </Badge>
              <div className="flex items-center gap-1">
                <div 
                  className="w-2.5 h-2.5 rounded"
                  style={{ backgroundColor: conditionColor }}
                />
                <span className="text-sm font-medium">{conditionLabel}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
              <span>{surfaceLabel}</span>
              {item.profissional?.nome && (
                <>
                  <span>•</span>
                  <span>{item.profissional.nome}</span>
                </>
              )}
            </div>
          </div>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {format(parseISO(item.created_at), 'HH:mm')}
          </span>
        </div>
      </div>
    </div>
  );
};
