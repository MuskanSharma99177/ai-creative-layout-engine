import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import { CreativeInputDto, LayoutConfigDto, LayoutConfigSchema } from '../schemas/layout.schema.js';
import { generateFallbackLayout } from './fallbackEngine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface GenerateLayoutResult {
  layout: LayoutConfigDto;
  engine: 'ai-openai' | 'deterministic-fallback';
  openAiError?: string;
}

/**
 * Dynamically resolves OPENAI_API_KEY from environment and .env files on disk
 * without requiring server restarts when .env is updated.
 */
export function getOpenAIApiKey(): string {
  // 1. Scan disk locations for .env files first for instant hot-reloading
  const envCandidates = [
    path.resolve(process.cwd(), 'backend/.env'),
    path.resolve(process.cwd(), '.env'),
    path.resolve(__dirname, '../../.env'),
    path.resolve(__dirname, '../../../.env'),
    path.resolve(__dirname, '../.env')
  ];

  for (const candidate of envCandidates) {
    try {
      if (fs.existsSync(candidate)) {
        const fileContent = fs.readFileSync(candidate, 'utf-8');
        const parsed = dotenv.parse(fileContent);
        const resolved = parsed.OPENAI_API_KEY;
        if (typeof resolved === 'string') {
          const key = resolved.trim().replace(/^["']|["']$/g, '');
          process.env.OPENAI_API_KEY = key;
          if (key.length > 0) {
            return key;
          }
          return '';
        }
      }
    } catch {
      // Continue searching next candidate
    }
  }

  // 2. Direct process.env check (e.g. system env or container deployment)
  const envKey = process.env.OPENAI_API_KEY;
  if (envKey && envKey.trim().length > 0) {
    return envKey.trim().replace(/^["']|["']$/g, '');
  }

  return '';
}

export const getGeminiApiKey = getOpenAIApiKey;

/**
 * Strips secret API keys from error messages before exposing to client or logs.
 */
function sanitizeErrorMessage(msg: string, key?: string): string {
  let clean = msg;
  try {
    const parsed = JSON.parse(msg);
    if (parsed.error && parsed.error.message) {
      clean = parsed.error.message;
    }
  } catch {
    // raw string
  }

  if (key && key.length > 5) {
    clean = clean.split(key).join('[REDACTED_KEY]');
  }
  clean = clean.replace(/key=[a-zA-Z0-9_\-]+/gi, 'key=[REDACTED]');
  clean = clean.replace(/sk-[a-zA-Z0-9_\-]{20,}/g, '[REDACTED_KEY]');

  if (clean.includes('Incorrect API key provided') || clean.includes('invalid_api_key') || clean.includes('API key not valid')) {
    return 'Invalid OpenAI API key. Please check your OPENAI_API_KEY in backend/.env';
  }
  if (clean.includes('insufficient_quota') || clean.includes('Quota exceeded') || clean.includes('exceeded your current quota')) {
    return 'OpenAI API quota exceeded (HTTP 429). Please check your OpenAI account billing or quota.';
  }
  if (clean.includes('rate_limit_exceeded') || clean.includes('Rate limit reached')) {
    return 'OpenAI rate limit reached (HTTP 429). Please wait a moment and retry.';
  }
  if (clean.includes('model_not_found') || clean.includes('does not exist')) {
    return 'Requested OpenAI model is unavailable. Please verify model permissions in backend/.env.';
  }

  return clean;
}

/**
 * Normalizes raw LLM output to conform strictly to LayoutConfigSchema
 */
function normalizeOpenAIOutput(raw: any): any {
  if (!raw || typeof raw !== 'object') return raw;

  const validLayouts = [
    'image-left-content-right',
    'image-right-content-left',
    'centered-product',
    'full-background-image',
    'split-screen',
    'minimal-editorial',
    'product-focused',
    'text-focused'
  ];

  let layoutType = String(raw.layoutType || '').toLowerCase().trim();
  if (!validLayouts.includes(layoutType)) {
    if (layoutType.includes('split')) layoutType = 'split-screen';
    else if (layoutType.includes('center')) layoutType = 'centered-product';
    else if (layoutType.includes('background')) layoutType = 'full-background-image';
    else if (layoutType.includes('editorial') || layoutType.includes('minimal')) layoutType = 'minimal-editorial';
    else if (layoutType.includes('product')) layoutType = 'product-focused';
    else if (layoutType.includes('text')) layoutType = 'text-focused';
    else if (layoutType.includes('right')) layoutType = 'image-right-content-left';
    else layoutType = 'image-left-content-right';
  }

  const fixHex = (val: any, fallback: string) => {
    if (typeof val !== 'string') return fallback;
    let s = val.trim();
    if (!s.startsWith('#') && !s.startsWith('rgb')) s = '#' + s;
    if (/^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$/.test(s)) return s;
    return fallback;
  };

  const theme = raw.theme || {};
  const typography = raw.typography || {};
  const composition = raw.composition || {};
  const responsiveRules = raw.responsiveRules || {};
  const creativeRationale = raw.creativeRationale || {};

  return {
    layoutType,
    theme: {
      primaryColor: fixHex(theme.primaryColor, '#0F172A'),
      secondaryColor: fixHex(theme.secondaryColor, '#3B82F6'),
      accentColor: fixHex(theme.accentColor, '#F59E0B'),
      backgroundColor: fixHex(theme.backgroundColor, '#FFFFFF'),
      textColor: fixHex(theme.textColor, '#0F172A'),
      cardBackground: typeof theme.cardBackground === 'string' && theme.cardBackground.trim()
        ? theme.cardBackground.trim()
        : 'rgba(255, 255, 255, 0.95)',
      fontFamily: ['sans', 'serif', 'mono', 'display'].includes(String(theme.fontFamily).toLowerCase())
        ? String(theme.fontFamily).toLowerCase()
        : 'sans'
    },
    typography: {
      headlineScale: ['compact', 'standard', 'large', 'heroic'].includes(String(typography.headlineScale).toLowerCase())
        ? String(typography.headlineScale).toLowerCase()
        : 'large',
      bodyScale: ['small', 'medium', 'large'].includes(String(typography.bodyScale).toLowerCase())
        ? String(typography.bodyScale).toLowerCase()
        : 'medium',
      letterSpacing: ['tight', 'normal', 'wide'].includes(String(typography.letterSpacing).toLowerCase())
        ? String(typography.letterSpacing).toLowerCase()
        : 'normal',
      headlineFontWeight: ['semibold', 'bold', 'extrabold', 'black'].includes(String(typography.headlineFontWeight).toLowerCase())
        ? String(typography.headlineFontWeight).toLowerCase()
        : 'bold',
      textTransform: ['none', 'uppercase', 'capitalize'].includes(String(typography.textTransform).toLowerCase())
        ? String(typography.textTransform).toLowerCase()
        : 'none'
    },
    composition: {
      alignment: ['left', 'center', 'right'].includes(String(composition.alignment).toLowerCase())
        ? String(composition.alignment).toLowerCase()
        : 'left',
      imagePosition: ['left', 'right', 'top', 'center', 'background'].includes(String(composition.imagePosition).toLowerCase())
        ? String(composition.imagePosition).toLowerCase()
        : 'left',
      imageFit: ['cover', 'contain', 'fill'].includes(String(composition.imageFit).toLowerCase())
        ? String(composition.imageFit).toLowerCase()
        : 'cover',
      imageAspectRatio: ['square', 'portrait', 'landscape', 'wide'].includes(String(composition.imageAspectRatio).toLowerCase())
        ? String(composition.imageAspectRatio).toLowerCase()
        : 'landscape',
      ctaPosition: ['inline', 'bottom-left', 'bottom-center', 'bottom-right', 'floating'].includes(String(composition.ctaPosition).toLowerCase())
        ? String(composition.ctaPosition).toLowerCase()
        : 'inline',
      ctaStyle: ['solid', 'outline', 'gradient', 'pill'].includes(String(composition.ctaStyle).toLowerCase())
        ? String(composition.ctaStyle).toLowerCase()
        : 'solid',
      visualEmphasis: ['headline', 'product-image', 'discount-badge', 'cta'].includes(String(composition.visualEmphasis).toLowerCase())
        ? String(composition.visualEmphasis).toLowerCase()
        : 'product-image',
      spacing: ['compact', 'comfortable', 'spacious'].includes(String(composition.spacing).toLowerCase())
        ? String(composition.spacing).toLowerCase()
        : 'comfortable',
      overlayOpacity: typeof composition.overlayOpacity === 'number' ? Math.max(0, Math.min(1, composition.overlayOpacity)) : 0.4,
      hasBadge: Boolean(composition.hasBadge),
      badgePosition: ['top-left', 'top-right', 'above-headline', 'on-image'].includes(String(composition.badgePosition).toLowerCase())
        ? String(composition.badgePosition).toLowerCase()
        : 'above-headline'
    },
    responsiveRules: {
      mobile: {
        direction: ['column', 'column-reverse', 'overlay'].includes(String(responsiveRules.mobile?.direction).toLowerCase())
          ? String(responsiveRules.mobile?.direction).toLowerCase()
          : 'column',
        imageHeight: String(responsiveRules.mobile?.imageHeight || '220px'),
        ctaFullWidth: typeof responsiveRules.mobile?.ctaFullWidth === 'boolean' ? responsiveRules.mobile.ctaFullWidth : true,
        textAlign: ['left', 'center', 'right'].includes(String(responsiveRules.mobile?.textAlign).toLowerCase())
          ? String(responsiveRules.mobile?.textAlign).toLowerCase()
          : 'center'
      },
      tablet: {
        direction: ['column', 'row'].includes(String(responsiveRules.tablet?.direction).toLowerCase())
          ? String(responsiveRules.tablet?.direction).toLowerCase()
          : 'row',
        splitRatio: String(responsiveRules.tablet?.splitRatio || '50/50')
      },
      desktop: {
        direction: String(responsiveRules.desktop?.direction || 'row') === 'column' ? 'column' : 'row',
        splitRatio: String(responsiveRules.desktop?.splitRatio || '50/50')
      }
    },
    creativeRationale: {
      layoutChoice: String(creativeRationale.layoutChoice || `Selected ${layoutType} to maximize visual engagement for ${raw.productName || 'product'}.`),
      visualHierarchy: String(creativeRationale.visualHierarchy || 'Headline and product imagery prioritized for fast eye-tracking.'),
      imagePlacement: String(creativeRationale.imagePlacement || 'Positioned to provide immediate visual context.'),
      ctaPlacement: String(creativeRationale.ctaPlacement || 'Placed in direct visual path for maximum conversion rate.'),
      colorHarmony: String(creativeRationale.colorHarmony || 'Colors adjusted to ensure WCAG AA compliant contrast.'),
      responsiveStrategy: String(creativeRationale.responsiveStrategy || 'Full desktop horizontal split reflowing into stacked vertical mobile view.'),
      audienceFit: String(creativeRationale.audienceFit || 'Visual tone aligned with target audience expectations.'),
      designTips: Array.isArray(creativeRationale.designTips) && creativeRationale.designTips.length > 0
        ? creativeRationale.designTips.map(String)
        : [
            'Maintain strong visual contrast between the background and CTA button.',
            'For mobile viewports, keep product imagery above the headline to anchor visual context quickly.',
            'Ensure headline copy is under 12 words to avoid viewport crowding.'
          ]
    },
    metadata: {
      engineMode: 'ai-openai',
      generatedAt: new Date().toISOString(),
      confidenceScore: typeof raw.metadata?.confidenceScore === 'number' ? raw.metadata.confidenceScore : 0.96
    }
  };
}

export async function generateCreativeLayout(input: CreativeInputDto): Promise<GenerateLayoutResult> {
  const apiKey = getOpenAIApiKey();

  // If no API key is provided, report clear error and use fallback
  if (!apiKey) {
    const errorMsg = 'OPENAI_API_KEY is not set in backend/.env. Please add OPENAI_API_KEY=your_key in backend/.env to use OpenAI.';
    console.log(`[AI Engine] ${errorMsg}`);
    return {
      layout: generateFallbackLayout(input),
      engine: 'deterministic-fallback',
      openAiError: errorMsg
    };
  }

  try {
    const openai = new OpenAI({ apiKey });

    const prompt = `
You are an expert Creative Art Director, UI/UX Architect, and Design Technologist at Flam (an AI-native visual content company).
Analyze the following advertisement input and recommend an optimal creative layout configuration for multi-surface rendering (Mobile, Tablet, Desktop).

INPUT:
- Product Name: "${input.productName}"
- Headline: "${input.headline}"
- Description: "${input.description}"
- Call-to-Action: "${input.cta}"
- Brand Name: "${input.brandName || 'N/A'}"
- Brand Colors: ${JSON.stringify(input.brandColors)}
- Target Audience: "${input.targetAudience || 'General'}"
- Campaign Goal: "${input.campaignGoal || 'Awareness'}"
- Badge Text: "${input.badgeText || ''}"
- Has Product Image: ${Boolean(input.imageUrl)}

CRITICAL CONSTRAINTS:
1. layoutType MUST be chosen from ONLY these 8 existing layout templates:
   - "image-left-content-right"
   - "image-right-content-left"
   - "centered-product"
   - "full-background-image"
   - "split-screen"
   - "minimal-editorial"
   - "product-focused"
   - "text-focused"
2. Visual Hierarchy: Decide which element receives maximum visual weight ("headline", "product-image", "discount-badge", or "cta").
3. Color Harmony: Derive primaryColor, secondaryColor, accentColor, backgroundColor, textColor, cardBackground ensuring high contrast (WCAG AA compliant).
4. Responsive Strategy: Define distinct structural shifts for mobile (column stacking, thumb-friendly CTA, image height), tablet (balanced proportions), and desktop (panoramic split or hero grid).
5. Creative Rationale: Provide professional justification explaining:
   - layoutChoice: why this specific template is best suited for this product and objective
   - visualHierarchy: why the chosen element receives maximum focal weight
   - imagePlacement: rationale for image positioning
   - ctaPlacement: rationale for CTA placement and style
   - responsiveStrategy: structural shift explanation across Mobile, Tablet, and Desktop
   - colorHarmony: color theory and contrast justification
   - audienceFit: alignment with target audience psychology
   - designTips: 3 actionable art director tips

OUTPUT FORMAT:
Return ONLY a valid JSON object matching this schema (do NOT wrap in markdown or backticks, just raw JSON):
{
  "layoutType": "one of the 8 allowed types",
  "theme": {
    "primaryColor": "#hex",
    "secondaryColor": "#hex",
    "accentColor": "#hex",
    "backgroundColor": "#hex",
    "textColor": "#hex",
    "cardBackground": "rgba(...) or #hex",
    "fontFamily": "sans" | "serif" | "mono" | "display"
  },
  "typography": {
    "headlineScale": "compact" | "standard" | "large" | "heroic",
    "bodyScale": "small" | "medium" | "large",
    "letterSpacing": "tight" | "normal" | "wide",
    "headlineFontWeight": "semibold" | "bold" | "extrabold" | "black",
    "textTransform": "uppercase" | "none" | "capitalize"
  },
  "composition": {
    "alignment": "left" | "center" | "right",
    "imagePosition": "left" | "right" | "top" | "center" | "background",
    "imageFit": "cover" | "contain" | "fill",
    "imageAspectRatio": "square" | "portrait" | "landscape" | "wide",
    "ctaPosition": "inline" | "bottom-left" | "bottom-center" | "bottom-right" | "floating",
    "ctaStyle": "solid" | "outline" | "gradient" | "pill",
    "visualEmphasis": "headline" | "product-image" | "discount-badge" | "cta",
    "spacing": "compact" | "comfortable" | "spacious",
    "overlayOpacity": 0.4,
    "hasBadge": true or false,
    "badgePosition": "top-left" | "top-right" | "above-headline" | "on-image"
  },
  "responsiveRules": {
    "mobile": {
      "direction": "column" | "column-reverse" | "overlay",
      "imageHeight": "220px",
      "ctaFullWidth": true,
      "textAlign": "left" | "center" | "right"
    },
    "tablet": {
      "direction": "column" | "row",
      "splitRatio": "50/50"
    },
    "desktop": {
      "direction": "row",
      "splitRatio": "50/50"
    }
  },
  "creativeRationale": {
    "layoutChoice": "...",
    "visualHierarchy": "...",
    "imagePlacement": "...",
    "ctaPlacement": "...",
    "colorHarmony": "...",
    "responsiveStrategy": "...",
    "audienceFit": "...",
    "designTips": ["tip 1", "tip 2", "tip 3"]
  },
  "metadata": {
    "engineMode": "ai-openai",
    "generatedAt": "${new Date().toISOString()}",
    "confidenceScore": 0.96
  }
}
`;

    const modelName = process.env.OPENAI_MODEL || 'gpt-4o-mini';
    console.log(`[AI Engine] Dispatching generation request to OpenAI model (${modelName})...`);

    const completion = await openai.chat.completions.create({
      model: modelName,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: 'You are an expert Creative Art Director, UI/UX Architect, and Design Technologist at Flam (an AI-native visual content company). You analyze advertising creative requirements and return an optimal, mathematically balanced, and WCAG AA contrast-compliant creative layout configuration JSON object.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3
    });

    let rawText = completion.choices[0]?.message?.content || '';
    if (rawText.includes('```')) {
      rawText = rawText.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
    }

    if (!rawText.trim()) {
      throw new Error('OpenAI API returned an empty response.');
    }

    const rawJson = JSON.parse(rawText);
    const normalized = normalizeOpenAIOutput(rawJson);

    // Validate with Zod schema
    const validated = LayoutConfigSchema.safeParse(normalized);

    if (!validated.success) {
      const issueSummary = validated.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
      console.warn('[AI Engine] OpenAI response failed Zod schema validation:', issueSummary);
      return {
        layout: generateFallbackLayout(input),
        engine: 'deterministic-fallback',
        openAiError: `Schema validation failure (${issueSummary})`
      };
    }

    console.log('[AI Engine] Successfully generated layout via OpenAI! Selected archetype:', validated.data.layoutType);
    return {
      layout: validated.data,
      engine: 'ai-openai'
    };
  } catch (error: any) {
    const rawError = error.message || String(error);
    const safeMsg = sanitizeErrorMessage(rawError, apiKey);
    console.error('[AI Engine] Error calling OpenAI API. Falling back to deterministic engine:', safeMsg);
    return {
      layout: generateFallbackLayout(input),
      engine: 'deterministic-fallback',
      openAiError: safeMsg
    };
  }
}
