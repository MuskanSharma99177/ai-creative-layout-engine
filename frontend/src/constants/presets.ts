import { DeviceSpec, LayoutType, PresetCampaign } from '../types/layout';

export const DEVICE_PRESETS: DeviceSpec[] = [
  {
    id: 'mobile',
    label: 'Mobile',
    width: 390,
    height: 680,
    aspectRatio: '9:16',
    icon: 'Smartphone',
    description: '390 × 680 (Phone Story / In-Feed)'
  },
  {
    id: 'tablet',
    label: 'Tablet',
    width: 768,
    height: 600,
    aspectRatio: '4:3',
    icon: 'Tablet',
    description: '768 × 600 (iPad / Tablet Ad)'
  },
  {
    id: 'desktop',
    label: 'Desktop',
    width: 1080,
    height: 600,
    aspectRatio: '16:9',
    icon: 'Monitor',
    description: '1080 × 600 (Billboard / Landscape Banner)'
  }
];

export const LAYOUT_TEMPLATES_METADATA: {
  id: LayoutType;
  name: string;
  description: string;
  bestFor: string;
}[] = [
  {
    id: 'image-left-content-right',
    name: 'Split Left Hero',
    description: 'Product image on left, copy and CTA structured on the right',
    bestFor: 'High-converting general e-commerce'
  },
  {
    id: 'image-right-content-left',
    name: 'Split Right Hero',
    description: 'Typography lead-in on left with product hero focal on right',
    bestFor: 'Narrative storytelling & feature launches'
  },
  {
    id: 'centered-product',
    name: 'Centered Spotlight',
    description: 'Symmetrical center-aligned product with balanced header and bottom CTA',
    bestFor: 'Iconic flagship products'
  },
  {
    id: 'full-background-image',
    name: 'Full Background Billboard',
    description: 'Immersive background with glassmorphic typography overlay',
    bestFor: 'Lifestyle, events, travel, and atmosphere'
  },
  {
    id: 'split-screen',
    name: 'Dynamic Split Screen',
    description: '50/50 dual color block contrast framing product vs callout',
    bestFor: 'Flash sales & high-urgency discounts'
  },
  {
    id: 'minimal-editorial',
    name: 'Minimal Editorial',
    description: 'Serif typography, generous whitespace, subtle framed aesthetics',
    bestFor: 'Luxury goods, fashion, perfumes, watches'
  },
  {
    id: 'product-focused',
    name: 'Product Dominated',
    description: 'Product fills 70% of canvas with streamlined badge & floating CTA',
    bestFor: 'Visually stunning apparel, shoes, hardware'
  },
  {
    id: 'text-focused',
    name: 'Typography Heavy',
    description: 'Bold typographic hierarchy and message impact with secondary media',
    bestFor: 'Announcements, software features, services'
  }
];

export const SAMPLE_IMAGES = [
  {
    label: 'Nike Running Shoes',
    url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80'
  },
  {
    label: 'Luxury Fragrance',
    url: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&auto=format&fit=crop&q=80'
  },
  {
    label: 'Gourmet Burger',
    url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80'
  },
  {
    label: 'Studio Headphones',
    url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80'
  },
  {
    label: 'Music Festival',
    url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=80'
  },
  {
    label: 'Carbon Road Bike',
    url: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800&auto=format&fit=crop&q=80'
  }
];

export const CAMPAIGN_PRESETS: PresetCampaign[] = [
  {
    id: 'nike-summer-sale',
    name: 'Nike Running Shoes',
    category: 'Fashion & Footwear',
    input: {
      productName: 'Nike Air Zoom Pegasus',
      headline: 'Summer Speed Sale',
      description: 'Engineered for responsive cushioning, energy return, and breathable marathon support. Step into peak velocity.',
      cta: 'Shop Now — 50% Off',
      brandName: 'Nike',
      brandColors: ['#0A0A0A', '#E11D48', '#FFFFFF'],
      targetAudience: 'Marathon runners & urban athletes',
      campaignGoal: 'Direct Sales / Summer Clearance',
      badgeText: '50% OFF TODAY',
      imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80'
    }
  },
  {
    id: 'smash-burger',
    name: 'Gourmet Burger Royale',
    category: 'Food Delivery',
    input: {
      productName: 'Truffle Wagyu Melt',
      headline: 'Craving Sizzling Flavor?',
      description: 'Double smash Wagyu beef patties, aged cheddar cheese, caramelized shallots, and house truffle garlic aioli.',
      cta: 'Order In 20 Mins',
      brandName: 'Royale Kitchen',
      brandColors: ['#991B1B', '#F59E0B', '#1E1B18'],
      targetAudience: 'Foodies and weekend cravings',
      campaignGoal: 'Instant Order Conversions',
      badgeText: 'FREE DELIVERY OVER $25',
      imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80'
    }
  },
  {
    id: 'saas-copilot',
    name: 'DevPulse AI Copilot',
    category: 'SaaS & Developer Tech',
    input: {
      productName: 'DevPulse Code Studio',
      headline: 'Ship Clean Code 10x Faster',
      description: 'Autonomous AI pair programmer that auto-generates unit tests, refactors legacy code, and detects vulnerabilities in real time.',
      cta: 'Start 14-Day Free Trial',
      brandName: 'DevPulse',
      brandColors: ['#0F172A', '#6366F1', '#38BDF8'],
      targetAudience: 'Engineering teams & CTOs',
      campaignGoal: 'SaaS Free Trial Signups',
      badgeText: 'NEW V2.5 LAUNCH',
      imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80'
    }
  },
  {
    id: 'luxury-perfume',
    name: 'Maison Noir Fragrance',
    category: 'Luxury Goods',
    input: {
      productName: 'Maison Noir Eau de Parfum',
      headline: 'The Essence of Timeless Elegance',
      description: 'Handcrafted in Grasse with notes of rare wild ambergris, bergamot rind, and smoked Haitian vetiver.',
      cta: 'Discover The Private Blend',
      brandName: 'Maison Noir Paris',
      brandColors: ['#1C1917', '#D4AF37', '#F5F5F4'],
      targetAudience: 'Connoisseurs of fine bespoke fragrance',
      campaignGoal: 'Luxury Brand Prestige',
      badgeText: 'LIMITED TO 500 BOTTLES',
      imageUrl: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&auto=format&fit=crop&q=80'
    }
  },
  {
    id: 'solstice-festival',
    name: 'Solstice Music Fest',
    category: 'Festival & Events',
    input: {
      productName: 'Solstice Arts Festival 2026',
      headline: 'Three Days of Pure Wonder',
      description: '5 stages of electronic soundscapes, 80+ international live artists, interactive projection domes, and gourmet cuisine under the stars.',
      cta: 'Claim Early Bird Pass',
      brandName: 'Solstice',
      brandColors: ['#311042', '#EC4899', '#F97316'],
      targetAudience: 'Music lovers, festivalgoers, creatives',
      campaignGoal: 'Ticket Presale',
      badgeText: 'EARLY BIRD PASSES',
      imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=80'
    }
  }
];
