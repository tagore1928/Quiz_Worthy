import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { QuizQuestion, QuizResponse } from '../types/quiz';
import { Loader } from '../components/Loader';
import { recordQuizResult } from '../utils/progress';
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
  const { userProfile, refreshUserProfile } = useAuth();

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
  // Level at the moment the session finished; currentLevel changes once the profile refreshes
  const [previousLevel, setPreviousLevel] = useState<number>(currentLevel);
  // 'offline' when the server served its curated bank because AI generation was unavailable
  const [questionSource, setQuestionSource] = useState<QuizResponse['source']>('ai');

  const [showExitConfirm, setShowExitConfirm] = useState<boolean>(false);

  useEffect(() => {
    fetchQuestions();
  }, [decodedTopic]);

  // A session is in progress once questions are loaded and at least one is answered
  const inProgress = questions.length > 0 && !quizFinished && (currentIndex > 0 || isAnswered);

  // Warn before a reload or tab close throws away an unfinished session
  useEffect(() => {
    if (!inProgress) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [inProgress]);

  const handleExit = () => {
    if (inProgress) setShowExitConfirm(true);
    else navigate('/');
  };

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

      const data = await response.json().catch(() => null);
      if (response.ok && data?.questions?.length > 0) {
        setQuestions(data.questions);
        setQuestionSource(data.source === 'offline' ? 'offline' : 'ai');
        return;
      }

      setQuestions([]);
      setError(
        data?.error ||
          (response.ok
            ? 'The quiz server returned no questions. Please try again.'
            : `The quiz server is having trouble right now (error ${response.status}). Please try again in a moment.`)
      );
    } catch (err: any) {
      console.warn('Quiz request failed:', err);
      setQuestions([]);
      setError("Couldn't reach the quiz server. Check your connection and try again.");
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

    setPreviousLevel(currentLevel);
    setNewLevel(calculatedLevel);
    setQuizFinished(true);

    // Trigger Confetti effect
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        colors: ['#c8f135', '#ffffff', '#ff9447'],
        origin: { y: 0.6 },
      });
    } catch (e) {
      console.warn('Confetti error:', e);
    }

    // Persist to Firestore if user logged in
    if (userProfile?.uid) {
      try {
        setSavingProgress(true);

        await recordQuizResult(userProfile.uid, {
          topic: decodedTopic,
          score: totalScore,
          percentage,
          previousLevel: currentLevel,
          newLevel: calculatedLevel,
        });

        // Pull the updated XP, levels and streak into the shared profile state
        await refreshUserProfile();
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
        <Loader fullScreen={false} label="Generating questions" />
        <h2 className="text-lg font-semibold text-white">{decodedTopic}</h2>
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
        <h2 className="text-lg font-semibold text-white">Quiz Generation Error</h2>
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={handleExit}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" /> Exit quiz
        </button>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <span className="clean-badge whitespace-nowrap bg-sky-500/10 text-sky-300 border-sky-400/30">
            {getLevelLabel(currentLevel)}
          </span>
          <div className="stat-chip whitespace-nowrap text-amber-400">
            <Zap className="w-3.5 h-3.5" />
            <span>{score}/100</span>
          </div>
        </div>
      </div>

      {/* Progress Bar & Counter */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-mono text-xs text-white">
            Q{String(currentIndex + 1).padStart(2, '0')} <span className="text-slate-500">/ {String(questions.length).padStart(2, '0')}</span>
          </span>
          <span className="flex items-center gap-2">
            {questionSource === 'offline' && (
              <span
                className="clean-badge bg-amber-500/10 text-amber-400 border-amber-500/30"
                title="AI question generation is unavailable right now, so this session uses a curated offline question set."
              >
                Offline set
              </span>
            )}
            <span className="font-mono uppercase tracking-wider text-[11px]">{decodedTopic}</span>
          </span>
        </div>
        <div className="meter-track">
          <div
            className="meter-fill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Main Question Card */}
      <div key={currentIndex} className="clean-glass-card p-6 sm:p-8 space-y-6 animate-fade-in">
        <h2 className="text-lg sm:text-xl font-medium text-white leading-relaxed whitespace-pre-line">
          {currentQ.question}
        </h2>

        {/* Options List */}
        <div className="space-y-2.5">
          {currentQ.options.map((option, idx) => {
            const isSelected = selectedOption === option;
            const isCorrect = option === currentQ.correctAnswer;

            let optionStyle =
              'border-slate-800 bg-slate-950/40 hover:bg-white/[0.03] hover:border-white/20 text-slate-200';

            if (isAnswered) {
              if (isSelected && isCorrect) {
                // Correct Selection
                optionStyle = 'border-emerald-400 bg-emerald-500/10 text-emerald-200';
              } else if (isSelected && !isCorrect) {
                // Wrong Selection
                optionStyle = 'border-rose-500 bg-rose-500/10 text-rose-200';
              } else if (!isSelected && isCorrect) {
                // Actual correct answer
                optionStyle = 'border-dashed border-emerald-400/70 bg-emerald-500/5 text-emerald-200';
              } else {
                optionStyle = 'border-slate-900 bg-slate-950/20 opacity-40 text-slate-400';
              }
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelectOption(option)}
                disabled={isAnswered}
                className={`w-full text-left p-3.5 rounded-lg border text-xs sm:text-sm font-medium transition-colors duration-150 flex items-center justify-between gap-3 cursor-pointer disabled:cursor-default ${optionStyle}`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-md border border-white/10 bg-white/[0.03] flex items-center justify-center text-xs font-mono text-slate-300 flex-shrink-0">
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
                  <span className="font-mono text-[10.5px] uppercase tracking-wider text-emerald-300 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-400/30">
                    Correct Answer
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Explanation Box */}
        {isAnswered && (
          <div className="p-4 bg-white/[0.02] border-l-2 border-sky-400 rounded-r-lg space-y-1 animate-fade-in">
            <div className="flex items-center gap-1.5 text-sky-300 text-xs font-semibold">
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

      {/* Exit confirmation */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm auth-glass-card p-6 space-y-4" role="dialog" aria-modal="true" aria-labelledby="exit-quiz-title">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-amber-400">Quiz in progress</p>
            <h3 id="exit-quiz-title" className="text-lg font-semibold text-white">Leave this quiz?</h3>
            <p className="text-sm text-slate-400">
              You've answered {currentIndex + (isAnswered ? 1 : 0)} of {questions.length} questions. Leaving now
              discards this session, and no XP or level change is saved.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowExitConfirm(false)}
                className="flex-1 clean-button-primary"
              >
                Keep going
              </button>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="flex-1 py-2 rounded-lg border border-white/10 text-slate-300 hover:text-white hover:bg-white/[0.04] text-sm transition"
              >
                Leave quiz
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Summary Completion Modal */}
      {quizFinished && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md auth-glass-card p-8 text-center space-y-6">
            <div className="inline-flex p-3 rounded-lg border border-sky-400/30 text-sky-400">
              <Trophy className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-semibold text-white">Session complete</h2>
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
                <div className="text-2xl font-mono text-sky-400">+{score}</div>
              </div>
            </div>

            {/* Adaptive Level Update Badge */}
            <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-1.5">
              <div className="text-xs text-slate-400 font-medium flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-sky-400" /> Topic Level Assessment
              </div>

              <div className="flex items-center justify-center gap-3 pt-1">
                <span className="text-xs text-slate-400">
                  Previous: Lvl {previousLevel}
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
                className="flex-1 py-2 rounded-md border border-slate-700 text-slate-200 hover:bg-slate-800 hover:border-sky-400/40 text-xs font-semibold transition flex items-center justify-center gap-1.5"
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
