import React, { useState, useEffect, useRef } from 'react';
import { Question, RoleQuestionPool, InterviewQuestionSession, Difficulty, Category } from '../types';
import { isMcqAnswerCorrect } from '../utils/mcqUtils';
import { 
  Play, 
  Send, 
  Volume2, 
  VolumeX, 
  CheckCircle2, 
  Sparkles, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Loader2, 
  ShieldAlert, 
  Brain,
  Award,
  ArrowRight,
  AlertTriangle,
  RefreshCw,
  AlertCircle,
  LogOut,
  Lock,
  Unlock
} from 'lucide-react';

interface InterviewKioskProps {
  candidateName: string;
  candidateEmail?: string;
  pool: RoleQuestionPool;
  questionCount?: number;
  onFinishInterview: (sessions: InterviewQuestionSession[]) => void;
  onCancel: () => void;
}

// Category progression schedule across customized question counts (5, 10, 20)
export function getCategoryForIndex(idx: number, totalQuestions: number = 20): Category {
  if (totalQuestions <= 5) {
    if (idx < 1) return 'basic'; // Q1 (1 basic)
    if (idx < 3) return 'domain'; // Q2 - Q3 (2 domain)
    if (idx < 4) return 'trends'; // Q4 (1 trends)
    return 'situational'; // Q5 (1 situational)
  }
  if (totalQuestions <= 10) {
    if (idx < 2) return 'basic'; // Q1 - Q2 (2 basic)
    if (idx < 6) return 'domain'; // Q3 - Q6 (4 domain)
    if (idx < 8) return 'trends'; // Q7 - Q8 (2 trends)
    return 'situational'; // Q9 - Q10 (2 situational)
  }
  // Default 20
  if (idx < 3) return 'basic'; // Q1 - Q3 (3 basic)
  if (idx < 12) return 'domain'; // Q4 - Q12 (9 domain)
  if (idx < 16) return 'trends'; // Q13 - Q16 (4 trends)
  return 'situational'; // Q17 - Q20 (4 situational)
}

export const InterviewKiosk: React.FC<InterviewKioskProps> = ({
  candidateName,
  candidateEmail,
  pool,
  questionCount = 20,
  onFinishInterview,
  onCancel,
}) => {
  const isMcq = pool.assessmentType === 'mcq' || pool.questions.some((q) => Boolean(q.options && q.options.length > 0));
  const targetCount = Math.min(questionCount, pool.questions.length > 0 ? pool.questions.length : questionCount);
  const [started, setStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentDifficulty, setCurrentDifficulty] = useState<Difficulty>('medium');
  const [usedQuestionIds, setUsedQuestionIds] = useState<Set<string>>(new Set());
  const [sessions, setSessions] = useState<InterviewQuestionSession[]>([]);
  
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [candidateAnswer, setCandidateAnswer] = useState('');
  
  // Evaluation & Processing states
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evalError, setEvalError] = useState<string | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [lastEvalNotice, setLastEvalNotice] = useState<{
    score: number;
    shift: 'harder' | 'easier' | 'same';
  } | null>(null);

  // Timer
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [questionTimer, setQuestionTimer] = useState(0);
  
  // Audio state
  const [isSpeaking, setIsSpeaking] = useState(false);

  // General Timer
  useEffect(() => {
    if (!started) return;
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
      setQuestionTimer((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [started]);

  // Helper: Shuffle array randomly
  const shuffleArray = <T,>(arr: T[]): T[] => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  // Pick Next Question
  const pickNextQuestion = (
    category: Category,
    targetDifficulty: Difficulty,
    usedIds: Set<string>
  ): Question => {
    // Attempt 1: Exact category + exact difficulty + not used
    let candidates = pool.questions.filter(
      (q) => q.category === category && q.difficulty === targetDifficulty && !usedIds.has(q.id)
    );

    // Attempt 2: Fallback to same category + any difficulty + not used
    if (candidates.length === 0) {
      candidates = pool.questions.filter((q) => q.category === category && !usedIds.has(q.id));
    }

    // Attempt 3: Fallback to any category + target difficulty + not used
    if (candidates.length === 0) {
      candidates = pool.questions.filter((q) => q.difficulty === targetDifficulty && !usedIds.has(q.id));
    }

    // Attempt 4: Fallback to any remaining question not used
    if (candidates.length === 0) {
      candidates = pool.questions.filter((q) => !usedIds.has(q.id));
    }

    // Attempt 5: If all used, allow reuse
    if (candidates.length === 0) {
      candidates = pool.questions;
    }

    // Shuffle candidates and pick first item to guarantee randomness across sessions
    const shuffled = shuffleArray(candidates);
    return shuffled[0] || pool.questions[0];
  };

  // Start Interview
  const handleStart = () => {
    setStarted(true);
    if (isMcq) {
      const q = pool.questions[0] || pickNextQuestion('basic', 'medium', new Set());
      setCurrentQuestion(q);
      setUsedQuestionIds(new Set([q.id]));
    } else {
      const cat = getCategoryForIndex(0, targetCount);
      const q = pickNextQuestion(cat, 'medium', new Set());
      setCurrentQuestion(q);
      setUsedQuestionIds(new Set([q.id]));
    }
    setQuestionTimer(0);
  };

  // Handle Text to Speech
  const toggleSpeech = (text: string) => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Submit Answer & Evaluate via AI (or instant advance for MCQ)
  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentQuestion) return;

    const trimmedAnswer = candidateAnswer.trim();
    if (!trimmedAnswer) {
      alert(isMcq ? 'Please select an option before proceeding.' : 'Please enter an answer before submitting.');
      return;
    }

    // Stop speaking if active
    if (isSpeaking && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }

    // In MCQ Mode: NO per-question AI API call!
    if (isMcq) {
      const isCorrect = isMcqAnswerCorrect(currentQuestion.correctAnswer, trimmedAnswer, currentQuestion.options);

      const newSession: InterviewQuestionSession = {
        questionIndex: currentQuestionIndex,
        question: currentQuestion,
        candidateAnswer: trimmedAnswer,
        timeSpentSeconds: questionTimer,
        evaluation: {
          score: isCorrect ? 100 : 0,
          technicalAccuracy: isCorrect ? 100 : 0,
          completeness: 100,
          clarity: 100,
          keyPointsCovered: isCorrect ? ['Selected Correct Option'] : ['Option Selected'],
          missingOrInaccuratePoints: isCorrect ? [] : [`Correct answer: ${currentQuestion.correctAnswer}`],
          constructiveFeedback: isCorrect ? 'Correct option selected' : `Incorrect option selected. Correct answer was ${currentQuestion.correctAnswer}`,
          suggestedDifficultyShift: 'same',
        },
      };

      const updatedSessions = [...sessions, newSession];
      setSessions(updatedSessions);

      const nextIdx = currentQuestionIndex + 1;
      if (nextIdx >= targetCount || nextIdx >= pool.questions.length) {
        onFinishInterview(updatedSessions);
      } else {
        setCurrentQuestionIndex(nextIdx);
        const nextQ = pool.questions[nextIdx] || pickNextQuestion(getCategoryForIndex(nextIdx, targetCount), 'medium', usedQuestionIds);
        setCurrentQuestion(nextQ);
        setUsedQuestionIds(new Set([...usedQuestionIds, nextQ.id]));
        setCandidateAnswer('');
        setQuestionTimer(0);
      }
      return;
    }

    // Descriptive Mode (Calls AI API for each answer)
    setEvalError(null);
    setIsEvaluating(true);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    try {
      // Evaluate answer via AI API server
      const res = await fetch('/api/interview/evaluate-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          question: currentQuestion,
          candidateAnswer: trimmedAnswer,
          roleName: pool.roleName,
          experienceLevel: pool.experienceLevel,
        }),
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        let errMsg = errData.error || `Evaluation request failed (HTTP ${res.status})`;
        if (res.status === 429 || errMsg.includes('429') || errMsg.includes('quota') || errMsg.includes('rate limit')) {
          errMsg = 'AI Rate Limit / Quota Exceeded (429): Token quota resets automatically every 60 seconds (1 minute). Please wait ~30 seconds and click "Retry Submit".';
        }
        throw new Error(errMsg);
      }

      const evalResult = await res.json();

      // Record session
      const newSession: InterviewQuestionSession = {
        questionIndex: currentQuestionIndex,
        question: currentQuestion,
        candidateAnswer: trimmedAnswer,
        timeSpentSeconds: questionTimer,
        evaluation: evalResult,
      };

      const updatedSessions = [...sessions, newSession];
      setSessions(updatedSessions);

      // Determine next difficulty shift
      let nextDiff: Difficulty = currentDifficulty;
      if (evalResult.suggestedDifficultyShift === 'harder') {
        if (currentDifficulty === 'easy') nextDiff = 'medium';
        else if (currentDifficulty === 'medium') nextDiff = 'hard';
      } else if (evalResult.suggestedDifficultyShift === 'easier') {
        if (currentDifficulty === 'hard') nextDiff = 'medium';
        else if (currentDifficulty === 'medium') nextDiff = 'easy';
      }

      setLastEvalNotice({
        score: evalResult.score,
        shift: evalResult.suggestedDifficultyShift,
      });

      // Brief delay to show adaptive notice, then move to next question or complete
      setTimeout(() => {
        const nextIdx = currentQuestionIndex + 1;
        if (nextIdx >= targetCount) {
          // Finished all questions for this session!
          setLastEvalNotice(null);
          setIsEvaluating(false);
          onFinishInterview(updatedSessions);
        } else {
          setCurrentQuestionIndex(nextIdx);
          setCurrentDifficulty(nextDiff);
          const nextCat = getCategoryForIndex(nextIdx, targetCount);
          const nextQ = pickNextQuestion(nextCat, nextDiff, usedQuestionIds);
          setCurrentQuestion(nextQ);
          setUsedQuestionIds(new Set([...usedQuestionIds, nextQ.id]));
          setCandidateAnswer('');
          setQuestionTimer(0);
          setLastEvalNotice(null);
          setIsEvaluating(false);
        }
      }, 1200);
    } catch (err: any) {
      clearTimeout(timeoutId);
      console.error('Answer evaluation error:', err);
      setIsEvaluating(false);

      let msg = err?.message || 'Error communicating with AI engine.';
      if (err?.name === 'AbortError') {
        msg = 'Evaluation timed out after 25s. AI server took too long to respond. Please try clicking "Retry Submit".';
      }

      setEvalError(msg);
    }
  };

  // Format time (mm:ss)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const wordCount = candidateAnswer.trim() ? candidateAnswer.trim().split(/\s+/).filter(Boolean).length : 0;

  // Category breakdown text description helper
  const getCategoryBreakdownText = () => {
    if (targetCount === 5) {
      return 'Pulls from 4 categories: Basic Fundamentals (1), Domain Expertise (2), Recent Trends (1), and Situational Scenarios (1).';
    }
    if (targetCount === 10) {
      return 'Pulls from 4 categories: Basic Fundamentals (2), Domain Expertise (4), Recent Trends (2), and Situational Scenarios (2).';
    }
    return 'Pulls from 4 categories: Basic Fundamentals (3), Domain Expertise (9), Recent Trends (4), and Situational Scenarios (4).';
  };

  // Start / Welcome View
  if (!started) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-[#0F0F12] border border-white/10 rounded-3xl p-8 sm:p-10 space-y-8 shadow-2xl text-slate-200">
          <div className="text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mx-auto shadow-inner">
              <Brain className="w-7 h-7" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Welcome, {candidateName}
            </h1>
            <p className="text-slate-400 text-xs tracking-wide">
              Technical Assessment for <span className="text-indigo-400 font-semibold">{pool.roleName}</span> ({pool.experienceLevel}{isMcq ? ' • MCQ' : ''})
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-2">
              <div className="flex items-center space-x-2 text-indigo-400 font-bold text-xs uppercase tracking-widest">
                <Award className="w-4 h-4" />
                <span>{targetCount} {isMcq ? 'MCQ Questions' : 'Adaptive Questions'}</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {getCategoryBreakdownText()}
              </p>
            </div>

            <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-2">
              <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs uppercase tracking-widest">
                <TrendingUp className="w-4 h-4" />
                <span>{isMcq ? 'Multiple Choice Assessment' : 'Adaptive Difficulty'}</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {isMcq
                  ? 'Sequential MCQs covering all key categories. Final report will evaluate total score and category accuracy.'
                  : 'Each response is evaluated by AI in real-time. Strong answers increase difficulty, while weak spots adjust difficulty tier.'}
              </p>
            </div>
          </div>

          <div className="bg-white/5 p-5 rounded-2xl border border-white/5 space-y-3 text-xs text-slate-300">
            <h3 className="font-bold text-white uppercase tracking-widest text-[10px]">Interview Guidelines</h3>
            <ul className="space-y-2 text-slate-400 list-disc list-inside leading-relaxed">
              {isMcq ? (
                <>
                  <li>Select one choice (A, B, C, or D) for each question.</li>
                  <li>Questions run sequentially from start to end without adaptive jumps.</li>
                  <li>Once submitted, AI engine generates a complete final performance summary.</li>
                </>
              ) : (
                <>
                  <li>Type clear, thorough technical explanations.</li>
                  <li>Include key architectural trade-offs, syntax concepts, or practical examples where applicable.</li>
                  <li>You can click the Audio icon to hear any question read aloud.</li>
                </>
              )}
            </ul>
          </div>

          <div className="pt-2 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-3 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 text-xs font-semibold transition-all"
            >
              Exit Assessment
            </button>
            <button
              onClick={handleStart}
              className="flex-1 flex items-center justify-center space-x-2 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-xl shadow-indigo-600/30 transition-all group"
            >
              <span>Begin Technical Assessment</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentQuestion) return null;

  const currentCategory = getCategoryForIndex(currentQuestionIndex, targetCount);
  const categoryLabels: Record<Category, string> = {
    basic: 'Basic Fundamentals',
    domain: 'Domain Specific',
    trends: 'Recent Trends',
    situational: 'Situational & Scenarios',
  };

  const difficultyColors: Record<Difficulty, { bg: string; text: string; border: string }> = {
    easy: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
    medium: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
    hard: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30' },
  };

  const currentDiffStyle = difficultyColors[currentDifficulty];

  // Difficulty progression bonus calculation (Descriptive Mode only)
  const getHardQuestionsCount = () => {
    const hardIndices = new Set<number>();
    sessions.forEach((s) => {
      if (s.question?.difficulty === 'hard') {
        hardIndices.add(s.questionIndex);
      }
    });
    if (currentQuestion && currentQuestion.difficulty === 'hard') {
      hardIndices.add(currentQuestionIndex);
    }
    return hardIndices.size;
  };

  const hardQuestionsReached = getHardQuestionsCount();

  const getProgressionBonusThresholds = (total: number) => {
    if (total <= 5) return { requiredHard: 2, bonusAmount: 5 };
    if (total <= 10) return { requiredHard: 4, bonusAmount: 10 };
    return { requiredHard: 10, bonusAmount: 10 };
  };

  const { requiredHard, bonusAmount } = getProgressionBonusThresholds(targetCount);
  const isBonusUnlocked = hardQuestionsReached >= requiredHard;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Kiosk Container */}
      <div className="bg-[#0F0F12] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row min-h-[640px]">
        {/* Left Sidebar: Progress & Category Tracker */}
        <aside className="w-full md:w-72 border-b md:border-b-0 md:border-r border-white/10 bg-[#0F0F12] p-6 flex flex-col gap-6 shrink-0">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[11px] uppercase tracking-[0.2em] text-slate-500 font-semibold">Question Progress</h3>
              <span className="text-xs font-mono text-slate-400">
                <span className="text-white font-bold">{String(currentQuestionIndex + 1).padStart(2, '0')}</span> / {targetCount}
              </span>
            </div>

            {/* Progress Dots Grid */}
            <div className={`grid gap-2 ${targetCount <= 5 ? 'grid-cols-5' : targetCount <= 10 ? 'grid-cols-5' : 'grid-cols-5'}`}>
              {Array.from({ length: targetCount }).map((_, i) => {
                const isCompleted = i < currentQuestionIndex;
                const isCurrent = i === currentQuestionIndex;
                return (
                  <div
                    key={i}
                    title={`Q${i + 1}`}
                    className={`h-1.5 rounded-full transition-all ${
                      isCompleted
                        ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]'
                        : isCurrent
                        ? 'bg-indigo-500 ring-2 ring-indigo-500/30'
                        : 'bg-white/10'
                    }`}
                  />
                );
              })}
            </div>
          </div>

          {/* Interview Phases List */}
          <div className="space-y-3">
            <h3 className="text-[11px] uppercase tracking-[0.2em] text-slate-500 font-semibold">Interview Phases</h3>
            <ul className="space-y-3">
              {(
                [
                  { key: 'basic', label: 'Fundamentals' },
                  { key: 'domain', label: 'Domain Specifics' },
                  { key: 'trends', label: 'Recent Trends' },
                  { key: 'situational', label: 'Situational Cases' },
                ] as const
              ).map((phase) => {
                const isActive = currentCategory === phase.key;
                const isPast =
                  (currentCategory === 'domain' && phase.key === 'basic') ||
                  (currentCategory === 'trends' && (phase.key === 'basic' || phase.key === 'domain')) ||
                  (currentCategory === 'situational' && phase.key !== 'situational');

                return (
                  <li
                    key={phase.key}
                    className={`flex items-center gap-3 text-sm transition-colors ${
                      isActive
                        ? 'text-white font-medium'
                        : isPast
                        ? 'text-slate-400'
                        : 'text-slate-600'
                    }`}
                  >
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${
                        isActive
                          ? 'bg-indigo-500 ring-2 ring-indigo-500/40'
                          : isPast
                          ? 'bg-emerald-500'
                          : 'bg-slate-800'
                      }`}
                    />
                    <span>{phase.label}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Timers */}
          <div className="space-y-2 pt-2 border-t border-white/5 font-mono text-xs text-slate-400">
            <div className="flex justify-between items-center">
              <span className="text-[10px] uppercase text-slate-500">Question Time</span>
              <span className="text-white font-medium">{formatTime(questionTimer)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] uppercase text-slate-500">Total Assessment</span>
              <span className="text-slate-300">{formatTime(elapsedSeconds)}</span>
            </div>
          </div>

          {/* Difficulty Progression Bonus Card (Descriptive Mode Only) */}
          {!isMcq && (
            <div
              className={`p-4 rounded-xl border transition-all ${
                isBonusUnlocked
                  ? 'bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.12)]'
                  : 'bg-white/5 border-white/5'
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center space-x-1.5">
                  {isBonusUnlocked ? (
                    <Unlock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  )}
                  <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">
                    Difficulty Progression Bonus
                  </span>
                </div>
                <span
                  className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                    isBonusUnlocked
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-slate-800 text-slate-400 border border-white/5'
                  }`}
                >
                  +{bonusAmount} PTS
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-400">Hard Questions Reached</span>
                  <span className={`font-mono font-bold ${isBonusUnlocked ? 'text-emerald-400' : 'text-slate-200'}`}>
                    {hardQuestionsReached} / {requiredHard}
                  </span>
                </div>

                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      isBonusUnlocked
                        ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]'
                        : 'bg-indigo-500/80'
                    }`}
                    style={{ width: `${Math.min(100, (hardQuestionsReached / requiredHard) * 100)}%` }}
                  />
                </div>

                <p className="text-[10px] text-slate-400 leading-tight pt-0.5">
                  {isBonusUnlocked ? (
                    <span className="text-emerald-400 font-semibold flex items-center space-x-1">
                      <CheckCircle2 className="w-3 h-3 inline shrink-0" />
                      <span>Bonus Unlocked! +{bonusAmount} pts added to final score.</span>
                    </span>
                  ) : (
                    <span>Reach {requiredHard} hard-level questions to unlock +{bonusAmount} bonus points.</span>
                  )}
                </p>
              </div>
            </div>
          )}

          {/* Difficulty Box */}
          <div className="mt-auto p-4 bg-white/5 rounded-xl border border-white/5">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] uppercase text-slate-500 font-bold">Difficulty Tier</span>
              <span className={`text-[10px] uppercase font-bold ${currentDiffStyle.text}`}>
                {currentDifficulty}
              </span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden flex">
              <div
                className={`h-full transition-all duration-300 ${
                  currentDifficulty === 'easy'
                    ? 'w-1/3 bg-emerald-500'
                    : currentDifficulty === 'medium'
                    ? 'w-2/3 bg-amber-500'
                    : 'w-full bg-rose-500'
                }`}
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
              Adaptive scaling active. Shifting based on score depth.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowCancelConfirm(true)}
            className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 text-xs font-semibold transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Exit Assessment</span>
          </button>
        </aside>

        {/* Main Question & Answer Content */}
        <section className="flex-1 flex flex-col p-6 sm:p-10 bg-gradient-to-br from-[#0A0A0B] to-[#141418] relative">
          {/* Adaptive Notice Overlay */}
          {lastEvalNotice && (
            <div className="absolute inset-0 bg-[#0A0A0B]/95 backdrop-blur-md z-20 flex flex-col items-center justify-center space-y-3 p-6 text-center animate-fade-in">
              <div className="w-12 h-12 rounded-full bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
                <Sparkles className="w-6 h-6 animate-spin" />
              </div>
              <h3 className="font-bold text-lg text-white">Answer Evaluated ({lastEvalNotice.score}/100)</h3>
              <p className="text-xs text-slate-300">
                {lastEvalNotice.shift === 'harder' && (
                  <span className="text-emerald-400 font-semibold flex items-center justify-center space-x-1">
                    <TrendingUp className="w-4 h-4 inline" />
                    <span>Strong explanation! Advancing difficulty tier.</span>
                  </span>
                )}
                {lastEvalNotice.shift === 'easier' && (
                  <span className="text-amber-400 font-semibold flex items-center justify-center space-x-1">
                    <TrendingDown className="w-4 h-4 inline" />
                    <span>Adjusting difficulty tier for next question.</span>
                  </span>
                )}
                {lastEvalNotice.shift === 'same' && (
                  <span className="text-indigo-300 font-semibold flex items-center justify-center space-x-1">
                    <Minus className="w-4 h-4 inline" />
                    <span>Solid response! Maintaining current tier.</span>
                  </span>
                )}
              </p>
            </div>
          )}

          <div className="flex-1 flex flex-col justify-between space-y-6">
            {/* Category tag & Question */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-bold uppercase tracking-widest rounded border border-indigo-500/20">
                  Category: {categoryLabels[currentCategory]}
                </span>

                <button
                  onClick={() => toggleSpeech(currentQuestion.questionText)}
                  title={isSpeaking ? 'Mute' : 'Listen to question'}
                  className={`p-2 rounded-lg border transition-all ${
                    isSpeaking
                      ? 'bg-indigo-600 text-white border-indigo-500 animate-pulse'
                      : 'bg-white/5 text-slate-400 hover:text-white border-white/10 hover:bg-white/10'
                  }`}
                >
                  {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
              </div>

              <h2 className="text-2xl sm:text-3xl font-serif-italic text-white leading-tight">
                "{currentQuestion.questionText}"
              </h2>
            </div>

            {/* Answer Form */}
            <form onSubmit={handleSubmitAnswer} className="space-y-4 flex-1 flex flex-col">
              {evalError && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-start justify-between space-x-3 text-xs text-rose-300 animate-fade-in shadow-lg">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-bold text-rose-200 text-xs">Evaluation Error / Rate Limit Issue</p>
                      <p className="text-slate-300 leading-relaxed">{evalError}</p>
                      <p className="text-[11px] text-slate-400 pt-0.5">
                        💡 <strong>Your answer is safe below!</strong> Free tier API token quota resets every 60 seconds (1 minute). Wait a moment and click <strong>Retry Submit</strong>.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEvalError(null)}
                    className="text-slate-400 hover:text-white p-1 shrink-0"
                    title="Dismiss"
                  >
                    ✕
                  </button>
                </div>
              )}

              {isMcq ? (
                <div className="space-y-4 flex-1 flex flex-col justify-between pt-2">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                      <span className="uppercase tracking-widest text-[11px] text-indigo-400">Select One Option</span>
                      <span className="font-mono text-slate-400">Question {currentQuestionIndex + 1} of {targetCount}</span>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      {(currentQuestion.options && currentQuestion.options.length > 0
                        ? currentQuestion.options
                        : ['Option A', 'Option B', 'Option C', 'Option D']
                      ).map((opt, idx) => {
                        const letter = ['A', 'B', 'C', 'D'][idx] || String(idx + 1);
                        const isSelected = candidateAnswer === opt || candidateAnswer === `${letter}) ${opt}`;

                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setCandidateAnswer(opt)}
                            className={`w-full p-4 rounded-xl border text-left text-sm transition-all flex items-center space-x-3.5 ${
                              isSelected
                                ? 'bg-indigo-600/30 border-indigo-500 text-white shadow-lg ring-1 ring-indigo-500/50'
                                : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white'
                            }`}
                          >
                            <div
                              className={`w-7 h-7 rounded-lg font-mono font-bold text-xs flex items-center justify-center shrink-0 ${
                                isSelected
                                  ? 'bg-indigo-600 text-white shadow-md'
                                  : 'bg-white/10 text-slate-400'
                              }`}
                            >
                              {letter}
                            </div>
                            <span className="leading-relaxed font-medium">{opt}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/10 mt-auto">
                    <button
                      type="button"
                      onClick={() => setShowCancelConfirm(true)}
                      className="px-3.5 py-2 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 text-xs font-semibold transition-all"
                    >
                      Exit
                    </button>
                    <button
                      type="submit"
                      disabled={!candidateAnswer.trim()}
                      className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-all shadow-lg shadow-indigo-600/30 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span>{currentQuestionIndex + 1 === targetCount ? 'Submit Assessment' : 'Next Question'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="relative flex-1 flex flex-col">
                  <textarea
                    required
                    rows={6}
                    disabled={isEvaluating}
                    placeholder="Type your detailed technical explanation here..."
                    value={candidateAnswer}
                    onChange={(e) => setCandidateAnswer(e.target.value)}
                    className="w-full min-h-[160px] bg-white/5 border border-white/10 rounded-2xl p-5 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 resize-none transition-all text-sm leading-relaxed"
                  />
                  
                  <div className="flex items-center justify-between mt-3 text-xs text-slate-500">
                    <span className="font-mono text-[11px] text-slate-400 italic">
                      {wordCount} words
                    </span>
                    <div className="flex items-center space-x-3">
                      <button
                        type="button"
                        onClick={() => setShowCancelConfirm(true)}
                        disabled={isEvaluating}
                        className="px-3 py-1.5 rounded-lg border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 text-xs transition-all disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isEvaluating || !candidateAnswer.trim()}
                        className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-all shadow-lg shadow-indigo-600/30 flex items-center space-x-2 disabled:opacity-50"
                      >
                        {isEvaluating ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Evaluating...</span>
                          </>
                        ) : evalError ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>Retry Submit</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5" />
                            <span>Submit Answer</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </form>
          </div>
        </section>
      </div>

      {/* Cancel Assessment Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121216] border border-white/10 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-fade-in text-slate-100">
            <div className="flex items-center space-x-3 text-rose-400">
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Exit Assessment?</h3>
                <p className="text-xs text-slate-400">Recorded answers will be discarded.</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-white/5 p-3.5 rounded-xl border border-white/5">
              Are you sure you want to exit? Your ongoing technical assessment progress and recorded answers will be lost.
            </p>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCancelConfirm(false)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold transition-all"
              >
                Keep Interviewing
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCancelConfirm(false);
                  onCancel();
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-600/30 transition-all"
              >
                Yes, Exit Assessment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
