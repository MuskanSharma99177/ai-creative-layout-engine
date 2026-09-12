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

export const SplitScreenTemplate: React.FC<TemplateProps> = ({ input, config, device }) => {
  const isMobile = device === 'mobile';
  const { theme } = config;

  return (
    <div
      className={`w-full h-full flex ${
        isMobile ? 'flex-col' : 'flex-row'
      } overflow-hidden`}
    >
      {/* Brand Color Block with Copy */}
      <div
        className={`w-full ${
          isMobile ? 'h-3/5 p-6' : 'w-1/2 p-12'
        } flex flex-col justify-between relative`}
        style={{ backgroundColor: theme.primaryColor }}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            {input.brandName && (
              <span className="text-xs font-black tracking-widest uppercase text-white/80">
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
              theme: { ...config.theme, textColor: '#FFFFFF' }
            }}
            device={device}
          />

          <CreativeDescription
            description={input.description}
            config={{
              ...config,
              theme: { ...config.theme, textColor: '#E2E8F0' }
            }}
            device={device}
            className="max-w-md"
          />
        </div>

        <div className="pt-4">
          <CreativeCTA
            cta={input.cta}
            config={{
              ...config,
              composition: { ...config.composition, ctaStyle: 'pill' }
            }}
            device={device}
          />
        </div>
      </div>

      {/* Visual Image Block */}
      <div
        className={`w-full ${
          isMobile ? 'h-2/5' : 'w-1/2'
        } relative overflow-hidden bg-slate-900 flex items-center justify-center`}
      >
        <CreativeMedia
          imageUrl={input.imageUrl}
          productName={input.productName}
          config={config}
          device={device}
          className="w-full h-full rounded-none"
        />
      </div>
    </div>
  );
};
