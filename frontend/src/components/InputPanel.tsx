import React, { useRef } from 'react';
import {
  Upload,
  Sparkles,
  Palette,
  Image as ImageIcon,
  Tag,
  Target,
  RefreshCw,
  X,
  Type
} from 'lucide-react';
import { CreativeInput } from '../types/layout';
import { SAMPLE_IMAGES } from '../constants/presets';

interface InputPanelProps {
  input: CreativeInput;
  onChange: (updated: Partial<CreativeInput>) => void;
  onGenerateAI: () => void;
  onRunFallback: () => void;
  isGenerating: boolean;
}

const COLOR_PALETTES = [
  { name: 'Midnight Neon', colors: ['#0F172A', '#38BDF8', '#F43F5E'] },
  { name: 'Crimson Power', colors: ['#0A0A0A', '#E11D48', '#FFFFFF'] },
  { name: 'Luxury Gold', colors: ['#1C1917', '#D4AF37', '#FAFAF9'] },
  { name: 'Emerald Growth', colors: ['#064E3B', '#10B981', '#F59E0B'] },
  { name: 'Royal Purple', colors: ['#3B0764', '#A855F7', '#EC4899'] }
];

export const InputPanel: React.FC<InputPanelProps> = ({
  input,
  onChange,
  onGenerateAI,
  onRunFallback,
  isGenerating
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          onChange({ imageUrl: reader.result });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          onChange({ imageUrl: reader.result });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <aside className="w-80 lg:w-96 bg-slate-900 border-r border-slate-800 flex flex-col h-[calc(100vh-4rem)] select-none">
      {/* Scrollable Form Area */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-5 space-y-6 custom-scrollbar text-slate-300 text-xs">
        {/* Section 1: Copy & Message */}
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 text-slate-100 font-semibold text-xs tracking-wide uppercase border-b border-slate-800 pb-2">
            <Type className="w-3.5 h-3.5 text-purple-400" />
            <span>Creative Copy</span>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">
              Product / Offer Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={input.productName}
              onChange={(e) => onChange({ productName: e.target.value })}
              placeholder="e.g. Nike Air Zoom Pegasus"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-purple-500 transition"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">
              Headline <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={input.headline}
              onChange={(e) => onChange({ headline: e.target.value })}
              placeholder="e.g. Summer Speed Sale"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 font-medium focus:outline-none focus:border-purple-500 transition"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">
              Description <span className="text-rose-400">*</span>
            </label>
            <textarea
              rows={3}
              value={input.description}
              onChange={(e) => onChange({ description: e.target.value })}
              placeholder="Get premium running shoes with responsive zoom cushioning at 50% off."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-purple-500 transition resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                CTA Button <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={input.cta}
                onChange={(e) => onChange({ cta: e.target.value })}
                placeholder="Shop Now"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-purple-500 transition"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">Badge Text</label>
              <input
                type="text"
                value={input.badgeText || ''}
                onChange={(e) => onChange({ badgeText: e.target.value })}
                placeholder="50% OFF"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-purple-500 transition"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Product Image */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-slate-100 font-semibold text-xs tracking-wide uppercase border-b border-slate-800 pb-2">
            <div className="flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
              <span>Product Imagery</span>
            </div>
            {input.imageUrl && (
              <button
                type="button"
                onClick={() => onChange({ imageUrl: '' })}
                className="text-[10px] text-rose-400 hover:text-rose-300 flex items-center gap-1"
              >
                <X className="w-3 h-3" /> Clear
              </button>
            )}
          </div>

          {/* Drag & drop / Upload target */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="group relative border border-dashed border-slate-700 hover:border-purple-500 rounded-xl p-4 text-center cursor-pointer bg-slate-950/50 hover:bg-slate-950 transition flex flex-col items-center justify-center gap-2"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            {input.imageUrl ? (
              <div className="relative w-full h-24 rounded-lg overflow-hidden border border-slate-800">
                <img
                  src={input.imageUrl}
                  alt="Product preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                  <span className="text-[11px] text-white font-medium">Click or Drop to replace</span>
                </div>
              </div>
            ) : (
              <>
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-purple-400 transition">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] font-medium text-slate-300">Click or drag image here</p>
                  <p className="text-[10px] text-slate-500">PNG, JPG, WebP supported</p>
                </div>
              </>
            )}
          </div>

          {/* Sample Images Gallery */}
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Or pick sample asset
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {SAMPLE_IMAGES.map((sample) => (
                <button
                  key={sample.label}
                  type="button"
                  onClick={() => onChange({ imageUrl: sample.url })}
                  className="relative group rounded-lg overflow-hidden border border-slate-800 hover:border-purple-500 transition aspect-square"
                  title={sample.label}
                >
                  <img
                    src={sample.url}
                    alt={sample.label}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition flex items-end p-1">
                    <span className="text-[9px] text-white font-medium truncate drop-shadow">
                      {sample.label}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Section 3: Brand Guidelines */}
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 text-slate-100 font-semibold text-xs tracking-wide uppercase border-b border-slate-800 pb-2">
            <Palette className="w-3.5 h-3.5 text-amber-400" />
            <span>Brand Colors</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[10px] text-slate-400 mb-1">Primary</label>
              <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-lg border border-slate-800">
                <input
                  type="color"
                  value={input.brandColors[0] || '#0F172A'}
                  onChange={(e) => {
                    const newColors = [...input.brandColors];
                    newColors[0] = e.target.value;
                    onChange({ brandColors: newColors });
                  }}
                  className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent"
                />
                <span className="text-[10px] font-mono uppercase text-slate-300 truncate">
                  {input.brandColors[0]}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 mb-1">Secondary</label>
              <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-lg border border-slate-800">
                <input
                  type="color"
                  value={input.brandColors[1] || '#3B82F6'}
                  onChange={(e) => {
                    const newColors = [...input.brandColors];
                    newColors[1] = e.target.value;
                    onChange({ brandColors: newColors });
                  }}
                  className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent"
                />
                <span className="text-[10px] font-mono uppercase text-slate-300 truncate">
                  {input.brandColors[1]}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 mb-1">Accent</label>
              <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-lg border border-slate-800">
                <input
                  type="color"
                  value={input.brandColors[2] || '#F59E0B'}
                  onChange={(e) => {
                    const newColors = [...input.brandColors];
                    newColors[2] = e.target.value;
                    onChange({ brandColors: newColors });
                  }}
                  className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent"
                />
                <span className="text-[10px] font-mono uppercase text-slate-300 truncate">
                  {input.brandColors[2]}
                </span>
              </div>
            </div>
          </div>

          {/* Palette presets */}
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Preset Palettes
            </label>
            <div className="flex flex-wrap gap-1.5">
              {COLOR_PALETTES.map((pal) => (
                <button
                  key={pal.name}
                  type="button"
                  onClick={() => onChange({ brandColors: pal.colors })}
                  className="flex items-center gap-1 px-2 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-md transition"
                >
                  <div className="flex -space-x-1">
                    {pal.colors.map((c, i) => (
                      <span
                        key={i}
                        className="w-2.5 h-2.5 rounded-full border border-slate-900"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] text-slate-300">{pal.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Section 4: Campaign Context */}
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 text-slate-100 font-semibold text-xs tracking-wide uppercase border-b border-slate-800 pb-2">
            <Target className="w-3.5 h-3.5 text-emerald-400" />
            <span>Campaign Context</span>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">Brand Name</label>
            <input
              type="text"
              value={input.brandName || ''}
              onChange={(e) => onChange({ brandName: e.target.value })}
              placeholder="e.g. Nike"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-purple-500 transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">Audience</label>
              <input
                type="text"
                value={input.targetAudience || ''}
                onChange={(e) => onChange({ targetAudience: e.target.value })}
                placeholder="e.g. Gen Z Athletes"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-purple-500 transition"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">Campaign Goal</label>
              <input
                type="text"
                value={input.campaignGoal || ''}
                onChange={(e) => onChange({ campaignGoal: e.target.value })}
                placeholder="e.g. Direct Sales"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-purple-500 transition"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer Action Dock */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/80 space-y-2">
        <button
          type="button"
          onClick={onGenerateAI}
          disabled={isGenerating}
          className="w-full py-3 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition active:scale-[0.99] disabled:opacity-50"
        >
          <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
          <span>{isGenerating ? 'Analyzing with Gemini AI...' : 'Generate with AI'}</span>
        </button>

        <button
          type="button"
          onClick={onRunFallback}
          disabled={isGenerating}
          className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[11px] font-medium flex items-center justify-center gap-1.5 transition"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Run Deterministic Fallback Engine</span>
        </button>
      </div>
    </aside>
  );
};
