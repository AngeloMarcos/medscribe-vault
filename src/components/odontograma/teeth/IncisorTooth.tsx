import React from 'react';
import { ToothCondition, ArchType, conditionColors } from './toothUtils';

interface IncisorToothProps {
  toothNumber: number;
  conditions: ToothCondition[];
  isSelected: boolean;
  onClick: () => void;
  archType: ArchType;
}

export const IncisorTooth: React.FC<IncisorToothProps> = ({
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
    return 'url(#incisorGradient)';
  };

  const isUpper = archType === 'upper';

  return (
    <svg
      width="28"
      height="70"
      viewBox="0 0 28 70"
      onClick={onClick}
      className={`cursor-pointer transition-all duration-200 ${
        isSelected ? 'drop-shadow-lg scale-110' : 'hover:scale-105'
      }`}
      style={{ transform: isUpper ? 'rotate(180deg)' : 'rotate(0deg)' }}
    >
      <defs>
        <linearGradient id="incisorGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFEF7" />
          <stop offset="50%" stopColor="#F5F5DC" />
          <stop offset="100%" stopColor="#E8E4D4" />
        </linearGradient>
        <linearGradient id="rootGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#E8E4D4" />
          <stop offset="50%" stopColor="#F5F0E1" />
          <stop offset="100%" stopColor="#E8E4D4" />
        </linearGradient>
        <filter id="incisorShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1" stdDeviation="1" floodOpacity="0.2" />
        </filter>
      </defs>

      {isAbsent ? (
        <g opacity="0.3">
          <line x1="4" y1="10" x2="24" y2="60" stroke="#999" strokeWidth="2" />
          <line x1="24" y1="10" x2="4" y2="60" stroke="#999" strokeWidth="2" />
        </g>
      ) : (
        <g filter="url(#incisorShadow)">
          {/* Raiz */}
          <path
            d="M10 45 Q14 70 14 70 Q14 70 18 45"
            fill={hasImplant ? '#7C8594' : 'url(#rootGradient)'}
            stroke="#D4D0C4"
            strokeWidth="0.5"
          />
          {hasImplant && (
            <g>
              <rect x="11" y="48" width="6" height="18" fill="#5C6574" rx="1" />
              <line x1="11" y1="52" x2="17" y2="52" stroke="#4A5568" strokeWidth="1" />
              <line x1="11" y1="56" x2="17" y2="56" stroke="#4A5568" strokeWidth="1" />
              <line x1="11" y1="60" x2="17" y2="60" stroke="#4A5568" strokeWidth="1" />
            </g>
          )}
          
          {/* Canal endodôntico */}
          {hasEndodontic && (
            <line x1="14" y1="20" x2="14" y2="65" stroke="#FF6B6B" strokeWidth="2" />
          )}

          {/* Coroa do dente */}
          <path
            d="M4 45 Q4 8 14 4 Q24 8 24 45 Z"
            fill={hasCrown ? '#FFD700' : getSurfaceColor('vestibular')}
            stroke={hasCrown ? '#DAA520' : '#C4C0B4'}
            strokeWidth="1"
          />

          {/* Superfícies clicáveis - Incisal */}
          <path
            d="M6 8 Q14 4 22 8 L22 15 Q14 12 6 15 Z"
            fill={getSurfaceColor('incisal')}
            fillOpacity="0.8"
            stroke="#C4C0B4"
            strokeWidth="0.5"
          />

          {/* Mesial */}
          <path
            d="M4 15 L6 15 L6 40 L4 45 Z"
            fill={getSurfaceColor('mesial')}
            fillOpacity="0.6"
            stroke="#C4C0B4"
            strokeWidth="0.3"
          />

          {/* Distal */}
          <path
            d="M22 15 L24 15 L24 45 L22 40 Z"
            fill={getSurfaceColor('distal')}
            fillOpacity="0.6"
            stroke="#C4C0B4"
            strokeWidth="0.3"
          />

          {/* Lingual (interno) */}
          <ellipse
            cx="14"
            cy="28"
            rx="6"
            ry="12"
            fill={getSurfaceColor('lingual')}
            fillOpacity="0.4"
            stroke="#D4D0C4"
            strokeWidth="0.3"
          />

          {/* Extração indicada */}
          {hasExtraction && (
            <g>
              <line x1="2" y1="5" x2="26" y2="50" stroke="#DC2626" strokeWidth="2.5" />
              <line x1="26" y1="5" x2="2" y2="50" stroke="#DC2626" strokeWidth="2.5" />
            </g>
          )}

          {/* Contorno de seleção */}
          {isSelected && (
            <path
              d="M4 45 Q4 8 14 4 Q24 8 24 45 Z"
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
        x="14"
        y={isUpper ? "-2" : "70"}
        textAnchor="middle"
        fontSize="8"
        fill="hsl(var(--foreground))"
        fontWeight="500"
        style={{ transform: isUpper ? 'rotate(180deg)' : 'rotate(0deg)', transformOrigin: '14px 35px' }}
      >
        {toothNumber}
      </text>
    </svg>
  );
};
