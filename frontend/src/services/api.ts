import { CreativeInput, LayoutConfig } from '../types/layout';
import { generateClientFallbackLayout } from './clientFallback';

export interface GenerateResult {
  layout: LayoutConfig;
  source: 'ai-gemini' | 'backend-fallback' | 'client-fallback';
  warning?: string;
}

export async function requestLayoutGeneration(input: CreativeInput): Promise<GenerateResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 18000);

  try {
    const response = await fetch('/api/generate-layout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(input),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`[API Service] Server returned HTTP ${response.status}. Using client fallback engine.`);
      const fallbackLayout = generateClientFallbackLayout(input);
      return {
        layout: fallbackLayout,
        source: 'client-fallback',
        warning: `Server returned status ${response.status}. Generated layout using local fallback engine.`
      };
    }

    const data = await response.json();
    if (data && data.layout) {
      return {
        layout: data.layout,
        source: data.layout.metadata?.engineMode === 'ai-gemini' ? 'ai-gemini' : 'backend-fallback'
      };
    }

    throw new Error('Malformed response payload');
  } catch (error: any) {
    clearTimeout(timeoutId);
    console.warn('[API Service] Network request failed, using client fallback:', error.message || error);
    const fallbackLayout = generateClientFallbackLayout(input);
    return {
      layout: fallbackLayout,
      source: 'client-fallback',
      warning: 'Backend API unreachable. Generated layout using local deterministic fallback engine.'
    };
  }
}
