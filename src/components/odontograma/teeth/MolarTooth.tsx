import React from 'react';
import { ToothCondition, ArchType, conditionColors } from './toothUtils';

interface MolarToothProps {
  toothNumber: number;
  conditions: ToothCondition[];
  isSelected: boolean;
  onClick: () => void;
  archType: ArchType;
}

export const MolarTooth: React.FC<MolarToothProps> = ({
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
    return 'url(#molarGradient)';
  };

  const isUpper = archType === 'upper';
  const isThirdMolar = toothNumber % 10 === 8; // Dente do siso

  return (
    <svg
      width="42"
      height="68"
      viewBox="0 0 42 68"
      onClick={onClick}
      className={`cursor-pointer transition-all duration-200 ${
        isSelected ? 'drop-shadow-lg scale-110' : 'hover:scale-105'
      }`}
      style={{ transform: isUpper ? 'rotate(180deg)' : 'rotate(0deg)' }}
    >
      <defs>
        <linearGradient id="molarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFEF7" />
          <stop offset="50%" stopColor="#F5F5DC" />
          <stop offset="100%" stopColor="#E8E4D4" />
        </linearGradient>
        <linearGradient id="molarRootGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#E8E4D4" />
          <stop offset="50%" stopColor="#F5F0E1" />
          <stop offset="100%" stopColor="#E8E4D4" />
        </linearGradient>
        <filter id="molarShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1" stdDeviation="1" floodOpacity="0.2" />
        </filter>
      </defs>

      {isAbsent ? (
        <g opacity="0.3">
          <line x1="4" y1="8" x2="38" y2="60" stroke="#999" strokeWidth="2" />
          <line x1="38" y1="8" x2="4" y2="60" stroke="#999" strokeWidth="2" />
        </g>
      ) : (
        <g filter="url(#molarShadow)">
          {/* Raízes do molar (3 para superiores, 2 para inferiores) */}
          {isUpper ? (
            <>
              {/* Raiz palatina (central) */}
              <path
                d="M18 42 Q21 68 21 68"
                fill="none"
                stroke={hasImplant ? '#7C8594' : '#E8E4D4'}
                strokeWidth="6"
              />
              {/* Raiz mesio-vestibular */}
              <path
                d="M10 42 Q8 65 10 65"
                fill="none"
                stroke={hasImplant ? '#7C8594' : '#E8E4D4'}
                strokeWidth="5"
              />
              {/* Raiz disto-vestibular */}
              <path
                d="M32 42 Q34 65 32 65"
                fill="none"
                stroke={hasImplant ? '#7C8594' : '#E8E4D4'}
                strokeWidth="5"
              />
            </>
          ) : (
            <>
              {/* Duas raízes para molares inferiores */}
              <path
                d="M12 42 Q10 68 12 68"
                fill="none"
                stroke={hasImplant ? '#7C8594' : '#E8E4D4'}
                strokeWidth="6"
              />
              <path
                d="M30 42 Q32 68 30 68"
                fill="none"
                stroke={hasImplant ? '#7C8594' : '#E8E4D4'}
                strokeWidth="6"
              />
            </>
          )}

          {hasImplant && (
            <g>
              <rect x="17" y="45" width="8" height="20" fill="#5C6574" rx="1" />
              <line x1="17" y1="51" x2="25" y2="51" stroke="#4A5568" strokeWidth="1" />
              <line x1="17" y1="57" x2="25" y2="57" stroke="#4A5568" strokeWidth="1" />
            </g>
          )}

          {/* Canais endodônticos */}
          {hasEndodontic && (
            isUpper ? (
              <>
                <line x1="10" y1="18" x2="10" y2="62" stroke="#FF6B6B" strokeWidth="1.5" />
                <line x1="21" y1="18" x2="21" y2="65" stroke="#FF6B6B" strokeWidth="1.5" />
                <line x1="32" y1="18" x2="32" y2="62" stroke="#FF6B6B" strokeWidth="1.5" />
              </>
            ) : (
              <>
                <line x1="12" y1="18" x2="12" y2="65" stroke="#FF6B6B" strokeWidth="1.5" />
                <line x1="30" y1="18" x2="30" y2="65" stroke="#FF6B6B" strokeWidth="1.5" />
              </>
            )
          )}

          {/* Coroa do molar - formato mais largo e quadrado */}
          <path
            d={isThirdMolar 
              ? "M4 42 L4 14 Q4 6 12 4 L30 4 Q38 6 38 14 L38 42 Z"
              : "M3 42 L3 14 Q3 6 10 4 L32 4 Q39 6 39 14 L39 42 Z"
            }
            fill={hasCrown ? '#FFD700' : getSurfaceColor('vestibular')}
            stroke={hasCrown ? '#DAA520' : '#C4C0B4'}
            strokeWidth="1"
          />

          {/* Superfície oclusal com 4-5 cúspides */}
          <path
            d="M6 10 Q10 4 14 8 Q18 4 21 8 Q24 4 28 8 Q32 4 36 10 L36 18 Q28 14 21 16 Q14 14 6 18 Z"
            fill={getSurfaceColor('oclusal')}
            fillOpacity="0.9"
            stroke="#C4C0B4"
            strokeWidth="0.5"
          />
          
          {/* Fissuras características do molar */}
          <path
            d="M12 8 Q21 18 30 8"
            fill="none"
            stroke="#C4C0B4"
            strokeWidth="0.8"
          />
          <path
            d="M21 8 L21 16"
            fill="none"
            stroke="#C4C0B4"
            strokeWidth="0.8"
          />

          {/* Mesial */}
          <path
            d="M3 14 L6 10 L6 38 L3 42 Z"
            fill={getSurfaceColor('mesial')}
            fillOpacity="0.6"
            stroke="#C4C0B4"
            strokeWidth="0.3"
          />

          {/* Distal */}
          <path
            d="M36 10 L39 14 L39 42 L36 38 Z"
            fill={getSurfaceColor('distal')}
            fillOpacity="0.6"
            stroke="#C4C0B4"
            strokeWidth="0.3"
          />

          {/* Lingual */}
          <ellipse
            cx="21"
            cy="26"
            rx="12"
            ry="10"
            fill={getSurfaceColor('lingual')}
            fillOpacity="0.3"
            stroke="#D4D0C4"
            strokeWidth="0.3"
          />

          {/* Extração indicada */}
          {hasExtraction && (
            <g>
              <line x1="2" y1="4" x2="40" y2="48" stroke="#DC2626" strokeWidth="2.5" />
              <line x1="40" y1="4" x2="2" y2="48" stroke="#DC2626" strokeWidth="2.5" />
            </g>
          )}

          {/* Contorno de seleção */}
          {isSelected && (
            <path
              d={isThirdMolar 
                ? "M4 42 L4 14 Q4 6 12 4 L30 4 Q38 6 38 14 L38 42 Z"
                : "M3 42 L3 14 Q3 6 10 4 L32 4 Q39 6 39 14 L39 42 Z"
              }
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
        x="21"
        y={isUpper ? "-2" : "68"}
        textAnchor="middle"
        fontSize="8"
        fill="hsl(var(--foreground))"
        fontWeight="500"
        style={{ transform: isUpper ? 'rotate(180deg)' : 'rotate(0deg)', transformOrigin: '21px 34px' }}
      >
        {toothNumber}
      </text>
    </svg>
  );
};
