import React from 'react';
import { Smartphone, Tablet, Monitor } from 'lucide-react';
import { CreativeInput, DeviceType, LayoutConfig } from '../types/layout';
import { DEVICE_PRESETS } from '../constants/presets';
import { CreativeRenderer } from '../renderer/CreativeRenderer';

interface PreviewCanvasProps {
  input: CreativeInput;
  layoutConfig: LayoutConfig;
  currentDevice: DeviceType;
  zoomLevel: number;
  canvasRef: React.RefObject<HTMLDivElement>;
}

export const PreviewCanvas: React.FC<PreviewCanvasProps> = ({
  input,
  layoutConfig,
  currentDevice,
  zoomLevel,
  canvasRef
}) => {
  const currentSpec = DEVICE_PRESETS.find((d) => d.id === currentDevice) || DEVICE_PRESETS[0];

  const getDeviceIcon = () => {
    switch (currentDevice) {
      case 'mobile':
        return <Smartphone className="w-4 h-4 text-purple-400" />;
      case 'tablet':
        return <Tablet className="w-4 h-4 text-purple-400" />;
      case 'desktop':
      default:
        return <Monitor className="w-4 h-4 text-purple-400" />;
    }
  };

  return (
    <main className="flex-1 bg-slate-950 flex flex-col items-center justify-between p-4 lg:p-6 overflow-auto relative select-none">
      {/* Viewport Meta Bar */}
      <div className="flex items-center gap-3 px-4 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs text-slate-300 shadow-md mb-3 z-10">
        <div className="flex items-center gap-1.5 font-medium">
          {getDeviceIcon()}
          <span>{currentSpec.label} Surface</span>
        </div>
        <span className="w-1 h-1 rounded-full bg-slate-700" />
        <span className="font-mono text-[11px] text-purple-400">
          {currentSpec.width} × {currentSpec.height} px
        </span>
        <span className="w-1 h-1 rounded-full bg-slate-700" />
        <span className="text-[11px] text-slate-400">{currentSpec.aspectRatio}</span>
      </div>

      {/* Scaled Canvas Container */}
      <div className="flex-1 flex items-center justify-center w-full min-h-[500px]">
        <div
          style={{
            transform: `scale(${zoomLevel})`,
            transformOrigin: 'center center',
            transition: 'transform 0.15s ease-out'
          }}
          className="relative transition-all duration-300"
        >
          {/* Hardware Device Bezel Frame */}
          <div
            className={`relative bg-slate-900 shadow-2xl transition-all duration-300 overflow-hidden ${
              currentDevice === 'mobile'
                ? 'rounded-[44px] p-3 ring-8 ring-slate-800/80'
                : currentDevice === 'tablet'
                ? 'rounded-[28px] p-3 ring-8 ring-slate-800/80'
                : 'rounded-xl p-2 ring-4 ring-slate-800/80'
            }`}
          >
            {/* Mobile Dynamic Island / Camera Notch */}
            {currentDevice === 'mobile' && (
              <div className="absolute top-5 left-1/2 -translate-x-1/2 w-24 h-4 bg-slate-950 rounded-full z-20 pointer-events-none" />
            )}

            {/* Inner Screen Surface */}
            <div
              ref={canvasRef}
              style={{
                width: `${currentSpec.width}px`,
                height: `${currentSpec.height}px`
              }}
              className={`relative overflow-hidden bg-white shadow-inner ${
                currentDevice === 'mobile'
                  ? 'rounded-[34px]'
                  : currentDevice === 'tablet'
                  ? 'rounded-[20px]'
                  : 'rounded-lg'
              }`}
            >
              <CreativeRenderer input={input} config={layoutConfig} device={currentDevice} />
            </div>
          </div>
        </div>
      </div>

      {/* Surface Status Footer */}
      <div className="mt-3 text-[11px] text-slate-400 flex items-center gap-4">
        <span>Structural Layout: <strong className="text-slate-300 font-semibold">{layoutConfig.layoutType}</strong></span>
        <span>•</span>
        <span>Visual Emphasis: <strong className="text-slate-300 font-semibold">{layoutConfig.composition.visualEmphasis}</strong></span>
        <span>•</span>
        <span>Typography: <strong className="text-slate-300 font-semibold">{layoutConfig.typography.headlineScale} ({layoutConfig.theme.fontFamily})</strong></span>
      </div>
    </main>
  );
};
