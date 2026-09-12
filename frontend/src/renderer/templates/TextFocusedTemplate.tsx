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

export const TextFocusedTemplate: React.FC<TemplateProps> = ({ input, config, device }) => {
  const isMobile = device === 'mobile';
  const isTablet = device === 'tablet';
  const { theme } = config;

  return (
    <div
      className={`w-full h-full flex ${
        isMobile ? 'flex-col' : 'flex-row'
      } items-center justify-between ${
        isMobile ? 'p-6' : isTablet ? 'p-10' : 'p-14'
      } overflow-hidden`}
      style={{ backgroundColor: theme.backgroundColor }}
    >
      {/* Primary Text Content (65% width on desktop) */}
      <div
        className={`w-full ${
          isMobile ? 'flex-1' : 'w-[62%]'
        } flex flex-col justify-between space-y-5`}
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            {input.brandName && (
              <span
                className="text-xs font-bold tracking-widest uppercase"
                style={{ color: theme.primaryColor }}
              >
                {input.brandName}
              </span>
            )}
            {config.composition.hasBadge && (
              <CreativeBadge badgeText={input.badgeText || ''} config={config} />
            )}
          </div>

          <CreativeHeadline
            headline={input.headline}
            config={{
              ...config,
              typography: {
                ...config.typography,
                headlineScale: config.typography.headlineScale === 'compact' ? 'standard' : config.typography.headlineScale
              }
            }}
            device={device}
          />

          <CreativeDescription
            description={input.description}
            config={config}
            device={device}
            className="max-w-xl text-base"
          />
        </div>

        <div className="pt-2">
          <CreativeCTA cta={input.cta} config={config} device={device} />
        </div>
      </div>

      {/* Secondary Visual Accent (35% width on desktop) */}
      <div
        className={`w-full ${
          isMobile ? 'h-[170px] mt-4' : 'w-[34%] h-full max-h-[380px]'
        } flex items-center justify-center`}
      >
        <CreativeMedia
          imageUrl={input.imageUrl}
          productName={input.productName}
          config={config}
          device={device}
          className="h-full rounded-2xl shadow-xl"
        />
      </div>
    </div>
  );
};
