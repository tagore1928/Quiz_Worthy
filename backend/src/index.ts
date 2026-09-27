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
    // Allow requests with no origin (e.g., mobile apps, curl, server-to-server) or matching localhost / CLIENT_URL
    if (!origin || origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:') || origin === process.env.CLIENT_URL) {
      callback(null, true);
    } else {
      callback(null, true); // Permissive for API consumers
    }
  },
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/quiz', quizRoutes);
app.use('/quiz', quizRoutes);

// Health check route
app.get(['/api/health', '/health'], (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'Quiz Worthy Backend API',
    timestamp: new Date().toISOString(),
    env: {
      groqConfigured: !!process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'your_groq_api_key',
    },
  });
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`🚀 Quiz Worthy server running on http://localhost:${PORT}`);
});
