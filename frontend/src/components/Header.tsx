import React, { useState } from 'react';
import {
  Smartphone,
  Tablet,
  Monitor,
  Download,
  Sparkles,
  Layers,
  ZoomIn,
  ZoomOut,
  ChevronDown,
  Check
} from 'lucide-react';
import { DeviceType } from '../types/layout';
import { CAMPAIGN_PRESETS, DEVICE_PRESETS } from '../constants/presets';

interface HeaderProps {
  currentDevice: DeviceType;
  onDeviceChange: (device: DeviceType) => void;
  zoomLevel: number;
  onZoomChange: (zoom: number) => void;
  onSelectPreset: (presetId: string) => void;
  onExport: (format: 'png' | 'jpeg') => void;
  isExporting: boolean;
  isGenerating: boolean;
  onGenerateAI: () => void;
  engineMode: 'ai-gemini' | 'deterministic-fallback';
}

export const Header: React.FC<HeaderProps> = ({
  currentDevice,
  onDeviceChange,
  zoomLevel,
  onZoomChange,
  onSelectPreset,
  onExport,
  isExporting,
  isGenerating,
  onGenerateAI,
  engineMode
}) => {
  const [showPresetMenu, setShowPresetMenu] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 text-white px-4 lg:px-6 flex items-center justify-between z-30 select-none">
      {/* Left: Brand / Title */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500 via-purple-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm tracking-tight text-white">Flam Creative Engine</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Internship Edition
            </span>
          </div>
          <p className="text-[11px] text-slate-400 hidden sm:block">AI-Powered Adaptive Creative Layout Engine</p>
        </div>
      </div>

      {/* Center: Device Switcher & Dimensions */}
      <div className="flex items-center gap-2 bg-slate-950/70 p-1 rounded-xl border border-slate-800">
        {DEVICE_PRESETS.map((spec) => {
          const isActive = currentDevice === spec.id;
          const IconComponent =
            spec.id === 'mobile' ? Smartphone : spec.id === 'tablet' ? Tablet : Monitor;

          return (
            <button
              key={spec.id}
              type="button"
              onClick={() => onDeviceChange(spec.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
              title={`${spec.label} preview (${spec.width}×${spec.height})`}
            >
              <IconComponent className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{spec.label}</span>
              <span className="text-[10px] opacity-70 hidden lg:inline">
                {spec.width}×{spec.height}
              </span>
            </button>
          );
        })}
      </div>

      {/* Right Controls: Presets, AI Generate, Zoom, Export */}
      <div className="flex items-center gap-2">
        {/* Preset Selector Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowPresetMenu(!showPresetMenu)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition"
          >
            <Layers className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">Presets</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-60" />
          </button>

          {showPresetMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Select Campaign Preset
              </div>
              {CAMPAIGN_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => {
                    onSelectPreset(preset.id);
                    setShowPresetMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-purple-600 hover:text-white flex flex-col transition"
                >
                  <span className="font-semibold">{preset.name}</span>
                  <span className="text-[10px] opacity-70">{preset.category}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Zoom Controls */}
        <div className="hidden xl:flex items-center bg-slate-800/80 rounded-lg border border-slate-700 p-0.5 text-slate-300">
          <button
            type="button"
            onClick={() => onZoomChange(Math.max(0.5, zoomLevel - 0.1))}
            className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] px-1.5 font-mono min-w-[42px] text-center">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            type="button"
            onClick={() => onZoomChange(Math.min(1.5, zoomLevel + 0.1))}
            className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Quick Generate AI Button */}
        <button
          type="button"
          onClick={onGenerateAI}
          disabled={isGenerating}
          className="flex items-center gap-2 px-3.5 py-1.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-purple-600/30 transition disabled:opacity-50"
        >
          <Sparkles className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">{isGenerating ? 'Generating...' : 'AI Generate'}</span>
        </button>

        {/* Export Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowExportMenu(!showExportMenu)}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-emerald-600/20 transition disabled:opacity-50"
          >
            <Download className={`w-3.5 h-3.5 ${isExporting ? 'animate-bounce' : ''}`} />
            <span className="hidden sm:inline">{isExporting ? 'Exporting...' : 'Export'}</span>
            <ChevronDown className="w-3 h-3 opacity-70" />
          </button>

          {showExportMenu && (
            <div className="absolute right-0 mt-2 w-44 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-1 z-50">
              <button
                type="button"
                onClick={() => {
                  onExport('png');
                  setShowExportMenu(false);
                }}
                className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-emerald-600 hover:text-white flex items-center justify-between"
              >
                <span>Export as PNG</span>
                <span className="text-[10px] opacity-70">Lossless</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onExport('jpeg');
                  setShowExportMenu(false);
                }}
                className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-emerald-600 hover:text-white flex items-center justify-between"
              >
                <span>Export as JPG</span>
                <span className="text-[10px] opacity-70">Compact</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
