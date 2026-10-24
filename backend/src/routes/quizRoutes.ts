import { Router, Request, Response } from 'express';
import { generateQuizQuestions, QuizUnavailableError } from '../services/groqQuizService';

const router = Router();

const handleQuizGeneration = async (req: Request, res: Response) => {
  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        body = {};
      }
    }

    const topic = body?.topic || req.query?.topic as string || 'Operating Systems';
    const rawLevel = body?.level || req.query?.level;
    const parsedLevel = typeof rawLevel === 'string' ? parseInt(rawLevel, 10) : rawLevel;
    const quizLevel = typeof parsedLevel === 'number' && [1, 2, 3].includes(parsedLevel) ? parsedLevel : 2;

    const quizData = await generateQuizQuestions(topic, quizLevel);
    return res.status(200).json(quizData);
  } catch (error: any) {
    if (error instanceof QuizUnavailableError) {
      return res.status(503).json({ error: error.message });
    }
    console.error('Quiz generation error:', error);
    return res.status(500).json({ error: 'Quiz generation failed. Please try again.' });
  }
};

// Mount handlers across common path patterns
router.post('/generate', handleQuizGeneration);
router.get('/generate', handleQuizGeneration);
router.post('/quiz/generate', handleQuizGeneration);
router.get('/quiz/generate', handleQuizGeneration);
router.post('/api/quiz/generate', handleQuizGeneration);
router.get('/api/quiz/generate', handleQuizGeneration);
router.post('/', handleQuizGeneration);
router.get('/', handleQuizGeneration);

export default router;
