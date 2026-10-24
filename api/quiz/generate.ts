import type { VercelRequest, VercelResponse } from '@vercel/node';
import { generateQuizQuestions, QuizUnavailableError } from '../../backend/src/services/groqQuizService';

// Serverless entry point; generation logic lives in the backend service so the
// Express server and this function always behave the same way.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

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

    return res.status(200).json(await generateQuizQuestions(topic, quizLevel));
  } catch (error: any) {
    if (error instanceof QuizUnavailableError) {
      return res.status(503).json({ error: error.message });
    }
    console.error('Vercel serverless quiz error:', error);
    return res.status(500).json({ error: 'Quiz generation failed. Please try again.' });
  }
}
