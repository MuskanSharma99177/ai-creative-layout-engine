import React from 'react';
import { CreativeInput, DeviceType, LayoutConfig } from '../../types/layout';
import { CreativeBadge } from '../components/CreativeBadge';
import { CreativeHeadline } from '../components/CreativeHeadline';
import { CreativeDescription } from '../components/CreativeDescription';
import { CreativeCTA } from '../components/CreativeCTA';

interface TemplateProps {
  input: CreativeInput;
  config: LayoutConfig;
  device: DeviceType;
}

export const FullBackgroundImageTemplate: React.FC<TemplateProps> = ({ input, config, device }) => {
  const isMobile = device === 'mobile';
  const { theme, composition } = config;

  return (
    <div className="relative w-full h-full overflow-hidden flex flex-col justify-end">
      {/* Background Image Layer */}
      {input.imageUrl ? (
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
          style={{ backgroundImage: `url(${input.imageUrl})` }}
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle at top right, ${theme.accentColor} 0%, ${theme.primaryColor} 100%)`
          }}
        />
      )}

      {/* Dynamic Dark Gradient Backdrop for contrast */}
      <div
        className="absolute inset-0"
        style={{
          background: isMobile
            ? 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0.2) 100%)'
            : 'linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.5) 60%, rgba(0,0,0,0.2) 100%)'
        }}
      />

      {/* Floating Glass Content Card */}
      <div
        className={`relative z-10 ${
          isMobile ? 'p-6 m-4' : 'p-10 m-10 max-w-xl'
        } rounded-3xl backdrop-blur-md border shadow-2xl transition-all`}
        style={{
          backgroundColor: isMobile ? 'rgba(15, 23, 42, 0.75)' : theme.cardBackground || 'rgba(15, 23, 42, 0.65)',
          borderColor: 'rgba(255, 255, 255, 0.15)'
        }}
      >
        <div className="space-y-3">
          {input.brandName && (
            <span className="text-xs font-bold tracking-widest uppercase text-white/70 block">
              {input.brandName}
            </span>
          )}

          {config.composition.hasBadge && (
            <CreativeBadge badgeText={input.badgeText || ''} config={config} />
          )}

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
          />

          <div className="pt-2">
            <CreativeCTA cta={input.cta} config={config} device={device} />
          </div>
        </div>
      </div>
    </div>
  );
};
