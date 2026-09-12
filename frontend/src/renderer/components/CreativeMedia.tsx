import React from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { DeviceType, LayoutConfig } from '../../types/layout';

interface CreativeMediaProps {
  imageUrl?: string;
  productName: string;
  config: LayoutConfig;
  device: DeviceType;
  className?: string;
  aspectClass?: string;
}

export const CreativeMedia: React.FC<CreativeMediaProps> = ({
  imageUrl,
  productName,
  config,
  className = '',
  aspectClass = ''
}) => {
  const { composition, theme } = config;
  const isEmphasized = composition.visualEmphasis === 'product-image';

  const getObjectFit = () => {
    switch (composition.imageFit) {
      case 'contain':
        return 'object-contain';
      case 'fill':
        return 'object-fill';
      case 'cover':
      default:
        return 'object-cover';
    }
  };

  if (!imageUrl) {
    return (
      <div
        className={`w-full h-full flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed transition-all ${aspectClass} ${className}`}
        style={{
          borderColor: theme.secondaryColor,
          backgroundColor: `${theme.primaryColor}0D`
        }}
      >
        <ImageIcon className="w-12 h-12 mb-2 opacity-40" style={{ color: theme.primaryColor }} />
        <span className="text-xs font-medium uppercase tracking-wider opacity-60" style={{ color: theme.textColor }}>
          {productName || 'Product Visual'}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`relative w-full h-full overflow-hidden rounded-2xl group transition-transform duration-300 ${
        isEmphasized ? 'ring-2 ring-offset-2 shadow-2xl' : 'shadow-lg'
      } ${aspectClass} ${className}`}
      style={{
        outlineColor: isEmphasized ? theme.accentColor : 'transparent'
      }}
    >
      <img
        src={imageUrl}
        alt={productName}
        className={`w-full h-full ${getObjectFit()} transition-transform duration-500 group-hover:scale-105`}
        loading="eager"
      />
      {/* Subtle shine / gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
    </div>
  );
};
