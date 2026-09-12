import fs from 'fs';
import path from 'path';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import layoutRoutes from './routes/layoutRoutes.js';
import { getOpenAIApiKey } from './services/aiService.js';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const HOST = process.env.HOST || '0.0.0.0';

// Enable CORS for frontend development and production
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Support up to 10MB payload for base64 product image uploads
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API routes
app.use('/api', layoutRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  const apiKey = getOpenAIApiKey();
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    openAiConfigured: Boolean(apiKey && apiKey.length > 0),
    aiConfigured: Boolean(apiKey && apiKey.length > 0)
  });
});

// Optionally serve static frontend build if dist folder exists (for single-service fullstack deployment on Render)
const candidateDistPaths = [
  path.resolve(process.cwd(), '../frontend/dist'),
  path.resolve(process.cwd(), 'frontend/dist'),
  path.resolve(process.cwd(), 'dist/public')
];

for (const distPath of candidateDistPaths) {
  if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) return next();
      res.sendFile(path.join(distPath, 'index.html'));
    });
    break;
  }
}

app.listen(PORT, HOST, () => {
  const isConfigured = Boolean(getOpenAIApiKey());
  console.log(`==================================================`);
  console.log(`AI-Powered Adaptive Creative Layout Engine API`);
  console.log(`Server listening on http://${HOST}:${PORT}`);
  console.log(`OpenAI API: ${isConfigured ? 'Configured (Active)' : 'Unset (Using Deterministic Fallback Engine)'}`);
  console.log(`==================================================`);
});
