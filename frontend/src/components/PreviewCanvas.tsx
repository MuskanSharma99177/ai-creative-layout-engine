import React, { useState, useEffect, useRef } from 'react';
import { Smartphone, Tablet, Monitor, Sparkles } from 'lucide-react';
import { CreativeInput, DeviceType, LayoutConfig } from '../types/layout';
import { DEVICE_PRESETS } from '../constants/presets';
import { CreativeRenderer } from '../renderer/CreativeRenderer';

interface PreviewCanvasProps {
  input: CreativeInput;
  layoutConfig: LayoutConfig;
  currentDevice: DeviceType;
  zoomLevel: number;
  canvasRef: React.RefObject<HTMLDivElement>;
  engineMode: 'ai-openai' | 'deterministic-fallback';
}

export const PreviewCanvas: React.FC<PreviewCanvasProps> = ({
  input,
  layoutConfig,
  currentDevice,
  zoomLevel,
  canvasRef,
  engineMode
}) => {
  const currentSpec = DEVICE_PRESETS.find((d) => d.id === currentDevice) || DEVICE_PRESETS[0];
  const stageRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState<{ width: number; height: number }>({
    width: 900,
    height: 600
  });

  // Track stage dimensions for responsive scaling
  useEffect(() => {
    const updateSize = () => {
      if (stageRef.current) {
        setContainerSize({
          width: stageRef.current.clientWidth,
          height: stageRef.current.clientHeight
        });
      }
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    if (stageRef.current) {
      observer.observe(stageRef.current);
    }
    return () => observer.disconnect();
  }, []);

  const bezelPad = currentDevice === 'mobile' ? 24 : currentDevice === 'tablet' ? 24 : 16;
  const fullWidth = currentSpec.width + bezelPad;
  const fullHeight = currentSpec.height + bezelPad;

  // Compute fit scale to prevent desktop clipping
  const availableWidth = Math.max(320, containerSize.width - 48);
  const availableHeight = Math.max(300, containerSize.height - 48);

  const autoFitScale = Math.min(
    1,
    Math.min(availableWidth / fullWidth, availableHeight / fullHeight)
  );

  // If manual zoomLevel would cause clipping on current screen, safely constrain or scale
  const effectiveZoom = zoomLevel > 0 ? Math.min(zoomLevel, autoFitScale > 0.4 ? 1.5 : 1) : autoFitScale;
  // If the device is desktop and zoomLevel exceeds available space, clamp to autoFit
  const safeZoom = Math.min(effectiveZoom, Math.max(autoFitScale, 0.45));

  const scaledWidth = Math.round(fullWidth * safeZoom);
  const scaledHeight = Math.round(fullHeight * safeZoom);

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
    <main className="flex-1 bg-slate-950 flex flex-col items-center justify-between p-3 sm:p-5 overflow-auto relative select-none min-w-0 min-h-0">
      {/* Viewport Meta Bar */}
      <div className="flex items-center gap-3 px-4 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs text-slate-300 shadow-md mb-2 z-10">
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
        <span className="w-1 h-1 rounded-full bg-slate-700" />
        <span className="text-[10px] text-slate-400 font-mono">
          Scale: {Math.round(safeZoom * 100)}%
        </span>
      </div>

      {/* Scaled Canvas Stage Area */}
      <div
        ref={stageRef}
        className="flex-1 w-full flex items-center justify-center overflow-auto p-2 min-h-0 min-w-0"
      >
        {/* Outer Box Model Wrapper: Has exact layout dimensions so flexbox centers without clipping */}
        <div
          style={{
            width: `${scaledWidth}px`,
            height: `${scaledHeight}px`
          }}
          className="relative m-auto flex-shrink-0 transition-all duration-200"
        >
          {/* Inner Scaled Frame: transform-origin top left */}
          <div
            style={{
              width: `${fullWidth}px`,
              height: `${fullHeight}px`,
              transform: `scale(${safeZoom})`,
              transformOrigin: 'top left'
            }}
            className="absolute top-0 left-0"
          >
            {/* Hardware Device Bezel Frame */}
            <div
              className={`relative bg-slate-900 shadow-2xl overflow-hidden ${
                currentDevice === 'mobile'
                  ? 'rounded-[44px] p-3 ring-8 ring-slate-800/80'
                  : currentDevice === 'tablet'
                  ? 'rounded-[28px] p-3 ring-8 ring-slate-800/80'
                  : 'rounded-xl p-2 ring-4 ring-slate-800/80'
              }`}
              style={{
                width: `${fullWidth}px`,
                height: `${fullHeight}px`
              }}
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
      </div>

      {/* Surface Status Footer */}
      <div className="mt-2 text-[11px] text-slate-400 flex flex-wrap items-center justify-center gap-2 sm:gap-4 px-4">
        <span className="flex items-center gap-1 font-semibold">
          {engineMode === 'ai-openai' ? (
            <span className="text-emerald-300 flex items-center gap-1 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
              ✨ Generated by OpenAI
            </span>
          ) : (
            <span className="text-amber-300 flex items-center gap-1 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60">
              ⚙️ Generated by Deterministic Fallback Engine
            </span>
          )}
        </span>
        <span>•</span>
        <span>Layout: <strong className="text-slate-300 font-semibold">{layoutConfig.layoutType}</strong></span>
        <span>•</span>
        <span>Emphasis: <strong className="text-slate-300 font-semibold">{layoutConfig.composition.visualEmphasis}</strong></span>
        <span>•</span>
        <span>Typography: <strong className="text-slate-300 font-semibold">{layoutConfig.typography.headlineScale} ({layoutConfig.theme.fontFamily})</strong></span>
      </div>
    </main>
  );
};
