import React from 'react';
import {
  Sparkles,
  Sliders,
  CheckCircle2,
  Lightbulb,
  Layers,
  Eye,
  Type,
  Maximize2,
  MousePointerClick,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { LayoutConfig, LayoutType } from '../types/layout';
import { LAYOUT_TEMPLATES_METADATA } from '../constants/presets';

interface InspectorPanelProps {
  layoutConfig: LayoutConfig;
  onUpdateConfig: (updater: (prev: LayoutConfig) => LayoutConfig) => void;
  engineMode: 'ai-openai' | 'deterministic-fallback';
}

function getLuminance(hex: string): number {
  if (!hex || typeof hex !== 'string') return 0.5;
  const clean = hex.replace('#', '');
  if (clean.length !== 6 && clean.length !== 3) return 0.5;
  const fullHex = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean;
  const r = parseInt(fullHex.substring(0, 2), 16) / 255;
  const g = parseInt(fullHex.substring(2, 4), 16) / 255;
  const b = parseInt(fullHex.substring(4, 6), 16) / 255;
  const a = [r, g, b].map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function getContrastRatio(hex1: string, hex2: string): number {
  const l1 = getLuminance(hex1);
  const l2 = getLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return Number(((lighter + 0.05) / (darker + 0.05)).toFixed(1));
}

export const InspectorPanel: React.FC<InspectorPanelProps> = ({
  layoutConfig,
  onUpdateConfig,
  engineMode
}) => {
  const { creativeRationale, theme, typography, composition } = layoutConfig;
  const [activeTab, setActiveTab] = React.useState<'intelligence' | 'tweaker'>('intelligence');

  const textBgContrast = getContrastRatio(theme.textColor || '#0F172A', theme.backgroundColor || '#FFFFFF');
  const passesAA = textBgContrast >= 4.5;
  const passesAAA = textBgContrast >= 7.0;
  const ctaContrast = getContrastRatio('#FFFFFF', theme.primaryColor || '#4F46E5');

  return (
    <aside className="w-80 lg:w-96 bg-slate-900 border-l border-slate-800 flex flex-col h-[calc(100vh-4rem)] select-none">
      {/* Tab Header Bar */}
      <div className="p-3.5 border-b border-slate-800 bg-slate-950/40 space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-bold text-xs uppercase tracking-wider text-slate-100">
            Layout Intelligence & Studio
          </span>
          <span
            className={`px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase border ${
              engineMode === 'ai-openai'
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                : 'bg-amber-950/80 text-amber-300 border-amber-500/40'
            }`}
          >
            {engineMode === 'ai-openai' ? '✨ OpenAI' : '⚙️ Fallback'}
          </span>
        </div>

        {/* 2-Way Tab Switcher */}
        <div className="grid grid-cols-2 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800/80">
          <button
            type="button"
            onClick={() => setActiveTab('intelligence')}
            className={`py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
              activeTab === 'intelligence'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>AI Rationale</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('tweaker')}
            className={`py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
              activeTab === 'tweaker'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Studio Tweaker</span>
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-5 space-y-5 custom-scrollbar text-slate-300 text-xs">
        {activeTab === 'intelligence' && (
          <>
            {/* Live WCAG Contrast Diagnostic Card */}
            <div className="bg-slate-950/80 rounded-2xl border border-slate-800 p-4 space-y-3 shadow-md">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                <div className="flex items-center gap-2 font-semibold text-xs text-cyan-400">
                  <ShieldCheck className="w-4 h-4" />
                  <span>WCAG 2.1 Color Diagnostics</span>
                </div>
                <div className="flex items-center gap-1">
                  {passesAA ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      {passesAAA ? 'AAA Pass' : 'AA Pass'}
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950/80 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-amber-400" />
                      Low Contrast
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-slate-900/90 rounded-xl p-2.5 border border-slate-800">
                  <div className="text-[10px] text-slate-400 mb-0.5">Body vs Background</div>
                  <div className="text-base font-bold text-slate-100 flex items-baseline gap-1">
                    <span>{textBgContrast} : 1</span>
                    <span className="text-[10px] font-normal text-slate-400">ratio</span>
                  </div>
                  <div className="mt-2 flex items-center gap-1.5">
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-slate-700 inline-block shadow-sm"
                      style={{ backgroundColor: theme.textColor }}
                      title={`Text: ${theme.textColor}`}
                    />
                    <span className="text-[10px] text-slate-400 font-mono">on</span>
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-slate-700 inline-block shadow-sm"
                      style={{ backgroundColor: theme.backgroundColor }}
                      title={`Background: ${theme.backgroundColor}`}
                    />
                  </div>
                </div>

                <div className="bg-slate-900/90 rounded-xl p-2.5 border border-slate-800">
                  <div className="text-[10px] text-slate-400 mb-0.5">CTA Button Legibility</div>
                  <div className="text-base font-bold text-slate-100 flex items-baseline gap-1">
                    <span>{ctaContrast} : 1</span>
                    <span className="text-[10px] font-normal text-slate-400">ratio</span>
                  </div>
                  <div className="mt-2 flex items-center gap-1.5">
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-slate-700 inline-block shadow-sm"
                      style={{ backgroundColor: theme.primaryColor }}
                      title={`Primary: ${theme.primaryColor}`}
                    />
                    <span className="text-[10px] text-slate-400 font-mono">White text</span>
                  </div>
                </div>
              </div>

              {/* Sample Live Readability Strip */}
              <div
                className="p-2.5 rounded-xl border flex items-center justify-between text-xs font-medium"
                style={{
                  backgroundColor: theme.backgroundColor,
                  color: theme.textColor,
                  borderColor: theme.textColor ? `${theme.textColor}22` : '#334155'
                }}
              >
                <span className="truncate pr-2">Live Text Readability Demo</span>
                <span
                  className="px-2 py-0.5 rounded text-[10px] font-bold shrink-0"
                  style={{
                    backgroundColor: theme.primaryColor,
                    color: '#FFFFFF'
                  }}
                >
                  CTA Action
                </span>
              </div>
            </div>

            {/* Card 1: AI Decision Rationale */}
            <div className="bg-slate-950/80 rounded-2xl border border-slate-800 p-4 space-y-3.5 shadow-md">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <div className="flex items-center gap-2 text-purple-400 font-semibold text-xs">
              <Lightbulb className="w-4 h-4" />
              <span>Creative Rationale</span>
            </div>
            <span
              className={`text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${
                engineMode === 'ai-openai' ? 'bg-emerald-900/50 text-emerald-300' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {engineMode === 'ai-openai' ? 'GPT-4o mini' : 'Rule Engine'}
            </span>
          </div>

          {creativeRationale.layoutChoice && (
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Why this layout was chosen
              </span>
              <p className="text-[11px] leading-relaxed text-slate-200">
                {creativeRationale.layoutChoice}
              </p>
            </div>
          )}

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
              Visual Hierarchy
            </span>
            <p className="text-[11px] leading-relaxed text-slate-200">
              {creativeRationale.visualHierarchy}
            </p>
          </div>

          {(creativeRationale.imagePlacement || creativeRationale.ctaPlacement) && (
            <div className="grid grid-cols-1 gap-2.5 pt-0.5">
              {creativeRationale.imagePlacement && (
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Image Placement
                  </span>
                  <p className="text-[11px] leading-relaxed text-slate-200">
                    {creativeRationale.imagePlacement}
                  </p>
                </div>
              )}
              {creativeRationale.ctaPlacement && (
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    CTA Placement & Strategy
                  </span>
                  <p className="text-[11px] leading-relaxed text-slate-200">
                    {creativeRationale.ctaPlacement}
                  </p>
                </div>
              )}
            </div>
          )}

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
              Color Harmony & Accessibility
            </span>
            <p className="text-[11px] leading-relaxed text-slate-200">
              {creativeRationale.colorHarmony}
            </p>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
              Responsive Adaptation
            </span>
            <p className="text-[11px] leading-relaxed text-slate-200">
              {creativeRationale.responsiveStrategy}
            </p>
          </div>

          {creativeRationale.audienceFit && (
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Audience Fit & Psychology
              </span>
              <p className="text-[11px] leading-relaxed text-slate-200">
                {creativeRationale.audienceFit}
              </p>
            </div>
          )}

          {creativeRationale.designTips?.length > 0 && (
            <div className="pt-1 border-t border-slate-800/60">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">
                Art Director Tips
              </span>
              <ul className="space-y-1.5">
                {creativeRationale.designTips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 text-[11px] text-slate-300">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </>
    )}

    {activeTab === 'tweaker' && (
      <>
        {/* Card 2: Manual Layout Template Selector */}
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 text-slate-100 font-semibold text-xs tracking-wide uppercase border-b border-slate-800 pb-2">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>Override Layout Template</span>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {LAYOUT_TEMPLATES_METADATA.map((tmpl) => {
              const isSelected = layoutConfig.layoutType === tmpl.id;
              return (
                <button
                  key={tmpl.id}
                  type="button"
                  onClick={() =>
                    onUpdateConfig((prev) => ({
                      ...prev,
                      layoutType: tmpl.id
                    }))
                  }
                  className={`w-full text-left p-2.5 rounded-xl border transition flex items-start gap-2.5 ${
                    isSelected
                      ? 'bg-purple-600/10 border-purple-500 shadow-md ring-1 ring-purple-500'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center mt-0.5 flex-shrink-0 ${
                      isSelected
                        ? 'border-purple-400 bg-purple-500 text-white'
                        : 'border-slate-600 bg-slate-900'
                    }`}
                  >
                    {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <div>
                    <div className="font-semibold text-xs text-slate-200">{tmpl.name}</div>
                    <div className="text-[10px] text-slate-400">{tmpl.description}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Card 3: Visual Emphasis & Alignment */}
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 text-slate-100 font-semibold text-xs tracking-wide uppercase border-b border-slate-800 pb-2">
            <Eye className="w-3.5 h-3.5 text-amber-400" />
            <span>Visual Emphasis & Alignment</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] text-slate-400 mb-1">Visual Emphasis</label>
              <select
                value={composition.visualEmphasis}
                onChange={(e) =>
                  onUpdateConfig((prev) => ({
                    ...prev,
                    composition: {
                      ...prev.composition,
                      visualEmphasis: e.target.value as any
                    }
                  }))
                }
                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-purple-500"
              >
                <option value="product-image">Product Image</option>
                <option value="headline">Headline</option>
                <option value="discount-badge">Discount Badge</option>
                <option value="cta">Call to Action</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 mb-1">Text Alignment</label>
              <select
                value={composition.alignment}
                onChange={(e) =>
                  onUpdateConfig((prev) => ({
                    ...prev,
                    composition: {
                      ...prev.composition,
                      alignment: e.target.value as any
                    }
                  }))
                }
                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-purple-500"
              >
                <option value="left">Left Aligned</option>
                <option value="center">Center Aligned</option>
                <option value="right">Right Aligned</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] text-slate-400 mb-1">Image Fit</label>
              <select
                value={composition.imageFit}
                onChange={(e) =>
                  onUpdateConfig((prev) => ({
                    ...prev,
                    composition: {
                      ...prev.composition,
                      imageFit: e.target.value as any
                    }
                  }))
                }
                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-purple-500"
              >
                <option value="cover">Cover (Full Bleed)</option>
                <option value="contain">Contain (Crisp Fit)</option>
                <option value="fill">Fill</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 mb-1">Canvas Spacing</label>
              <select
                value={composition.spacing}
                onChange={(e) =>
                  onUpdateConfig((prev) => ({
                    ...prev,
                    composition: {
                      ...prev.composition,
                      spacing: e.target.value as any
                    }
                  }))
                }
                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-purple-500"
              >
                <option value="compact">Compact (High Density)</option>
                <option value="comfortable">Comfortable (Balanced)</option>
                <option value="spacious">Spacious (Luxury Space)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Card 4: Typography Tweaks */}
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 text-slate-100 font-semibold text-xs tracking-wide uppercase border-b border-slate-800 pb-2">
            <Type className="w-3.5 h-3.5 text-cyan-400" />
            <span>Typography Tuning</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] text-slate-400 mb-1">Headline Scale</label>
              <select
                value={typography.headlineScale}
                onChange={(e) =>
                  onUpdateConfig((prev) => ({
                    ...prev,
                    typography: {
                      ...prev.typography,
                      headlineScale: e.target.value as any
                    }
                  }))
                }
                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-purple-500"
              >
                <option value="compact">Compact</option>
                <option value="standard">Standard</option>
                <option value="large">Large</option>
                <option value="heroic">Heroic (Bold Impact)</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 mb-1">Font Family</label>
              <select
                value={theme.fontFamily}
                onChange={(e) =>
                  onUpdateConfig((prev) => ({
                    ...prev,
                    theme: {
                      ...prev.theme,
                      fontFamily: e.target.value as any
                    }
                  }))
                }
                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-purple-500"
              >
                <option value="sans">Modern Sans (Inter)</option>
                <option value="display">Display (Plus Jakarta)</option>
                <option value="serif">Editorial Serif</option>
                <option value="mono">Technical Mono</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] text-slate-400 mb-1">Headline Weight</label>
              <select
                value={typography.headlineFontWeight}
                onChange={(e) =>
                  onUpdateConfig((prev) => ({
                    ...prev,
                    typography: {
                      ...prev.typography,
                      headlineFontWeight: e.target.value as any
                    }
                  }))
                }
                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-purple-500"
              >
                <option value="semibold">Semibold (600)</option>
                <option value="bold">Bold (700)</option>
                <option value="extrabold">Extra Bold (800)</option>
                <option value="black">Black (900)</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 mb-1">Letter Spacing</label>
              <select
                value={typography.letterSpacing}
                onChange={(e) =>
                  onUpdateConfig((prev) => ({
                    ...prev,
                    typography: {
                      ...prev.typography,
                      letterSpacing: e.target.value as any
                    }
                  }))
                }
                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-purple-500"
              >
                <option value="tight">Tight</option>
                <option value="normal">Normal</option>
                <option value="wide">Wide (Spaced)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Card 5: Call to Action Style */}
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 text-slate-100 font-semibold text-xs tracking-wide uppercase border-b border-slate-800 pb-2">
            <MousePointerClick className="w-3.5 h-3.5 text-emerald-400" />
            <span>Call to Action Styling</span>
          </div>

          <div>
            <label className="block text-[10px] text-slate-400 mb-1">CTA Button Shape & Style</label>
            <div className="grid grid-cols-2 gap-2">
              {(['solid', 'pill', 'outline', 'gradient'] as const).map((styleOption) => (
                <button
                  key={styleOption}
                  type="button"
                  onClick={() =>
                    onUpdateConfig((prev) => ({
                      ...prev,
                      composition: {
                        ...prev.composition,
                        ctaStyle: styleOption
                      }
                    }))
                  }
                  className={`py-2 px-3 rounded-lg border text-xs font-semibold capitalize transition ${
                    composition.ctaStyle === styleOption
                      ? 'bg-purple-600/20 border-purple-500 text-purple-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {styleOption}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Card 6: Direct Theme Canvas Overrides */}
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 text-slate-100 font-semibold text-xs tracking-wide uppercase border-b border-slate-800 pb-2">
            <Maximize2 className="w-3.5 h-3.5 text-rose-400" />
            <span>Canvas Theme Color Overrides</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[10px] text-slate-400 mb-1">Background</label>
              <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-lg border border-slate-800">
                <input
                  type="color"
                  value={theme.backgroundColor}
                  onChange={(e) =>
                    onUpdateConfig((prev) => ({
                      ...prev,
                      theme: { ...prev.theme, backgroundColor: e.target.value }
                    }))
                  }
                  className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent"
                />
                <span className="text-[10px] font-mono text-slate-300 uppercase truncate">
                  {theme.backgroundColor}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 mb-1">Text Color</label>
              <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-lg border border-slate-800">
                <input
                  type="color"
                  value={theme.textColor}
                  onChange={(e) =>
                    onUpdateConfig((prev) => ({
                      ...prev,
                      theme: { ...prev.theme, textColor: e.target.value }
                    }))
                  }
                  className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent"
                />
                <span className="text-[10px] font-mono text-slate-300 uppercase truncate">
                  {theme.textColor}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 mb-1">Primary Color</label>
              <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-lg border border-slate-800">
                <input
                  type="color"
                  value={theme.primaryColor}
                  onChange={(e) =>
                    onUpdateConfig((prev) => ({
                      ...prev,
                      theme: { ...prev.theme, primaryColor: e.target.value }
                    }))
                  }
                  className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent"
                />
                <span className="text-[10px] font-mono text-slate-300 uppercase truncate">
                  {theme.primaryColor}
                </span>
              </div>
            </div>
          </div>
        </div>
      </>
    )}
  </div>
</aside>
);
};
