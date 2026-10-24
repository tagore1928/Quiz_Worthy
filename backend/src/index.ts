import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import quizRoutes from './routes/quizRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Permissive CORS to allow all previews, Vercel deployments and localhost
    callback(null, true);
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Universal mounting to handle any Vercel service rewrite variation
app.use('/api/quiz', quizRoutes);
app.use('/quiz', quizRoutes);
app.use('/api', quizRoutes);
app.use('/', quizRoutes);

// Health check route
app.get(['/api/health', '/health'], (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    service: 'Quiz Worthy Backend API',
    timestamp: new Date().toISOString(),
    env: {
      groqConfigured: !!process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'your_groq_api_key',
    },
  });
});

// Last-resort error handler so an unexpected error returns JSON instead of
// leaving the serverless function in a broken state.
app.use((err: unknown, req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled API error:', err);
  if (!res.headersSent) {
    res.status(500).json({ error: 'Unexpected server error. Please try again.' });
  }
});

// On Vercel the platform serves the exported app; opening our own port there as
// well conflicts with the runtime. Only listen when running locally.
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Quiz Worthy server running on port ${PORT}`);
  });
}

export default app;
