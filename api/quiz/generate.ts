import type { VercelRequest, VercelResponse } from '@vercel/node';
import Groq from 'groq-sdk';

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

const FALLBACK_QUESTIONS: Record<string, QuizQuestion[]> = {
  'Operating Systems': [
    {
      id: 1,
      question: 'What is the primary function of an Operating System Kernel?',
      options: ['Managing hardware resources and system operations', 'Compiling high-level source code', 'Providing web browsing capabilities', 'Designing user interfaces'],
      correctAnswer: 'Managing hardware resources and system operations',
      explanation: 'The kernel is the core component of an OS that manages system resources like CPU, memory, and I/O devices.'
    },
    {
      id: 2,
      question: 'Which scheduling algorithm can cause the convoy effect?',
      options: ['First-Come, First-Served (FCFS)', 'Round Robin', 'Shortest Job First (SJF)', 'Priority Scheduling'],
      correctAnswer: 'First-Come, First-Served (FCFS)',
      explanation: 'In FCFS, if a long CPU-bound process arrives first, all shorter I/O-bound processes wait behind it, causing the convoy effect.'
    },
    {
      id: 3,
      question: 'What occurs during a context switch in an OS?',
      options: ['The state of an active process is saved and another process state is restored', 'The system reboots automatically', 'Memory is cleared completely', 'The kernel updates system date and time'],
      correctAnswer: 'The state of an active process is saved and another process state is restored',
      explanation: 'A context switch saves the PCB register states of the currently running process and restores another to allow multitasking.'
    },
    {
      id: 4,
      question: 'Which condition is NOT necessary for a deadlock to occur?',
      options: ['Preemption allowed', 'Mutual Exclusion', 'Hold and Wait', 'Circular Wait'],
      correctAnswer: 'Preemption allowed',
      explanation: 'Coffman conditions require No Preemption for a deadlock to happen. Allowing preemption prevents deadlocks.'
    },
    {
      id: 5,
      question: 'What is thrashing in virtual memory management?',
      options: ['Excessive page swapping activity spending more time paging than executing', 'Physical disk corruption', 'Overclocking the CPU frequency', 'Freeing unreferenced memory blocks'],
      correctAnswer: 'Excessive page swapping activity spending more time paging than executing',
      explanation: 'Thrashing happens when a process does not have enough frames, causing continuous page faults and page swapping.'
    },
    {
      id: 6,
      question: 'What is a Semaphore used for in operating systems?',
      options: ['Process synchronization and managing access to shared resources', 'Compiling C code', 'Formatting hard drives', 'Accelerating graphics rendering'],
      correctAnswer: 'Process synchronization and managing access to shared resources',
      explanation: 'Semaphores are integer variables used to solve critical section problems and synchronize concurrent processes.'
    },
    {
      id: 7,
      question: 'Which page replacement policy suffers from Belady’s Anomaly?',
      options: ['First-In, First-Out (FIFO)', 'Least Recently Used (LRU)', 'Optimal Page Replacement', 'Clock Policy'],
      correctAnswer: 'First-In, First-Out (FIFO)',
      explanation: 'Belady’s anomaly occurs when increasing the number of page frames results in an increase in page faults, seen in FIFO.'
    },
    {
      id: 8,
      question: 'What is the main advantage of Paging memory management over Segmentation?',
      options: ['Eliminates external fragmentation', 'Eliminates internal fragmentation', 'Allows unlimited process execution speed', 'Requires zero memory overhead'],
      correctAnswer: 'Eliminates external fragmentation',
      explanation: 'Paging divides memory into fixed-size frames, which eliminates external fragmentation.'
    },
    {
      id: 9,
      question: 'What is a race condition in concurrent programming?',
      options: ['The output depends on the sequence or timing of uncontrollable execution threads', 'A process running out of memory', 'High network latency', 'A CPU overheating event'],
      correctAnswer: 'The output depends on the sequence or timing of uncontrollable execution threads',
      explanation: 'A race condition occurs when multiple processes access and manipulate shared data concurrently without proper synchronization.'
    },
    {
      id: 10,
      question: 'What is the function of the translation lookaside buffer (TLB)?',
      options: ['A hardware cache used to speed up virtual address translation', 'A backup hard disk partition', 'A tool for debugging C++ programs', 'A network packet buffer'],
      correctAnswer: 'A hardware cache used to speed up virtual address translation',
      explanation: 'The TLB stores recent page table translations to reduce the time needed to access virtual memory.'
    }
  ]
};

const getFallbackQuestions = (topic: string, level: number): QuizQuestion[] => {
  if (FALLBACK_QUESTIONS[topic]) {
    return FALLBACK_QUESTIONS[topic];
  }
  const levelText = level === 1 ? 'Easy' : level === 2 ? 'Medium' : 'Hard';
  return Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    question: `[${topic} - ${levelText}] Question ${i + 1}: What is a fundamental core concept in ${topic}?`,
    options: [
      `Key Principle A of ${topic}`,
      `Key Principle B of ${topic}`,
      `Key Principle C of ${topic}`,
      `Key Principle D of ${topic}`
    ],
    correctAnswer: `Key Principle A of ${topic}`,
    explanation: `Key Principle A is an essential fundamental concept of ${topic} at ${levelText} level.`
  }));
};

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

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey || apiKey === 'your_groq_api_key' || apiKey.trim() === '') {
      return res.status(200).json({
        topic,
        level: quizLevel,
        questions: getFallbackQuestions(topic, quizLevel)
      });
    }

    const groq = new Groq({ apiKey });
    const levelText = quizLevel === 1 ? 'Easy' : quizLevel === 2 ? 'Medium' : 'Hard';

    const systemPrompt = `You are a Senior Computer Science Educator and technical interviewer. Generate exactly 10 multiple-choice questions for a quiz on the specified topic and difficulty level. Output STRICT JSON only.`;

    const userPrompt = `Generate a 10-question multiple choice quiz for the topic "${topic}" at level ${quizLevel} (${levelText}).
Return ONLY a valid JSON object matching this schema:
{
  "questions": [
    {
      "id": 1,
      "question": "Question text here",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Option A",
      "explanation": "Detailed explanation of why Option A is correct."
    }
  ]
}`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
      response_format: { type: 'json_object' },
      temperature: 0.7,
    });

    const content = completion.choices[0]?.message?.content;
    if (content) {
      const parsed = JSON.parse(content);
      if (parsed.questions && Array.isArray(parsed.questions) && parsed.questions.length >= 10) {
        const formattedQuestions: QuizQuestion[] = parsed.questions.slice(0, 10).map((q: any, index: number) => ({
          id: index + 1,
          question: q.question || `Question ${index + 1}`,
          options: Array.isArray(q.options) && q.options.length === 4 ? q.options : ['Option A', 'Option B', 'Option C', 'Option D'],
          correctAnswer: q.correctAnswer || (q.options ? q.options[0] : 'Option A'),
          explanation: q.explanation || 'Refer to fundamental computer science principles for details.'
        }));

        return res.status(200).json({
          topic,
          level: quizLevel,
          questions: formattedQuestions
        });
      }
    }

    return res.status(200).json({
      topic,
      level: quizLevel,
      questions: getFallbackQuestions(topic, quizLevel)
    });
  } catch (error: any) {
    console.error('Vercel serverless quiz error:', error);
    const topic = req.body?.topic || 'Operating Systems';
    return res.status(200).json({
      topic,
      level: 2,
      questions: getFallbackQuestions(topic, 2)
    });
  }
}
