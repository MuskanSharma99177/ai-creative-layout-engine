import React from 'react';
import { DeviceType, LayoutConfig } from '../../types/layout';

interface CreativeDescriptionProps {
  description: string;
  config: LayoutConfig;
  device: DeviceType;
  className?: string;
}

export const CreativeDescription: React.FC<CreativeDescriptionProps> = ({
  description,
  config,
  device,
  className = ''
}) => {
  const { typography, theme } = config;

  const getSize = () => {
    switch (typography.bodyScale) {
      case 'large':
        return device === 'mobile' ? 'text-sm sm:text-base leading-relaxed' : 'text-base lg:text-lg leading-relaxed';
      case 'small':
        return 'text-xs sm:text-sm leading-relaxed';
      case 'medium':
      default:
        return device === 'mobile' ? 'text-xs sm:text-sm leading-relaxed' : 'text-sm sm:text-base leading-relaxed';
    }
  };

  return (
    <p
      className={`${getSize()} transition-colors ${className}`}
      style={{
        color: theme.textColor,
        opacity: 0.85
      }}
    >
      {description}
    </p>
  );
};
