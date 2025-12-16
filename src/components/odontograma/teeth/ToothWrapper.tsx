import React from 'react';
import { IncisorTooth } from './IncisorTooth';
import { CanineTooth } from './CanineTooth';
import { PremolarTooth } from './PremolarTooth';
import { MolarTooth } from './MolarTooth';
import { ToothCondition, getToothType, getArchType, ToothPosition } from './toothUtils';

interface ToothWrapperProps {
  toothNumber: number;
  conditions: ToothCondition[];
  isSelected: boolean;
  onClick: () => void;
  position: ToothPosition;
}

export const ToothWrapper: React.FC<ToothWrapperProps> = ({
  toothNumber,
  conditions,
  isSelected,
  onClick,
  position,
}) => {
  const toothType = getToothType(toothNumber);
  const archType = getArchType(toothNumber);

  const commonProps = {
    toothNumber,
    conditions,
    isSelected,
    onClick,
    archType,
  };

  const renderTooth = () => {
    switch (toothType) {
      case 'incisor':
        return <IncisorTooth {...commonProps} />;
      case 'canine':
        return <CanineTooth {...commonProps} />;
      case 'premolar':
        return <PremolarTooth {...commonProps} />;
      case 'molar':
        return <MolarTooth {...commonProps} />;
      default:
        return <IncisorTooth {...commonProps} />;
    }
  };

  return (
    <div
      style={{
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: `rotate(${position.rotation}deg)`,
        transformOrigin: 'center center',
      }}
      className="tooth-wrapper"
    >
      {renderTooth()}
    </div>
  );
};
