import { GoogleGenerativeAI } from '@google/generative-ai';
import { CreativeInputDto, LayoutConfigDto, LayoutConfigSchema } from '../schemas/layout.schema.js';
import { generateFallbackLayout } from './fallbackEngine.js';

export async function generateCreativeLayout(input: CreativeInputDto): Promise<LayoutConfigDto> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  // If no API key is provided, use deterministic fallback
  if (!apiKey) {
    console.log('[AI Engine] GEMINI_API_KEY not configured. Invoking Deterministic Fallback Engine.');
    return generateFallbackLayout(input);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    // Use gemini-1.5-flash for speed, reliability, and structured JSON output support
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.4
      }
    });

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

GUIDELINES:
1. Select the most fitting layoutType among:
   - "image-left-content-right"
   - "image-right-content-left"
   - "centered-product"
   - "full-background-image"
   - "split-screen"
   - "minimal-editorial"
   - "product-focused"
   - "text-focused"
2. Visual Hierarchy: Decide which element receives maximum visual weight (headline, product-image, discount-badge, or cta).
3. Color Harmony: Derive primaryColor, secondaryColor, accentColor, backgroundColor, textColor, cardBackground ensuring high contrast (WCAG AA compliant).
4. Responsive Strategy: Define distinct structural shifts for mobile (e.g. column stacking, thumb-friendly CTA, image height), tablet (balanced proportions), and desktop (panoramic split or hero grid).
5. Creative Rationale: Provide professional justification explaining why this layout, color scheme, and typography scale were selected for this specific product and audience.

OUTPUT FORMAT:
Return a strictly formatted JSON object adhering to this shape:
{
  "layoutType": "...",
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
    "visualHierarchy": "...",
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

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const rawJson = JSON.parse(text);

    // Validate with Zod schema
    const validated = LayoutConfigSchema.safeParse({
      ...rawJson,
      metadata: {
        engineMode: 'ai-gemini',
        generatedAt: new Date().toISOString(),
        confidenceScore: rawJson.metadata?.confidenceScore || 0.95
      }
    });

    if (!validated.success) {
      console.warn(
        '[AI Engine] AI JSON output failed schema validation. Falling back to deterministic engine. Errors:',
        validated.error.issues
      );
      return generateFallbackLayout(input);
    }

    return validated.data;
  } catch (error) {
    console.error('[AI Engine] Error invoking Gemini API, defaulting to Fallback Engine:', error);
    return generateFallbackLayout(input);
  }
}
