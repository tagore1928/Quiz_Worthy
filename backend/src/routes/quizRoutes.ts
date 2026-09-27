import { Router, Request, Response } from 'express';
import { generateQuizQuestions } from '../services/groqQuizService';

const router = Router();

// POST /api/quiz/generate
router.post('/generate', async (req: Request, res: Response) => {
  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        body = {};
      }
    }

    const topic = body?.topic || 'Operating Systems';
    const level = body?.level;
    const quizLevel = typeof level === 'number' && [1, 2, 3].includes(level) ? level : 2;

    const quizData = await generateQuizQuestions(topic, quizLevel);
    return res.json(quizData);
  } catch (error: any) {
    console.error('Quiz generation error:', error);
    try {
      const fallback = await generateQuizQuestions('Operating Systems', 2);
      return res.json(fallback);
    } catch (finalErr) {
      return res.status(500).json({ error: 'Failed to generate quiz questions.' });
    }
  }
});

export default router;
