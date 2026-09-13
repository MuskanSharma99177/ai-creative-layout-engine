import React, { useRef, useState } from 'react';
import {
  Upload,
  Sparkles,
  Palette,
  Image as ImageIcon,
  Tag,
  Target,
  RefreshCw,
  X,
  Type,
  FileSpreadsheet,
  Database,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { CreativeInput, DatasetProfile } from '../types/layout';
import { SAMPLE_IMAGES } from '../constants/presets';
import {
  parseAndProfileCSV,
  mapRowToCreativeInput,
  BENCHMARK_DATASETS
} from '../utils/csvProfiler';

interface InputPanelProps {
  input: CreativeInput;
  onChange: (updated: Partial<CreativeInput>) => void;
  onGenerateAI: () => void;
  onRunFallback: () => void;
  isGenerating: boolean;
  onDatasetLoaded?: (datasetName: string) => void;
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
  isGenerating,
  onDatasetLoaded
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);

  const [activeDatasetName, setActiveDatasetName] = useState<string | null>(null);
  const [datasetRows, setDatasetRows] = useState<Record<string, any>[]>([]);
  const [activeRowIdx, setActiveRowIdx] = useState<number>(0);
  const [csvError, setCsvError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'copy' | 'visuals' | 'batch'>('copy');

  const readinessScore = Math.round(
    (input.headline.trim() ? 30 : 0) +
    (input.cta.trim() ? 25 : 0) +
    (input.description.trim() ? 15 : 0) +
    (input.imageUrl ? 15 : 0) +
    (input.brandColors.length >= 2 ? 15 : 0)
  );

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

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        processCSVContent(reader.result, file.name);
      }
    };
    reader.readAsText(file);
  };

  const processCSVContent = (content: string, name: string) => {
    setCsvError(null);
    const result = parseAndProfileCSV(content);

    if (result.errors.length > 0 && result.profile.rows === 0) {
      setCsvError(result.errors.join('; '));
      return;
    }

    if (result.profile.rows === 0) {
      setCsvError('The CSV file contains no valid data rows.');
      return;
    }

    setActiveDatasetName(name);
    setDatasetRows(result.rawRows);
    setActiveRowIdx(0);

    const mapped = mapRowToCreativeInput(result.rawRows[0], result.profile, 0, input.brandColors);
    onChange(mapped);

    if (onDatasetLoaded) {
      onDatasetLoaded(name);
    }
  };

  const handleLoadBenchmark = (key: keyof typeof BENCHMARK_DATASETS) => {
    const b = BENCHMARK_DATASETS[key];
    processCSVContent(b.csv, b.title);
  };

  const handleNextRow = () => {
    if (!input.datasetProfile || datasetRows.length === 0) return;
    const nextIdx = (activeRowIdx + 1) % datasetRows.length;
    setActiveRowIdx(nextIdx);
    const mapped = mapRowToCreativeInput(
      datasetRows[nextIdx],
      input.datasetProfile,
      nextIdx,
      input.brandColors
    );
    onChange(mapped);
  };

  const handlePrevRow = () => {
    if (!input.datasetProfile || datasetRows.length === 0) return;
    const prevIdx = (activeRowIdx - 1 + datasetRows.length) % datasetRows.length;
    setActiveRowIdx(prevIdx);
    const mapped = mapRowToCreativeInput(
      datasetRows[prevIdx],
      input.datasetProfile,
      prevIdx,
      input.brandColors
    );
    onChange(mapped);
  };

  const handleClearDataset = () => {
    setActiveDatasetName(null);
    setDatasetRows([]);
    setActiveRowIdx(0);
    onChange({
      datasetProfile: undefined,
      activeRowData: undefined,
      activeRowIndex: undefined,
    });
  };

  const profile = input.datasetProfile;

  return (
    <aside className="w-80 lg:w-96 bg-slate-900 border-r border-slate-800 flex flex-col h-[calc(100vh-4rem)] select-none">
      {/* Studio Header & Readiness Score */}
      <div className="p-3.5 border-b border-slate-800 bg-slate-950/40 space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <span className="font-bold text-xs uppercase tracking-wider text-slate-100 block">
              Creative Studio Input
            </span>
            <span className="text-[10px] text-slate-400">Ad copy, visual assets & brand parameters</span>
          </div>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono border ${
              readinessScore >= 80
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                : readinessScore >= 50
                ? 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            {readinessScore}% Ready
          </span>
        </div>

        {/* Readiness Meter Bar */}
        <div className="w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              readinessScore >= 80
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                : readinessScore >= 50
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                : 'bg-gradient-to-r from-rose-500 to-orange-400'
            }`}
            style={{ width: `${Math.max(5, readinessScore)}%` }}
          />
        </div>

        {/* 3-Way Sub-Tab Switcher */}
        <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800/80 pt-1">
          <button
            type="button"
            onClick={() => setActiveTab('copy')}
            className={`py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
              activeTab === 'copy'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            <span>Copy</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('visuals')}
            className={`py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
              activeTab === 'visuals'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Visuals</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('batch')}
            className={`py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition relative ${
              activeTab === 'batch'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Data / CSV</span>
            {activeDatasetName && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 absolute top-1 right-1" />
            )}
          </button>
        </div>
      </div>

      {/* Scrollable Form Body by Active Tab */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-5 space-y-5 custom-scrollbar text-slate-300 text-xs">
        {/* TAB 1: COPY & MESSAGING */}
        {activeTab === 'copy' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Product / Title */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-medium text-slate-400">
                  Headline / Hook <span className="text-rose-400">*</span>
                </label>
                <span className="text-[10px] text-slate-500 font-mono">
                  {input.headline.split(/\s+/).filter(Boolean).length} words
                </span>
              </div>
              <input
                type="text"
                value={input.headline}
                onChange={(e) => onChange({ headline: e.target.value, productName: input.productName || e.target.value })}
                placeholder="e.g. Silence the World. Amplify Your Sound."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 font-medium focus:outline-none focus:border-purple-500 transition"
              />
            </div>

            {/* Description */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-medium text-slate-400">
                  Supporting Copy / Description
                </label>
                <span className="text-[10px] text-slate-500 font-mono">
                  {input.description.length} chars
                </span>
              </div>
              <textarea
                rows={3}
                value={input.description}
                onChange={(e) => onChange({ description: e.target.value })}
                placeholder="Highlight key value proposition, specifications, or promotional details"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-purple-500 transition resize-none leading-relaxed"
              />
            </div>

            {/* CTA Field & Quick Suggest Chips */}
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Call-to-Action (CTA) <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={input.cta}
                onChange={(e) => onChange({ cta: e.target.value })}
                placeholder="e.g. Shop Now, Claim 50% Off"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-purple-500 transition font-medium mb-1.5"
              />
              {/* Quick CTA Chips */}
              <div className="flex flex-wrap gap-1">
                {['Shop Now', 'Claim 50% Off', 'Start Free Trial', 'Explore Collection', 'Book Demo'].map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => onChange({ cta: suggestion })}
                    className="text-[9px] px-2 py-0.5 rounded bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-purple-300 border border-slate-800 transition"
                  >
                    + {suggestion}
                  </button>
                ))}
              </div>
            </div>

            {/* Badge / Key Metric */}
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Key Metric / Promotion Badge
              </label>
              <input
                type="text"
                value={input.badgeText || ''}
                onChange={(e) => onChange({ badgeText: e.target.value })}
                placeholder="e.g. 50% OFF, LIMITED EDITION"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-purple-500 transition font-medium mb-1.5"
              />
              <div className="flex flex-wrap gap-1">
                {['50% OFF', 'LIMITED TIME', 'BESTSELLER', 'NEW ARRIVAL', 'AWARD WINNING'].map((badge) => (
                  <button
                    key={badge}
                    type="button"
                    onClick={() => onChange({ badgeText: badge })}
                    className="text-[9px] px-2 py-0.5 rounded bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-amber-300 border border-slate-800 transition"
                  >
                    + {badge}
                  </button>
                ))}
              </div>
            </div>

            {/* Brand / Product Name */}
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Brand / Product Name
              </label>
              <input
                type="text"
                value={input.productName || input.brandName || ''}
                onChange={(e) => onChange({ productName: e.target.value, brandName: e.target.value })}
                placeholder="e.g. AeroGlide Audio"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-purple-500 transition"
              />
            </div>
          </div>
        )}

        {/* TAB 2: VISUALS & THEME */}
        {activeTab === 'visuals' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Custom Image Upload Box */}
            <div>
              <div className="flex items-center justify-between text-slate-100 font-semibold text-xs tracking-wide uppercase mb-2">
                <div className="flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
                  <span>Product Image</span>
                </div>
                {input.imageUrl && (
                  <button
                    type="button"
                    onClick={() => onChange({ imageUrl: '' })}
                    className="text-[10px] text-slate-400 hover:text-rose-400 flex items-center gap-0.5 transition"
                  >
                    <X className="w-3 h-3" /> Clear
                  </button>
                )}
              </div>

              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-3.5 text-center cursor-pointer transition ${
                  input.imageUrl
                    ? 'border-purple-500/60 bg-purple-950/20'
                    : 'border-slate-800 hover:border-slate-700 bg-slate-950/40'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />

                {input.imageUrl ? (
                  <div className="flex items-center gap-3">
                    <img
                      src={input.imageUrl}
                      alt="Creative asset"
                      className="w-14 h-14 object-cover rounded-lg border border-slate-700 shrink-0"
                    />
                    <div className="text-left overflow-hidden">
                      <p className="text-xs font-semibold text-slate-200">Image Loaded</p>
                      <p className="text-[10px] text-slate-400 truncate">Click to replace</p>
                    </div>
                  </div>
                ) : (
                  <div className="py-2.5 flex flex-col items-center gap-1">
                    <Upload className="w-5 h-5 text-slate-400 mb-0.5" />
                    <p className="text-[11px] text-slate-300 font-medium">Click to upload photo</p>
                    <p className="text-[9px] text-slate-500">PNG, JPG, WebP up to 10MB</p>
                  </div>
                )}
              </div>
            </div>

            {/* Curated Sample Images Preset Grid */}
            <div>
              <label className="block text-[10px] uppercase font-semibold text-slate-400 mb-1.5">
                Curated Asset Library (1-Click)
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {SAMPLE_IMAGES.map((sample, idx) => {
                  const isCurrent = input.imageUrl === sample.url;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => onChange({ imageUrl: sample.url })}
                      className={`relative rounded-lg overflow-hidden border text-left transition group ${
                        isCurrent
                          ? 'ring-2 ring-purple-500 border-transparent shadow-md'
                          : 'border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <img
                        src={sample.url}
                        alt={sample.label}
                        className="w-full h-12 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-slate-950/80 p-0.5 text-[8px] font-semibold text-slate-300 truncate px-1 text-center">
                        {sample.label.split(' ')[0]}
                      </div>
                      {isCurrent && (
                        <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-purple-400" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Brand Colors Custom Pickers */}
            <div>
              <div className="flex items-center gap-1.5 text-slate-100 font-semibold text-xs tracking-wide uppercase mb-2">
                <Palette className="w-3.5 h-3.5 text-amber-400" />
                <span>Brand Colors & Contrast</span>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-3">
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1 font-medium">Primary</label>
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
                  <label className="block text-[10px] text-slate-400 mb-1 font-medium">Secondary</label>
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
                  <label className="block text-[10px] text-slate-400 mb-1 font-medium">Accent</label>
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

              {/* Palette Harmonies Presets */}
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Designer Palette Harmonies
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {COLOR_PALETTES.map((pal) => (
                    <button
                      key={pal.name}
                      type="button"
                      onClick={() => onChange({ brandColors: pal.colors })}
                      className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-md transition"
                    >
                      <div className="flex -space-x-1">
                        {pal.colors.map((c, i) => (
                          <span
                            key={i}
                            className="w-3 h-3 rounded-full border border-slate-900 shadow-sm"
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] text-slate-300 font-medium">{pal.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: STRATEGY & BATCH CSV */}
        {activeTab === 'batch' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Target Audience */}
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Target Audience Profile
              </label>
              <input
                type="text"
                value={input.targetAudience || ''}
                onChange={(e) => onChange({ targetAudience: e.target.value })}
                placeholder="e.g. Gen-Z Sneakerheads, Enterprise CTOs"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-purple-500 transition"
              />
            </div>

            {/* Campaign Goal */}
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Campaign Goal / Optimization Objective
              </label>
              <select
                value={input.campaignGoal || 'Conversion'}
                onChange={(e) => onChange({ campaignGoal: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-purple-500 transition"
              >
                <option value="Conversion">Direct Conversion & Sales</option>
                <option value="Brand Awareness">Brand Awareness & Reach</option>
                <option value="Product Launch">New Product Launch</option>
                <option value="Urgent Promotion">Flash Sale / Urgency Promotion</option>
                <option value="Luxury Prestige">Luxury Prestige & Storytelling</option>
              </select>
            </div>

            {/* CSV Dataset Profiler */}
            <div className="space-y-3 bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-1.5 text-slate-100 font-semibold text-xs tracking-wide uppercase">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                  <span>CSV Dataset Ingestion</span>
                </div>
                {activeDatasetName && (
                  <button
                    type="button"
                    onClick={handleClearDataset}
                    className="text-[10px] text-slate-400 hover:text-rose-400 flex items-center gap-1 transition"
                  >
                    <X className="w-3 h-3" /> Clear
                  </button>
                )}
              </div>

              {/* Quick Benchmark Loaders */}
              <div>
                <label className="block text-[10px] uppercase font-semibold text-slate-400 mb-1.5">
                  Pre-Loaded Benchmark Datasets
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleLoadBenchmark('datasetA')}
                    className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500 rounded-lg text-left transition"
                  >
                    <p className="font-bold text-[10px] text-emerald-400">Dataset A</p>
                    <p className="text-[9px] text-slate-400 truncate">HR / Salary</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLoadBenchmark('datasetB')}
                    className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-blue-500 rounded-lg text-left transition"
                  >
                    <p className="font-bold text-[10px] text-blue-400">Dataset B</p>
                    <p className="text-[9px] text-slate-400 truncate">E-Commerce</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLoadBenchmark('datasetC')}
                    className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-amber-500 rounded-lg text-left transition"
                  >
                    <p className="font-bold text-[10px] text-amber-400">Dataset C</p>
                    <p className="text-[9px] text-slate-400 truncate">Sensor / Date</p>
                  </button>
                </div>
              </div>

              {/* Upload Drop Button */}
              <div>
                <input
                  type="file"
                  ref={csvInputRef}
                  onChange={handleCSVUpload}
                  accept=".csv"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => csvInputRef.current?.click()}
                  className="w-full py-2 px-3 border border-dashed border-slate-700 hover:border-emerald-400 rounded-lg bg-slate-900/60 hover:bg-slate-900 text-slate-300 text-[11px] font-medium flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Upload Custom CSV</span>
                </button>
              </div>

              {csvError && (
                <div className="p-2 rounded bg-rose-950/60 border border-rose-800 text-rose-300 text-[10px] flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{csvError}</span>
                </div>
              )}

              {/* Active Dataset Readout */}
              {profile && (
                <div className="mt-2 space-y-2 pt-2 border-t border-slate-800 text-[11px]">
                  <div className="flex items-center justify-between text-slate-200">
                    <span className="font-semibold text-emerald-400 truncate max-w-[170px]" title={activeDatasetName || 'Dataset'}>
                      {activeDatasetName || 'Active CSV'}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {profile.rows} rows × {profile.columns} cols
                    </span>
                  </div>

                  {datasetRows.length > 1 && (
                    <div className="flex items-center justify-between bg-slate-900 p-1.5 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-400 font-mono">
                        Record {activeRowIdx + 1} of {datasetRows.length}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={handlePrevRow}
                          className="p-1 hover:bg-slate-800 rounded text-slate-300 hover:text-white"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={handleNextRow}
                          className="p-1 hover:bg-slate-800 rounded text-slate-300 hover:text-white"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer Action Dock */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/90 space-y-2">
        <button
          type="button"
          onClick={onGenerateAI}
          disabled={isGenerating}
          className="w-full py-3 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition active:scale-[0.99] disabled:opacity-50 cursor-pointer"
        >
          <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
          <span>{isGenerating ? 'Synthesizing with AI...' : 'Generate with AI'}</span>
        </button>

        <button
          type="button"
          onClick={onRunFallback}
          disabled={isGenerating}
          className="w-full py-2 bg-slate-800/90 hover:bg-slate-700 text-slate-300 rounded-lg text-[11px] font-medium flex items-center justify-center gap-1.5 transition cursor-pointer border border-slate-700/60"
        >
          <RefreshCw className="w-3 h-3 text-cyan-400" />
          <span>Run Deterministic Fallback Engine</span>
        </button>
      </div>
    </aside>
  );
};
