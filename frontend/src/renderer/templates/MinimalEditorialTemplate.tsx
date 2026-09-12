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

export const MinimalEditorialTemplate: React.FC<TemplateProps> = ({ input, config, device }) => {
  const isMobile = device === 'mobile';
  const { theme } = config;

  return (
    <div
      className="w-full h-full p-4 sm:p-6 lg:p-8 flex items-center justify-center overflow-hidden"
      style={{ backgroundColor: theme.backgroundColor }}
    >
      {/* Editorial Frame Border */}
      <div
        className={`w-full h-full border border-stone-300/80 rounded-2xl flex ${
          isMobile ? 'flex-col p-5' : 'flex-row p-10'
        } items-center justify-between gap-6 relative shadow-sm`}
      >
        {/* Left Editorial Copy */}
        <div
          className={`w-full ${
            isMobile ? 'order-2 flex-1 justify-between' : 'w-1/2 order-1'
          } flex flex-col justify-center space-y-4`}
        >
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              {input.brandName && (
                <span className="text-[11px] font-semibold tracking-[0.25em] uppercase opacity-70">
                  {input.brandName}
                </span>
              )}
              {config.composition.hasBadge && (
                <CreativeBadge badgeText={input.badgeText || ''} config={config} />
              )}
            </div>

            <div className="w-8 h-[1.5px] bg-stone-400 my-2" />

            <CreativeHeadline
              headline={input.headline}
              config={{
                ...config,
                theme: { ...config.theme, fontFamily: 'serif' }
              }}
              device={device}
            />

            <CreativeDescription
              description={input.description}
              config={config}
              device={device}
              className="max-w-md font-serif italic text-stone-600"
            />
          </div>

          <div className="pt-4">
            <CreativeCTA
              cta={input.cta}
              config={{
                ...config,
                composition: { ...config.composition, ctaStyle: 'outline' }
              }}
              device={device}
            />
          </div>
        </div>

        {/* Right Subtle Framed Media */}
        <div
          className={`w-full ${
            isMobile ? 'order-1 h-[210px]' : 'w-1/2 h-full order-2'
          } flex items-center justify-center p-2`}
        >
          <CreativeMedia
            imageUrl={input.imageUrl}
            productName={input.productName}
            config={config}
            device={device}
            className="h-full max-h-[420px] rounded-xl shadow-md"
          />
        </div>
      </div>
    </div>
  );
};
