import React from 'react';
import { ToothCondition, ArchType, conditionColors } from './toothUtils';

interface CanineToothProps {
  toothNumber: number;
  conditions: ToothCondition[];
  isSelected: boolean;
  onClick: () => void;
  archType: ArchType;
}

export const CanineTooth: React.FC<CanineToothProps> = ({
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
    return 'url(#canineGradient)';
  };

  const isUpper = archType === 'upper';

  return (
    <svg
      width="30"
      height="80"
      viewBox="0 0 30 80"
      onClick={onClick}
      className={`cursor-pointer transition-all duration-200 ${
        isSelected ? 'drop-shadow-lg scale-110' : 'hover:scale-105'
      }`}
      style={{ transform: isUpper ? 'rotate(180deg)' : 'rotate(0deg)' }}
    >
      <defs>
        <linearGradient id="canineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFEF7" />
          <stop offset="50%" stopColor="#F5F5DC" />
          <stop offset="100%" stopColor="#E8E4D4" />
        </linearGradient>
        <linearGradient id="canineRootGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#E8E4D4" />
          <stop offset="50%" stopColor="#F5F0E1" />
          <stop offset="100%" stopColor="#E8E4D4" />
        </linearGradient>
        <filter id="canineShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1" stdDeviation="1" floodOpacity="0.2" />
        </filter>
      </defs>

      {isAbsent ? (
        <g opacity="0.3">
          <line x1="5" y1="10" x2="25" y2="70" stroke="#999" strokeWidth="2" />
          <line x1="25" y1="10" x2="5" y2="70" stroke="#999" strokeWidth="2" />
        </g>
      ) : (
        <g filter="url(#canineShadow)">
          {/* Raiz longa do canino */}
          <path
            d="M10 48 Q15 80 15 80 Q15 80 20 48"
            fill={hasImplant ? '#7C8594' : 'url(#canineRootGradient)'}
            stroke="#D4D0C4"
            strokeWidth="0.5"
          />
          {hasImplant && (
            <g>
              <rect x="12" y="52" width="6" height="24" fill="#5C6574" rx="1" />
              <line x1="12" y1="58" x2="18" y2="58" stroke="#4A5568" strokeWidth="1" />
              <line x1="12" y1="64" x2="18" y2="64" stroke="#4A5568" strokeWidth="1" />
              <line x1="12" y1="70" x2="18" y2="70" stroke="#4A5568" strokeWidth="1" />
            </g>
          )}

          {/* Canal endodôntico */}
          {hasEndodontic && (
            <line x1="15" y1="18" x2="15" y2="75" stroke="#FF6B6B" strokeWidth="2" />
          )}

          {/* Coroa do canino - formato pontiagudo característico */}
          <path
            d="M5 48 Q5 20 15 4 Q25 20 25 48 Z"
            fill={hasCrown ? '#FFD700' : getSurfaceColor('vestibular')}
            stroke={hasCrown ? '#DAA520' : '#C4C0B4'}
            strokeWidth="1"
          />

          {/* Ponta do canino (cúspide) */}
          <path
            d="M10 12 L15 4 L20 12 Z"
            fill={getSurfaceColor('incisal')}
            fillOpacity="0.9"
            stroke="#C4C0B4"
            strokeWidth="0.5"
          />

          {/* Mesial */}
          <path
            d="M5 18 L10 12 L10 42 L5 48 Z"
            fill={getSurfaceColor('mesial')}
            fillOpacity="0.6"
            stroke="#C4C0B4"
            strokeWidth="0.3"
          />

          {/* Distal */}
          <path
            d="M20 12 L25 18 L25 48 L20 42 Z"
            fill={getSurfaceColor('distal')}
            fillOpacity="0.6"
            stroke="#C4C0B4"
            strokeWidth="0.3"
          />

          {/* Lingual */}
          <ellipse
            cx="15"
            cy="30"
            rx="6"
            ry="14"
            fill={getSurfaceColor('lingual')}
            fillOpacity="0.4"
            stroke="#D4D0C4"
            strokeWidth="0.3"
          />

          {/* Extração indicada */}
          {hasExtraction && (
            <g>
              <line x1="2" y1="5" x2="28" y2="55" stroke="#DC2626" strokeWidth="2.5" />
              <line x1="28" y1="5" x2="2" y2="55" stroke="#DC2626" strokeWidth="2.5" />
            </g>
          )}

          {/* Contorno de seleção */}
          {isSelected && (
            <path
              d="M5 48 Q5 20 15 4 Q25 20 25 48 Z"
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
        x="15"
        y={isUpper ? "-2" : "80"}
        textAnchor="middle"
        fontSize="8"
        fill="hsl(var(--foreground))"
        fontWeight="500"
        style={{ transform: isUpper ? 'rotate(180deg)' : 'rotate(0deg)', transformOrigin: '15px 40px' }}
      >
        {toothNumber}
      </text>
    </svg>
  );
};
