import React from 'react';
import { DeviceType, LayoutConfig } from '../../types/layout';

interface CreativeHeadlineProps {
  headline: string;
  config: LayoutConfig;
  device: DeviceType;
  className?: string;
}

export const CreativeHeadline: React.FC<CreativeHeadlineProps> = ({
  headline,
  config,
  device,
  className = ''
}) => {
  const { typography, theme } = config;

  const getFontSize = () => {
    switch (typography.headlineScale) {
      case 'heroic':
        if (device === 'mobile') return 'text-2xl sm:text-3xl leading-tight';
        if (device === 'tablet') return 'text-3xl lg:text-4xl leading-tight';
        return 'text-4xl lg:text-5xl leading-tight';
      case 'large':
        if (device === 'mobile') return 'text-xl sm:text-2xl leading-tight';
        if (device === 'tablet') return 'text-2xl lg:text-3xl leading-snug';
        return 'text-3xl lg:text-4xl leading-tight';
      case 'standard':
        if (device === 'mobile') return 'text-lg sm:text-xl leading-snug';
        if (device === 'tablet') return 'text-xl lg:text-2xl leading-snug';
        return 'text-2xl lg:text-3xl leading-snug';
      case 'compact':
      default:
        if (device === 'mobile') return 'text-base sm:text-lg leading-snug';
        if (device === 'tablet') return 'text-lg leading-snug';
        return 'text-xl leading-snug';
    }
  };

  const getFontWeight = () => {
    switch (typography.headlineFontWeight) {
      case 'black':
        return 'font-black';
      case 'extrabold':
        return 'font-extrabold';
      case 'semibold':
        return 'font-semibold';
      case 'bold':
      default:
        return 'font-bold';
    }
  };

  const getLetterSpacing = () => {
    switch (typography.letterSpacing) {
      case 'tight':
        return 'tracking-tighter';
      case 'wide':
        return 'tracking-widest uppercase';
      case 'normal':
      default:
        return 'tracking-tight';
    }
  };

  const getTextTransform = () => {
    switch (typography.textTransform) {
      case 'uppercase':
        return 'uppercase';
      case 'capitalize':
        return 'capitalize';
      case 'none':
      default:
        return 'normal-case';
    }
  };

  const getFontFamily = () => {
    switch (theme.fontFamily) {
      case 'serif':
        return 'font-serif';
      case 'mono':
        return 'font-mono';
      case 'display':
        return 'font-display tracking-tight';
      case 'sans':
      default:
        return 'font-sans';
    }
  };

  return (
    <h1
      className={`${getFontSize()} ${getFontWeight()} ${getLetterSpacing()} ${getTextTransform()} ${getFontFamily()} break-words max-w-full overflow-visible transition-all duration-200 ${className}`}
      style={{ color: theme.textColor }}
    >
      {headline}
    </h1>
  );
};
