import React from 'react';
import { CreativeInput, DeviceType, LayoutConfig } from '../types/layout';
import { ImageLeftRightTemplate } from './templates/ImageLeftRightTemplate';
import { CenteredProductTemplate } from './templates/CenteredProductTemplate';
import { FullBackgroundImageTemplate } from './templates/FullBackgroundImageTemplate';
import { SplitScreenTemplate } from './templates/SplitScreenTemplate';
import { MinimalEditorialTemplate } from './templates/MinimalEditorialTemplate';
import { ProductFocusedTemplate } from './templates/ProductFocusedTemplate';
import { TextFocusedTemplate } from './templates/TextFocusedTemplate';

interface CreativeRendererProps {
  input: CreativeInput;
  config: LayoutConfig;
  device: DeviceType;
  className?: string;
  forwardRef?: React.RefObject<HTMLDivElement>;
}

export const CreativeRenderer: React.FC<CreativeRendererProps> = ({
  input,
  config,
  device,
  className = '',
  forwardRef
}) => {
  const renderTemplate = () => {
    switch (config.layoutType) {
      case 'image-left-content-right':
      case 'image-right-content-left':
        return <ImageLeftRightTemplate input={input} config={config} device={device} />;
      case 'centered-product':
        return <CenteredProductTemplate input={input} config={config} device={device} />;
      case 'full-background-image':
        return <FullBackgroundImageTemplate input={input} config={config} device={device} />;
      case 'split-screen':
        return <SplitScreenTemplate input={input} config={config} device={device} />;
      case 'minimal-editorial':
        return <MinimalEditorialTemplate input={input} config={config} device={device} />;
      case 'product-focused':
        return <ProductFocusedTemplate input={input} config={config} device={device} />;
      case 'text-focused':
        return <TextFocusedTemplate input={input} config={config} device={device} />;
      default:
        return <ImageLeftRightTemplate input={input} config={config} device={device} />;
    }
  };

  return (
    <div
      ref={forwardRef}
      className={`relative w-full h-full select-none overflow-hidden transition-all duration-300 ${className}`}
      data-layout-type={config.layoutType}
      data-device-surface={device}
    >
      {renderTemplate()}
    </div>
  );
};
