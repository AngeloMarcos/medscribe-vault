import React from 'react';
import { ToothCondition, ArchType, conditionColors } from './toothUtils';

interface PremolarToothProps {
  toothNumber: number;
  conditions: ToothCondition[];
  isSelected: boolean;
  onClick: () => void;
  archType: ArchType;
}

export const PremolarTooth: React.FC<PremolarToothProps> = ({
  toothNumber,
  conditions,
  isSelected,
  onClick,
  archType,
}) => {
  const isAbsent = conditions.some(c => c.condition === 'absent');
  const hasImplant = conditions.some(c => c.condition === 'implant');
  const hasCrown = conditions.some(c => c.condition === 'crown');
  const hasEndodontic = conditions.some(c => c.condition === 'endodontic');
  const hasExtraction = conditions.some(c => c.condition === 'extraction');

  const getSurfaceColor = (surface: string) => {
    const condition = conditions.find(c => c.surface === surface || c.surface === 'all');
    if (condition && condition.condition !== 'absent' && condition.condition !== 'implant' && 
        condition.condition !== 'crown' && condition.condition !== 'endodontic' && 
        condition.condition !== 'extraction') {
      return conditionColors[condition.condition];
    }
    return 'url(#premolarGradient)';
  };

  const isUpper = archType === 'upper';

  return (
    <svg
      width="32"
      height="72"
      viewBox="0 0 32 72"
      onClick={onClick}
      className={`cursor-pointer transition-all duration-200 ${
        isSelected ? 'drop-shadow-lg scale-110' : 'hover:scale-105'
      }`}
      style={{ transform: isUpper ? 'rotate(180deg)' : 'rotate(0deg)' }}
    >
      <defs>
        <linearGradient id="premolarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFEF7" />
          <stop offset="50%" stopColor="#F5F5DC" />
          <stop offset="100%" stopColor="#E8E4D4" />
        </linearGradient>
        <linearGradient id="premolarRootGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#E8E4D4" />
          <stop offset="50%" stopColor="#F5F0E1" />
          <stop offset="100%" stopColor="#E8E4D4" />
        </linearGradient>
        <filter id="premolarShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1" stdDeviation="1" floodOpacity="0.2" />
        </filter>
      </defs>

      {isAbsent ? (
        <g opacity="0.3">
          <line x1="4" y1="10" x2="28" y2="62" stroke="#999" strokeWidth="2" />
          <line x1="28" y1="10" x2="4" y2="62" stroke="#999" strokeWidth="2" />
        </g>
      ) : (
        <g filter="url(#premolarShadow)">
          {/* Duas raízes do pré-molar */}
          <path
            d="M8 45 Q10 72 12 72"
            fill="none"
            stroke={hasImplant ? '#7C8594' : '#E8E4D4'}
            strokeWidth="5"
          />
          <path
            d="M24 45 Q22 72 20 72"
            fill="none"
            stroke={hasImplant ? '#7C8594' : '#E8E4D4'}
            strokeWidth="5"
          />
          {hasImplant && (
            <g>
              <rect x="13" y="48" width="6" height="20" fill="#5C6574" rx="1" />
              <line x1="13" y1="54" x2="19" y2="54" stroke="#4A5568" strokeWidth="1" />
              <line x1="13" y1="60" x2="19" y2="60" stroke="#4A5568" strokeWidth="1" />
            </g>
          )}

          {/* Canais endodônticos */}
          {hasEndodontic && (
            <>
              <line x1="10" y1="20" x2="11" y2="68" stroke="#FF6B6B" strokeWidth="1.5" />
              <line x1="22" y1="20" x2="21" y2="68" stroke="#FF6B6B" strokeWidth="1.5" />
            </>
          )}

          {/* Coroa do pré-molar - formato mais quadrado com duas cúspides */}
          <path
            d="M4 45 L4 15 Q4 8 10 6 L16 4 L22 6 Q28 8 28 15 L28 45 Z"
            fill={hasCrown ? '#FFD700' : getSurfaceColor('vestibular')}
            stroke={hasCrown ? '#DAA520' : '#C4C0B4'}
            strokeWidth="1"
          />

          {/* Superfície oclusal com duas cúspides */}
          <path
            d="M6 12 Q10 4 16 8 Q22 4 26 12 L26 18 Q20 14 16 16 Q12 14 6 18 Z"
            fill={getSurfaceColor('oclusal')}
            fillOpacity="0.9"
            stroke="#C4C0B4"
            strokeWidth="0.5"
          />
          
          {/* Fissura central */}
          <path
            d="M10 10 Q16 16 22 10"
            fill="none"
            stroke="#C4C0B4"
            strokeWidth="0.8"
          />

          {/* Mesial */}
          <path
            d="M4 15 L6 12 L6 40 L4 45 Z"
            fill={getSurfaceColor('mesial')}
            fillOpacity="0.6"
            stroke="#C4C0B4"
            strokeWidth="0.3"
          />

          {/* Distal */}
          <path
            d="M26 12 L28 15 L28 45 L26 40 Z"
            fill={getSurfaceColor('distal')}
            fillOpacity="0.6"
            stroke="#C4C0B4"
            strokeWidth="0.3"
          />

          {/* Lingual */}
          <ellipse
            cx="16"
            cy="28"
            rx="8"
            ry="12"
            fill={getSurfaceColor('lingual')}
            fillOpacity="0.3"
            stroke="#D4D0C4"
            strokeWidth="0.3"
          />

          {/* Extração indicada */}
          {hasExtraction && (
            <g>
              <line x1="2" y1="5" x2="30" y2="50" stroke="#DC2626" strokeWidth="2.5" />
              <line x1="30" y1="5" x2="2" y2="50" stroke="#DC2626" strokeWidth="2.5" />
            </g>
          )}

          {/* Contorno de seleção */}
          {isSelected && (
            <path
              d="M4 45 L4 15 Q4 8 10 6 L16 4 L22 6 Q28 8 28 15 L28 45 Z"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="2"
              className="animate-pulse"
            />
          )}
        </g>
      )}

      {/* Número do dente */}
      <text
        x="16"
        y={isUpper ? "-2" : "72"}
        textAnchor="middle"
        fontSize="8"
        fill="hsl(var(--foreground))"
        fontWeight="500"
        style={{ transform: isUpper ? 'rotate(180deg)' : 'rotate(0deg)', transformOrigin: '16px 36px' }}
      >
        {toothNumber}
      </text>
    </svg>
  );
};
