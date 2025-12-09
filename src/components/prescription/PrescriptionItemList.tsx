import React, { useState, useMemo } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  GripVertical,
  Pencil,
  Copy,
  Pause,
  Play,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
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
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface ItemDetails {
  name?: string;
  dose?: string;
  unit?: string;
  route?: string;
  frequency?: string;
  diluent?: string;
  volume?: string;
  infusionTime?: string;
  storageType?: string;
  quantity?: string;
  item?: string;
  observation?: string;
}

interface PrescriptionItem {
  id: string;
  prescription_id: string;
  item_type: string;
  sequence_order: number;
  description: string;
  status: string;
  is_high_risk: boolean;
  observation: string | null;
  item_details: ItemDetails | null;
  created_at: string;
  updated_at: string;
}

interface PrescriptionItemListProps {
  items: PrescriptionItem[];
  onEdit: (item: PrescriptionItem) => void;
  onCopy: (id: string) => void;
  onSuspend: (id: string) => void;
  onRemove: (id: string) => void;
  onReorder: (startIndex: number, endIndex: number) => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  allergy: 'ALERGIAS',
  diet: 'DIETA',
  medication: 'MEDICAMENTOS',
  solution: 'SOLUÇÕES',
  care: 'CUIDADOS',
  consultation: 'CONSULTORIAS',
  exam: 'EXAMES',
  procedure: 'PROCEDIMENTOS',
};

const CATEGORY_ORDER = [
  'allergy',
  'diet',
  'medication',
  'solution',
  'care',
  'consultation',
  'exam',
  'procedure',
];

const formatMedication = (details: ItemDetails, observation: string | null): string => {
  const lines: string[] = [];
  
  const mainLine = [
    details.name,
    details.dose ? `${details.dose}${details.unit || ''}` : null,
    details.route ? `Via ${details.route}` : null,
    details.frequency,
  ].filter(Boolean).join(' - ');
  
  if (mainLine) lines.push(mainLine);
  
  const diluentLine = [
    details.diluent ? `Diluente: ${details.diluent}` : null,
    details.volume ? `Volume: ${details.volume}mL` : null,
    details.infusionTime ? `Correr em ${details.infusionTime}` : null,
  ].filter(Boolean).join(' | ');
  
  if (diluentLine) lines.push(diluentLine);
  if (observation) lines.push(`Obs: ${observation}`);
  
  return lines.join('\n');
};

const formatDiet = (details: ItemDetails, observation: string | null): string => {
  const lines: string[] = [];
  
  const mainLine = [
    details.item || details.name,
    details.quantity ? `${details.quantity}${details.unit || ''}` : null,
    details.frequency,
  ].filter(Boolean).join(' - ');
  
  if (mainLine) lines.push(mainLine);
  if (observation) lines.push(`Obs: ${observation}`);
  
  return lines.join('\n');
};

const formatSolution = (details: ItemDetails, observation: string | null): string => {
  const lines: string[] = [];
  
  const mainLine = [
    details.name,
    details.volume ? `${details.volume}mL` : null,
    details.frequency,
    details.infusionTime ? `Correr em ${details.infusionTime}` : null,
  ].filter(Boolean).join(' - ');
  
  if (mainLine) lines.push(mainLine);
  if (details.storageType) lines.push(`Tipo: ${details.storageType}`);
  if (observation) lines.push(`Obs: ${observation}`);
  
  return lines.join('\n');
};

const formatCare = (details: ItemDetails, description: string): string => {
  return [description, details.frequency].filter(Boolean).join(' - ');
};

const formatDescription = (item: PrescriptionItem): string => {
  const details = item.item_details || {};
  
  switch (item.item_type) {
    case 'medication':
      return formatMedication(details, item.observation);
    case 'diet':
      return formatDiet(details, item.observation);
    case 'solution':
      return formatSolution(details, item.observation);
    case 'care':
      return formatCare(details, item.description);
    default:
      return item.description;
  }
};

interface SortableItemProps {
  item: PrescriptionItem;
  index: number;
  onEdit: (item: PrescriptionItem) => void;
  onCopy: (id: string) => void;
  onSuspend: (id: string) => void;
  onRemove: (id: string) => void;
}

const SortableItem: React.FC<SortableItemProps> = ({
  item,
  index,
  onEdit,
  onCopy,
  onSuspend,
  onRemove,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isSuspended = item.status === 'suspended';
  const formattedDescription = formatDescription(item);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-start gap-3 p-3 rounded-lg border bg-card transition-all',
        'hover:bg-muted/50',
        isDragging && 'opacity-50 shadow-lg z-50',
        isSuspended && 'opacity-60'
      )}
    >
      <button
        {...attributes}
        {...listeners}
        className="mt-1 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <span className="font-mono text-sm text-muted-foreground mt-0.5 min-w-[24px]">
        {index + 1}.
      </span>

      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2 flex-wrap">
          <p
            className={cn(
              'text-sm whitespace-pre-line',
              isSuspended && 'line-through text-muted-foreground'
            )}
          >
            {formattedDescription}
          </p>
        </div>

        <div className="flex items-center gap-2 mt-2">
          {isSuspended && (
            <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">
              Suspenso
            </Badge>
          )}
          {item.is_high_risk && (
            <Badge variant="destructive" className="gap-1">
              <AlertTriangle className="h-3 w-3" />
              Alto Risco
            </Badge>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onEdit(item)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Editar</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onCopy(item.id)}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Copiar</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onSuspend(item.id)}
            >
              {isSuspended ? (
                <Play className="h-4 w-4" />
              ) : (
                <Pause className="h-4 w-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{isSuspended ? 'Reativar' : 'Suspender'}</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={() => onRemove(item.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Excluir</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
};

interface CategorySectionProps {
  category: string;
  items: PrescriptionItem[];
  onEdit: (item: PrescriptionItem) => void;
  onCopy: (id: string) => void;
  onSuspend: (id: string) => void;
  onRemove: (id: string) => void;
}

const CategorySection: React.FC<CategorySectionProps> = ({
  category,
  items,
  onEdit,
  onCopy,
  onSuspend,
  onRemove,
}) => {
  if (items.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-semibold text-primary uppercase tracking-wide">
          {CATEGORY_LABELS[category] || category.toUpperCase()}
        </h3>
        <Separator className="flex-1" />
      </div>

      <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {items.map((item, index) => (
            <SortableItem
              key={item.id}
              item={item}
              index={index}
              onEdit={onEdit}
              onCopy={onCopy}
              onSuspend={onSuspend}
              onRemove={onRemove}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  );
};

export const PrescriptionItemList: React.FC<PrescriptionItemListProps> = ({
  items,
  onEdit,
  onCopy,
  onSuspend,
  onRemove,
  onReorder,
}) => {
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const activeItems = useMemo(
    () => items.filter((item) => item.status !== 'deleted'),
    [items]
  );

  const groupedItems = useMemo(() => {
    const groups: Record<string, PrescriptionItem[]> = {};
    
    CATEGORY_ORDER.forEach((category) => {
      groups[category] = [];
    });

    activeItems
      .sort((a, b) => a.sequence_order - b.sequence_order)
      .forEach((item) => {
        const category = item.item_type;
        if (!groups[category]) {
          groups[category] = [];
        }
        groups[category].push(item);
      });

    return groups;
  }, [activeItems]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = activeItems.findIndex((i) => i.id === active.id);
      const newIndex = activeItems.findIndex((i) => i.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        onReorder(oldIndex, newIndex);
      }
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeleteConfirmId(id);
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmId) {
      onRemove(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  if (activeItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <p className="text-sm">Nenhum item na prescrição</p>
        <p className="text-xs mt-1">Selecione uma categoria e adicione itens</p>
      </div>
    );
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="space-y-6">
          {CATEGORY_ORDER.map((category) => (
            <CategorySection
              key={category}
              category={category}
              items={groupedItems[category] || []}
              onEdit={onEdit}
              onCopy={onCopy}
              onSuspend={onSuspend}
              onRemove={handleDeleteClick}
            />
          ))}
        </div>
      </DndContext>

      <AlertDialog
        open={!!deleteConfirmId}
        onOpenChange={(open) => !open && setDeleteConfirmId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default PrescriptionItemList;
