export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface QuizResponse {
  topic: string;
  level: number;
  questions: QuizQuestion[];
}

export interface QuizAttempt {
  id?: string;
  topic: string;
  score: number;
  percentage: number;
  previousLevel: number;
  newLevel: number;
  timestamp: string;
}
