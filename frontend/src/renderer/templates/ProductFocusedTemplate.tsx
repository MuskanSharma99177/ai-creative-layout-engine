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

export const ProductFocusedTemplate: React.FC<TemplateProps> = ({ input, config, device }) => {
  const isMobile = device === 'mobile';
  const { theme } = config;

  return (
    <div
      className={`w-full h-full flex ${
        isMobile ? 'flex-col' : 'flex-row'
      } overflow-hidden relative`}
      style={{ backgroundColor: theme.backgroundColor }}
    >
      {/* 65% Hero Visual Area */}
      <div
        className={`w-full ${
          isMobile ? 'h-[58%]' : 'w-[65%]'
        } relative p-4 flex items-center justify-center bg-gradient-to-br from-black/5 to-transparent`}
      >
        <CreativeMedia
          imageUrl={input.imageUrl}
          productName={input.productName}
          config={config}
          device={device}
          className="w-full h-full max-h-[500px]"
        />

        {/* Floating badge over image */}
        {config.composition.hasBadge && (
          <div className="absolute top-6 left-6 z-10 shadow-lg">
            <CreativeBadge badgeText={input.badgeText || ''} config={config} />
          </div>
        )}
      </div>

      {/* 35% Sidebar Action Area */}
      <div
        className={`w-full ${
          isMobile ? 'h-[42%] p-5' : 'w-[35%] p-8'
        } flex flex-col justify-between border-l border-black/5`}
      >
        <div className="space-y-3">
          {input.brandName && (
            <span
              className="text-xs font-black tracking-widest uppercase opacity-70 block"
              style={{ color: theme.primaryColor }}
            >
              {input.brandName}
            </span>
          )}

          <CreativeHeadline headline={input.headline} config={config} device={device} />

          <CreativeDescription
            description={input.description}
            config={config}
            device={device}
            className="line-clamp-3"
          />
        </div>

        <div className="pt-3">
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
    </div>
  );
};
