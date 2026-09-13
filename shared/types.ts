export type LayoutType =
  | 'image-left-content-right'
  | 'image-right-content-left'
  | 'centered-product'
  | 'full-background-image'
  | 'split-screen'
  | 'minimal-editorial'
  | 'product-focused'
  | 'text-focused';

export type DeviceType = 'mobile' | 'tablet' | 'desktop';

export interface DeviceSpec {
  id: DeviceType;
  label: string;
  width: number;
  height: number;
  aspectRatio: string;
  icon: string;
}

export interface ColumnSummaryStats {
  min?: number;
  max?: number;
  avg?: number;
}

export interface DatasetProfile {
  rows: number;
  columns: number;
  columnNames: string[];
  numericColumns: string[];
  categoricalColumns: string[];
  textColumns: string[];
  dateColumns: string[];
  missingValueCounts: Record<string, number>;
  uniqueValueCounts: Record<string, number>;
  sampleRows: Record<string, any>[];
  summaryStats?: Record<string, ColumnSummaryStats>;
}

export interface CreativeInput {
  productName?: string;
  headline: string;
  description: string;
  cta: string;
  brandName?: string;
  brandColors: string[];
  targetAudience?: string;
  campaignGoal?: string;
  badgeText?: string;
  imageUrl?: string;
  datasetProfile?: DatasetProfile;
  activeRowData?: Record<string, any>;
  activeRowIndex?: number;
}

export interface PresetCampaign {
  id: string;
  name: string;
  category: string;
  input: CreativeInput;
}

export interface LayoutTheme {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  cardBackground: string;
  fontFamily: 'sans' | 'serif' | 'mono' | 'display';
}

export interface LayoutTypography {
  headlineScale: 'compact' | 'standard' | 'large' | 'heroic';
  bodyScale: 'small' | 'medium' | 'large';
  letterSpacing: 'tight' | 'normal' | 'wide';
  headlineFontWeight: 'semibold' | 'bold' | 'extrabold' | 'black';
  textTransform: 'uppercase' | 'none' | 'capitalize';
}

export interface LayoutComposition {
  alignment: 'left' | 'center' | 'right';
  imagePosition: 'left' | 'right' | 'top' | 'center' | 'background';
  imageFit: 'cover' | 'contain' | 'fill';
  imageAspectRatio: 'square' | 'portrait' | 'landscape' | 'wide';
  ctaPosition: 'inline' | 'bottom-left' | 'bottom-center' | 'bottom-right' | 'floating';
  ctaStyle: 'solid' | 'outline' | 'gradient' | 'pill';
  visualEmphasis: 'headline' | 'product-image' | 'discount-badge' | 'cta';
  spacing: 'compact' | 'comfortable' | 'spacious';
  overlayOpacity: number;
  hasBadge: boolean;
  badgePosition: 'top-left' | 'top-right' | 'above-headline' | 'on-image';
}

export interface LayoutResponsiveRules {
  mobile: {
    direction: 'column' | 'column-reverse' | 'overlay';
    imageHeight: string;
    ctaFullWidth: boolean;
    textAlign: 'left' | 'center' | 'right';
  };
  tablet: {
    direction: 'column' | 'row';
    splitRatio: string;
  };
  desktop: {
    direction: 'row';
    splitRatio: string;
  };
}

export interface CreativeRationale {
  layoutChoice?: string;
  visualHierarchy: string;
  imagePlacement?: string;
  ctaPlacement?: string;
  colorHarmony: string;
  responsiveStrategy: string;
  audienceFit: string;
  designTips: string[];
}

export interface LayoutConfig {
  layoutType: LayoutType;
  theme: LayoutTheme;
  typography: LayoutTypography;
  composition: LayoutComposition;
  responsiveRules: LayoutResponsiveRules;
  creativeRationale: CreativeRationale;
  metadata: {
    engineMode: 'ai-openai' | 'deterministic-fallback';
    generatedAt: string;
    confidenceScore?: number;
  };
}

export interface GenerateLayoutRequest extends CreativeInput {}

export interface GenerateLayoutResponse {
  success: boolean;
  layout: LayoutConfig;
  input: CreativeInput;
  engine?: 'ai-openai' | 'deterministic-fallback';
  openAiError?: string;
  warnings?: string[];
}
