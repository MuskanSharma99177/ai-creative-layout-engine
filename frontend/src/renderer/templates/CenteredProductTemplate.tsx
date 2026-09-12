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

export const CenteredProductTemplate: React.FC<TemplateProps> = ({ input, config, device }) => {
  const isMobile = device === 'mobile';
  const isTablet = device === 'tablet';
  const { theme } = config;

  const paddingClass = isMobile ? 'p-5' : isTablet ? 'p-8' : 'p-10';

  return (
    <div
      className={`w-full h-full flex flex-col items-center justify-between ${paddingClass} text-center overflow-hidden relative`}
      style={{ backgroundColor: theme.backgroundColor }}
    >
      {/* Top Header Region */}
      <div className="w-full max-w-2xl flex flex-col items-center space-y-2 z-10">
        {config.composition.hasBadge && (
          <CreativeBadge badgeText={input.badgeText || ''} config={config} className="mb-1" />
        )}
        <CreativeHeadline headline={input.headline} config={config} device={device} />
      </div>

      {/* Center Image Region */}
      <div
        className={`w-full ${
          isMobile ? 'h-[220px] my-3' : isTablet ? 'h-[240px] my-4' : 'h-[260px] my-4'
        } max-w-lg flex items-center justify-center`}
      >
        <CreativeMedia
          imageUrl={input.imageUrl}
          productName={input.productName}
          config={config}
          device={device}
          className="h-full"
        />
      </div>

      {/* Bottom Action & Copy Region */}
      <div className="w-full max-w-md flex flex-col items-center space-y-4 z-10">
        <CreativeDescription
          description={input.description}
          config={config}
          device={device}
          className="line-clamp-2"
        />
        <CreativeCTA cta={input.cta} config={config} device={device} />
      </div>
    </div>
  );
};
