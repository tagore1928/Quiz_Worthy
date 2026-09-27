import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { QuizQuestion } from '../types/quiz';
import { db } from '../config/firebase';
import { doc, updateDoc, collection, addDoc, setDoc, getDoc } from 'firebase/firestore';
import { 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  Info, 
  Trophy, 
  ArrowRight, 
  RotateCcw,
  Zap,
  ShieldCheck
} from 'lucide-react';

export const QuizArena: React.FC = () => {
  const { topic } = useParams<{ topic: string }>();
  const decodedTopic = decodeURIComponent(topic || 'Operating Systems');
  const navigate = useNavigate();
  const { userProfile } = useAuth();

  // Initial Level from User Profile
  const currentLevel = userProfile?.topicLevels?.[decodedTopic] || 2;

  // Quiz State
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Post Quiz State
  const [quizFinished, setQuizFinished] = useState<boolean>(false);
  const [savingProgress, setSavingProgress] = useState<boolean>(false);
  const [newLevel, setNewLevel] = useState<number>(currentLevel);

  const getTopicFallbackQuestions = (topicName: string, level: number): QuizQuestion[] => {
    const levelText = level === 1 ? 'Easy' : level === 2 ? 'Medium' : 'Hard';
    if (topicName.toLowerCase().includes('operating') || topicName.toLowerCase().includes('os')) {
      return [
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
      ];
    }

    return Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      question: `[${topicName} - ${levelText}] Concept ${i + 1}: What is a fundamental core concept in ${topicName}?`,
      options: [
        `Key Architectural Principle of ${topicName}`,
        `Alternative Implementation Variant B`,
        `Unrelated Utility Component C`,
        `Deprecated Legacy Method D`
      ],
      correctAnswer: `Key Architectural Principle of ${topicName}`,
      explanation: `Understanding key concepts and architectural patterns is essential for mastering ${topicName} at ${levelText} level.`
    }));
  };

  useEffect(() => {
    fetchQuestions();
  }, [decodedTopic]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setError('');
      setCurrentIndex(0);
      setScore(0);
      setSelectedOption(null);
      setIsAnswered(false);
      setQuizFinished(false);

      const apiBase = import.meta.env.VITE_API_BASE_URL || '';
      const response = await fetch(`${apiBase}/api/quiz/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: decodedTopic, level: currentLevel }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.questions && data.questions.length > 0) {
          setQuestions(data.questions);
          return;
        }
      }

      // If backend responded with non-200 or empty questions, fallback seamlessly
      console.warn('Using client-side questions fallback for:', decodedTopic);
      const fallback = getTopicFallbackQuestions(decodedTopic, currentLevel);
      setQuestions(fallback);
    } catch (err: any) {
      console.warn('Network request failed, activating offline questions mode:', err);
      const fallback = getTopicFallbackQuestions(decodedTopic, currentLevel);
      setQuestions(fallback);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (option: string) => {
    if (isAnswered) return; // Lock interaction immediately

    setSelectedOption(option);
    setIsAnswered(true);

    const currentQuestion = questions[currentIndex];
    if (option === currentQuestion.correctAnswer) {
      setScore((prev) => prev + 10);
    }
  };

  const handleNextQuestion = async () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      // Quiz Completed!
      await handleCompleteQuiz();
    }
  };

  const handleCompleteQuiz = async () => {
    const totalScore = score;
    const percentage = (totalScore / 100) * 100;

    // Recalculate Adaptive Level
    // 0%-40% -> Level 1 (Easy), 41%-70% -> Level 2 (Medium), 71%-100% -> Level 3 (Hard)
    let calculatedLevel = 2;
    if (percentage <= 40) {
      calculatedLevel = 1;
    } else if (percentage <= 70) {
      calculatedLevel = 2;
    } else {
      calculatedLevel = 3;
    }

    setNewLevel(calculatedLevel);
    setQuizFinished(true);

    // Trigger Confetti effect
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch (e) {
      console.warn('Confetti error:', e);
    }

    // Persist to Firestore if user logged in
    if (userProfile?.uid) {
      try {
        setSavingProgress(true);

        const userRef = doc(db, 'users', userProfile.uid);
        const userDocSnap = await getDoc(userRef);

        if (userDocSnap.exists()) {
          const currentXp = userDocSnap.data().xp || 0;

          // Update XP & Topic Level
          await updateDoc(userRef, {
            xp: currentXp + totalScore,
            [`topicLevels.${decodedTopic}`]: calculatedLevel,
          });

          // Log to quiz_attempts subcollection
          const attemptsRef = collection(db, 'users', userProfile.uid, 'quiz_attempts');
          await addDoc(attemptsRef, {
            topic: decodedTopic,
            score: totalScore,
            percentage,
            previousLevel: currentLevel,
            newLevel: calculatedLevel,
            timestamp: new Date().toISOString(),
          });

          // Log daily activity heatmap record
          const todayDateStr = new Date().toISOString().split('T')[0];
          const activityRef = doc(db, 'users', userProfile.uid, 'activity', todayDateStr);
          await setDoc(activityRef, {
            date: todayDateStr,
            xpEarned: totalScore,
            quizzesCompleted: 1,
            timestamp: new Date().toISOString(),
          }, { merge: true });
        }
      } catch (err) {
        console.error('Error saving quiz progress to Firestore:', err);
      } finally {
        setSavingProgress(false);
      }
    }
  };

  const getLevelLabel = (lvl: number) => {
    return lvl === 1 ? 'Level 1: Beginner' : lvl === 2 ? 'Level 2: Intermediate' : 'Level 3: Advanced';
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="text-lg font-bold text-white tracking-tight">Generating Questions...</h2>
        <p className="text-xs text-slate-400 mt-1">
          Loading 10 technical questions for {decodedTopic} ({getLevelLabel(currentLevel)})
        </p>
      </div>
    );
  }

  if (error || questions.length === 0) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 auth-glass-card text-center space-y-4">
        <XCircle className="w-10 h-10 text-rose-400 mx-auto" />
        <h2 className="text-lg font-bold text-white">Quiz Generation Error</h2>
        <p className="text-xs text-slate-300">{error || 'Could not load quiz questions.'}</p>
        <button onClick={fetchQuestions} className="clean-button-primary inline-flex items-center gap-2">
          <RotateCcw className="w-4 h-4" /> Try Again
        </button>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const progressPercent = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-4">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" /> Dashboard
        </Link>

        <div className="flex items-center gap-2.5">
          <span className="clean-badge bg-sky-500/10 text-sky-400 border-sky-500/30">
            {getLevelLabel(currentLevel)}
          </span>
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-amber-400 text-xs font-semibold">
            <Zap className="w-3.5 h-3.5 fill-amber-400" />
            <span>Score: {score} / 100</span>
          </div>
        </div>
      </div>

      {/* Progress Bar & Counter */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-semibold text-white">
            Question {currentIndex + 1} of {questions.length}
          </span>
          <span>{decodedTopic}</span>
        </div>
        <div className="w-full h-2 bg-slate-800 rounded-md overflow-hidden border border-slate-700/50">
          <div
            className="h-full bg-sky-500 transition-all duration-200"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Main Question Card */}
      <div className="clean-glass-card p-6 sm:p-8 space-y-6">
        <h2 className="text-base sm:text-lg font-semibold text-white leading-relaxed">
          {currentQ.question}
        </h2>

        {/* Options List */}
        <div className="space-y-2.5">
          {currentQ.options.map((option, idx) => {
            const isSelected = selectedOption === option;
            const isCorrect = option === currentQ.correctAnswer;

            let optionStyle =
              'border-slate-800 bg-slate-950/40 hover:bg-slate-900 hover:border-slate-700 text-slate-200';

            if (isAnswered) {
              if (isSelected && isCorrect) {
                // Correct Selection
                optionStyle = 'border-emerald-500 bg-emerald-500/10 text-emerald-200';
              } else if (isSelected && !isCorrect) {
                // Wrong Selection
                optionStyle = 'border-rose-500 bg-rose-500/10 text-rose-200';
              } else if (!isSelected && isCorrect) {
                // Actual correct answer
                optionStyle = 'border-sky-500 bg-sky-500/10 text-sky-200';
              } else {
                optionStyle = 'border-slate-900 bg-slate-950/20 opacity-40 text-slate-400';
              }
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelectOption(option)}
                disabled={isAnswered}
                className={`w-full text-left p-3.5 rounded-lg border text-xs sm:text-sm font-medium transition-all duration-150 flex items-center justify-between gap-3 cursor-pointer disabled:cursor-default ${optionStyle}`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-md bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-mono font-semibold text-slate-300 flex-shrink-0">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span>{option}</span>
                </div>

                {isAnswered && isSelected && isCorrect && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                )}
                {isAnswered && isSelected && !isCorrect && (
                  <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                )}
                {isAnswered && !isSelected && isCorrect && (
                  <span className="text-[11px] font-medium text-sky-400 px-2 py-0.5 rounded bg-sky-500/10 border border-sky-500/30">
                    Correct Answer
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Explanation Box */}
        {isAnswered && (
          <div className="p-4 bg-sky-500/10 border border-sky-500/20 rounded-lg space-y-1 animate-fade-in">
            <div className="flex items-center gap-1.5 text-sky-400 text-xs font-semibold">
              <Info className="w-3.5 h-3.5" /> Explanation
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">{currentQ.explanation}</p>
          </div>
        )}

        {/* Next Question / Finish Trigger */}
        {isAnswered && (
          <div className="pt-2 flex justify-end">
            <button
              onClick={handleNextQuestion}
              className="clean-button-primary max-w-xs flex items-center justify-center gap-2"
            >
              <span>{currentIndex + 1 < questions.length ? 'Next Question' : 'Finish Quiz'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Summary Completion Modal */}
      {quizFinished && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md auth-glass-card p-8 text-center space-y-6">
            <div className="inline-flex p-3 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
              <Trophy className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-bold text-white">Quiz Completed</h2>
              <p className="text-xs text-slate-400">{decodedTopic} Practice Session</p>
            </div>

            {/* Score Breakdown Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="clean-glass-card p-4 space-y-1">
                <div className="text-xs text-slate-400 font-medium">Total Score</div>
                <div className="text-2xl font-bold text-white">{score} / 100</div>
              </div>

              <div className="clean-glass-card p-4 space-y-1">
                <div className="text-xs text-slate-400 font-medium">XP Earned</div>
                <div className="text-2xl font-bold text-sky-400">+{score} XP</div>
              </div>
            </div>

            {/* Adaptive Level Update Badge */}
            <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-lg space-y-1.5">
              <div className="text-xs text-slate-400 font-medium flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-sky-400" /> Topic Level Assessment
              </div>

              <div className="flex items-center justify-center gap-3 pt-1">
                <span className="text-xs text-slate-400">
                  Previous: Lvl {currentLevel}
                </span>
                <span className="text-slate-500 font-bold">→</span>
                <span className="clean-badge bg-sky-500/10 text-sky-400 border-sky-500/30 font-semibold">
                  {getLevelLabel(newLevel)}
                </span>
              </div>
            </div>

            {savingProgress && (
              <div className="text-xs text-slate-400 flex items-center justify-center gap-2">
                <div className="w-3 h-3 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
                Syncing progress...
              </div>
            )}

            <div className="flex gap-2.5 pt-2">
              <button
                onClick={fetchQuestions}
                className="flex-1 py-2 rounded-lg border border-slate-700 text-slate-200 hover:bg-slate-800 text-xs font-semibold transition flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Retake
              </button>
              <Link
                to="/"
                className="flex-1 clean-button-primary text-xs py-2 flex items-center justify-center gap-1.5"
              >
                <span>Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizArena;
