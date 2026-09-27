import Groq from 'groq-sdk';

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

// Fallback questions dictionary for seamless offline/dev demonstration
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

const getGenericFallbackQuestions = (topic: string, level: number): QuizQuestion[] => {
  if (FALLBACK_QUESTIONS[topic]) {
    return FALLBACK_QUESTIONS[topic];
  }

  // Generate clean generic fallback questions for any domain if Groq is unavailable
  const levelText = level === 1 ? 'Easy' : level === 2 ? 'Medium' : 'Hard';
  return Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    question: `[${topic} - ${levelText}] Question ${i + 1}: What is a core fundamental concept in ${topic}?`,
    options: [
      `Key Concept A related to ${topic}`,
      `Key Concept B related to ${topic}`,
      `Key Concept C related to ${topic}`,
      `Key Concept D related to ${topic}`
    ],
    correctAnswer: `Key Concept A related to ${topic}`,
    explanation: `Key Concept A is a fundamental principle of ${topic} at ${levelText} level.`
  }));
};

export const generateQuizQuestions = async (topic: string, level: number): Promise<QuizResponse> => {
  try {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey || apiKey === 'your_groq_api_key' || apiKey.trim() === '') {
      console.warn(`[GroqQuizService] No valid GROQ_API_KEY found. Serving fallback questions for topic "${topic}".`);
      return {
        topic,
        level,
        questions: getGenericFallbackQuestions(topic, level)
      };
    }

    const groq = new Groq({ apiKey });
    const levelText = level === 1 ? 'Easy' : level === 2 ? 'Medium' : 'Hard';

    const systemPrompt = `You are a Senior Computer Science Educator and technical interviewer. Generate exactly 10 multiple-choice questions for a quiz on the specified topic and difficulty level. Output STRICT JSON only.`;

    const userPrompt = `Generate a 10-question multiple choice quiz for the topic "${topic}" at level ${level} (${levelText}).
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
}

Ensure:
1. Exactly 10 questions in array.
2. "options" must contain 4 distinct choices.
3. "correctAnswer" must match exactly one string in "options".
4. "explanation" provides clear technical reasoning.`;

    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const completion = await groq.chat.completions.create({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          model: process.env.GROQ_MODEL || (attempt === 1 ? 'llama-3.3-70b-versatile' : 'llama-3.1-8b-instant'),
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

            return {
              topic,
              level,
              questions: formattedQuestions
            };
          }
        }
      } catch (err: any) {
        console.warn(`[GroqQuizService] Attempt ${attempt} failed:`, err?.message || err);
      }
    }

    // Fallback if AI generation fails
    console.warn(`[GroqQuizService] AI generation failed after retries. Serving fallback questions for "${topic}".`);
    return {
      topic,
      level,
      questions: getGenericFallbackQuestions(topic, level)
    };
  } catch (globalErr) {
    console.error(`[GroqQuizService] Critical error in generateQuizQuestions:`, globalErr);
    return {
      topic,
      level,
      questions: getGenericFallbackQuestions(topic, level)
    };
  }
};
