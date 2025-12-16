export type ToothType = 'incisor' | 'canine' | 'premolar' | 'molar';
export type ToothSurface = 'mesial' | 'distal' | 'vestibular' | 'lingual' | 'oclusal' | 'incisal';
export type ArchType = 'upper' | 'lower';

export interface ToothCondition {
  surface: ToothSurface | 'all';
  condition: 'caries' | 'restoration' | 'crown' | 'endodontic' | 'extraction' | 'absent' | 'implant' | 'sealant';
}

export interface ToothPosition {
  x: number;
  y: number;
  rotation: number;
}

export const getToothType = (toothNumber: number): ToothType => {
  const unitDigit = toothNumber % 10;
  if (unitDigit === 1 || unitDigit === 2) return 'incisor';
  if (unitDigit === 3) return 'canine';
  if (unitDigit === 4 || unitDigit === 5) return 'premolar';
  return 'molar';
};

export const getArchType = (toothNumber: number): ArchType => {
  const quadrant = Math.floor(toothNumber / 10);
  return quadrant <= 2 ? 'upper' : 'lower';
};

export const getQuadrant = (toothNumber: number): 1 | 2 | 3 | 4 => {
  return Math.floor(toothNumber / 10) as 1 | 2 | 3 | 4;
};

export const conditionColors: Record<ToothCondition['condition'], string> = {
  caries: '#8B4513',
  restoration: '#A8A8A8',
  crown: '#FFD700',
  endodontic: '#FF6B6B',
  extraction: '#DC2626',
  absent: '#E5E5E5',
  implant: '#4A90D9',
  sealant: '#9333EA',
};

export const conditionLabels: Record<ToothCondition['condition'], string> = {
  caries: 'Cárie',
  restoration: 'Restauração',
  crown: 'Coroa',
  endodontic: 'Tratamento de Canal',
  extraction: 'Extração Indicada',
  absent: 'Ausente',
  implant: 'Implante',
  sealant: 'Selante',
};

// Posições dos dentes em formato de arco parabólico
// Arcada superior (Q1: direita 18-11, Q2: esquerda 21-28)
// Arcada inferior (Q3: esquerda 38-31, Q4: direita 41-48)
export const upperArchPositions: Record<number, ToothPosition> = {
  // Quadrante 1 (superior direito) - do 18 ao 11
  18: { x: 30, y: 45, rotation: -25 },
  17: { x: 75, y: 25, rotation: -18 },
  16: { x: 120, y: 12, rotation: -12 },
  15: { x: 162, y: 5, rotation: -8 },
  14: { x: 200, y: 2, rotation: -5 },
  13: { x: 238, y: 0, rotation: -3 },
  12: { x: 273, y: 0, rotation: -1 },
  11: { x: 305, y: 0, rotation: 0 },
  // Quadrante 2 (superior esquerdo) - do 21 ao 28
  21: { x: 345, y: 0, rotation: 0 },
  22: { x: 377, y: 0, rotation: 1 },
  23: { x: 412, y: 0, rotation: 3 },
  24: { x: 450, y: 2, rotation: 5 },
  25: { x: 488, y: 5, rotation: 8 },
  26: { x: 530, y: 12, rotation: 12 },
  27: { x: 575, y: 25, rotation: 18 },
  28: { x: 620, y: 45, rotation: 25 },
};

export const lowerArchPositions: Record<number, ToothPosition> = {
  // Quadrante 3 (inferior esquerdo) - do 38 ao 31
  38: { x: 30, y: 45, rotation: 25 },
  37: { x: 75, y: 25, rotation: 18 },
  36: { x: 120, y: 12, rotation: 12 },
  35: { x: 162, y: 5, rotation: 8 },
  34: { x: 200, y: 2, rotation: 5 },
  33: { x: 238, y: 0, rotation: 3 },
  32: { x: 273, y: 0, rotation: 1 },
  31: { x: 305, y: 0, rotation: 0 },
  // Quadrante 4 (inferior direito) - do 41 ao 48
  41: { x: 345, y: 0, rotation: 0 },
  42: { x: 377, y: 0, rotation: -1 },
  43: { x: 412, y: 0, rotation: -3 },
  44: { x: 450, y: 2, rotation: -5 },
  45: { x: 488, y: 5, rotation: -8 },
  46: { x: 530, y: 12, rotation: -12 },
  47: { x: 575, y: 25, rotation: -18 },
  48: { x: 620, y: 45, rotation: -25 },
};

export const toothDimensions: Record<ToothType, { width: number; height: number }> = {
  incisor: { width: 28, height: 70 },
  canine: { width: 30, height: 80 },
  premolar: { width: 32, height: 72 },
  molar: { width: 42, height: 68 },
};
