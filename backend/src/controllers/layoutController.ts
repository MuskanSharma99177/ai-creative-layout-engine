import { Request, Response } from 'express';
import { CreativeInputSchema } from '../schemas/layout.schema.js';
import { generateCreativeLayout } from '../services/aiService.js';
import { generateFallbackLayout } from '../services/fallbackEngine.js';

export async function generateLayoutHandler(req: Request, res: Response): Promise<void> {
  try {
    const parseResult = CreativeInputSchema.safeParse(req.body);

    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        error: 'Invalid advertisement input parameters',
        details: parseResult.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message
        }))
      });
      return;
    }

    const input = parseResult.data;
    const result = await generateCreativeLayout(input);

    res.status(200).json({
      success: true,
      layout: result.layout,
      engine: result.engine,
      openAiError: result.openAiError,
      geminiError: result.openAiError,
      input
    });
  } catch (err: any) {
    console.error('[Layout Controller Error]:', err);
    res.status(500).json({
      success: false,
      error: 'An unexpected error occurred while generating creative layout.',
      message: 'Please retry with adjusted parameters or check system status.'
    });
  }
}

export function fallbackLayoutHandler(req: Request, res: Response): void {
  try {
    const parseResult = CreativeInputSchema.safeParse(req.body);

    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        error: 'Invalid advertisement input parameters',
        details: parseResult.error.issues
      });
      return;
    }

    const layout = generateFallbackLayout(parseResult.data);
    res.status(200).json({
      success: true,
      layout,
      input: parseResult.data
    });
  } catch (err: any) {
    console.error('[Fallback Controller Error]:', err);
    res.status(500).json({
      success: false,
      error: 'Unable to calculate deterministic fallback layout.'
    });
  }
}
