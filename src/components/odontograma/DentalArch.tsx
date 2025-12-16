import React from 'react';
import { ToothWrapper } from './teeth/ToothWrapper';
import { 
  ToothCondition, 
  upperArchPositions, 
  lowerArchPositions,
} from './teeth/toothUtils';

interface DentalArchProps {
  teethConditions: Record<number, ToothCondition[]>;
  selectedTooth: number | null;
  onToothClick: (toothNumber: number) => void;
}

export const DentalArch: React.FC<DentalArchProps> = ({
  teethConditions,
  selectedTooth,
  onToothClick,
}) => {
  // Ordem dos dentes por quadrante (notação FDI)
  const upperRightTeeth = [18, 17, 16, 15, 14, 13, 12, 11];
  const upperLeftTeeth = [21, 22, 23, 24, 25, 26, 27, 28];
  const lowerLeftTeeth = [38, 37, 36, 35, 34, 33, 32, 31];
  const lowerRightTeeth = [41, 42, 43, 44, 45, 46, 47, 48];

  const allUpperTeeth = [...upperRightTeeth, ...upperLeftTeeth];
  const allLowerTeeth = [...lowerLeftTeeth, ...lowerRightTeeth];

  return (
    <div className="dental-arch-container flex flex-col items-center gap-4 md:gap-6 w-full">
      {/* Arcada Superior */}
      <div className="relative w-full max-w-[720px]">
        {/* Label Quadrantes - hidden on mobile */}
        <div className="hidden sm:block absolute -left-6 md:-left-8 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground rotate-[-90deg]">
          Q1
        </div>
        <div className="hidden sm:block absolute -right-6 md:-right-8 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground rotate-90">
          Q2
        </div>

        {/* Container da arcada com gengiva */}
        <div className="relative bg-gradient-to-b from-[#FFB6B6] via-[#FFA0A0] to-[#FF8A8A] rounded-t-[50%] pt-3 md:pt-4 pb-2 px-2 md:px-4">
          {/* Palato */}
          <div 
            className="absolute top-6 md:top-8 left-1/2 -translate-x-1/2 w-[60%] h-[50%] rounded-[50%] bg-gradient-to-b from-[#FF9090] to-[#FFB0B0] opacity-50"
          />
          
          {/* Área dos dentes superiores - scrollable on small screens */}
          <div className="relative h-[100px] md:h-[120px] w-full overflow-x-auto scrollbar-hide">
            <div className="relative h-full min-w-[680px] mx-auto">
              {allUpperTeeth.map((toothNumber) => (
                <ToothWrapper
                  key={toothNumber}
                  toothNumber={toothNumber}
                  conditions={teethConditions[toothNumber] || []}
                  isSelected={selectedTooth === toothNumber}
                  onClick={() => onToothClick(toothNumber)}
                  position={upperArchPositions[toothNumber]}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Linha central */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px border-l border-dashed border-muted-foreground/30" />
      </div>

      {/* Separador entre arcadas */}
      <div className="w-full max-w-[680px] border-t-2 border-dashed border-muted-foreground/20" />

      {/* Arcada Inferior */}
      <div className="relative w-full max-w-[720px]">
        {/* Label Quadrantes - hidden on mobile */}
        <div className="hidden sm:block absolute -left-6 md:-left-8 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground rotate-[-90deg]">
          Q3
        </div>
        <div className="hidden sm:block absolute -right-6 md:-right-8 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground rotate-90">
          Q4
        </div>

        {/* Container da arcada com gengiva */}
        <div className="relative bg-gradient-to-t from-[#FFB6B6] via-[#FFA0A0] to-[#FF8A8A] rounded-b-[50%] pb-3 md:pb-4 pt-2 px-2 md:px-4">
          {/* Área dos dentes inferiores - scrollable on small screens */}
          <div className="relative h-[100px] md:h-[120px] w-full overflow-x-auto scrollbar-hide">
            <div className="relative h-full min-w-[680px] mx-auto">
              {allLowerTeeth.map((toothNumber) => (
                <ToothWrapper
                  key={toothNumber}
                  toothNumber={toothNumber}
                  conditions={teethConditions[toothNumber] || []}
                  isSelected={selectedTooth === toothNumber}
                  onClick={() => onToothClick(toothNumber)}
                  position={lowerArchPositions[toothNumber]}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Linha central */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px border-l border-dashed border-muted-foreground/30" />
      </div>
    </div>
  );
};
