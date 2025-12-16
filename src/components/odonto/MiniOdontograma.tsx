import { cn } from "@/lib/utils";
import { StatusItemTratamento } from "@/data/dentalMockData";

interface ToothStatus {
  dente: number;
  status: StatusItemTratamento;
}

interface MiniOdontogramaProps {
  teethStatus: ToothStatus[];
  className?: string;
}

const statusColors: Record<StatusItemTratamento, string> = {
  planejado: 'fill-blue-400 stroke-blue-600',
  em_andamento: 'fill-amber-400 stroke-amber-600',
  concluido: 'fill-emerald-400 stroke-emerald-600',
  cancelado: 'fill-red-400 stroke-red-600',
};

const upperTeeth = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
const lowerTeeth = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];

export function MiniOdontograma({ teethStatus, className }: MiniOdontogramaProps) {
  const getToothStatus = (toothNumber: number): StatusItemTratamento | null => {
    const tooth = teethStatus.find(t => t.dente === toothNumber);
    return tooth?.status || null;
  };

  const renderTooth = (toothNumber: number, index: number, isUpper: boolean) => {
    const status = getToothStatus(toothNumber);
    const hasStatus = status !== null;
    
    return (
      <g key={toothNumber}>
        <rect
          x={index * 16 + 2}
          y={isUpper ? 2 : 26}
          width={14}
          height={18}
          rx={2}
          className={cn(
            "transition-all duration-200",
            hasStatus 
              ? statusColors[status!]
              : "fill-muted stroke-border"
          )}
          strokeWidth={1}
        />
        <text
          x={index * 16 + 9}
          y={isUpper ? 14 : 38}
          textAnchor="middle"
          className="fill-foreground text-[6px] font-medium"
        >
          {toothNumber}
        </text>
      </g>
    );
  };

  return (
    <div className={cn("min-w-[200px]", className)}>
      <svg viewBox="0 0 260 50" className="w-full h-auto">
        {/* Upper arch */}
        {upperTeeth.map((tooth, index) => renderTooth(tooth, index, true))}
        {/* Lower arch */}
        {lowerTeeth.map((tooth, index) => renderTooth(tooth, index, false))}
      </svg>
      
      {/* Legend - 2 columns on mobile */}
      <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-x-3 gap-y-1 sm:gap-2 mt-2 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-sm bg-blue-400 border border-blue-600 flex-shrink-0" />
          <span className="text-muted-foreground text-[10px] sm:text-xs">Planejado</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-sm bg-amber-400 border border-amber-600 flex-shrink-0" />
          <span className="text-muted-foreground text-[10px] sm:text-xs">Em andamento</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-sm bg-emerald-400 border border-emerald-600 flex-shrink-0" />
          <span className="text-muted-foreground text-[10px] sm:text-xs">Concluído</span>
        </div>
      </div>
    </div>
  );
}
