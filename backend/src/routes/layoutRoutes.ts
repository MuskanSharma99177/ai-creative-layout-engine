import { Router } from 'express';
import { generateLayoutHandler, fallbackLayoutHandler } from '../controllers/layoutController.js';

const router = Router();

// Primary endpoint requested in prompt: POST /api/generate-layout
router.post('/generate-layout', generateLayoutHandler);

// Optional dedicated fallback testing endpoint
router.post('/fallback-layout', fallbackLayoutHandler);

export default router;
