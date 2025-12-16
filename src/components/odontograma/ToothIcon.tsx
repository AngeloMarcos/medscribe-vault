import { cn } from '@/lib/utils';

interface ToothIconProps {
  toothNumber: number;
  conditions: ToothCondition[];
  isSelected: boolean;
  onClick: () => void;
}

export interface ToothCondition {
  surface: 'O' | 'M' | 'D' | 'V' | 'L' | 'I' | 'full'; // Oclusal, Mesial, Distal, Vestibular, Lingual, Incisal, Full
  condition: 'caries' | 'restoration' | 'extraction' | 'endodontic' | 'crown' | 'implant' | 'absent' | 'healthy';
}

const conditionColors: Record<ToothCondition['condition'], string> = {
  healthy: '#E5E7EB',
  caries: '#EF4444',
  restoration: '#3B82F6',
  extraction: '#6B7280',
  endodontic: '#8B5CF6',
  crown: '#F59E0B',
  implant: '#10B981',
  absent: '#1F2937',
};

export const ToothIcon = ({ toothNumber, conditions, isSelected, onClick }: ToothIconProps) => {
  const isUpper = toothNumber < 30 || (toothNumber >= 50 && toothNumber < 70);
  const isMolar = [1, 2, 3, 6, 7, 8].includes(toothNumber % 10) && toothNumber % 10 !== 0;
  const isIncisor = [1, 2].includes(toothNumber % 10);

  const getSurfaceColor = (surface: ToothCondition['surface']) => {
    const condition = conditions.find((c) => c.surface === surface || c.surface === 'full');
    return condition ? conditionColors[condition.condition] : '#E5E7EB';
  };

  const hasCondition = (surface: ToothCondition['surface']) => {
    return conditions.some((c) => c.surface === surface || c.surface === 'full');
  };

  const isAbsent = conditions.some((c) => c.condition === 'absent');

  if (isAbsent) {
    return (
      <div
        onClick={onClick}
        className={cn(
          'relative w-10 h-12 flex flex-col items-center cursor-pointer transition-transform hover:scale-110',
          isSelected && 'ring-2 ring-primary rounded'
        )}
      >
        <svg viewBox="0 0 40 48" className="w-full h-full opacity-30">
          <line x1="8" y1="8" x2="32" y2="40" stroke="#6B7280" strokeWidth="2" />
          <line x1="32" y1="8" x2="8" y2="40" stroke="#6B7280" strokeWidth="2" />
        </svg>
        <span className="text-[10px] text-muted-foreground absolute -bottom-3">{toothNumber}</span>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={cn(
        'relative w-10 h-12 flex flex-col items-center cursor-pointer transition-transform hover:scale-110',
        isSelected && 'ring-2 ring-primary rounded'
      )}
    >
      <svg viewBox="0 0 40 48" className="w-full h-full">
        {/* Tooth shape - 5 surface representation */}
        {/* Center (Oclusal/Incisal) */}
        <rect
          x="12"
          y="16"
          width="16"
          height="16"
          fill={getSurfaceColor(isIncisor ? 'I' : 'O')}
          stroke="#9CA3AF"
          strokeWidth="1"
          className="transition-colors"
        />
        
        {/* Top (Vestibular for upper, Lingual for lower) */}
        <polygon
          points="12,16 28,16 32,4 8,4"
          fill={getSurfaceColor(isUpper ? 'V' : 'L')}
          stroke="#9CA3AF"
          strokeWidth="1"
          className="transition-colors"
        />
        
        {/* Bottom (Lingual for upper, Vestibular for lower) */}
        <polygon
          points="12,32 28,32 32,44 8,44"
          fill={getSurfaceColor(isUpper ? 'L' : 'V')}
          stroke="#9CA3AF"
          strokeWidth="1"
          className="transition-colors"
        />
        
        {/* Left (Mesial or Distal depending on quadrant) */}
        <polygon
          points="12,16 12,32 8,44 8,4"
          fill={getSurfaceColor('M')}
          stroke="#9CA3AF"
          strokeWidth="1"
          className="transition-colors"
        />
        
        {/* Right (Distal or Mesial depending on quadrant) */}
        <polygon
          points="28,16 28,32 32,44 32,4"
          fill={getSurfaceColor('D')}
          stroke="#9CA3AF"
          strokeWidth="1"
          className="transition-colors"
        />

        {/* Crown indicator */}
        {conditions.some((c) => c.condition === 'crown') && (
          <circle cx="20" cy="24" r="6" fill="none" stroke="#F59E0B" strokeWidth="2" />
        )}

        {/* Endodontic indicator */}
        {conditions.some((c) => c.condition === 'endodontic') && (
          <circle cx="20" cy="24" r="3" fill="#8B5CF6" />
        )}
      </svg>
      <span className="text-[10px] text-muted-foreground absolute -bottom-3 font-medium">
        {toothNumber}
      </span>
    </div>
  );
};
