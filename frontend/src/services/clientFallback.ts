import { CreativeInput, LayoutConfig } from '../types/layout';

function getLuminance(hex: string): number {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255;

  const a = [r, g, b].map((v) => {
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });

  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function getContrastRatio(hex1: string, hex2: string): number {
  const lum1 = getLuminance(hex1);
  const lum2 = getLuminance(hex2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

function ensureAccessibleTextColor(bgHex: string, preferredTextHex: string): string {
  try {
    const ratio = getContrastRatio(bgHex, preferredTextHex);
    if (ratio >= 4.5) return preferredTextHex;
    const whiteRatio = getContrastRatio(bgHex, '#FFFFFF');
    const blackRatio = getContrastRatio(bgHex, '#0F172A');
    return whiteRatio > blackRatio ? '#FFFFFF' : '#0F172A';
  } catch {
    return '#0F172A';
  }
}

export function generateClientFallbackLayout(input: CreativeInput): LayoutConfig {
  const primaryColor = input.brandColors[0] || '#0F172A';
  const secondaryColor = input.brandColors[1] || '#3B82F6';
  const accentColor = input.brandColors[2] || '#F59E0B';

  const headlineLen = input.headline.length;
  const descLen = input.description.length;
  const hasImage = Boolean(input.imageUrl && input.imageUrl.trim().length > 0);
  const isSaleOrDiscount =
    input.headline.toLowerCase().includes('sale') ||
    input.headline.toLowerCase().includes('off') ||
    input.headline.includes('%') ||
    Boolean(input.badgeText && input.badgeText.length > 0);

  const goalLower = (input.campaignGoal || '').toLowerCase();
  const audienceLower = (input.targetAudience || '').toLowerCase();

  const isLuxury =
    goalLower.includes('luxury') ||
    audienceLower.includes('luxury') ||
    goalLower.includes('editorial') ||
    audienceLower.includes('premium');

  let layoutType: LayoutConfig['layoutType'] = 'image-left-content-right';
  let visualEmphasis: LayoutConfig['composition']['visualEmphasis'] = 'product-image';
  let fontFamily: LayoutConfig['theme']['fontFamily'] = 'sans';
  let headlineScale: LayoutConfig['typography']['headlineScale'] = 'large';
  let ctaStyle: LayoutConfig['composition']['ctaStyle'] = 'solid';
  let imagePosition: LayoutConfig['composition']['imagePosition'] = 'left';
  let spacing: LayoutConfig['composition']['spacing'] = 'comfortable';

  if (isLuxury) {
    layoutType = 'minimal-editorial';
    fontFamily = 'serif';
    headlineScale = 'standard';
    ctaStyle = 'outline';
    visualEmphasis = 'headline';
    spacing = 'spacious';
    imagePosition = 'right';
  } else if (isSaleOrDiscount && hasImage) {
    layoutType = 'split-screen';
    visualEmphasis = 'discount-badge';
    headlineScale = 'heroic';
    ctaStyle = 'gradient';
    imagePosition = 'right';
    spacing = 'compact';
  } else if (descLen > 160) {
    layoutType = 'text-focused';
    visualEmphasis = 'headline';
    headlineScale = 'standard';
    spacing = 'comfortable';
    imagePosition = 'right';
  } else if (hasImage && headlineLen <= 30) {
    layoutType = 'full-background-image';
    visualEmphasis = 'product-image';
    headlineScale = 'heroic';
    ctaStyle = 'pill';
    imagePosition = 'background';
    spacing = 'comfortable';
  } else if (hasImage) {
    layoutType = 'product-focused';
    visualEmphasis = 'product-image';
    headlineScale = 'large';
    ctaStyle = 'solid';
    imagePosition = 'left';
    spacing = 'comfortable';
  } else {
    layoutType = 'centered-product';
    visualEmphasis = 'headline';
    headlineScale = 'heroic';
    ctaStyle = 'solid';
    imagePosition = 'center';
    spacing = 'comfortable';
  }

  let backgroundColor = '#FFFFFF';
  let textColor = '#0F172A';
  let cardBackground = 'rgba(255, 255, 255, 0.95)';

  if (layoutType === 'full-background-image') {
    backgroundColor = '#090D16';
    textColor = '#F8FAFC';
    cardBackground = 'rgba(15, 23, 42, 0.85)';
  } else if (layoutType === 'split-screen') {
    backgroundColor = primaryColor;
    textColor = ensureAccessibleTextColor(primaryColor, '#FFFFFF');
    cardBackground = 'rgba(255, 255, 255, 0.1)';
  } else if (layoutType === 'minimal-editorial') {
    backgroundColor = '#FAFAF9';
    textColor = '#1C1917';
    cardBackground = 'rgba(255, 255, 255, 0.9)';
  }

  return {
    layoutType,
    theme: {
      primaryColor,
      secondaryColor,
      accentColor,
      backgroundColor,
      textColor: ensureAccessibleTextColor(backgroundColor, textColor),
      cardBackground,
      fontFamily
    },
    typography: {
      headlineScale,
      bodyScale: descLen > 120 ? 'small' : 'medium',
      letterSpacing: isLuxury ? 'wide' : 'normal',
      headlineFontWeight: isLuxury ? 'semibold' : headlineScale === 'heroic' ? 'black' : 'bold',
      textTransform: isSaleOrDiscount ? 'uppercase' : 'none'
    },
    composition: {
      alignment: layoutType === 'centered-product' ? 'center' : 'left',
      imagePosition,
      imageFit: layoutType === 'full-background-image' ? 'cover' : 'contain',
      imageAspectRatio: layoutType === 'split-screen' ? 'square' : 'landscape',
      ctaPosition:
        layoutType === 'centered-product'
          ? 'bottom-center'
          : layoutType === 'product-focused'
          ? 'bottom-left'
          : 'inline',
      ctaStyle,
      visualEmphasis,
      spacing,
      overlayOpacity: layoutType === 'full-background-image' ? 0.65 : 0.2,
      hasBadge: Boolean(input.badgeText && input.badgeText.length > 0) || isSaleOrDiscount,
      badgePosition: 'above-headline'
    },
    responsiveRules: {
      mobile: {
        direction: 'column',
        imageHeight: layoutType === 'product-focused' ? '280px' : '220px',
        ctaFullWidth: true,
        textAlign: layoutType === 'centered-product' ? 'center' : 'left'
      },
      tablet: {
        direction: layoutType === 'full-background-image' ? 'column' : 'row',
        splitRatio: '50/50'
      },
      desktop: {
        direction: 'row',
        splitRatio: layoutType === 'product-focused' ? '60/40' : '50/50'
      }
    },
    creativeRationale: {
      visualHierarchy: `Prioritizing ${visualEmphasis.replace('-', ' ')} based on ${
        isSaleOrDiscount ? 'high-urgency offer signals' : 'content volume and product imagery'
      }. Headline scale tuned to ${headlineScale}.`,
      colorHarmony: `Base background (${backgroundColor}) calibrated with primary brand color (${primaryColor}) and accent (${accentColor}) to assure WCAG AA compliant contrast.`,
      responsiveStrategy:
        'Desktop balances media and copy side-by-side; Tablet condenses padding; Mobile stacks imagery above copy with a full-width thumb-zone CTA.',
      audienceFit: `Tuned for ${input.targetAudience || 'broad consumer base'} optimizing for ${
        input.campaignGoal || 'engagement'
      }.`,
      designTips: [
        'Maintain strong visual contrast between the background and CTA button.',
        'For mobile viewports, keep product imagery above the headline to anchor visual context quickly.',
        'Ensure headline copy is under 12 words to avoid viewport crowding.'
      ]
    },
    metadata: {
      engineMode: 'deterministic-fallback',
      generatedAt: new Date().toISOString(),
      confidenceScore: 0.88
    }
  };
}
