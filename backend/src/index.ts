import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import layoutRoutes from './routes/layoutRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

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
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    aiConfigured: Boolean(process.env.GEMINI_API_KEY?.trim())
  });
});

app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`AI-Powered Adaptive Creative Layout Engine API`);
  console.log(`Server listening on http://localhost:${PORT}`);
  console.log(`Gemini AI: ${process.env.GEMINI_API_KEY?.trim() ? 'Configured (Active)' : 'Unset (Using Deterministic Fallback Engine)'}`);
  console.log(`==================================================`);
});
