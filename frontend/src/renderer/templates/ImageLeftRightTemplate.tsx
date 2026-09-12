import React from 'react';
import { CreativeInput, DeviceType, LayoutConfig } from '../../types/layout';
import { CreativeBadge } from '../components/CreativeBadge';
import { CreativeHeadline } from '../components/CreativeHeadline';
import { CreativeDescription } from '../components/CreativeDescription';
import { CreativeCTA } from '../components/CreativeCTA';
import { CreativeMedia } from '../components/CreativeMedia';

interface TemplateProps {
  input: CreativeInput;
  config: LayoutConfig;
  device: DeviceType;
}

export const ImageLeftRightTemplate: React.FC<TemplateProps> = ({ input, config, device }) => {
  const isRightImage = config.layoutType === 'image-right-content-left';
  const isMobile = device === 'mobile';
  const isTablet = device === 'tablet';

  const { theme, composition } = config;
  const paddingClass = isMobile ? 'p-5' : isTablet ? 'p-8' : 'p-12';
  const gapClass = isMobile ? 'gap-4' : isTablet ? 'gap-6' : 'gap-10';

  // Structural shifts per device
  const flexDirection = isMobile
    ? 'flex-col'
    : isRightImage
    ? 'flex-row-reverse'
    : 'flex-row';

  return (
    <div
      className={`w-full h-full flex ${flexDirection} ${paddingClass} ${gapClass} items-center justify-between overflow-hidden relative`}
      style={{ backgroundColor: theme.backgroundColor }}
    >
      {/* Media Element */}
      <div
        className={`w-full ${
          isMobile
            ? 'h-[230px] flex-shrink-0'
            : isTablet
            ? 'w-1/2 h-full'
            : 'w-1/2 h-full'
        } flex items-center justify-center`}
      >
        <CreativeMedia
          imageUrl={input.imageUrl}
          productName={input.productName}
          config={config}
          device={device}
          className="h-full max-h-[460px]"
        />
      </div>

      {/* Content Element */}
      <div
        className={`w-full ${
          isMobile ? 'flex-1 justify-between' : 'w-1/2'
        } flex flex-col justify-center ${
          composition.alignment === 'center' ? 'items-center text-center' : 'items-start text-left'
        }`}
      >
        <div className="space-y-3 w-full">
          {input.brandName && (
            <span
              className="text-xs font-bold tracking-widest uppercase opacity-70 block"
              style={{ color: theme.primaryColor }}
            >
              {input.brandName}
            </span>
          )}

          {config.composition.hasBadge && (
            <CreativeBadge badgeText={input.badgeText || ''} config={config} />
          )}

          <CreativeHeadline headline={input.headline} config={config} device={device} />

          <CreativeDescription
            description={input.description}
            config={config}
            device={device}
            className="max-w-xl"
          />
        </div>

        <div className={`mt-6 w-full ${isMobile ? 'pt-2' : ''}`}>
          <CreativeCTA cta={input.cta} config={config} device={device} />
        </div>
      </div>
    </div>
  );
};
