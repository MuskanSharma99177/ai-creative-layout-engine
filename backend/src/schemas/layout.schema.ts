import { z } from 'zod';

export const LayoutTypeEnum = z.enum([
  'image-left-content-right',
  'image-right-content-left',
  'centered-product',
  'full-background-image',
  'split-screen',
  'minimal-editorial',
  'product-focused',
  'text-focused'
]);

export const CreativeInputSchema = z.object({
  productName: z.string().min(1, 'Product name is required').max(120),
  headline: z.string().min(1, 'Headline is required').max(150),
  description: z.string().min(1, 'Description is required').max(600),
  cta: z.string().min(1, 'CTA text is required').max(50),
  brandName: z.string().max(80).optional().default(''),
  brandColors: z
    .array(z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid hex color'))
    .min(1, 'At least one brand color is required')
    .max(6)
    .default(['#0F172A', '#3B82F6']),
  targetAudience: z.string().max(150).optional().default('General audience'),
  campaignGoal: z.string().max(100).optional().default('Brand Awareness'),
  badgeText: z.string().max(40).optional().default(''),
  imageUrl: z.string().optional().default('')
});

export const LayoutThemeSchema = z.object({
  primaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/),
  secondaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/),
  accentColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/),
  backgroundColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/),
  textColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/),
  cardBackground: z.string(),
  fontFamily: z.enum(['sans', 'serif', 'mono', 'display']).default('sans')
});

export const LayoutTypographySchema = z.object({
  headlineScale: z.enum(['compact', 'standard', 'large', 'heroic']).default('large'),
  bodyScale: z.enum(['small', 'medium', 'large']).default('medium'),
  letterSpacing: z.enum(['tight', 'normal', 'wide']).default('normal'),
  headlineFontWeight: z.enum(['semibold', 'bold', 'extrabold', 'black']).default('bold'),
  textTransform: z.enum(['uppercase', 'none', 'capitalize']).default('none')
});

export const LayoutCompositionSchema = z.object({
  alignment: z.enum(['left', 'center', 'right']).default('left'),
  imagePosition: z.enum(['left', 'right', 'top', 'center', 'background']).default('left'),
  imageFit: z.enum(['cover', 'contain', 'fill']).default('cover'),
  imageAspectRatio: z.enum(['square', 'portrait', 'landscape', 'wide']).default('landscape'),
  ctaPosition: z.enum(['inline', 'bottom-left', 'bottom-center', 'bottom-right', 'floating']).default('inline'),
  ctaStyle: z.enum(['solid', 'outline', 'gradient', 'pill']).default('solid'),
  visualEmphasis: z.enum(['headline', 'product-image', 'discount-badge', 'cta']).default('product-image'),
  spacing: z.enum(['compact', 'comfortable', 'spacious']).default('comfortable'),
  overlayOpacity: z.number().min(0).max(1).default(0.4),
  hasBadge: z.boolean().default(false),
  badgePosition: z.enum(['top-left', 'top-right', 'above-headline', 'on-image']).default('above-headline')
});

export const LayoutResponsiveRulesSchema = z.object({
  mobile: z.object({
    direction: z.enum(['column', 'column-reverse', 'overlay']).default('column'),
    imageHeight: z.string().default('220px'),
    ctaFullWidth: z.boolean().default(true),
    textAlign: z.enum(['left', 'center', 'right']).default('center')
  }),
  tablet: z.object({
    direction: z.enum(['column', 'row']).default('row'),
    splitRatio: z.string().default('50/50')
  }),
  desktop: z.object({
    direction: z.enum(['row']).default('row'),
    splitRatio: z.string().default('50/50')
  })
});

export const CreativeRationaleSchema = z.object({
  layoutChoice: z.string().optional().default('Selected for optimal visual impact and message harmony.'),
  visualHierarchy: z.string(),
  imagePlacement: z.string().optional().default('Positioned for maximum focal balance.'),
  ctaPlacement: z.string().optional().default('Placed in the primary eye-path for peak conversions.'),
  colorHarmony: z.string(),
  responsiveStrategy: z.string(),
  audienceFit: z.string(),
  designTips: z.array(z.string()).default([])
});

export const LayoutConfigSchema = z.object({
  layoutType: LayoutTypeEnum,
  theme: LayoutThemeSchema,
  typography: LayoutTypographySchema,
  composition: LayoutCompositionSchema,
  responsiveRules: LayoutResponsiveRulesSchema,
  creativeRationale: CreativeRationaleSchema,
  metadata: z.object({
    engineMode: z.enum(['ai-openai', 'ai-gemini', 'deterministic-fallback']),
    generatedAt: z.string(),
    confidenceScore: z.number().optional()
  })
});

export type CreativeInputDto = z.infer<typeof CreativeInputSchema>;
export type CreativeInputRawDto = z.input<typeof CreativeInputSchema>;
export type LayoutConfigDto = z.infer<typeof LayoutConfigSchema>;
