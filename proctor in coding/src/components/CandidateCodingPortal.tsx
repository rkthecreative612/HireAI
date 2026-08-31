import React, { useState, useEffect } from 'react';
import {
  CodingAssessmentRecord,
  JavaCodingQuestion,
  CodingTestCaseResult,
  JavaExecutionResponse,
  InterviewReport,
  CodingReportData,
  QuestionCodingResult,
  CodingSessionRecord
} from '../types';
import {
  fetchCodingAssessmentByToken,
  saveCodingSessionToDb,
  updateCodingSessionInDb,
  updateCodingAssessmentStatus
} from '../lib/codingSupabase';
import Editor from '@monaco-editor/react';
import {
  Code2,
  CheckCircle2,
  XCircle,
  Clock,
  Play,
  RotateCcw,
  Terminal,
  FileCode2,
  AlertCircle,
  ArrowRight,
  User,
  Mail,
  Send,
  Loader2,
  Sparkles,
  ShieldAlert,
  Camera
} from 'lucide-react';
import { ProctorCameraWidget } from './ProctorCameraWidget';

interface CandidateCodingPortalProps {
  token: string | null;
  onSaveReport?: (report: InterviewReport) => void;
  onReturnToHome?: () => void;
}

export const CandidateCodingPortal: React.FC<CandidateCodingPortalProps> = ({
  token,
  onSaveReport,
  onReturnToHome
}) => {
  // Validation state
  const [isValidating, setIsValidating] = useState<boolean>(true);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [assessment, setAssessment] = useState<CodingAssessmentRecord | null>(null);

  // Candidate entry form
  const [candidateName, setCandidateName] = useState<string>('');
  const [candidateEmail, setCandidateEmail] = useState<string>('');
  const [formError, setFormError] = useState<string>('');

  // Assessment active state
  const [isStarted, setIsStarted] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [sessionId, setSessionId] = useState<string>('');

  // Questions and code editor state
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<number>(0);
  const [codeMap, setCodeMap] = useState<Record<string, string>>({});
  const [testResultsMap, setTestResultsMap] = useState<Record<string, CodingTestCaseResult[]>>({});
  const [isRunningCode, setIsRunningCode] = useState<boolean>(false);
  const [rawConsoleOutput, setRawConsoleOutput] = useState<string>('');
  const [activeOutputTab, setActiveOutputTab] = useState<'test_results' | 'console'>('test_results');

  // Timer
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState<number>(1800);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  // AI Proctor State
  const [isProctorTerminated, setIsProctorTerminated] = useState<boolean>(false);
  const [proctorTerminationReason, setProctorTerminationReason] = useState<string>('');
  const [proctorEvents, setProctorEvents] = useState<any[]>([]);

  // Final submission data
  const [finalReport, setFinalReport] = useState<InterviewReport | null>(null);
  const [saveStatus, setSaveStatus] = useState<{ isSaving: boolean; error?: string; success?: boolean }>({
    isSaving: false,
  });

  // 1. Validate Token on Mount
  useEffect(() => {
    let isMounted = true;
    async function validate() {
      if (!token) {
        if (isMounted) {
          setValidationError('Invalid or expired assessment link. No assessment token was provided.');
          setIsValidating(false);
        }
        return;
      }

      setIsValidating(true);
      setValidationError(null);

      const result = await fetchCodingAssessmentByToken(token);
      if (!isMounted) return;

      if (result.valid && result.assessment) {
        setAssessment(result.assessment);
        if (result.assessment.candidate_name) {
          setCandidateName(result.assessment.candidate_name);
        }
        if (result.assessment.candidate_email) {
          setCandidateEmail(result.assessment.candidate_email);
        }
        setTimeRemainingSeconds((result.assessment.duration_minutes || 30) * 60);
      } else {
        setValidationError(result.error || 'Invalid or expired assessment link.');
      }
      setIsValidating(false);
    }

    validate();
    return () => {
      isMounted = false;
    };
  }, [token]);

  // Questions list from validated assessment
  const questions: JavaCodingQuestion[] = assessment?.questions || [];
  const currentQuestion: JavaCodingQuestion | undefined = questions[selectedQuestionIndex];
  const currentCode = currentQuestion ? (codeMap[currentQuestion.id] ?? (currentQuestion.starterCode || currentQuestion.javaStarterCode)) : '';

  // Timer countdown
  useEffect(() => {
    if (!isTimerRunning || isSubmitted || !isStarted) return;

    const interval = setInterval(() => {
      setTimeRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmitAssessment();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimerRunning, isSubmitted, isStarted]);

  // Format time MM:SS
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Start Assessment Handler
  const handleStart = () => {
    if (!candidateName.trim()) {
      setFormError('Please enter your full name to begin the assessment.');
      return;
    }
    setFormError('');

    const initialCodeMap: Record<string, string> = {};
    questions.forEach((q) => {
      initialCodeMap[q.id] = q.starterCode || q.javaStarterCode;
    });

    const newSessionId = `coding-session-${Date.now()}`;
    setSessionId(newSessionId);
    setCodeMap(initialCodeMap);
    setSelectedQuestionIndex(0);
    setIsStarted(true);
    setIsTimerRunning(true);
    setIsProctorTerminated(false);
    setProctorTerminationReason('');
    setProctorEvents([]);

    // Persist in-progress session to Supabase
    if (assessment) {
      const initialRecord: CodingSessionRecord = {
        id: newSessionId,
        candidate_name: candidateName.trim(),
        candidate_email: candidateEmail.trim() || undefined,
        language: assessment.language,
        set_id: assessment.set_id,
        set_name: assessment.set_name,
        duration_minutes: assessment.duration_minutes,
        time_spent_seconds: 0,
        overall_score: 0,
        status: 'in_progress',
        code_submissions: initialCodeMap,
        question_results: [],
        proctor_enabled: assessment.proctor_enabled,
        proctor_events: [],
        proctor_strikes_count: 0,
        created_at: new Date().toISOString()
      };

      saveCodingSessionToDb(initialRecord).catch((err) => {
        console.warn('Could not save session to Supabase:', err);
      });
    }
  };

  // Proctor violation strikes
  const handleProctorViolationStrike = (strikeCount: number, event: any) => {
    setProctorEvents((prev) => [event, ...prev]);

    if (sessionId) {
      updateCodingSessionInDb(sessionId, {
        proctor_strikes_count: strikeCount,
        proctor_events: [event, ...proctorEvents]
      }).catch((err) => {
        console.warn('Could not update proctor strike in Supabase:', err);
      });
    }
  };

  // Proctor Max Strikes Termination (4th Strike - Immediate Assessment End)
  const handleProctorTermination = async (lastEvent?: any, allEventsList?: any[]) => {
    if (isSubmitted || isProctorTerminated || !assessment) return;

    setIsTimerRunning(false);
    setIsSubmitted(true);
    setIsProctorTerminated(true);

    const termReason = lastEvent?.message || 'Proctor strike limit exceeded (4/4 strikes)';
    setProctorTerminationReason(termReason);

    const timeSpent = (assessment.duration_minutes * 60) - Math.max(0, timeRemainingSeconds);
    const eventsToSave = allEventsList && allEventsList.length > 0 ? allEventsList : proctorEvents;

    let totalTests = 0;
    let passedTests = 0;
    let solvedCount = 0;
    let partialCount = 0;
    let failedCount = 0;
    let unattemptedCount = 0;

    const questionResultsList: QuestionCodingResult[] = questions.map((q) => {
      const qResults = testResultsMap[q.id] || [];
      const qTestsTotal = q.testCases.length;
      const qTestsPassed = qResults.filter((r) => r.passed).length;
      const qCode = codeMap[q.id] || q.starterCode || q.javaStarterCode || '';
      const originalStarter = q.starterCode || q.javaStarterCode || '';
      const isCodeModified = qCode.trim() !== originalStarter.trim() && qCode.trim().length > 0;

      totalTests += qTestsTotal;
      passedTests += qTestsPassed;

      let status: 'Solved' | 'Partial' | 'Failed' | 'Not Attempted' = 'Not Attempted';
      let score = 0;

      if (!isCodeModified && qTestsPassed === 0) {
        status = 'Not Attempted';
        unattemptedCount++;
      } else if (qTestsPassed === qTestsTotal && qTestsTotal > 0) {
        status = 'Solved';
        score = 100;
        solvedCount++;
      } else if (qTestsPassed > 0) {
        status = 'Partial';
        score = Math.round((qTestsPassed / qTestsTotal) * 100);
        partialCount++;
      } else {
        status = 'Failed';
        score = 0;
        failedCount++;
      }

      return {
        questionId: q.id,
        questionTitle: q.title,
        difficulty: q.difficulty,
        passedCount: qTestsPassed,
        totalTestCases: qTestsTotal,
        score,
        status,
        timeTakenSeconds: Math.round(timeSpent / (questions.length || 1)),
        codeSubmitted: qCode,
        testCasesResults: qResults.length > 0 ? qResults : q.testCases.map((tc) => ({
          testCaseId: tc.id,
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          actualOutput: 'Assessment Terminated (Proctor Cheating Violation)',
          passed: false,
          isHidden: tc.isHidden
        }))
      };
    });

    const halfwayScore = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;
    const finalCandidateName = candidateName.trim() || 'Candidate';
    const finalCandidateEmail = candidateEmail.trim();

    const attemptedCount = solvedCount + partialCount + failedCount;
    const failedTestCasesCount = totalTests - passedTests;
    const totalLimit = assessment.duration_minutes * 60;
    const timeRemaining = Math.max(0, timeRemainingSeconds);

    const submissionTime = new Date().toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });

    const codingData: CodingReportData = {
      totalQuestions: questions.length,
      attemptedQuestions: attemptedCount,
      solvedQuestions: solvedCount,
      partiallySolvedQuestions: partialCount,
      failedQuestions: failedCount,
      totalTestCases: totalTests,
      passedTestCases: passedTests,
      failedTestCases: failedTestCasesCount,
      totalTimeLimitSeconds: totalLimit,
      timeSpentSeconds: timeSpent,
      timeRemainingSeconds: timeRemaining,
      submissionTime,
      questionResults: questionResultsList
    };

    const report: InterviewReport = {
      id: `report-coding-${Date.now()}`,
      candidateName: finalCandidateName,
      candidateEmail: finalCandidateEmail || undefined,
      roleName: `${assessment.language === 'python' ? 'Python' : 'Java'} Coding Assessment (${assessment.set_name})`,
      experienceLevel: 'Mid',
      assessmentType: 'coding',
      completedAt: new Date().toISOString(),
      totalTimeSpentSeconds: timeSpent,
      overallScore: halfwayScore,
      recommendation: 'No Hire',
      summary: `[TERMINATED: CHEATING DETECTED] ${assessment.language === 'python' ? 'Python' : 'Java'} Coding Assessment (${assessment.set_name}) was terminated by AI Proctor due to maximum integrity violations. Halfway Score: ${halfwayScore}%. Reason: ${termReason}`,
      strengths: [],
      weaknesses: [
        `Assessment terminated by AI Proctor due to 4 integrity strikes. Reason: ${termReason}`,
        ...eventsToSave.map((ev: any) => `[${ev.formattedTime || 'Violation'}] Strike ${ev.strikeNumber || '!'}: ${ev.message}`)
      ],
      categoryBreakdown: [
        {
          category: 'domain',
          categoryName: `${assessment.language === 'python' ? 'Python' : 'Java'} Problem Solving`,
          score: halfwayScore,
          questionsAnswered: questions.length,
          easyCount: questions.filter((q) => q.difficulty === 'easy').length,
          mediumCount: questions.filter((q) => q.difficulty === 'medium').length,
          hardCount: questions.filter((q) => q.difficulty === 'hard').length
        }
      ],
      followUpQuestionsForInterviewer: [],
      questionSessions: [],
      codingReportData: codingData,
      proctor_enabled: true,
      proctor_terminated: true,
      proctor_termination_reason: termReason,
      proctor_events: eventsToSave,
      proctor_strikes_count: 4
    };

    setFinalReport(report);

    if (onSaveReport) {
      onSaveReport(report);
    }

    setSaveStatus({ isSaving: true });
    const sessionToSave: CodingSessionRecord = {
      id: sessionId || `coding-session-${Date.now()}`,
      candidate_name: finalCandidateName,
      candidate_email: finalCandidateEmail || undefined,
      language: assessment.language,
      set_id: assessment.set_id,
      set_name: assessment.set_name,
      duration_minutes: assessment.duration_minutes,
      time_spent_seconds: timeSpent,
      overall_score: halfwayScore,
      status: 'terminated_cheating',
      code_submissions: codeMap,
      question_results: questionResultsList,
      proctor_enabled: true,
      proctor_terminated: true,
      proctor_termination_reason: termReason,
      proctor_events: eventsToSave,
      proctor_strikes_count: 4,
      created_at: new Date(Date.now() - timeSpent * 1000).toISOString(),
      completed_at: new Date().toISOString()
    };

    try {
      const saveRes = await saveCodingSessionToDb(sessionToSave);
      if (token) {
        await updateCodingAssessmentStatus(token, 'completed');
      }

      if (!saveRes.success) {
        setSaveStatus({ isSaving: false, error: saveRes.error || 'Failed to submit terminated assessment.' });
      } else {
        setSaveStatus({ isSaving: false, success: true });
      }
    } catch (err: any) {
      console.warn('Could not save terminated coding session:', err);
      setSaveStatus({ isSaving: false, error: err?.message || 'Unexpected error submitting assessment.' });
    }
  };

  // Execute Code via JDoodle proxy endpoint
  const executeCode = async (code: string, stdinInput: string, lang: 'java' | 'python'): Promise<JavaExecutionResponse> => {
    const response = await fetch('/api/coding/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ script: code, stdin: stdinInput, language: lang })
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      throw new Error(errJson.error || `Server error: ${response.status}`);
    }

    return await response.json();
  };

  // Run Test Cases
  const handleRunCode = async () => {
    if (!currentQuestion || !assessment) return;
    setIsRunningCode(true);
    setRawConsoleOutput(`Compiling and executing ${assessment.language === 'python' ? 'Python' : 'Java'} code...\n`);
    setActiveOutputTab('test_results');

    const results: CodingTestCaseResult[] = [];
    let consoleLogAccumulator = '';
    let allPassed = true;

    try {
      for (let i = 0; i < currentQuestion.testCases.length; i++) {
        const tc = currentQuestion.testCases[i];
        consoleLogAccumulator += `\n--- Running Test Case ${i + 1} (${tc.isHidden ? 'Hidden' : 'Public'}) ---\n`;

        const execution = await executeCode(currentCode, tc.input, assessment.language);

        const actualOutRaw = execution.output || execution.error || '';
        const actualOutClean = actualOutRaw.trim();
        const expectedOutClean = (tc.expectedOutput || '').trim();

        consoleLogAccumulator += `Standard Output:\n${actualOutRaw}\n`;
        if (execution.statusCode && execution.statusCode !== 200) {
          consoleLogAccumulator += `Execution Exit Status: ${execution.statusCode}\n`;
        }

        const isMatch = actualOutClean === expectedOutClean;
        if (!isMatch) allPassed = false;

        results.push({
          testCaseId: tc.id,
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          actualOutput: actualOutRaw,
          passed: isMatch,
          isHidden: tc.isHidden,
          error: execution.error
        });
      }

      setTestResultsMap((prev) => ({
        ...prev,
        [currentQuestion.id]: results
      }));

      setRawConsoleOutput(consoleLogAccumulator);

      // Sync intermediate code progress to Supabase
      if (sessionId) {
        const updatedCodeMap = { ...codeMap, [currentQuestion.id]: currentCode };
        updateCodingSessionInDb(sessionId, {
          code_submissions: updatedCodeMap
        }).catch((err) => {
          console.warn('Could not sync code progress:', err);
        });
      }
    } catch (err: any) {
      console.error('Error running test cases:', err);
      setRawConsoleOutput((prev) => prev + `\nExecution Failed:\n${err?.message || 'Unknown error'}`);
    } finally {
      setIsRunningCode(false);
    }
  };

  // Reset current question code to boilerplate
  const handleResetCode = () => {
    if (!currentQuestion || isSubmitted) return;
    if (window.confirm('Reset your code back to the initial boilerplate starter code?')) {
      setCodeMap((prev) => ({
        ...prev,
        [currentQuestion.id]: currentQuestion.starterCode || currentQuestion.javaStarterCode
      }));
    }
  };

  // Submit and Finalize Assessment
  const handleSubmitAssessment = async () => {
    if (!assessment || isSubmitted) return;
    setIsTimerRunning(false);
    setIsSubmitted(true);

    const timeSpent = (assessment.duration_minutes * 60) - Math.max(0, timeRemainingSeconds);

    let totalTests = 0;
    let passedTests = 0;
    let solvedCount = 0;
    let partialCount = 0;
    let failedCount = 0;
    let unattemptedCount = 0;

    const questionResultsList: QuestionCodingResult[] = questions.map((q) => {
      const qResults = testResultsMap[q.id] || [];
      const qTestsTotal = q.testCases.length;
      const qTestsPassed = qResults.filter((r) => r.passed).length;
      const qCode = codeMap[q.id] || q.starterCode || q.javaStarterCode || '';
      const originalStarter = q.starterCode || q.javaStarterCode || '';
      const isCodeModified = qCode.trim() !== originalStarter.trim() && qCode.trim().length > 0;

      totalTests += qTestsTotal;
      passedTests += qTestsPassed;

      let status: 'Solved' | 'Partial' | 'Failed' | 'Not Attempted' = 'Not Attempted';
      let score = 0;

      if (!isCodeModified && qTestsPassed === 0) {
        status = 'Not Attempted';
        unattemptedCount++;
      } else if (qTestsPassed === qTestsTotal && qTestsTotal > 0) {
        status = 'Solved';
        score = 100;
        solvedCount++;
      } else if (qTestsPassed > 0) {
        status = 'Partial';
        score = Math.round((qTestsPassed / qTestsTotal) * 100);
        partialCount++;
      } else {
        status = 'Failed';
        score = 0;
        failedCount++;
      }

      return {
        questionId: q.id,
        questionTitle: q.title,
        difficulty: q.difficulty,
        passedCount: qTestsPassed,
        totalTestCases: qTestsTotal,
        score,
        status,
        timeTakenSeconds: Math.round(timeSpent / (questions.length || 1)),
        codeSubmitted: qCode,
        testCasesResults: qResults
      };
    });

    const finalScore = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;
    const finalCandidateName = candidateName.trim() || 'Candidate';
    const finalCandidateEmail = candidateEmail.trim();

    let recommendation: 'Strong Hire' | 'Hire' | 'Borderline' | 'No Hire' = 'No Hire';
    if (finalScore >= 85) recommendation = 'Strong Hire';
    else if (finalScore >= 70) recommendation = 'Hire';
    else if (finalScore >= 50) recommendation = 'Borderline';

    const attemptedCount = solvedCount + partialCount + failedCount;
    const failedTestCasesCount = totalTests - passedTests;
    const totalLimit = assessment.duration_minutes * 60;
    const timeRemaining = Math.max(0, timeRemainingSeconds);

    const submissionTime = new Date().toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });

    const codingData: CodingReportData = {
      totalQuestions: questions.length,
      attemptedQuestions: attemptedCount,
      solvedQuestions: solvedCount,
      partiallySolvedQuestions: partialCount,
      failedQuestions: failedCount,
      totalTestCases: totalTests,
      passedTestCases: passedTests,
      failedTestCases: failedTestCasesCount,
      totalTimeLimitSeconds: totalLimit,
      timeSpentSeconds: timeSpent,
      timeRemainingSeconds: timeRemaining,
      submissionTime,
      questionResults: questionResultsList
    };

    const report: InterviewReport = {
      id: `report-coding-${Date.now()}`,
      candidateName: finalCandidateName,
      candidateEmail: finalCandidateEmail || undefined,
      roleName: `${assessment.language === 'python' ? 'Python' : 'Java'} Coding Assessment (${assessment.set_name})`,
      experienceLevel: 'Mid',
      assessmentType: 'coding',
      completedAt: new Date().toISOString(),
      totalTimeSpentSeconds: timeSpent,
      overallScore: finalScore,
      recommendation,
      summary: `Candidate ${finalCandidateName} completed ${assessment.language === 'python' ? 'Python' : 'Java'} coding assessment (${assessment.set_name}). Passed ${passedTests} of ${totalTests} test cases (${finalScore}%). Solved ${solvedCount} of ${questions.length} questions. Overall evaluation: ${recommendation}.`,
      strengths: questionResultsList.filter((q) => q.status === 'Solved').map((q) => `Fully solved "${q.questionTitle}" passing all test assertions.`),
      weaknesses: questionResultsList.filter((q) => q.status !== 'Solved').map((q) => `${q.status === 'Not Attempted' ? 'Did not attempt' : 'Partial / Failed'} "${q.questionTitle}" (${q.passedCount}/${q.totalTestCases} test cases passed).`),
      categoryBreakdown: [
        {
          category: 'domain',
          categoryName: `${assessment.language === 'python' ? 'Python' : 'Java'} Problem Solving`,
          score: finalScore,
          questionsAnswered: questions.length,
          easyCount: questions.filter((q) => q.difficulty === 'easy').length,
          mediumCount: questions.filter((q) => q.difficulty === 'medium').length,
          hardCount: questions.filter((q) => q.difficulty === 'hard').length
        }
      ],
      followUpQuestionsForInterviewer: [
        'Ask the candidate to explain their time and space complexity analysis for their implemented solution.',
        'Discuss edge case handling, constraint validation, and memory efficiency under heavy workloads.'
      ],
      questionSessions: [],
      codingReportData: codingData,
      proctor_enabled: assessment.proctor_enabled,
      proctor_events: proctorEvents,
      proctor_strikes_count: proctorEvents.length
    };

    setFinalReport(report);

    // 1. Notify parent reports store so it appears in Interviewer Reports view if open in same tab
    if (onSaveReport) {
      onSaveReport(report);
    }

    // 2. Persist completed session strictly to Supabase
    setSaveStatus({ isSaving: true });
    const sessionToSave: CodingSessionRecord = {
      id: sessionId || `coding-session-${Date.now()}`,
      candidate_name: finalCandidateName,
      candidate_email: finalCandidateEmail || undefined,
      language: assessment.language,
      set_id: assessment.set_id,
      set_name: assessment.set_name,
      duration_minutes: assessment.duration_minutes,
      time_spent_seconds: timeSpent,
      overall_score: finalScore,
      status: 'completed',
      code_submissions: codeMap,
      question_results: questionResultsList,
      proctor_enabled: assessment.proctor_enabled,
      proctor_events: proctorEvents,
      proctor_strikes_count: proctorEvents.length,
      created_at: new Date(Date.now() - timeSpent * 1000).toISOString(),
      completed_at: new Date().toISOString()
    };

    try {
      const saveRes = await saveCodingSessionToDb(sessionToSave);
      if (token) {
        await updateCodingAssessmentStatus(token, 'completed');
      }

      if (!saveRes.success) {
        setSaveStatus({ isSaving: false, error: saveRes.error || 'Failed to submit assessment results.' });
      } else {
        setSaveStatus({ isSaving: false, success: true });
      }
    } catch (err: any) {
      console.warn('Could not save completed coding session:', err);
      setSaveStatus({ isSaving: false, error: err?.message || 'Unexpected error submitting assessment.' });
    }
  };

  // Progress metrics
  const totalQuestionsCount = questions.length;
  const passedQuestionsCount = questions.filter((q) => {
    const results = testResultsMap[q.id];
    return results && results.length > 0 && results.every((r) => r.passed);
  }).length;

  // View: Loading Validation
  if (isValidating) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center animate-pulse">
          <Code2 className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-white">Validating Assessment Link...</h2>
          <p className="text-xs text-slate-400">Verifying secure token and loading assessment configuration...</p>
        </div>
        <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
      </div>
    );
  }

  // View: Invalid or Expired Token (Strict Security - Zero Data Leak)
  if (validationError || !assessment) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-[#0F0F12] border border-rose-500/30 rounded-2xl p-8 space-y-5 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto shadow-lg">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white">Invalid or Expired Assessment Link</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              {validationError || 'This assessment link is invalid, expired, or was not found. Please contact your hiring recruiter or interviewer for a fresh assessment link.'}
            </p>
          </div>

          <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-[11px] text-slate-400 font-mono">
            Token: <span className="text-rose-300 font-semibold">{token || '(none)'}</span>
          </div>

          {onReturnToHome && (
            <button
              onClick={onReturnToHome}
              className="w-full py-2.5 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-semibold transition-all"
            >
              Return to HireAI Home
            </button>
          )}
        </div>
      </div>
    );
  }

  // View: Assessment Submitted Confirmation
  if (isSubmitted && finalReport) {
    const isTerminated = finalReport.proctor_terminated || isProctorTerminated;

    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <div
          className={`max-w-lg w-full bg-[#0F0F12] border rounded-2xl p-8 space-y-6 shadow-2xl ${
            isTerminated ? 'border-rose-500/30' : 'border-emerald-500/30'
          }`}
        >
          <div
            className={`w-16 h-16 rounded-2xl border flex items-center justify-center mx-auto shadow-lg ${
              isTerminated
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
            }`}
          >
            {isTerminated ? <ShieldAlert className="w-8 h-8" /> : <CheckCircle2 className="w-8 h-8" />}
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">
              {isTerminated ? 'Assessment Terminated: Proctor Violation' : 'Assessment Submitted Successfully!'}
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              {isTerminated ? (
                <span>
                  Candidate <strong className="text-white">{finalReport.candidateName}</strong>, your coding session was terminated because the 4-strike integrity limit was exceeded.
                </span>
              ) : (
                <span>
                  Thank you, <strong className="text-white">{finalReport.candidateName}</strong>.
                </span>
              )}
            </p>
            {isTerminated && (finalReport.proctor_termination_reason || proctorTerminationReason) && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-left">
                <span className="text-[10px] uppercase font-bold text-rose-400 tracking-wider block">Termination Reason</span>
                <span className="text-xs text-rose-200 font-mono">
                  {finalReport.proctor_termination_reason || proctorTerminationReason}
                </span>
              </div>
            )}
          </div>

          {/* Submission Status */}
          {saveStatus.isSaving && (
            <div className="flex items-center justify-center space-x-2 text-indigo-400 text-xs py-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Submitting assessment...</span>
            </div>
          )}

          {saveStatus.error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 text-left space-y-1">
              <p className="font-bold flex items-center space-x-1.5 text-rose-200">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>Notice</span>
              </p>
              <p className="text-[11px] text-rose-300/90">{saveStatus.error}</p>
            </div>
          )}

          {saveStatus.success && (
            <div
              className={`flex items-center justify-center space-x-1.5 text-xs py-2 rounded-xl border font-medium ${
                isTerminated
                  ? 'text-rose-400 bg-rose-500/10 border-rose-500/20'
                  : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
              }`}
            >
              {isTerminated ? <ShieldAlert className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
              <span>{isTerminated ? 'Terminated result recorded' : 'Submitted successfully'}</span>
            </div>
          )}

          <div className="grid grid-cols-3 gap-3 bg-white/5 p-4 rounded-xl border border-white/10 text-left font-mono">
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">
                {isTerminated ? 'Halfway Score' : 'Score'}
              </span>
              <span
                className={`text-lg font-bold ${
                  isTerminated ? 'text-rose-400' : 'text-emerald-400'
                }`}
              >
                {finalReport.overallScore}%
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">Tests Passed</span>
              <span className="text-lg font-bold text-indigo-300">
                {finalReport.codingReportData?.passedTestCases}/{finalReport.codingReportData?.totalTestCases}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">Language</span>
              <span className="text-lg font-bold text-white uppercase">{assessment.language}</span>
            </div>
          </div>

          <div className="text-[11px] text-slate-500">
            You may now safely close this window.
          </div>
        </div>
      </div>
    );
  }

  // View: Candidate Welcome & Onboarding Screen (Before clicking Start)
  if (!isStarted) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6">
        <div className="max-w-xl w-full bg-[#0F0F12] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
              <Code2 className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">{assessment.title || 'Coding Assessment'}</h2>
            <div className="flex items-center justify-center space-x-2">
              <span className="text-[11px] uppercase font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono">
                {assessment.language === 'python' ? 'Python DSA' : 'Java DSA'}
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded bg-white/5 text-slate-400 border border-white/10">
                {questions.length} Challenges
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded bg-white/5 text-slate-400 border border-white/10 flex items-center space-x-1">
                <Clock className="w-3 h-3 text-indigo-400" />
                <span>{assessment.duration_minutes} Minutes</span>
              </span>
            </div>
          </div>

          {/* Assessment Guidelines */}
          <div className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-2 text-xs text-slate-300">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider">Instructions & Guidelines</h3>
            <ul className="space-y-1.5 list-disc list-inside text-slate-400 text-[11px] leading-relaxed">
              <li>Write your algorithm in the Monaco editor and use the <strong>Run Code</strong> button to verify test cases.</li>
              <li>Public and hidden test cases will test functional correctness and edge constraints.</li>
              <li>Once you click <strong>Begin Assessment</strong>, the timer ({assessment.duration_minutes} minutes) will start.</li>
              <li>Your progress is continuously saved to the cloud.</li>
            </ul>

            {assessment.proctor_enabled && (
              <div className="mt-3 pt-3 border-t border-white/10 flex items-start space-x-2 text-indigo-300 bg-indigo-500/10 p-3 rounded-xl border border-indigo-500/20">
                <Camera className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <div className="text-[11px] space-y-0.5">
                  <p className="font-bold text-indigo-200">AI Proctor Mode Active</p>
                  <p className="text-slate-300">
                    This coding assessment uses automated face & gaze integrity monitoring. 3 warning strikes are permitted; a 4th strike terminates the session immediately.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Candidate Identification Form */}
          <div className="space-y-3 bg-white/5 p-4 rounded-xl border border-white/10">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                <User className="w-3.5 h-3.5 text-indigo-400" />
                <span>Your Full Name <strong className="text-rose-400">*</strong></span>
              </label>
              <input
                type="text"
                required
                placeholder="Enter your full legal name"
                value={candidateName}
                onChange={(e) => {
                  setCandidateName(e.target.value);
                  if (formError) setFormError('');
                }}
                className={`w-full px-3.5 py-2 rounded-xl bg-black/40 border text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-1 transition-all ${
                  formError
                    ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500'
                    : 'border-white/10 focus:border-indigo-500 focus:ring-indigo-500'
                }`}
              />
              {formError && <p className="text-[11px] text-rose-400 font-medium">{formError}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                <Mail className="w-3.5 h-3.5 text-indigo-400" />
                <span>Your Email Address <span className="text-slate-500 font-normal">(Optional)</span></span>
              </label>
              <input
                type="email"
                placeholder="candidate@example.com"
                value={candidateEmail}
                onChange={(e) => setCandidateEmail(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>
          </div>

          {/* Start Action */}
          <button
            onClick={handleStart}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Begin Coding Assessment</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      </div>
    );
  }

  // View: Active Coding Environment for Candidate
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased">
      {/* Top Fixed Candidate Navigation Bar */}
      <header className="bg-[#0F0F12] border-b border-white/10 px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-30 shadow-md">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-600/30">
            <Code2 className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white leading-none">{assessment.title || 'Coding Assessment'}</h1>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Candidate: <strong className="text-slate-200">{candidateName}</strong> • {assessment.language === 'python' ? 'Python 3' : 'Java (OpenJDK)'}
            </p>
          </div>
        </div>

        {/* Timer & Finish Submission Button */}
        <div className="flex items-center space-x-4">
          <div
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold ${
              timeRemainingSeconds <= 300
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 animate-pulse'
                : 'bg-black/40 border-white/10 text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span>{formatTime(timeRemainingSeconds)}</span>
          </div>

          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to finish and submit your coding assessment? Once submitted, your answers will be locked.')) {
                handleSubmitAssessment();
              }
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Submit Assessment</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Questions Sidebar (4 Cols) */}
          <div className="lg:col-span-4 bg-[#0F0F12] border border-white/10 rounded-2xl p-4 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Questions ({questions.length})</h2>
              <span className="text-xs font-mono text-emerald-400 font-bold">
                {passedQuestionsCount}/{totalQuestionsCount} Solved
              </span>
            </div>

            <div className="space-y-2">
              {questions.map((q, idx) => {
                const isSelected = selectedQuestionIndex === idx;
                const results = testResultsMap[q.id];
                const hasRun = results && results.length > 0;
                const isAllPass = hasRun && results.every((r) => r.passed);

                return (
                  <button
                    key={q.id}
                    onClick={() => setSelectedQuestionIndex(idx)}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-indigo-600/20 border-indigo-500/50 text-white shadow-md ring-1 ring-indigo-500/30'
                        : 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <div className="space-y-1 truncate pr-2">
                      <span className="font-semibold text-xs truncate block">{q.title}</span>
                      <div className="flex items-center space-x-2 text-[10px] text-slate-400">
                        <span
                          className={`px-1.5 py-0.5 rounded font-bold uppercase ${
                            q.difficulty === 'easy'
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : q.difficulty === 'medium'
                              ? 'bg-amber-500/10 text-amber-400'
                              : 'bg-rose-500/10 text-rose-400'
                          }`}
                        >
                          {q.difficulty}
                        </span>
                        <span>{q.testCases.length} Test Cases</span>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {isAllPass ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : hasRun ? (
                        <XCircle className="w-4 h-4 text-rose-400" />
                      ) : (
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-600" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Problem Statement Drawer */}
            {currentQuestion && (
              <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
                <h3 className="text-xs font-bold text-white tracking-tight">{currentQuestion.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">{currentQuestion.description}</p>

                {(currentQuestion.sampleInput || currentQuestion.sampleOutput) && (
                  <div className="grid grid-cols-2 gap-2 pt-2 text-[11px]">
                    <div className="bg-black/40 p-2 rounded-lg border border-white/5">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Sample Input</span>
                      <code className="text-indigo-300 font-mono">{currentQuestion.sampleInput || '(none)'}</code>
                    </div>
                    <div className="bg-black/40 p-2 rounded-lg border border-white/5">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Sample Output</span>
                      <code className="text-emerald-300 font-mono">{currentQuestion.sampleOutput || '(none)'}</code>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Code Editor & Execution Panel (8 Cols) */}
          <div className="lg:col-span-8 space-y-4">
            {/* Editor Container */}
            <div className="bg-[#0F0F12] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
              {/* Header */}
              <div className="bg-black/40 px-4 py-2.5 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileCode2 className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-mono font-bold text-slate-200">
                    {assessment.language === 'python' ? 'solution.py' : 'Solution.java'}
                  </span>
                </div>

                <button
                  onClick={handleResetCode}
                  className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white px-2 py-1 rounded-lg hover:bg-white/5 transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Code</span>
                </button>
              </div>

              {/* Monaco Editor */}
              <div className="h-[400px] w-full">
                <Editor
                  height="100%"
                  defaultLanguage={assessment.language === 'python' ? 'python' : 'java'}
                  language={assessment.language === 'python' ? 'python' : 'java'}
                  theme="vs-dark"
                  value={currentCode}
                  onChange={(val) => {
                    if (currentQuestion) {
                      setCodeMap((prev) => ({
                        ...prev,
                        [currentQuestion.id]: val || ''
                      }));
                    }
                  }}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 13,
                    lineNumbers: 'on',
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 4
                  }}
                />
              </div>

              {/* Footer Run Bar */}
              <div className="p-3 bg-black/40 border-t border-white/10 flex items-center justify-between">
                <div className="text-[11px] text-slate-400 font-mono">
                  Engine: <span className="text-white font-semibold">{assessment.language === 'python' ? 'Python 3' : 'Java (OpenJDK)'}</span>
                </div>

                <button
                  onClick={handleRunCode}
                  disabled={isRunningCode}
                  className={`flex items-center space-x-2 px-5 py-2 rounded-xl font-bold text-xs shadow-lg transition-all ${
                    isRunningCode
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
                  }`}
                >
                  {isRunningCode ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Running Tests...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Run Code</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Test Results Output Panel */}
            <div className="bg-[#0F0F12] border border-white/10 rounded-2xl p-4 space-y-3">
              <div className="flex items-center space-x-2 border-b border-white/10 pb-2">
                <button
                  onClick={() => setActiveOutputTab('test_results')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeOutputTab === 'test_results'
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Test Case Results ({currentQuestion?.testCases.length || 0})
                </button>
                <button
                  onClick={() => setActiveOutputTab('console')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeOutputTab === 'console'
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Console Output
                </button>
              </div>

              {activeOutputTab === 'test_results' && (
                <div className="space-y-2">
                  {testResultsMap[currentQuestion?.id] ? (
                    testResultsMap[currentQuestion?.id].map((res, i) => (
                      <div
                        key={res.testCaseId}
                        className={`p-3 rounded-xl border text-xs space-y-1.5 ${
                          res.passed
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                            : 'bg-rose-500/10 border-rose-500/30 text-rose-200'
                        }`}
                      >
                        <div className="flex items-center justify-between font-semibold">
                          <div className="flex items-center space-x-2">
                            {res.passed ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <XCircle className="w-4 h-4 text-rose-400" />
                            )}
                            <span>
                              Test Case {i + 1} {res.isHidden ? '(Hidden)' : '(Public)'}
                            </span>
                          </div>
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                              res.passed ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                            }`}
                          >
                            {res.passed ? 'PASS' : 'FAIL'}
                          </span>
                        </div>

                        {!res.isHidden && (
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 font-mono text-[11px]">
                            <div>
                              <span className="text-[10px] text-slate-400 block uppercase">Input</span>
                              <span className="text-slate-200 bg-black/40 px-2 py-1 rounded block truncate">
                                {res.input || '(empty)'}
                              </span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 block uppercase">Expected</span>
                              <span className="text-slate-200 bg-black/40 px-2 py-1 rounded block truncate">
                                {res.expectedOutput}
                              </span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 block uppercase">Actual Output</span>
                              <span className="text-slate-200 bg-black/40 px-2 py-1 rounded block truncate">
                                {res.actualOutput || '(no output)'}
                              </span>
                            </div>
                          </div>
                        )}

                        {res.isHidden && (
                          <div className="text-[11px] text-slate-400 italic">
                            Input and expected output are hidden for verification integrity.
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-slate-500 text-xs space-y-1">
                      <Terminal className="w-6 h-6 mx-auto opacity-40" />
                      <p>No tests executed yet for this question.</p>
                      <p className="text-[11px]">
                        Click <strong>Run Code</strong> above to test your solution against all test cases.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeOutputTab === 'console' && (
                <div className="bg-black/60 rounded-xl p-3 font-mono text-xs text-slate-300 max-h-48 overflow-y-auto border border-white/5 whitespace-pre-wrap">
                  {rawConsoleOutput || 'Console is clean.'}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Real-time AI Face Proctor Widget for Candidate Portal */}
      {isStarted && !isSubmitted && assessment?.proctor_enabled && (
        <ProctorCameraWidget
          isEnabled={assessment.proctor_enabled && isStarted && !isSubmitted}
          maxStrikes={4}
          onViolationStrike={handleProctorViolationStrike}
          onMaxStrikesReached={handleProctorTermination}
        />
      )}
    </div>
  );
};
