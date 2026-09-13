import { describe, it, expect } from 'vitest';
import { generateFallbackLayout } from '../services/fallbackEngine.js';
import { CreativeInputSchema, LayoutConfigSchema } from '../schemas/layout.schema.js';

describe('Layout Engine Schema & Fallback Suite', () => {
  it('should validate complete valid creative input', () => {
    const input = {
      productName: 'Nike Air Zoom Pegasus',
      headline: 'Summer Speed Sale',
      description: 'Engineered for responsive cushioning and lightweight performance.',
      cta: 'Shop Now',
      brandName: 'Nike',
      brandColors: ['#000000', '#FF3B30'],
      targetAudience: 'Marathon runners & fitness enthusiasts',
      campaignGoal: 'Direct Sales',
      badgeText: '50% OFF'
    };

    const parsed = CreativeInputSchema.safeParse(input);
    expect(parsed.success).toBe(true);
  });

  it('should reject creative input missing required headline or cta', () => {
    const invalidInput = {
      productName: 'Nike Air Zoom',
      description: 'Great shoes'
    };

    const parsed = CreativeInputSchema.safeParse(invalidInput);
    expect(parsed.success).toBe(false);
  });

  it('should generate a valid LayoutConfig conforming strictly to Zod schema', () => {
    const input = {
      productName: 'AeroPulse Noise Canceling Headphones',
      headline: 'Silence The Noise. Elevate The Sound.',
      description: 'High-fidelity audio with spatial 3D audio and 40-hour battery life.',
      cta: 'Order Now',
      brandColors: ['#0F172A', '#6366F1', '#10B981'],
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e'
    };

    const layout = generateFallbackLayout(input);
    const validated = LayoutConfigSchema.safeParse(layout);

    expect(validated.success).toBe(true);
    expect(layout.metadata.engineMode).toBe('deterministic-fallback');
    expect(layout.theme.primaryColor).toBe('#0F172A');
  });

  it('should adapt to sale and discount triggers with high-urgency layout', () => {
    const saleInput = {
      productName: 'Sneaker Flash Sale',
      headline: 'MEGA SALE 50% OFF',
      description: 'Grab your pair before stock runs out.',
      cta: 'Claim Discount',
      brandColors: ['#DC2626', '#000000'],
      badgeText: '50% OFF',
      imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff'
    };

    const layout = generateFallbackLayout(saleInput);
    expect(layout.layoutType).toBe('split-screen');
    expect(layout.composition.hasBadge).toBe(true);
    expect(layout.composition.visualEmphasis).toBe('discount-badge');
  });

  it('should adapt to luxury / editorial campaign goal with minimal-editorial template', () => {
    const luxuryInput = {
      productName: 'Maison Noir Eau de Parfum',
      headline: 'The Essence of Timeless Sophistication',
      description: 'Crafted in Grasse with notes of rare ambergris, bergamot, and smoked vetiver.',
      cta: 'Discover Collection',
      brandColors: ['#1C1917', '#D4AF37'],
      campaignGoal: 'Luxury Brand Awareness',
      targetAudience: 'Connoisseurs of fine fragrance'
    };

    const layout = generateFallbackLayout(luxuryInput);
    expect(layout.layoutType).toBe('minimal-editorial');
    expect(layout.theme.fontFamily).toBe('serif');
    expect(layout.composition.spacing).toBe('spacious');
  });

  it('should handle long text gracefully with text-focused layout', () => {
    const longTextInput = {
      productName: 'Enterprise Cloud Security',
      headline: 'Next-Gen Autonomous Zero Trust Architecture',
      description:
        'Protect your distributed multi-cloud workloads with continuous machine-learning threat detection, automated policy remediation, end-to-end cryptographic integrity, and zero friction for authorized developers across all global availability zones.',
      cta: 'Request Demo',
      brandColors: ['#1E293B', '#0284C7']
    };

    const layout = generateFallbackLayout(longTextInput);
    expect(layout.layoutType).toBe('text-focused');
    expect(layout.typography.bodyScale).toBe('small');
  });

  it('should satisfy Section 17 required presets testing', () => {
    const presets = [
      {
        name: '1. Fashion Sale',
        input: {
          productName: 'Summer Linen Collection',
          headline: 'Breeze Through Summer',
          description: '100% breathable organic linen pieces designed for effortless warm-weather style.',
          cta: 'Shop Collection',
          brandColors: ['#D97706', '#FFFBEB'],
          badgeText: 'NEW ARRIVAL'
        }
      },
      {
        name: '2. Food Delivery',
        input: {
          productName: 'Smash Burger Royale',
          headline: 'Craving Sizzling Flavor?',
          description: 'Double Wagyu patty, aged cheddar, caramelized shallots, and house truffle aioli.',
          cta: 'Order in 20 Mins',
          brandColors: ['#B91C1C', '#FBBF24'],
          badgeText: 'FREE DELIVERY'
        }
      },
      {
        name: '3. SaaS Product',
        input: {
          productName: 'DevPulse AI Copilot',
          headline: 'Ship Clean Code 10x Faster',
          description: 'Context-aware code refactoring, instant test generation, and deep architectural insights.',
          cta: 'Start 14-Day Free Trial',
          brandColors: ['#0F172A', '#6366F1'],
          campaignGoal: 'SaaS Free Trial Signups'
        }
      },
      {
        name: '4. Festival Campaign',
        input: {
          productName: 'Solstice Music & Arts Festival',
          headline: 'Three Days of Pure Wonder',
          description: '5 stages, 80+ international artists, immersive light installations, and culinary experiences.',
          cta: 'Get Early Bird Pass',
          brandColors: ['#4C1D95', '#F43F5E'],
          badgeText: 'EARLY BIRD'
        }
      },
      {
        name: '5. E-commerce Product',
        input: {
          productName: 'Veloce Carbon Fiber Bike',
          headline: 'Aerodynamic Dominance',
          description: 'Monocoque carbon frame weighing only 7.2kg with electronic 12-speed wireless shifting.',
          cta: 'Configure Yours',
          brandColors: ['#18181B', '#10B981'],
          imageUrl: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e'
        }
      }
    ];

    presets.forEach((preset) => {
      const parsedInput = CreativeInputSchema.safeParse(preset.input);
      expect(parsedInput.success, `Preset ${preset.name} input validation failed`).toBe(true);

      const layout = generateFallbackLayout(preset.input);
      const parsedLayout = LayoutConfigSchema.safeParse(layout);
      expect(parsedLayout.success, `Preset ${preset.name} layout validation failed`).toBe(true);
      expect(layout.responsiveRules.mobile.ctaFullWidth).toBe(true);
    });
  });

  it('should reliably handle Dataset A (HR/Employee Directory: Name, Age, Salary, Department)', () => {
    const datasetAInput = {
      productName: 'Alex Chen',
      headline: 'Alex Chen',
      description: 'Department: IT • Age: 23 • Salary: 45000',
      cta: 'Explore IT',
      badgeText: 'Salary: 45,000',
      brandColors: ['#0F172A', '#10B981'],
      datasetProfile: {
        rows: 2,
        columns: 4,
        columnNames: ['Name', 'Age', 'Salary', 'Department'],
        numericColumns: ['Age', 'Salary'],
        categoricalColumns: ['Department'],
        textColumns: ['Name'],
        dateColumns: [],
        missingValueCounts: { Name: 0, Age: 0, Salary: 0, Department: 0 },
        uniqueValueCounts: { Name: 2, Age: 2, Salary: 2, Department: 2 },
        sampleRows: [
          { Name: 'A', Age: '23', Salary: '45000', Department: 'IT' },
          { Name: 'B', Age: '25', Salary: '60000', Department: 'HR' }
        ]
      },
      activeRowData: { Name: 'A', Age: '23', Salary: '45000', Department: 'IT' }
    };

    const layout = generateFallbackLayout(datasetAInput);
    const validated = LayoutConfigSchema.safeParse(layout);
    expect(validated.success).toBe(true);
    expect(layout.creativeRationale.layoutChoice).toContain('dataset');
  });

  it('should reliably handle Dataset B (Product Catalog: Product, Category, Price, Rating)', () => {
    const datasetBInput = {
      productName: 'Phone',
      headline: 'Phone',
      description: 'Category: Electronics • Price: 500 • Rating: 4.5',
      cta: 'Explore Electronics',
      badgeText: 'Rating: 4.5',
      brandColors: ['#0F172A', '#3B82F6'],
      datasetProfile: {
        rows: 2,
        columns: 4,
        columnNames: ['Product', 'Category', 'Price', 'Rating'],
        numericColumns: ['Price', 'Rating'],
        categoricalColumns: ['Category'],
        textColumns: ['Product'],
        dateColumns: [],
        missingValueCounts: { Product: 0, Category: 0, Price: 0, Rating: 0 },
        uniqueValueCounts: { Product: 2, Category: 2, Price: 2, Rating: 2 },
        sampleRows: [
          { Product: 'Phone', Category: 'Electronics', Price: '500', Rating: '4.5' },
          { Product: 'Book', Category: 'Education', Price: '20', Rating: '4.2' }
        ]
      },
      activeRowData: { Product: 'Phone', Category: 'Electronics', Price: '500', Rating: '4.5' }
    };

    const layout = generateFallbackLayout(datasetBInput);
    const validated = LayoutConfigSchema.safeParse(layout);
    expect(validated.success).toBe(true);
  });

  it('should reliably handle Dataset C (Sensor/Weather Log with missing value: Date, Temperature, Humidity)', () => {
    const datasetCInput = {
      productName: '2026-01-01',
      headline: '2026-01-01',
      description: 'Temperature: 24.5 • Humidity: 61',
      cta: 'Inspect Metrics',
      badgeText: 'Temperature: 24.5',
      brandColors: ['#1C1917', '#D97706'],
      datasetProfile: {
        rows: 2,
        columns: 3,
        columnNames: ['Date', 'Temperature', 'Humidity'],
        numericColumns: ['Temperature', 'Humidity'],
        categoricalColumns: [],
        textColumns: [],
        dateColumns: ['Date'],
        missingValueCounts: { Date: 0, Temperature: 0, Humidity: 1 },
        uniqueValueCounts: { Date: 2, Temperature: 2, Humidity: 1 },
        sampleRows: [
          { Date: '2026-01-01', Temperature: '24.5', Humidity: '61' },
          { Date: '2026-01-02', Temperature: '', Humidity: '' }
        ]
      },
      activeRowData: { Date: '2026-01-01', Temperature: '24.5', Humidity: '61' }
    };

    const layout = generateFallbackLayout(datasetCInput);
    const validated = LayoutConfigSchema.safeParse(layout);
    expect(validated.success).toBe(true);
    expect(layout.theme.fontFamily).toBe('mono'); // Date/Sensor logs use mono
  });
});
