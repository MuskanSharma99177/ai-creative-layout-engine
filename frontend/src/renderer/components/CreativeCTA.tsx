import React from 'react';
import { ArrowRight } from 'lucide-react';
import { DeviceType, LayoutConfig } from '../../types/layout';

interface CreativeCTAProps {
  cta: string;
  config: LayoutConfig;
  device: DeviceType;
  className?: string;
}

export const CreativeCTA: React.FC<CreativeCTAProps> = ({
  cta,
  config,
  device,
  className = ''
}) => {
  if (!cta || !cta.trim()) return null;

  const { theme, composition, responsiveRules } = config;
  const isMobile = device === 'mobile';
  const fullWidth = isMobile && responsiveRules.mobile.ctaFullWidth;

  const getStyleClasses = () => {
    switch (composition.ctaStyle) {
      case 'pill':
        return 'rounded-full px-7 py-3';
      case 'outline':
        return 'rounded-lg px-6 py-2.5 border-2 bg-transparent';
      case 'gradient':
        return 'rounded-xl px-7 py-3 shadow-lg hover:shadow-xl';
      case 'solid':
      default:
        return 'rounded-xl px-6 py-3 shadow-md hover:shadow-lg';
    }
  };

  const getCustomStyles = (): React.CSSProperties => {
    if (composition.ctaStyle === 'outline') {
      return {
        borderColor: theme.primaryColor,
        color: theme.primaryColor
      };
    }
    if (composition.ctaStyle === 'gradient') {
      return {
        background: `linear-gradient(135deg, ${theme.primaryColor} 0%, ${theme.accentColor} 100%)`,
        color: '#FFFFFF'
      };
    }
    // Solid default
    return {
      backgroundColor: theme.primaryColor,
      color: '#FFFFFF'
    };
  };

  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-2 font-semibold text-sm tracking-wide transition-all duration-200 active:scale-95 ${
        fullWidth ? 'w-full py-3.5 text-base' : 'w-auto'
      } ${getStyleClasses()} ${className}`}
      style={getCustomStyles()}
    >
      <span>{cta}</span>
      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
    </button>
  );
};
