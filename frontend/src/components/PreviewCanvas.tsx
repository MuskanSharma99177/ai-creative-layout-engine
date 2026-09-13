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
  viewMode?: 'single' | 'matrix';
  onSelectDevice?: (device: DeviceType) => void;
}

export const PreviewCanvas: React.FC<PreviewCanvasProps> = ({
  input,
  layoutConfig,
  currentDevice,
  zoomLevel,
  canvasRef,
  engineMode,
  viewMode = 'single',
  onSelectDevice
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

  const effectiveZoom = zoomLevel > 0 ? Math.min(zoomLevel, autoFitScale > 0.4 ? 1.5 : 1) : autoFitScale;
  const safeZoom = Math.min(effectiveZoom, Math.max(autoFitScale, 0.45));

  const scaledWidth = Math.round(fullWidth * safeZoom);
  const scaledHeight = Math.round(fullHeight * safeZoom);

  const getDeviceIcon = (device: DeviceType) => {
    switch (device) {
      case 'mobile':
        return <Smartphone className="w-3.5 h-3.5 text-purple-400" />;
      case 'tablet':
        return <Tablet className="w-3.5 h-3.5 text-purple-400" />;
      case 'desktop':
      default:
        return <Monitor className="w-3.5 h-3.5 text-purple-400" />;
    }
  };

  return (
    <main className="flex-1 bg-slate-950 flex flex-col items-center justify-between p-3 sm:p-5 overflow-auto relative select-none min-w-0 min-h-0">
      {/* Ambient Lighting Backglow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center opacity-20 transition-all duration-700">
        <div
          className="w-[700px] h-[700px] rounded-full blur-[140px]"
          style={{ backgroundColor: layoutConfig.theme.primaryColor || '#6366f1' }}
        />
        <div
          className="w-[500px] h-[500px] rounded-full blur-[120px] -ml-40"
          style={{ backgroundColor: layoutConfig.theme.secondaryColor || '#38bdf8' }}
        />
      </div>

      {/* Viewport Meta HUD Bar */}
      <div className="flex items-center gap-3 px-4 py-1.5 rounded-full bg-slate-900/90 backdrop-blur-md border border-slate-800 text-xs text-slate-300 shadow-md mb-2 z-10">
        {viewMode === 'matrix' ? (
          <div className="flex items-center gap-2 font-medium text-cyan-300">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>Multi-Surface Matrix View</span>
            <span className="text-[10px] text-slate-400">(Mobile, Tablet & Desktop Side-by-Side)</span>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-1.5 font-medium">
              {getDeviceIcon(currentDevice)}
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
          </>
        )}
      </div>

      {/* Center Canvas Stage */}
      {viewMode === 'matrix' ? (
        /* Multi-Surface Side-by-Side Comparison Matrix */
        <div
          ref={stageRef}
          className="flex-1 w-full flex items-center justify-start xl:justify-center overflow-x-auto overflow-y-hidden p-4 min-h-0 min-w-0 custom-scrollbar gap-8 z-10"
        >
          {DEVICE_PRESETS.map((spec) => {
            const isSelected = spec.id === currentDevice;
            const matrixScale = spec.id === 'mobile' ? 0.68 : spec.id === 'tablet' ? 0.52 : 0.44;
            const mBezel = spec.id === 'mobile' ? 24 : spec.id === 'tablet' ? 24 : 16;
            const mFullWidth = spec.width + mBezel;
            const mFullHeight = spec.height + mBezel;
            const mScaledWidth = Math.round(mFullWidth * matrixScale);
            const mScaledHeight = Math.round(mFullHeight * matrixScale);

            return (
              <div
                key={spec.id}
                onClick={() => onSelectDevice && onSelectDevice(spec.id)}
                className={`flex flex-col items-center flex-shrink-0 cursor-pointer group transition-transform ${
                  isSelected ? 'scale-[1.02]' : 'opacity-85 hover:opacity-100'
                }`}
              >
                {/* Surface Label Badge */}
                <div className="flex items-center justify-between w-full mb-2 px-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
                    {getDeviceIcon(spec.id)}
                    <span>{spec.label}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">
                    {spec.width}×{spec.height}
                  </span>
                </div>

                {/* Scaled Frame Box */}
                <div
                  style={{ width: `${mScaledWidth}px`, height: `${mScaledHeight}px` }}
                  className="relative flex-shrink-0 transition-all"
                >
                  <div
                    style={{
                      width: `${mFullWidth}px`,
                      height: `${mFullHeight}px`,
                      transform: `scale(${matrixScale})`,
                      transformOrigin: 'top left'
                    }}
                    className="absolute top-0 left-0"
                  >
                    <div
                      className={`relative bg-slate-900 shadow-2xl overflow-hidden ${
                        isSelected ? 'ring-4 ring-indigo-500 shadow-indigo-500/20' : 'ring-2 ring-slate-800'
                      } ${
                        spec.id === 'mobile'
                          ? 'rounded-[44px] p-3'
                          : spec.id === 'tablet'
                          ? 'rounded-[28px] p-3'
                          : 'rounded-xl p-2'
                      }`}
                      style={{ width: `${mFullWidth}px`, height: `${mFullHeight}px` }}
                    >
                      {spec.id === 'mobile' && (
                        <div className="absolute top-5 left-1/2 -translate-x-1/2 w-24 h-4 bg-slate-950 rounded-full z-20 pointer-events-none" />
                      )}
                      <div
                        ref={isSelected ? canvasRef : undefined}
                        style={{ width: `${spec.width}px`, height: `${spec.height}px` }}
                        className={`relative overflow-hidden bg-white shadow-inner ${
                          spec.id === 'mobile'
                            ? 'rounded-[34px]'
                            : spec.id === 'tablet'
                            ? 'rounded-[20px]'
                            : 'rounded-lg'
                        }`}
                      >
                        <CreativeRenderer input={input} config={layoutConfig} device={spec.id} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Single Surface Viewport with Precision Centering */
        <div
          ref={stageRef}
          className="flex-1 w-full flex items-center justify-center overflow-auto p-2 min-h-0 min-w-0 z-10"
        >
          <div
            style={{
              width: `${scaledWidth}px`,
              height: `${scaledHeight}px`
            }}
            className="relative m-auto flex-shrink-0 transition-all duration-200"
          >
            <div
              style={{
                width: `${fullWidth}px`,
                height: `${fullHeight}px`,
                transform: `scale(${safeZoom})`,
                transformOrigin: 'top left'
              }}
              className="absolute top-0 left-0"
            >
              <div
                className={`relative bg-slate-900 shadow-2xl overflow-hidden ring-4 ring-slate-800/90 ${
                  currentDevice === 'mobile'
                    ? 'rounded-[44px] p-3 ring-8 ring-slate-800/80 shadow-purple-950/20'
                    : currentDevice === 'tablet'
                    ? 'rounded-[28px] p-3 ring-8 ring-slate-800/80 shadow-indigo-950/20'
                    : 'rounded-xl p-2 shadow-cyan-950/20'
                }`}
                style={{
                  width: `${fullWidth}px`,
                  height: `${fullHeight}px`
                }}
              >
                {currentDevice === 'mobile' && (
                  <div className="absolute top-5 left-1/2 -translate-x-1/2 w-24 h-4 bg-slate-950 rounded-full z-20 pointer-events-none" />
                )}

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
      )}

      {/* Surface Status Footer */}
      <div className="mt-2 text-[11px] text-slate-400 flex flex-wrap items-center justify-center gap-2 sm:gap-4 px-4 z-10">
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
