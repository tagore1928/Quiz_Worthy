import express, { Request, Response } from 'express';
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

// Always listen on process.env.PORT for both Vercel Services and local development
app.listen(PORT, () => {
  console.log(`🚀 Quiz Worthy server running on port ${PORT}`);
});

export default app;
