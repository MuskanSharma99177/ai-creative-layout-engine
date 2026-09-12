import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { CreativeInputDto, LayoutConfigDto, LayoutConfigSchema } from '../schemas/layout.schema.js';
import { generateFallbackLayout } from './fallbackEngine.js';

dotenv.config();

export async function generateCreativeLayout(input: CreativeInputDto): Promise<LayoutConfigDto> {
  // Ensure fresh environment variables are read
  dotenv.config();
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  // If no API key is provided, use deterministic fallback
  if (!apiKey) {
    console.log('[AI Engine] GEMINI_API_KEY is not set in backend/.env. Using Deterministic Fallback Engine.');
    return generateFallbackLayout(input);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

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
Return ONLY a valid JSON object matching this schema (do NOT include markdown code fences, just raw valid JSON):
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
    "engineMode": "ai-gemini",
    "generatedAt": "${new Date().toISOString()}",
    "confidenceScore": 0.96
  }
}
`;

    console.log('[AI Engine] Contacting Gemini API with @google/genai SDK...');
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.3
      }
    });

    let rawText = response.text || '';
    if (rawText.includes('```')) {
      rawText = rawText.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
    }

    const rawJson = JSON.parse(rawText);

    // Validate with Zod schema
    const validated = LayoutConfigSchema.safeParse({
      ...rawJson,
      metadata: {
        engineMode: 'ai-gemini',
        generatedAt: new Date().toISOString(),
        confidenceScore: rawJson.metadata?.confidenceScore || 0.96
      }
    });

    if (!validated.success) {
      console.warn(
        '[AI Engine] Gemini response failed Zod schema validation. Automatically falling back to Deterministic Fallback Engine. Issues:',
        validated.error.issues
      );
      return generateFallbackLayout(input);
    }

    console.log('[AI Engine] Gemini generation and Zod validation succeeded! Layout archetype:', validated.data.layoutType);
    return validated.data;
  } catch (error: any) {
    console.error(
      '[AI Engine] Error calling Gemini API. Automatically falling back to Deterministic Fallback Engine:',
      error.message || error
    );
    return generateFallbackLayout(input);
  }
}
