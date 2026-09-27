import { Router, Request, Response } from 'express';
import { generateQuizQuestions } from '../services/groqQuizService';

const router = Router();

// POST /api/quiz/generate
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const { topic, level } = req.body;

    if (!topic || typeof topic !== 'string') {
      return res.status(400).json({ error: 'Topic string is required.' });
    }

    const quizLevel = typeof level === 'number' && [1, 2, 3].includes(level) ? level : 2;

    const quizData = await generateQuizQuestions(topic, quizLevel);
    return res.json(quizData);
  } catch (error: any) {
    console.error('Quiz generation error:', error);
    return res.status(500).json({ error: 'Failed to generate quiz questions.' });
  }
});

export default router;
