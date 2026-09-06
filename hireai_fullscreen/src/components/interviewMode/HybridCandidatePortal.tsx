import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import {
  HybridAssessmentRecord,
  HybridMCQQuestion,
  JavaCodingQuestion,
  CodingTestCaseResult,
  JavaExecutionResponse,
  InterviewReport,
  CodingReportData,
  QuestionCodingResult,
  CodingSessionRecord,
  CategoryScore,
  HybridMCQResult,
  HybridReportData,
  SecurityEvent,
  SecurityViolationType
} from '../../types';
import {
  fetchHybridAssessmentByToken,
  updateHybridAssessmentStatus,
  secondsToMMSS
} from '../../lib/hybridStorage';
import {
  saveCodingSessionToDb,
  updateCodingAssessmentStatus
} from '../../lib/codingSupabase';
import { saveInterviewReportToDb } from '../../lib/questionPoolsSupabase';
import { ProctorCameraWidget } from '../ProctorCameraWidget';
import {
  HelpCircle,
  Code2,
  Clock,
  CheckCircle2,
  XCircle,
  Play,
  RotateCcw,
  Terminal,
  AlertCircle,
  ArrowRight,
  User,
  Mail,
  Send,
  Loader2,
  ShieldAlert,
  ShieldCheck,
  Shield,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Layers,
  Sparkles,
  Bookmark,
  BookmarkCheck,
  Copy,
  Check,
  FileCode,
  Keyboard,
  Zap,
  CheckCircle,
  Lock,
  Camera
} from 'lucide-react';

interface HybridCandidatePortalProps {
  token: string | null;
  onSaveReport?: (report: InterviewReport) => void;
  onReturnToHome?: () => void;
}

type AssessmentPhase = 'entry' | 'mcq' | 'interval' | 'coding' | 'submitted';

export const HybridCandidatePortal: React.FC<HybridCandidatePortalProps> = ({
  token,
  onSaveReport,
  onReturnToHome
}) => {
  // Validation state
  const [isValidating, setIsValidating] = useState(true);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [assessment, setAssessment] = useState<HybridAssessmentRecord | null>(null);
  const [isAlreadyCompleted, setIsAlreadyCompleted] = useState(false);

  // Candidate info
  const [candidateName, setCandidateName] = useState('');
  const [candidateEmail, setCandidateEmail] = useState('');
  const [formError, setFormError] = useState('');

  // Assessment flow phases
  const [phase, setPhase] = useState<AssessmentPhase>('entry');
  const [sessionId, setSessionId] = useState('');

  // Section 1: MCQ State
  const [mcqTimeRemaining, setMcqTimeRemaining] = useState(600);
  const [isMcqTimerRunning, setIsMcqTimerRunning] = useState(false);
  const [currentMcqIndex, setCurrentMcqIndex] = useState(0);
  const [mcqAnswers, setMcqAnswers] = useState<Record<string, number>>({}); // qId -> selectedIndex
  const [flaggedMcqs, setFlaggedMcqs] = useState<Record<string, boolean>>({}); // qId -> boolean
  const [showMcqSubmitConfirm, setShowMcqSubmitConfirm] = useState(false);

  // Interval State
  const [intervalRemaining, setIntervalRemaining] = useState(15);
  const [isIntervalRunning, setIsIntervalRunning] = useState(false);

  // Section 2: Coding State
  const [codingTimeRemaining, setCodingTimeRemaining] = useState(1800);
  const [isCodingTimerRunning, setIsCodingTimerRunning] = useState(false);
  const [selectedCodingIndex, setSelectedCodingIndex] = useState(0);
  const [codeMap, setCodeMap] = useState<Record<string, string>>({});
  const [testResultsMap, setTestResultsMap] = useState<Record<string, CodingTestCaseResult[]>>({});
  const [selectedTestCaseIdx, setSelectedTestCaseIdx] = useState<number>(0);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isRunningCode, setIsRunningCode] = useState(false);
  const [rawConsoleOutput, setRawConsoleOutput] = useState('');
  const [activeOutputTab, setActiveOutputTab] = useState<'test_results' | 'console'>('test_results');
  const [showCodingSubmitConfirm, setShowCodingSubmitConfirm] = useState(false);

  // Exam Integrity Guard State
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [securityStrikesCount, setSecurityStrikesCount] = useState(0);
  const [isSecurityTerminated, setIsSecurityTerminated] = useState(false);
  const [securityTerminationReason, setSecurityTerminationReason] = useState('');
  const [isCurrentlyFullscreen, setIsCurrentlyFullscreen] = useState(false);
  const [securityModal, setSecurityModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    strikeNumber: number;
    isTerminal: boolean;
    type: SecurityViolationType;
  } | null>(null);
  const [externalPasteAlert, setExternalPasteAlert] = useState<string | null>(null);

  // Entry webcam check state
  const [entryWebcamStatus, setEntryWebcamStatus] = useState<'idle' | 'testing' | 'ready' | 'error'>('idle');
  const [entryWebcamError, setEntryWebcamError] = useState<string>('');
  const entryVideoRef = useRef<HTMLVideoElement | null>(null);
  const entryStreamRef = useRef<MediaStream | null>(null);

  const internalClipboardRef = useRef<string>('');
  const lastViolationTimeRef = useRef<number>(0);
  const securityStrikesCountRef = useRef<number>(0);
  const isSecurityTerminatedRef = useRef<boolean>(false);
  const isSecurityModalOpenRef = useRef<boolean>(false);
  const startGracePeriodUntilRef = useRef<number>(0);
  const isSubmittingFinalRef = useRef<boolean>(false);

  // Helper to strip any lingering "[Hybrid]" or "[hybrid]" tags
  const cleanAssessmentName = (name?: string): string => {
    if (!name) return '';
    return name.replace(/\s*\[\s*hybrid\s*\]/gi, '').replace(/\s*\(\s*hybrid\s*\)/gi, '').trim();
  };

  // Keep refs in sync for event listeners
  useEffect(() => {
    securityStrikesCountRef.current = securityStrikesCount;
  }, [securityStrikesCount]);

  useEffect(() => {
    isSecurityTerminatedRef.current = isSecurityTerminated;
  }, [isSecurityTerminated]);

  useEffect(() => {
    isSecurityModalOpenRef.current = Boolean(securityModal && securityModal.isOpen);
  }, [securityModal]);

  // Helper function to strip redundant "A)", "B.", etc. prefix if options already have them
  const cleanOptionText = (text: string, optIdx: number): string => {
    if (!text) return '';
    const letter = String.fromCharCode(65 + optIdx);
    const regex = new RegExp(`^(\\(${letter}\\)|${letter}\\)|${letter}\\.|${letter}:|Option\\s+${letter}:|\\b${optIdx + 1}\\.|\\b${optIdx + 1}\\))\\s*`, 'i');
    return text.trim().replace(regex, '').trim();
  };

  // Helper function to clean leading numbers from problem title (e.g. "1. Reverse String" -> "Reverse String")
  const cleanProblemTitle = (title: string, index: number): string => {
    if (!title) return `Problem ${index + 1}`;
    return title.replace(/^(P\d+[:.]\s*|Problem\s*\d+[:.]\s*|\d+[\.\)]\s*)/i, '').trim();
  };

  // Copy helper for sample cases
  const handleCopyText = (content: string, fieldKey: string) => {
    if (!content) return;
    navigator.clipboard.writeText(content);
    internalClipboardRef.current = content;
    setCopiedField(fieldKey);
    setTimeout(() => setCopiedField(null), 1800);
  };

  // Proctor state
  const [proctorEvents, setProctorEvents] = useState<any[]>([]);
  const [isProctorTerminated, setIsProctorTerminated] = useState(false);
  const [proctorTerminationReason, setProctorTerminationReason] = useState('');

  // Submission status
  const [isSubmittingFinal, setIsSubmittingFinal] = useState(false);
  const [finalReport, setFinalReport] = useState<InterviewReport | null>(null);

  // 1. Validate Token on mount
  useEffect(() => {
    let isMounted = true;
    async function validate() {
      if (!token) {
        if (isMounted) {
          setValidationError('No assessment token provided.');
          setIsValidating(false);
        }
        return;
      }

      setIsValidating(true);
      setValidationError(null);

      const res = await fetchHybridAssessmentByToken(token);
      if (!isMounted) return;

      if (res.valid && res.assessment) {
        if (res.assessment.status === 'completed') {
          setIsAlreadyCompleted(true);
          setAssessment(res.assessment);
          setIsValidating(false);
          return;
        }
        setAssessment(res.assessment);
        if (res.assessment.candidateName) setCandidateName(res.assessment.candidateName);
        if (res.assessment.candidateEmail) setCandidateEmail(res.assessment.candidateEmail);
        setMcqTimeRemaining(res.assessment.mcqDurationSeconds);
        setIntervalRemaining(res.assessment.intervalCountdownSeconds);
        setCodingTimeRemaining(res.assessment.codingDurationSeconds);
      } else {
        setValidationError(res.error || 'Invalid or expired assessment link.');
      }
      setIsValidating(false);
    }

    validate();
    return () => {
      isMounted = false;
    };
  }, [token]);

  // Section 1 Timer (MCQ)
  useEffect(() => {
    if (phase !== 'mcq' || !isMcqTimerRunning) return;

    const timer = setInterval(() => {
      setMcqTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTransitionToInterval();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phase, isMcqTimerRunning]);

  // Interval Countdown Timer
  useEffect(() => {
    if (phase !== 'interval' || !isIntervalRunning) return;

    const timer = setInterval(() => {
      setIntervalRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleStartCoding();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phase, isIntervalRunning]);

  // Section 2 Timer (Coding)
  useEffect(() => {
    if (phase !== 'coding' || !isCodingTimerRunning) return;

    const timer = setInterval(() => {
      setCodingTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinalSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phase, isCodingTimerRunning]);

  // Execute code via server proxy
  const executeCode = async (
    code: string,
    stdinInput: string,
    lang: 'java' | 'python'
  ): Promise<JavaExecutionResponse> => {
    const response = await fetch('/api/coding/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ script: code, stdin: stdinInput, language: lang })
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      throw new Error(errJson.error || `Server execution error: ${response.status}`);
    }

    return await response.json();
  };

  // Fullscreen Helpers
  const requestFullscreenSafe = async () => {
    try {
      const el = document.documentElement as any;
      if (el.requestFullscreen) {
        await el.requestFullscreen();
      } else if (el.webkitRequestFullscreen) {
        await el.webkitRequestFullscreen();
      } else if (el.msRequestFullscreen) {
        await el.msRequestFullscreen();
      }
    } catch (err) {
      console.warn('Fullscreen request bypassed or blocked by browser gesture rules:', err);
    }
  };

  const exitFullscreenSafe = async () => {
    try {
      const doc = document as any;
      if (doc.fullscreenElement || doc.webkitFullscreenElement || doc.msFullscreenElement) {
        if (doc.exitFullscreen) {
          await doc.exitFullscreen();
        } else if (doc.webkitExitFullscreen) {
          await doc.webkitExitFullscreen();
        } else if (doc.msExitFullscreen) {
          await doc.msExitFullscreen();
        }
      }
    } catch (err) {
      console.warn('Fullscreen exit exception:', err);
    }
  };

  // Exam Integrity Guard Strike Trigger
  const triggerSecurityStrike = (type: SecurityViolationType, customMessage?: string) => {
    if (phase !== 'mcq' && phase !== 'interval' && phase !== 'coding') return;
    if (isSubmittingFinalRef.current || isSubmittingFinal) return;
    if (assessment?.browser_lock_enabled === false) return;
    if (isSecurityTerminatedRef.current || isProctorTerminated) return;

    // Startup, modal & submit grace period check (prevents false strikes)
    if (Date.now() < startGracePeriodUntilRef.current) {
      return;
    }

    // If warning modal is already displayed, ignore subsequent defocus or fullscreen exit events
    if (isSecurityModalOpenRef.current && (type === 'tab_switch' || type === 'window_defocus' || type === 'fullscreen_exit')) {
      return;
    }

    const now = Date.now();
    if (now - lastViolationTimeRef.current < 2500) {
      return; // Debounce rapid duplicate events
    }
    lastViolationTimeRef.current = now;

    const nextStrike = securityStrikesCountRef.current + 1;
    setSecurityStrikesCount(nextStrike);

    let defaultMsg = '';
    let title = '';
    if (type === 'fullscreen_exit') {
      title = 'Fullscreen Mode Exited';
      defaultMsg = 'Exiting fullscreen mode violates the exam integrity policy.';
    } else if (type === 'tab_switch' || type === 'window_defocus') {
      title = 'Tab Switch / Window Blur Detected';
      defaultMsg = 'Switching away from this tab or application is strictly prohibited.';
    } else if (type === 'external_paste_attempt') {
      title = 'External Clipboard Paste Blocked';
      defaultMsg = 'Pasting text from external websites or outside applications is blocked.';
    } else if (type === 'developer_tools_attempt') {
      title = 'Developer Tools / Source Code Access Blocked';
      defaultMsg = 'Keyboard shortcuts to inspect elements or view source are restricted.';
    }

    const eventMsg = customMessage || defaultMsg;
    const newEvent: SecurityEvent = {
      id: `sec-event-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type,
      timestamp: new Date().toISOString(),
      formattedTime: new Date().toLocaleTimeString(),
      message: eventMsg,
      strikeNumber: Math.min(3, nextStrike)
    };

    setSecurityEvents((prev) => {
      const updated = [newEvent, ...prev];
      if (nextStrike >= 3) {
        setIsSecurityTerminated(true);
        const reason = `Terminated: Maximum 3 strikes reached on Exam Integrity Guard (${title}: ${eventMsg})`;
        setSecurityTerminationReason(reason);

        setSecurityModal({
          isOpen: true,
          title: 'Assessment Terminated: 3 Integrity Strikes',
          message: 'You have exceeded the maximum allowed integrity strikes (3/3). Your assessment has been automatically disqualified and submitted to the recruiting team.',
          strikeNumber: 3,
          isTerminal: true,
          type
        });

        exitFullscreenSafe();

        setTimeout(() => {
          handleFinalSubmit(true, reason, proctorEvents, updated, 3);
        }, 2200);
      } else {
        setSecurityModal({
          isOpen: true,
          title: nextStrike === 1 ? 'Strike 1 of 3: Integrity Warning' : 'Strike 2 of 3: Final Disqualification Warning',
          message: `${eventMsg}\n\n${
            nextStrike === 2
              ? '⚠️ CRITICAL: 1 more violation will immediately disqualify you and auto-submit your assessment.'
              : 'Please remain in fullscreen and do not navigate away.'
          }`,
          strikeNumber: nextStrike,
          isTerminal: false,
          type
        });
      }
      return updated;
    });
  };

  const handleResumeAfterSecurityWarning = async () => {
    startGracePeriodUntilRef.current = Date.now() + 4000;
    setSecurityModal(null);
    isSecurityModalOpenRef.current = false;
    await requestFullscreenSafe();
  };

  // Entry webcam test helper
  const testEntryWebcam = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setEntryWebcamError('Webcam is not supported by your browser.');
      setEntryWebcamStatus('error');
      return;
    }
    setEntryWebcamStatus('testing');
    setEntryWebcamError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 320 }, height: { ideal: 240 } },
        audio: false
      });
      entryStreamRef.current = stream;
      if (entryVideoRef.current) {
        entryVideoRef.current.srcObject = stream;
        await entryVideoRef.current.play();
      }
      setEntryWebcamStatus('ready');
    } catch (err: any) {
      console.warn('Webcam permission error:', err);
      setEntryWebcamStatus('error');
      setEntryWebcamError(
        err.name === 'NotAllowedError'
          ? 'Camera access was denied. Please allow camera access in your browser address bar.'
          : 'Unable to access camera.'
      );
    }
  };

  // Exam Integrity Guard Listeners
  useEffect(() => {
    const checkFullscreenState = () => {
      const doc = document as any;
      const isFull = Boolean(doc.fullscreenElement || doc.webkitFullscreenElement || doc.msFullscreenElement);
      setIsCurrentlyFullscreen(isFull);
    };
    checkFullscreenState();

    if (phase !== 'mcq' && phase !== 'interval' && phase !== 'coding') return;
    if (assessment?.browser_lock_enabled === false) return;

    const onFullscreenChange = () => {
      const doc = document as any;
      const isFull = Boolean(doc.fullscreenElement || doc.webkitFullscreenElement || doc.msFullscreenElement);
      setIsCurrentlyFullscreen(isFull);
      if (isSubmittingFinalRef.current || isSecurityTerminatedRef.current) return;
      if (Date.now() < startGracePeriodUntilRef.current || isSecurityModalOpenRef.current) return;
      if (!isFull) {
        triggerSecurityStrike('fullscreen_exit');
      }
    };

    const onVisibilityChange = () => {
      if (isSubmittingFinalRef.current || isSecurityTerminatedRef.current) return;
      if (Date.now() < startGracePeriodUntilRef.current || isSecurityModalOpenRef.current) return;
      if (document.hidden) {
        triggerSecurityStrike('tab_switch');
      }
    };

    const onBlur = () => {
      if (isSubmittingFinalRef.current || isSecurityTerminatedRef.current) return;
      if (Date.now() < startGracePeriodUntilRef.current || isSecurityModalOpenRef.current) return;
      triggerSecurityStrike('window_defocus');
    };

    const handleCopyOrCut = () => {
      const selected = window.getSelection()?.toString();
      if (selected) {
        internalClipboardRef.current = selected;
      }
    };

    const handlePaste = (e: ClipboardEvent) => {
      const pasted = e.clipboardData?.getData('text/plain') || '';
      if (!pasted) return;

      const trimmedPasted = pasted.trim();
      const trimmedInternal = (internalClipboardRef.current || '').trim();

      const isAllowedInternal =
        trimmedInternal.length > 0 &&
        (trimmedInternal.includes(trimmedPasted) || trimmedPasted.includes(trimmedInternal));

      if (!isAllowedInternal) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        setExternalPasteAlert('External paste blocked! Only code copied from within this portal is allowed.');
        setTimeout(() => setExternalPasteAlert(null), 3500);

        triggerSecurityStrike('external_paste_attempt', 'Attempted to paste content from an external clipboard source.');
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Block F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, Ctrl+U, Cmd+Option+I, etc.
      if (
        e.key === 'F12' ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && ['I', 'i', 'J', 'j', 'C', 'c'].includes(e.key)) ||
        ((e.ctrlKey || e.metaKey) && ['u', 'U'].includes(e.key))
      ) {
        e.preventDefault();
        triggerSecurityStrike('developer_tools_attempt', 'Attempted to inspect page or open developer tools.');
      }
    };

    document.addEventListener('fullscreenchange', onFullscreenChange);
    document.addEventListener('webkitfullscreenchange', onFullscreenChange);
    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('blur', onBlur);
    window.addEventListener('copy', handleCopyOrCut);
    window.addEventListener('cut', handleCopyOrCut);
    window.addEventListener('paste', handlePaste, true);
    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', onFullscreenChange);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('copy', handleCopyOrCut);
      window.removeEventListener('cut', handleCopyOrCut);
      window.removeEventListener('paste', handlePaste, true);
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [phase, assessment?.browser_lock_enabled]);

  // Clean up entry webcam preview on unmount
  useEffect(() => {
    return () => {
      if (entryStreamRef.current) {
        entryStreamRef.current.getTracks().forEach((track) => track.stop());
        entryStreamRef.current = null;
      }
    };
  }, []);

  // Start Assessment from Entry Screen (Pure Synchronous User Click Gesture)
  const handleStartAssessment = () => {
    if (!candidateName.trim()) {
      setFormError('Please enter your full name to begin the assessment.');
      return;
    }
    if (assessment?.proctor_enabled && entryWebcamStatus !== 'ready') {
      setFormError('Camera access and preview verification is mandatory before starting this proctored assessment.');
      return;
    }
    setFormError('');

    // Stop entry preview video stream so proctor widget gets exclusive access
    if (entryStreamRef.current) {
      entryStreamRef.current.getTracks().forEach((track) => track.stop());
      entryStreamRef.current = null;
    }

    // Direct synchronous fullscreen request on user gesture
    if (assessment?.browser_lock_enabled !== false) {
      requestFullscreenSafe();
    }

    // 15-second grace period immunity for smooth initialization
    startGracePeriodUntilRef.current = Date.now() + 15000;

    const newSessionId = `hyb-session-${Date.now()}`;
    setSessionId(newSessionId);

    // Initial code map for coding section
    const initialCode: Record<string, string> = {};
    (assessment?.codingQuestions || []).forEach((q) => {
      initialCode[q.id] = q.starterCode || q.javaStarterCode || '';
    });
    setCodeMap(initialCode);

    // If assessment has MCQs, go to MCQ round; otherwise straight to coding
    if (token) {
      updateHybridAssessmentStatus(token, 'in_progress');
    }

    if (assessment?.mcqQuestions && assessment.mcqQuestions.length > 0) {
      setPhase('mcq');
      setIsMcqTimerRunning(true);
    } else {
      setPhase('coding');
      setIsCodingTimerRunning(true);
    }
  };

  // Submit MCQ and start Interval Countdown
  const handleTransitionToInterval = () => {
    setIsMcqTimerRunning(false);
    setShowMcqSubmitConfirm(false);

    // If no coding questions in assessment, proceed straight to final submission
    if (!assessment?.codingQuestions || assessment.codingQuestions.length === 0) {
      handleFinalSubmit();
      return;
    }

    // Otherwise start the strict auto-advancing interval countdown
    setIntervalRemaining(assessment?.intervalCountdownSeconds || 15);
    setPhase('interval');
    setIsIntervalRunning(true);
  };

  // Start Coding Round immediately (e.g. from countdown screen)
  const handleStartCoding = () => {
    setIsIntervalRunning(false);
    setPhase('coding');
    setIsCodingTimerRunning(true);
  };

  // Run Test Cases for current coding question
  const handleRunCode = async () => {
    const currentQuestion = assessment?.codingQuestions[selectedCodingIndex];
    if (!currentQuestion || !assessment) return;

    setIsRunningCode(true);
    setRawConsoleOutput(`Compiling and running ${assessment.codingLanguage === 'python' ? 'Python' : 'Java'} tests...\n`);
    setActiveOutputTab('test_results');

    const results: CodingTestCaseResult[] = [];
    let consoleAcc = '';

    try {
      const currentCode = codeMap[currentQuestion.id] || currentQuestion.starterCode || currentQuestion.javaStarterCode || '';

      for (let i = 0; i < currentQuestion.testCases.length; i++) {
        const tc = currentQuestion.testCases[i];
        consoleAcc += `\n--- Running Test Case ${i + 1} (${tc.isHidden ? 'Hidden' : 'Visible'}) ---\n`;

        const execution = await executeCode(currentCode, tc.input, assessment.codingLanguage);
        const actualOutRaw = execution.output || execution.error || '';
        const actualOutClean = actualOutRaw.trim().replace(/\r\n/g, '\n');
        const expectedOutClean = (tc.expectedOutput || '').trim().replace(/\r\n/g, '\n');

        consoleAcc += `Stdout:\n${actualOutRaw}\n`;
        const passed = actualOutClean === expectedOutClean;

        results.push({
          testCaseId: tc.id,
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          actualOutput: actualOutRaw,
          passed,
          isHidden: tc.isHidden,
          error: execution.error
        });
      }

      setTestResultsMap((prev) => ({
        ...prev,
        [currentQuestion.id]: results
      }));
      setRawConsoleOutput(consoleAcc);
    } catch (err: any) {
      console.warn('Execution exception:', err);
      setRawConsoleOutput(`Execution failed: ${err?.message || 'Server error'}`);
    } finally {
      setIsRunningCode(false);
    }
  };

  // Final submit handler (combines MCQ + Coding results)
  const handleFinalSubmit = async (
    forcedTermination = false,
    termReason?: string,
    eventsList?: any[],
    secEventsList?: SecurityEvent[],
    secStrikes?: number
  ) => {
    if (!assessment) return;

    // Immediately disable security/integrity triggers and mark submission in progress
    isSubmittingFinalRef.current = true;
    startGracePeriodUntilRef.current = Number.MAX_SAFE_INTEGER;
    setIsSubmittingFinal(true);

    // Immediately close any open confirmation popups
    setShowCodingSubmitConfirm(false);
    setShowMcqSubmitConfirm(false);
    setSecurityModal(null);

    // Auto exit fullscreen safely on finish without triggering violation strikes
    exitFullscreenSafe();

    setIsMcqTimerRunning(false);
    setIsIntervalRunning(false);
    setIsCodingTimerRunning(false);

    const finalEvents = eventsList && eventsList.length > 0 ? eventsList : proctorEvents;
    const finalSecEvents = secEventsList && secEventsList.length > 0 ? secEventsList : securityEvents;
    const finalSecStrikes = secStrikes !== undefined ? secStrikes : securityStrikesCount;

    const isSecurityTerm = isSecurityTerminated || finalSecStrikes >= 3 || (forcedTermination && termReason?.includes('Secure Browser'));
    const isProctorTerm = isProctorTerminated || (forcedTermination && !isSecurityTerm);
    const isTerminated = forcedTermination || isSecurityTerm || isProctorTerm;
    const terminationReason = termReason || (isSecurityTerm ? securityTerminationReason : proctorTerminationReason);

    const cleanedSetName = cleanAssessmentName(assessment.setName);

    const mcqs = assessment.mcqQuestions || [];
    let mcqCorrect = 0;
    let mcqAttempted = 0;
    let mcqWrong = 0;

    const mcqResultsList: HybridMCQResult[] = mcqs.map((q) => {
      const ans = mcqAnswers[q.id];
      const hasAnswered = ans !== undefined && ans !== null;
      if (hasAnswered) mcqAttempted++;
      const isCorrect = hasAnswered && ans === q.correctAnswerIndex;
      if (isCorrect) {
        mcqCorrect++;
      } else if (hasAnswered) {
        mcqWrong++;
      }

      return {
        questionId: q.id,
        questionText: q.questionText,
        options: q.options,
        correctAnswerIndex: q.correctAnswerIndex,
        candidateAnswerIndex: hasAnswered ? ans : null,
        isCorrect,
        difficulty: q.difficulty
      };
    });

    const mcqScorePercent = mcqs.length > 0 ? Math.round((mcqCorrect / mcqs.length) * 100) : 100;

    // Evaluate Coding test cases
    const codingQs = assessment.codingQuestions || [];
    let totalTestCases = 0;
    let passedTestCases = 0;
    let solvedCount = 0;
    let partialCount = 0;
    let failedCount = 0;

    const questionResultsList: QuestionCodingResult[] = codingQs.map((q) => {
      const qResults = testResultsMap[q.id] || [];
      const qTotal = q.testCases.length;
      const qPassed = qResults.filter((r) => r.passed).length;
      totalTestCases += qTotal;
      passedTestCases += qPassed;

      let status: 'Solved' | 'Partial' | 'Failed' | 'Not Attempted' = 'Not Attempted';
      if (qResults.length > 0) {
        if (qPassed === qTotal && qTotal > 0) {
          status = 'Solved';
          solvedCount++;
        } else if (qPassed > 0) {
          status = 'Partial';
          partialCount++;
        } else {
          status = 'Failed';
          failedCount++;
        }
      }

      return {
        questionId: q.id,
        questionTitle: q.title,
        difficulty: q.difficulty,
        passedCount: qPassed,
        totalTestCases: qTotal,
        score: qTotal > 0 ? Math.round((qPassed / qTotal) * 100) : 0,
        status,
        codeSubmitted: codeMap[q.id] || q.starterCode || q.javaStarterCode || '',
        testCasesResults: qResults
      };
    });

    const codingScorePercent =
      codingQs.length > 0
        ? totalTestCases > 0
          ? Math.round((passedTestCases / totalTestCases) * 100)
          : solvedCount > 0
          ? 100
          : 0
        : 0;

    // Combined overall score (40% MCQ + 60% Coding if both present)
    let finalOverallScore = 0;
    if (mcqs.length > 0 && codingQs.length > 0) {
      finalOverallScore = Math.round(mcqScorePercent * 0.4 + codingScorePercent * 0.6);
    } else if (mcqs.length > 0) {
      finalOverallScore = mcqScorePercent;
    } else {
      finalOverallScore = codingScorePercent;
    }

    let recommendation: 'Strong Hire' | 'Hire' | 'Borderline' | 'No Hire' = 'No Hire';
    if (isTerminated) {
      recommendation = 'No Hire';
      finalOverallScore = Math.min(finalOverallScore, 30);
    } else {
      if (finalOverallScore >= 85) recommendation = 'Strong Hire';
      else if (finalOverallScore >= 70) recommendation = 'Hire';
      else if (finalOverallScore >= 50) recommendation = 'Borderline';
    }

    const codingReportData: CodingReportData = {
      totalQuestions: codingQs.length,
      attemptedQuestions: codingQs.filter((q) => {
        const hasTests = Boolean(testResultsMap[q.id] && testResultsMap[q.id].length > 0);
        const currentCode = (codeMap[q.id] || '').trim();
        const starter = (q.starterCode || q.javaStarterCode || '').trim();
        const hasCode = currentCode.length > 0 && currentCode !== starter;
        return hasTests || hasCode;
      }).length,
      solvedQuestions: solvedCount,
      partiallySolvedQuestions: partialCount,
      failedQuestions: failedCount,
      totalTestCases,
      passedTestCases,
      failedTestCases: Math.max(0, totalTestCases - passedTestCases),
      totalTimeLimitSeconds: assessment.codingDurationSeconds,
      timeSpentSeconds: Math.max(0, assessment.codingDurationSeconds - codingTimeRemaining),
      timeRemainingSeconds: codingTimeRemaining,
      submissionTime: new Date().toLocaleString(),
      questionResults: questionResultsList
    };

    const hybridReportData: HybridReportData = {
      mcqTotal: mcqs.length,
      mcqAttempted,
      mcqCorrect,
      mcqWrong,
      mcqScorePercent,
      mcqTimeSpentSeconds: Math.max(0, assessment.mcqDurationSeconds - mcqTimeRemaining),
      mcqResults: mcqResultsList,
      codingReportData
    };

    const categoryBreakdown: CategoryScore[] = [
      {
        category: 'domain',
        categoryName: 'MCQ Technical Accuracy',
        score: mcqScorePercent,
        questionsAnswered: mcqAttempted,
        easyCount: mcqs.filter((q) => q.difficulty === 'easy').length,
        mediumCount: mcqs.filter((q) => q.difficulty === 'medium').length,
        hardCount: mcqs.filter((q) => q.difficulty === 'hard').length
      },
      {
        category: 'basic',
        categoryName: `${assessment.codingLanguage === 'python' ? 'Python' : 'Java'} Coding Execution`,
        score: codingScorePercent,
        questionsAnswered: codingQs.length,
        easyCount: codingQs.filter((q) => q.difficulty === 'easy').length,
        mediumCount: codingQs.filter((q) => q.difficulty === 'medium').length,
        hardCount: codingQs.filter((q) => q.difficulty === 'hard').length
      }
    ];

    const hasMcq = mcqs.length > 0;
    const hasCoding = codingQs.length > 0;

    let dynamicRoleName = `${cleanedSetName} (MCQ + Coding)`;
    let computedAssessmentType: 'hybrid' | 'coding' | 'descriptive' = 'hybrid';

    if (hasMcq && hasCoding) {
      dynamicRoleName = `${cleanedSetName} (MCQ + Coding)`;
      computedAssessmentType = 'hybrid';
    } else if (hasMcq) {
      dynamicRoleName = `${cleanedSetName} (MCQ Assessment)`;
      computedAssessmentType = 'hybrid';
    } else if (hasCoding) {
      dynamicRoleName = `${cleanedSetName} (${assessment.codingLanguage === 'python' ? 'Python' : 'Java'} Coding)`;
      computedAssessmentType = 'coding';
    }

    const report: InterviewReport = {
      id: sessionId || `hyb-report-${Date.now()}`,
      candidateName: candidateName.trim(),
      candidateEmail: candidateEmail.trim() || undefined,
      roleName: dynamicRoleName,
      experienceLevel: 'Mid',
      completedAt: new Date().toISOString(),
      totalTimeSpentSeconds:
        (assessment.mcqDurationSeconds - mcqTimeRemaining) +
        (assessment.codingDurationSeconds - codingTimeRemaining),
      overallScore: finalOverallScore,
      recommendation,
      summary: isTerminated
        ? `Assessment disqualified & terminated: Candidate ${candidateName} triggered ${finalSecStrikes} integrity violation(s) / proctor strikes (${terminationReason}).`
        : `Candidate ${candidateName} completed assessment (${cleanedSetName}). MCQ Section: ${mcqCorrect}/${mcqs.length} correct (${mcqScorePercent}%, ${mcqAttempted} attended, ${mcqWrong} wrong). Coding Section: ${passedTestCases}/${totalTestCases} test cases passed (${codingScorePercent}%, ${solvedCount} solved). Overall Evaluation: ${recommendation} (${finalOverallScore}/100).`,
      strengths: isTerminated
        ? []
        : [
            ...(mcqScorePercent >= 70 ? [`Demonstrated strong technical understanding on MCQ evaluation with ${mcqScorePercent}% accuracy (${mcqCorrect}/${mcqs.length} correct).`] : []),
            ...questionResultsList.filter((q) => q.status === 'Solved').map((q) => `Solved "${q.questionTitle}" passing all test assertions.`)
          ],
      weaknesses: [
        ...(isTerminated ? [`Disqualified: ${terminationReason || 'Integrity rules violation'}`] : []),
        ...(mcqScorePercent < 70 ? [`Knowledge gaps in MCQ concepts: ${mcqWrong} incorrect questions (${mcqScorePercent}% accuracy).`] : []),
        ...questionResultsList.filter((q) => q.status !== 'Solved').map((q) => `Incomplete on "${q.questionTitle}" (${q.passedCount}/${q.totalTestCases} tests passed).`)
      ],
      categoryBreakdown,
      followUpQuestionsForInterviewer: [
        'Ask candidate to walk through algorithmic trade-offs and edge-case handling on their coding submissions.',
        'Review missed MCQ conceptual questions to probe depth of systems understanding.'
      ],
      questionSessions: mcqs.map((q, idx) => {
        const userSelected = mcqAnswers[q.id];
        const hasAnswered = userSelected !== undefined && userSelected !== null;
        return {
          questionIndex: idx,
          question: {
            id: q.id,
            category: 'domain' as const,
            difficulty: q.difficulty,
            questionText: q.questionText,
            keyEvaluationCriteria: [],
            options: q.options,
            correctAnswer: q.options[q.correctAnswerIndex]
          },
          candidateAnswer: hasAnswered ? q.options[userSelected] : '(Unattempted)',
          timeSpentSeconds: Math.round(assessment.mcqDurationSeconds / (mcqs.length || 1)),
          evaluation: {
            score: hasAnswered && userSelected === q.correctAnswerIndex ? 100 : 0,
            technicalAccuracy: hasAnswered && userSelected === q.correctAnswerIndex ? 100 : 0,
            completeness: hasAnswered ? 100 : 0,
            clarity: 100,
            keyPointsCovered: hasAnswered && userSelected === q.correctAnswerIndex ? ['Selected correct option'] : [],
            missingOrInaccuratePoints: !hasAnswered ? ['Question skipped'] : userSelected !== q.correctAnswerIndex ? ['Selected wrong option'] : [],
            constructiveFeedback: hasAnswered && userSelected === q.correctAnswerIndex ? 'Correct answer' : `Correct answer was: ${q.options[q.correctAnswerIndex]}`,
            suggestedDifficultyShift: 'same' as const
          }
        };
      }),
      codingReportData,
      hybridReportData,
      assessmentType: computedAssessmentType,
      proctor_enabled: assessment.proctor_enabled,
      proctor_events: finalEvents,
      proctor_terminated: isProctorTerm,
      proctor_termination_reason: proctorTerminationReason,
      proctor_strikes_count: finalEvents.length,
      browser_lock_enabled: assessment.browser_lock_enabled ?? true,
      security_events: finalSecEvents,
      security_strikes_count: finalSecStrikes,
      browser_lock_terminated: isSecurityTerm,
      browser_lock_termination_reason: isSecurityTerm ? terminationReason : undefined
    };

    setFinalReport(report);

    // Save report to local storage and DB
    saveInterviewReportToDb(report).catch((err) => {
      console.warn('Could not save hybrid interview report to DB:', err);
    });

    // Update assessment status
    if (token) {
      updateCodingAssessmentStatus(token, 'completed').catch(() => {});
      updateHybridAssessmentStatus(token, 'completed').catch(() => {});
    }

    if (onSaveReport) {
      onSaveReport(report);
    }

    setIsSubmittingFinal(false);
    setPhase('submitted');
  };

  // Proctor violation handlers
  const handleProctorViolationStrike = (strikeCount: number, event: any) => {
    setProctorEvents((prev) => [event, ...prev]);
  };

  const handleProctorTermination = async (lastEvent?: any, allEventsList?: any[]) => {
    if (phase === 'submitted' || isProctorTerminated || !assessment) return;

    setIsMcqTimerRunning(false);
    setIsIntervalRunning(false);
    setIsCodingTimerRunning(false);
    setIsProctorTerminated(true);

    const termReason = lastEvent?.message || 'Proctor strike limit exceeded (4/4 strikes)';
    setProctorTerminationReason(termReason);

    await handleFinalSubmit(true, termReason, allEventsList);
  };

  // If validating link
  if (isValidating) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center text-slate-100">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-3" />
        <p className="text-sm font-medium text-slate-300">Validating assessment link...</p>
      </div>
    );
  }

  // Single-use link completed screen
  if (isAlreadyCompleted) {
    return (
      <div className="min-h-screen bg-[#0a0a0d] flex flex-col items-center justify-center p-6 text-center text-slate-100 animate-fade-in">
        <div className="max-w-md w-full bg-[#121216] border border-amber-500/30 rounded-3xl p-8 space-y-5 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-400 flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[10px] font-mono font-bold uppercase tracking-wider mb-2">
              <span>Single-Use Session Closed</span>
            </div>
            <h2 className="text-xl font-bold text-white">Assessment Already Completed</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              This assessment link was issued for a single session and has already been submitted. Each link can only be used once.
            </p>
          </div>

          {assessment && (
            <div className="p-4 rounded-2xl bg-black/40 border border-white/5 text-left space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between text-slate-400">
                <span>Assessment:</span>
                <span className="text-white font-sans font-semibold truncate max-w-[200px]">{assessment.title}</span>
              </div>
              {assessment.candidateName && (
                <div className="flex items-center justify-between text-slate-400">
                  <span>Candidate:</span>
                  <span className="text-indigo-300 font-sans">{assessment.candidateName}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-slate-400">
                <span>Status:</span>
                <span className="text-emerald-400 font-bold">Completed & Recorded</span>
              </div>
            </div>
          )}

          <p className="text-[11px] text-slate-500 leading-normal">
            Your responses and proctoring logs have been securely submitted. If you experienced any technical issues, please contact your hiring recruiter to request assistance.
          </p>

          {onReturnToHome && (
            <button
              type="button"
              onClick={onReturnToHome}
              className="mt-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold rounded-xl border border-white/10 transition-all cursor-pointer"
            >
              Close
            </button>
          )}
        </div>
      </div>
    );
  }

  // If invalid link
  if (validationError || !assessment) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center text-slate-100">
        <div className="max-w-md w-full bg-[#121216] border border-rose-500/30 rounded-2xl p-8 space-y-4 shadow-2xl">
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-white">Assessment Link Unavailable</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            {validationError || 'The assessment link is invalid, expired, or has already been completed.'}
          </p>
          {onReturnToHome && (
            <button
              type="button"
              onClick={onReturnToHome}
              className="mt-4 px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold rounded-xl border border-white/10 transition-all"
            >
              Return to Home
            </button>
          )}
        </div>
      </div>
    );
  }

  // Assessment Submitted or Proctor / Browser Lock Terminated Screen
  if (phase === 'submitted') {
    const isSecurityTerm = isSecurityTerminated || Boolean(finalReport?.browser_lock_terminated);
    const isProctorTerm = isProctorTerminated || Boolean(finalReport?.proctor_terminated);
    const isTerminated = isSecurityTerm || isProctorTerm;
    const termReason =
      securityTerminationReason ||
      finalReport?.browser_lock_termination_reason ||
      proctorTerminationReason ||
      finalReport?.proctor_termination_reason;

    const displaySecEvents = finalReport?.security_events || securityEvents;

    return (
      <div className="min-h-screen bg-[#0a0a0d] flex flex-col items-center justify-center p-4 sm:p-6 text-center text-slate-100 animate-fade-in">
        <div
          className={`max-w-2xl w-full bg-[#121216] border rounded-3xl p-6 sm:p-10 space-y-6 shadow-2xl ${
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
            <div
              className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${
                isTerminated
                  ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                  : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
              }`}
            >
              <span>{isTerminated ? 'Assessment Disqualified & Terminated' : 'Submitted Successfully'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              {isTerminated ? 'Assessment Session Terminated' : 'Assessment Submitted Successfully!'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-lg mx-auto">
              {isTerminated ? (
                <span>
                  Candidate <strong className="text-white">{candidateName}</strong>, your assessment session was automatically disqualified and submitted due to integrity violations exceeding the permitted threshold.
                </span>
              ) : (
                <span>
                  Thank you, <strong className="text-white">{candidateName}</strong>. Your solutions for both <strong className="text-indigo-300">Section 1 (MCQ)</strong> and <strong className="text-purple-300">Section 2 (Coding)</strong> have been recorded and submitted for recruiter evaluation.
                </span>
              )}
            </p>

            {isTerminated && termReason && (
              <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-left space-y-1 mt-2">
                <span className="text-[10px] uppercase font-bold text-rose-400 tracking-wider block">
                  Termination Reason
                </span>
                <span className="text-xs text-rose-200 font-mono break-words">
                  {termReason}
                </span>
              </div>
            )}
          </div>

          {/* Violations Log if any occurred */}
          {displaySecEvents && displaySecEvents.length > 0 && (
            <div className="bg-black/50 border border-rose-500/20 rounded-2xl p-4 text-left space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 font-mono flex items-center space-x-1.5">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Exam Integrity Violations Log ({displaySecEvents.length} Recorded)</span>
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  Strike Policy: 3 Violations Max
                </span>
              </div>
              <div className="max-h-40 overflow-y-auto space-y-1.5 text-xs font-mono">
                {displaySecEvents.map((evt, i) => (
                  <div key={evt.id || i} className="p-2 bg-rose-500/5 rounded-lg border border-rose-500/15 flex items-start justify-between text-[11px]">
                    <div className="space-y-0.5 min-w-0 pr-2">
                      <span className="text-rose-300 font-semibold block truncate">
                        Strike {evt.strikeNumber || (i + 1)}: {evt.message}
                      </span>
                      <span className="text-[10px] text-slate-500 block">Type: {evt.type}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 shrink-0">{evt.formattedTime || new Date(evt.timestamp).toLocaleTimeString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Summary Card */}
          {finalReport && (
            <div className="bg-black/40 border border-white/5 rounded-2xl p-5 text-left grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Assessment Set</span>
                <span className="text-white font-semibold truncate block">{cleanAssessmentName(assessment.setName)}</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Submission Timestamp</span>
                <span className="text-slate-300 font-mono text-[11px] block">{new Date().toLocaleTimeString()}</span>
              </div>
              <div className="space-y-0.5 border-t border-white/5 pt-3">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Section 1: MCQ Attended</span>
                <span className="text-indigo-300 font-mono font-bold block text-sm">
                  {finalReport.hybridReportData?.mcqAttempted ?? 0} / {finalReport.hybridReportData?.mcqTotal ?? 0} Attended
                </span>
              </div>
              <div className="space-y-0.5 border-t border-white/5 pt-3">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Section 2: Coding Solved</span>
                <span className="text-purple-300 font-mono font-bold block text-sm">
                  {finalReport.codingReportData?.attemptedQuestions ?? 0} / {finalReport.codingReportData?.totalQuestions ?? 0} Attended
                </span>
              </div>
            </div>
          )}

          <p className="text-xs text-slate-400">
            You may now safely close this browser window.
          </p>
        </div>
      </div>
    );
  }

  // Current Question pointers
  const currentMcq = assessment.mcqQuestions[currentMcqIndex];
  const currentCoding = assessment.codingQuestions[selectedCodingIndex];
  const currentCode = currentCoding
    ? codeMap[currentCoding.id] ?? (currentCoding.starterCode || currentCoding.javaStarterCode)
    : '';

  return (
    <div className="min-h-screen bg-[#0a0a0d] text-slate-100 flex flex-col">
      {/* Top Bar (visible during assessment) */}
      {phase !== 'entry' && phase !== 'submitted' && (
        <header className="bg-[#0e0e13]/95 backdrop-blur-md border-b border-white/10 px-4 sm:px-6 py-2.5 flex items-center justify-between sticky top-0 z-30 shadow-lg">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0 shadow-sm">
              {phase === 'mcq' ? <HelpCircle className="w-4 h-4" /> : <Code2 className="w-4 h-4" />}
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <h1 className="text-xs sm:text-sm font-bold text-white leading-tight truncate">{cleanAssessmentName(assessment.title)}</h1>
                <span
                  className={`hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-medium border shrink-0 ${
                    phase === 'mcq'
                      ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20'
                      : phase === 'interval'
                      ? 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                      : 'bg-purple-500/10 text-purple-300 border-purple-500/20'
                  }`}
                >
                  {phase === 'mcq'
                    ? 'Section 1: MCQ Round'
                    : phase === 'interval'
                    ? 'Transition Interval'
                    : `Section 2: Coding Sandbox (${assessment.codingLanguage === 'java' ? 'Java' : 'Python'})`}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-[10px] text-slate-400 font-mono mt-0.5">
                <span>Candidate: <strong className="text-slate-200">{candidateName}</strong></span>
                {phase === 'mcq' && (
                  <>
                    <span className="text-slate-600">•</span>
                    <span className="text-indigo-300">
                      Answered {Object.keys(mcqAnswers).length}/{assessment.mcqQuestions.length}
                    </span>
                  </>
                )}
                {phase === 'coding' && (
                  <>
                    <span className="text-slate-600">•</span>
                    <span className="text-purple-300">
                      Problem {selectedCodingIndex + 1} of {assessment.codingQuestions.length}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Timers & Submit Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            {/* Fullscreen Recovery Button if Candidate is not in Fullscreen */}
            {assessment.browser_lock_enabled !== false && !isCurrentlyFullscreen && (
              <button
                type="button"
                onClick={requestFullscreenSafe}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold animate-pulse shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
                title="Enter mandatory full-screen mode"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Enter Fullscreen</span>
              </button>
            )}

            {/* Exam Integrity Guard Status Indicator */}
            {assessment.browser_lock_enabled !== false && (
              <div
                className={`hidden md:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl border text-[10px] font-mono font-medium transition-all ${
                  securityStrikesCount > 0
                    ? 'bg-rose-500/15 text-rose-300 border-rose-500/30 shadow-sm shadow-rose-500/10'
                    : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="font-semibold">Integrity Guard</span>
                <span className="text-slate-500">•</span>
                <span className={securityStrikesCount > 0 ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                  {securityStrikesCount}/3 Strikes
                </span>
              </div>
            )}

            {phase === 'mcq' && (
              <div
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border font-mono text-xs font-bold tracking-wider transition-all ${
                  mcqTimeRemaining <= 120
                    ? 'bg-rose-500/15 text-rose-400 border-rose-500/40 animate-pulse shadow-sm shadow-rose-500/20'
                    : 'bg-black/60 text-indigo-300 border-indigo-500/30'
                }`}
              >
                <Clock className="w-3.5 h-3.5 shrink-0" />
                <span>MCQ: {secondsToMMSS(mcqTimeRemaining)}</span>
              </div>
            )}

            {phase === 'coding' && (
              <div
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border font-mono text-xs font-bold tracking-wider transition-all ${
                  codingTimeRemaining <= 300
                    ? 'bg-rose-500/15 text-rose-400 border-rose-500/40 animate-pulse shadow-sm shadow-rose-500/20'
                    : 'bg-black/60 text-purple-300 border-purple-500/30'
                }`}
              >
                <Clock className="w-3.5 h-3.5 shrink-0" />
                <span>Code: {secondsToMMSS(codingTimeRemaining)}</span>
              </div>
            )}

            {/* Submit Actions */}
            {phase === 'mcq' && (
              <button
                type="button"
                onClick={() => setShowMcqSubmitConfirm(true)}
                className="px-3.5 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all flex items-center space-x-1.5 cursor-pointer"
              >
                <span>Submit MCQs</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {phase === 'coding' && (
              <button
                type="button"
                onClick={() => setShowCodingSubmitConfirm(true)}
                className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-emerald-600/30 transition-all flex items-center space-x-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Assessment</span>
              </button>
            )}
          </div>
        </header>
      )}

      {/* Main View Router */}
      <main className="flex-1 flex flex-col">
        {/* PHASE 0: ENTRY FORM */}
        {phase === 'entry' && (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="max-w-xl w-full bg-[#121216] border border-white/10 rounded-2xl p-8 space-y-6 shadow-2xl text-slate-100">
              <div className="flex items-center space-x-3 border-b border-white/10 pb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shadow-inner">
                  <Layers className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">{cleanAssessmentName(assessment.title)}</h2>
                  <p className="text-xs text-slate-400">
                    Dual-Section Assessment Screening • {cleanAssessmentName(assessment.setName)}
                  </p>
                </div>
              </div>

              {/* Assessment Structure Overview */}
              <div className="bg-black/40 p-4 rounded-xl border border-white/5 space-y-2.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Assessment Structure
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-black/60 border border-white/5 space-y-1">
                    <div className="flex items-center space-x-1.5 text-indigo-400 font-semibold">
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>Section 1: MCQ</span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      {assessment.mcqQuestions.length} Questions
                    </p>
                    <p className="text-[10px] font-mono text-slate-400">
                      Timer: {secondsToMMSS(assessment.mcqDurationSeconds)}
                    </p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-black/60 border border-white/5 space-y-1">
                    <div className="flex items-center space-x-1.5 text-amber-400 font-semibold">
                      <ArrowRight className="w-3.5 h-3.5" />
                      <span>Transition</span>
                    </div>
                    <p className="text-[11px] text-slate-300">Auto-Advance</p>
                    <p className="text-[10px] font-mono text-slate-400">
                      Interval: {assessment.intervalCountdownSeconds}s
                    </p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-black/60 border border-white/5 space-y-1">
                    <div className="flex items-center space-x-1.5 text-purple-400 font-semibold">
                      <Code2 className="w-3.5 h-3.5" />
                      <span>Section 2: Code</span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      {assessment.codingQuestions.length} Problems ({assessment.codingLanguage})
                    </p>
                    <p className="text-[10px] font-mono text-slate-400">
                      Timer: {secondsToMMSS(assessment.codingDurationSeconds)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Exam Integrity Guard Policy Notice (if enabled) */}
              {assessment.browser_lock_enabled !== false && (
                <div className="p-4 bg-indigo-950/30 border border-indigo-500/30 rounded-2xl space-y-2 text-xs text-indigo-200">
                  <div className="flex items-center space-x-2 font-bold text-white text-xs">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Exam Integrity Guard Active</span>
                    <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-mono font-bold">
                      3-Strike Policy
                    </span>
                  </div>
                  <ul className="text-[11px] text-slate-300 space-y-1 pl-4 list-disc marker:text-indigo-400 leading-relaxed">
                    <li>Assessment runs in <strong>mandatory full-screen mode</strong>.</li>
                    <li>Tab switching, window unfocusing, and developer shortcuts are <strong>strictly monitored</strong>.</li>
                    <li><strong>External clipboard pasting is blocked</strong> (internal copy-paste within editor is permitted).</li>
                    <li>Accumulating <strong>3 strikes</strong> automatically submits and disqualifies your assessment.</li>
                  </ul>
                </div>
              )}

              {formError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 text-xs font-medium">
                  {formError}
                </div>
              )}

              {/* Candidate Info Inputs */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-200 flex items-center space-x-1">
                    <User className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Your Full Name <span className="text-rose-400">*</span></span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your first and last name"
                    value={candidateName}
                    onChange={(e) => {
                      setCandidateName(e.target.value);
                      setFormError('');
                    }}
                    className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-200 flex items-center space-x-1">
                    <Mail className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Email Address <span className="text-slate-500 font-normal">(Optional)</span></span>
                  </label>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={candidateEmail}
                    onChange={(e) => setCandidateEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Proctor & Mandatory Webcam Verification */}
              {assessment.proctor_enabled && (
                <div className={`p-4 rounded-2xl border transition-all ${
                  entryWebcamStatus === 'ready'
                    ? 'bg-emerald-950/20 border-emerald-500/30'
                    : 'bg-indigo-950/25 border-indigo-500/30'
                } space-y-3`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-xs font-semibold text-white">
                      <ShieldAlert className={`w-4 h-4 ${entryWebcamStatus === 'ready' ? 'text-emerald-400' : 'text-amber-400'}`} />
                      <span>AI Proctoring Camera Setup</span>
                      <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-mono font-bold">
                        Mandatory
                      </span>
                    </div>
                    {entryWebcamStatus === 'ready' ? (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[11px] font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Camera Verified</span>
                      </span>
                    ) : (
                      <span className="text-[11px] text-amber-400 font-mono font-medium">
                        Verification Required
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Continuous webcam proctoring is enforced. You must enable your camera and verify the live video feed below before beginning.
                  </p>

                  {/* Video preview or grant button */}
                  {entryWebcamStatus === 'ready' ? (
                    <div className="p-3 bg-black/60 border border-emerald-500/30 rounded-xl space-y-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-24 h-18 rounded-lg bg-black overflow-hidden relative border-2 border-emerald-500 shadow-md shrink-0">
                          <video
                            ref={entryVideoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover -scale-x-100"
                          />
                          <div className="absolute top-1 left-1 flex items-center space-x-1 bg-black/70 px-1.5 py-0.5 rounded text-[9px] text-emerald-400 font-mono">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                            <span>LIVE</span>
                          </div>
                        </div>
                        <div className="text-[11px] text-emerald-200 space-y-1">
                          <p className="font-semibold text-white flex items-center space-x-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Camera Stream Active</span>
                          </p>
                          <p className="text-[10px] text-slate-300 leading-normal">
                            Position yourself clearly in front of the screen with adequate lighting.
                          </p>
                          <button
                            type="button"
                            onClick={testEntryWebcam}
                            className="text-[10px] text-indigo-300 hover:text-indigo-200 underline cursor-pointer"
                          >
                            Re-check Camera
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={testEntryWebcam}
                        disabled={entryWebcamStatus === 'testing'}
                        className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                      >
                        {entryWebcamStatus === 'testing' ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin text-white" />
                            <span>Connecting Camera... (Click "Allow" if prompted)</span>
                          </>
                        ) : (
                          <>
                            <Camera className="w-4 h-4 text-white" />
                            <span>Enable Camera & Verify Live Preview</span>
                          </>
                        )}
                      </button>
                      {entryWebcamError ? (
                        <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-[11px] text-rose-300 space-y-1">
                          <p className="font-medium">Camera Verification Failed</p>
                          <p className="text-[10px] text-rose-300/80">{entryWebcamError}</p>
                          <p className="text-[10px] text-slate-400">Click the camera icon in your browser's address bar, select "Always allow", then try again.</p>
                        </div>
                      ) : (
                        <p className="text-[10px] text-center text-slate-400">
                          Clicking above will request camera permission in your browser.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Start Button */}
              {assessment.proctor_enabled && entryWebcamStatus !== 'ready' ? (
                <div className="space-y-1.5">
                  <button
                    type="button"
                    disabled
                    className="w-full py-3 bg-white/5 border border-white/10 text-slate-400 rounded-xl text-xs font-bold tracking-wide flex items-center justify-center space-x-2 cursor-not-allowed opacity-75"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Complete Camera Verification to Start Assessment</span>
                  </button>
                  <p className="text-[10px] text-center text-amber-400/90 font-mono">
                    ↑ Please enable your camera above to unlock the assessment.
                  </p>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleStartAssessment}
                  className="w-full py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold tracking-wide shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2 cursor-pointer animate-pulse"
                >
                  <span>Start Assessment (Enter Fullscreen)</span>
                  <Maximize2 className="w-4 h-4 ml-1" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* PHASE 1: MCQ ROUND */}
        {phase === 'mcq' && currentMcq && (
          <div className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6 flex flex-col justify-between">
            <div className="space-y-5">
              {/* Question Progress Tracker & Actions */}
              <div className="bg-[#121217] border border-white/10 rounded-2xl p-4 shadow-md space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center space-x-2.5">
                    <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-white font-bold text-xs font-mono">
                      Question {currentMcqIndex + 1} of {assessment.mcqQuestions.length}
                    </span>
                    <span
                      className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase font-semibold border ${
                        (currentMcq.difficulty || '').toLowerCase() === 'easy'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : (currentMcq.difficulty || '').toLowerCase() === 'hard'
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      <span>{currentMcq.difficulty || 'Medium'}</span>
                    </span>
                    {currentMcq.category && (
                      <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-white/5 text-slate-400 text-[10px] font-mono border border-white/5">
                        {currentMcq.category}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-3">
                    {/* Mark for Review Toggle Button */}
                    <button
                      type="button"
                      onClick={() =>
                        setFlaggedMcqs((prev) => ({
                          ...prev,
                          [currentMcq.id]: !prev[currentMcq.id]
                        }))
                      }
                      className={`px-3 py-1 rounded-xl text-xs font-medium border transition-all flex items-center space-x-1.5 cursor-pointer ${
                        flaggedMcqs[currentMcq.id]
                          ? 'bg-amber-500/15 border-amber-500/30 text-amber-300 shadow-sm shadow-amber-500/10'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:border-white/20'
                      }`}
                      title="Flag question to review later (Hotkey: F)"
                    >
                      {flaggedMcqs[currentMcq.id] ? (
                        <>
                          <BookmarkCheck className="w-3.5 h-3.5 text-amber-400" />
                          <span>Flagged for Review</span>
                        </>
                      ) : (
                        <>
                          <Bookmark className="w-3.5 h-3.5" />
                          <span>Mark for Review</span>
                        </>
                      )}
                    </button>

                    <span className="text-[11px] text-slate-400 font-mono hidden sm:inline-block">
                      Answered:{' '}
                      <strong className="text-emerald-400 font-bold">
                        {Object.keys(mcqAnswers).length}
                      </strong>
                      /{assessment.mcqQuestions.length}
                    </span>
                  </div>
                </div>

                {/* Linear progress bar */}
                <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.round(
                        (Object.keys(mcqAnswers).length / assessment.mcqQuestions.length) * 100
                      )}%`
                    }}
                  />
                </div>
              </div>

              {/* Question Card */}
              <div className="bg-[#121217] p-6 sm:p-8 rounded-2xl border border-white/10 shadow-xl space-y-3 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500/30 via-purple-500/30 to-transparent" />
                <p className="text-base sm:text-lg font-medium text-white leading-relaxed whitespace-pre-wrap selection:bg-indigo-500/30">
                  {currentMcq.questionText}
                </p>
              </div>

              {/* Options */}
              <div className="space-y-3">
                {currentMcq.options.map((optionText, optIdx) => {
                  const letter = String.fromCharCode(65 + optIdx);
                  const isSelected = mcqAnswers[currentMcq.id] === optIdx;
                  const displayOption = cleanOptionText(optionText, optIdx);

                  return (
                    <button
                      type="button"
                      key={optIdx}
                      onClick={() => {
                        setMcqAnswers((prev) => ({
                          ...prev,
                          [currentMcq.id]: optIdx
                        }));
                      }}
                      className={`group w-full p-4 rounded-xl border text-left transition-all duration-150 flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'bg-gradient-to-r from-indigo-950/40 to-purple-950/30 border-indigo-500 text-white ring-1 ring-indigo-500/50 shadow-lg shadow-indigo-600/10'
                          : 'bg-[#121217] border-white/10 hover:border-white/20 hover:bg-white/[0.02] text-slate-300'
                      }`}
                    >
                      <div className="flex items-start space-x-3.5 pr-2">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono text-xs font-bold shrink-0 transition-all ${
                            isSelected
                              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/50'
                              : 'bg-white/5 border border-white/15 text-slate-400 group-hover:border-white/30 group-hover:text-white'
                          }`}
                        >
                          {letter}
                        </div>
                        <span className="text-xs sm:text-sm pt-0.5 leading-relaxed font-normal">
                          {displayOption}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        {isSelected && (
                          <CheckCircle className="w-4 h-4 text-indigo-400 shrink-0" />
                        )}
                        <span className="text-[10px] font-mono text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:inline-block">
                          Key {letter}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Clear Choice button */}
              {mcqAnswers[currentMcq.id] !== undefined && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setMcqAnswers((prev) => {
                        const copy = { ...prev };
                        delete copy[currentMcq.id];
                        return copy;
                      });
                    }}
                    className="text-xs text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                  >
                    Clear selection
                  </button>
                </div>
              )}
            </div>

            {/* Bottom Nav: Previous / Next & Quick Palette */}
            <div className="space-y-4 pt-4 border-t border-white/10">
              {/* Question Numbers Quick Grid & Legend */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#121217] p-3 rounded-2xl border border-white/5">
                <div className="flex items-center space-x-1.5 flex-wrap gap-y-1.5 justify-center">
                  {assessment.mcqQuestions.map((q, i) => {
                    const isAnswered = mcqAnswers[q.id] !== undefined;
                    const isFlagged = Boolean(flaggedMcqs[q.id]);
                    const isCurrent = i === currentMcqIndex;

                    return (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => setCurrentMcqIndex(i)}
                        className={`relative w-8 h-8 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                          isCurrent
                            ? 'ring-2 ring-indigo-400 bg-indigo-600 text-white shadow-md shadow-indigo-600/40'
                            : isFlagged
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 ring-1 ring-amber-500/30'
                            : isAnswered
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-black/50 text-slate-400 hover:bg-white/5 border border-white/5'
                        }`}
                        title={`Go to Question ${i + 1}${isFlagged ? ' (Flagged)' : isAnswered ? ' (Answered)' : ''}`}
                      >
                        {i + 1}
                        {isFlagged && !isCurrent && (
                          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-[#121217]" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="flex items-center space-x-3 text-[10px] font-mono text-slate-400 shrink-0">
                  <div className="flex items-center space-x-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>Answered</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span>Flagged</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="w-2 h-2 rounded-full bg-slate-600" />
                    <span>Unanswered</span>
                  </div>
                </div>
              </div>

              {/* Navigation Controls */}
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  disabled={currentMcqIndex === 0}
                  onClick={() => setCurrentMcqIndex((prev) => Math.max(0, prev - 1))}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 border border-white/10 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <div className="hidden md:flex items-center space-x-1 text-[11px] font-mono text-slate-500">
                  <Keyboard className="w-3.5 h-3.5 text-slate-600" />
                  <span>Use 1-4 / A-D to answer • Arrow keys to navigate</span>
                </div>

                {currentMcqIndex < assessment.mcqQuestions.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentMcqIndex((prev) => prev + 1)}
                    className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all flex items-center space-x-1.5 cursor-pointer"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowMcqSubmitConfirm(true)}
                    className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-emerald-600/30 transition-all flex items-center space-x-1.5 cursor-pointer"
                  >
                    <span>Finish MCQ Section</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* PHASE 2: INTERVAL COUNTDOWN SCREEN */}
        {phase === 'interval' && (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-[#121216] border border-amber-500/30 rounded-2xl p-8 space-y-6 shadow-2xl text-center text-slate-100 animate-fade-in">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-lg">
                <Clock className="w-8 h-8 animate-pulse" />
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                  ✓ Section 1 (MCQ) Submitted
                </span>
                <h2 className="text-xl font-bold text-white">
                  Section 2: Coding Sandbox
                </h2>
                <p className="text-xs text-slate-300">
                  The coding environment will start automatically. You cannot pause or exit this session.
                </p>
              </div>

              {/* Big Interval Countdown */}
              <div className="p-6 bg-black/60 rounded-2xl border border-white/10 space-y-2">
                <span className="text-[11px] text-slate-400 block font-mono">
                  Auto-advancing in
                </span>
                <div className="text-5xl font-black text-amber-400 font-mono tracking-wider">
                  00:{intervalRemaining.toString().padStart(2, '0')}
                </div>
                <span className="text-[10px] text-slate-500 block">
                  Get your keyboard ready
                </span>
              </div>

              {/* Start coding now button */}
              <button
                type="button"
                onClick={handleStartCoding}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold tracking-wide shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2"
              >
                <span>Start Coding Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* PHASE 3: CODING ROUND */}
        {phase === 'coding' && currentCoding && (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-[calc(100vh-53px)]">
            {/* Left Panel: Problem description */}
            <div className="w-full md:w-5/12 border-r border-white/10 bg-[#0c0c10] flex flex-col overflow-y-auto p-5 sm:p-6 space-y-6 max-h-[calc(100vh-53px)]">
              {/* Question Navigation Tabs */}
              <div className="flex items-center space-x-2 overflow-x-auto pb-2 border-b border-white/10 no-scrollbar">
                {assessment.codingQuestions.map((q, idx) => {
                  const isSelected = idx === selectedCodingIndex;
                  const res = testResultsMap[q.id] || [];
                  const allPassed = res.length > 0 && res.every((r) => r.passed);
                  const partialPassed = res.length > 0 && res.some((r) => r.passed) && !allPassed;
                  const cleanTitle = cleanProblemTitle(q.title, idx);

                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => {
                        setSelectedCodingIndex(idx);
                        setSelectedTestCaseIdx(0);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center space-x-2 cursor-pointer ${
                        isSelected
                          ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30'
                          : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/5'
                      }`}
                    >
                      <span>
                        P{idx + 1}. {cleanTitle}
                      </span>
                      {allPassed && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                      {partialPassed && <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Problem Header & Metadata */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                    <span
                      className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase font-semibold border ${
                        (currentCoding.difficulty || '').toLowerCase() === 'easy'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : (currentCoding.difficulty || '').toLowerCase() === 'hard'
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      <span>{currentCoding.difficulty || 'Medium'}</span>
                    </span>

                    <span className="px-2 py-0.5 rounded-md bg-white/5 text-slate-300 text-[10px] font-mono border border-white/10">
                      {assessment.codingLanguage === 'java' ? 'Java 17' : 'Python 3.10'}
                    </span>

                    <span className="px-2 py-0.5 rounded-md bg-white/5 text-slate-400 text-[10px] font-mono border border-white/5">
                      {currentCoding.testCases.length} Test Cases
                    </span>
                  </div>

                  <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                    {cleanProblemTitle(currentCoding.title, selectedCodingIndex)}
                  </h2>
                </div>

                {/* Problem Description */}
                <div className="bg-[#121217] p-5 rounded-2xl border border-white/10 shadow-sm space-y-3 text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap selection:bg-purple-500/30">
                  {currentCoding.description}
                </div>

                {/* Sample Examples */}
                {(currentCoding.sampleInput || currentCoding.sampleOutput) && (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center space-x-2">
                      <Terminal className="w-3.5 h-3.5 text-purple-400" />
                      <span className="text-xs font-bold text-white tracking-wide uppercase">
                        Sample Examples
                      </span>
                    </div>

                    <div className="space-y-3">
                      {currentCoding.sampleInput && (
                        <div className="bg-[#121217] rounded-xl border border-white/10 overflow-hidden">
                          <div className="bg-white/[0.03] px-3.5 py-1.5 border-b border-white/10 flex items-center justify-between">
                            <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-wider">
                              Sample Input
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                handleCopyText(currentCoding.sampleInput || '', 'sample-in')
                              }
                              className="text-[10px] text-slate-400 hover:text-white flex items-center space-x-1 cursor-pointer transition-colors"
                            >
                              {copiedField === 'sample-in' ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-400" />
                                  <span className="text-emerald-400">Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>
                          </div>
                          <pre className="p-3 text-slate-200 font-mono text-xs whitespace-pre-wrap break-all bg-black/40">
                            {currentCoding.sampleInput}
                          </pre>
                        </div>
                      )}

                      {currentCoding.sampleOutput && (
                        <div className="bg-[#121217] rounded-xl border border-white/10 overflow-hidden">
                          <div className="bg-white/[0.03] px-3.5 py-1.5 border-b border-white/10 flex items-center justify-between">
                            <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider">
                              Sample Output
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                handleCopyText(currentCoding.sampleOutput || '', 'sample-out')
                              }
                              className="text-[10px] text-slate-400 hover:text-white flex items-center space-x-1 cursor-pointer transition-colors"
                            >
                              {copiedField === 'sample-out' ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-400" />
                                  <span className="text-emerald-400">Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>
                          </div>
                          <pre className="p-3 text-emerald-300/90 font-mono text-xs whitespace-pre-wrap break-all bg-black/40">
                            {currentCoding.sampleOutput}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Constraints & Standard I/O callout */}
                <div className="bg-purple-950/20 border border-purple-500/20 rounded-xl p-3.5 space-y-1 text-slate-300">
                  <div className="flex items-center space-x-1.5 text-purple-300 text-xs font-semibold">
                    <Zap className="w-3.5 h-3.5" />
                    <span>Execution Environment</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Standard I/O (read from <code className="text-purple-300">stdin</code> and print to <code className="text-purple-300">stdout</code>). Time limit: 2000ms per test case.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Panel: Code Editor & Execution Console */}
            <div className="w-full md:w-7/12 flex flex-col bg-[#101015] max-h-[calc(100vh-53px)]">
              {/* Editor Bar */}
              <div className="px-4 py-2.5 bg-[#0a0a0e] border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs text-slate-300 font-mono">
                  <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-slate-200">
                    <FileCode className="w-3.5 h-3.5 text-purple-400" />
                    <span>Solution.{assessment.codingLanguage === 'java' ? 'java' : 'py'}</span>
                  </div>
                  <span className="hidden sm:inline-block text-[10px] text-slate-500">
                    (Ctrl + Enter to run)
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCodeMap((prev) => ({
                        ...prev,
                        [currentCoding.id]:
                          currentCoding.starterCode || currentCoding.javaStarterCode || ''
                      }));
                    }}
                    className="px-2.5 py-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 text-xs transition-all flex items-center space-x-1 border border-transparent hover:border-white/10 cursor-pointer"
                    title="Reset to initial starter code"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>

                  <button
                    type="button"
                    disabled={isRunningCode}
                    onClick={handleRunCode}
                    className="px-4 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all flex items-center space-x-1.5 cursor-pointer"
                  >
                    {isRunningCode ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Running...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Run Tests</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Monaco Editor */}
              <div className="flex-1 min-h-[320px] bg-[#1e1e1e]">
                <Editor
                  height="100%"
                  language={assessment.codingLanguage === 'java' ? 'java' : 'python'}
                  theme="vs-dark"
                  value={currentCode}
                  onMount={(editor) => {
                    editor.onDidChangeCursorSelection(() => {
                      const selection = editor.getSelection();
                      if (selection && !selection.isEmpty()) {
                        const selectedText = editor.getModel()?.getValueInRange(selection);
                        if (selectedText) {
                          internalClipboardRef.current = selectedText;
                        }
                      }
                    });
                  }}
                  onChange={(val) => {
                    setCodeMap((prev) => ({
                      ...prev,
                      [currentCoding.id]: val || ''
                    }));
                  }}
                  options={{
                    fontSize: 13,
                    fontFamily: 'JetBrains Mono, Fira Code, monospace',
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    lineNumbers: 'on',
                    wordWrap: 'on',
                    padding: { top: 12, bottom: 12 },
                    smoothScrolling: true,
                    cursorBlinking: 'smooth',
                    renderLineHighlight: 'all'
                  }}
                />
              </div>

              {/* Output & Test Results Panel */}
              <div className="border-t border-white/10 bg-[#0c0c10] flex flex-col h-64 shadow-2xl">
                {/* Console Header & Tabs */}
                <div className="flex items-center justify-between px-3.5 py-2 border-b border-white/10 bg-[#08080c]">
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setActiveOutputTab('test_results')}
                      className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center space-x-1.5 ${
                        activeOutputTab === 'test_results'
                          ? 'bg-white/10 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Test Results</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveOutputTab('console')}
                      className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center space-x-1.5 ${
                        activeOutputTab === 'console'
                          ? 'bg-white/10 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Terminal className="w-3.5 h-3.5 text-slate-400" />
                      <span>Stdout / Logs</span>
                    </button>
                  </div>

                  {testResultsMap[currentCoding.id] && (
                    <div className="flex items-center space-x-2">
                      {(() => {
                        const results = testResultsMap[currentCoding.id];
                        const passedCount = results.filter((r) => r.passed).length;
                        const totalCount = currentCoding.testCases.length;
                        const allPassed = passedCount === totalCount;

                        return (
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border ${
                              allPassed
                                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                            }`}
                          >
                            {allPassed ? '✓ All Passed' : `${passedCount}/${totalCount} Passed`}
                          </span>
                        );
                      })()}
                    </div>
                  )}
                </div>

                {/* Console Content */}
                <div className="flex-1 overflow-y-auto p-3 text-xs font-mono">
                  {activeOutputTab === 'test_results' ? (
                    !testResultsMap[currentCoding.id] ? (
                      <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-2 py-8">
                        <Terminal className="w-8 h-8 text-slate-600" />
                        <p className="text-xs text-slate-400 font-sans">
                          Click &quot;Run Tests&quot; or press <kbd className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded font-mono text-[10px]">Ctrl+Enter</kbd> to execute your code.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {/* Test Case Selection Tabs */}
                        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 no-scrollbar border-b border-white/5">
                          {testResultsMap[currentCoding.id].map((res, i) => {
                            const isCurrentTab = (selectedTestCaseIdx ?? 0) === i;
                            return (
                              <button
                                key={res.testCaseId || i}
                                type="button"
                                onClick={() => setSelectedTestCaseIdx(i)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-all flex items-center space-x-1.5 cursor-pointer shrink-0 ${
                                  isCurrentTab
                                    ? res.passed
                                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                                    : 'bg-white/5 text-slate-400 hover:text-white border border-white/5'
                                }`}
                              >
                                <span>Case {i + 1}</span>
                                {res.passed ? (
                                  <Check className="w-3 h-3 text-emerald-400" />
                                ) : (
                                  <XCircle className="w-3 h-3 text-rose-400" />
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {/* Selected Test Case Inspector */}
                        {(() => {
                          const results = testResultsMap[currentCoding.id];
                          const activeIdx = Math.min(selectedTestCaseIdx ?? 0, results.length - 1);
                          const activeRes = results[activeIdx];
                          if (!activeRes) return null;

                          return (
                            <div className="space-y-3 bg-[#111116] p-3.5 rounded-xl border border-white/10 animate-fade-in">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <span className="font-bold text-white text-xs">
                                    Test Case #{activeIdx + 1}
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-mono">
                                    {activeRes.isHidden ? '(Hidden Evaluation Case)' : '(Visible Case)'}
                                  </span>
                                </div>
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                                    activeRes.passed
                                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                  }`}
                                >
                                  {activeRes.passed ? 'Passed ✓' : 'Failed ✕'}
                                </span>
                              </div>

                              {activeRes.error && (
                                <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs space-y-1">
                                  <span className="text-[10px] font-bold uppercase tracking-wider block text-rose-400">
                                    Execution Error
                                  </span>
                                  <pre className="whitespace-pre-wrap font-mono text-[11px] break-all">
                                    {activeRes.error}
                                  </pre>
                                </div>
                              )}

                              {!activeRes.isHidden ? (
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                                  <div className="bg-black/50 p-2.5 rounded-lg border border-white/5 space-y-1">
                                    <div className="flex items-center justify-between">
                                      <span className="text-[10px] text-slate-400 uppercase font-mono block font-semibold">
                                        Input
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleCopyText(
                                            activeRes.input || '',
                                            `tc-${activeIdx}-input`
                                          )
                                        }
                                        className="text-[9px] text-slate-400 hover:text-white transition-colors"
                                      >
                                        {copiedField === `tc-${activeIdx}-input` ? 'Copied' : 'Copy'}
                                      </button>
                                    </div>
                                    <pre className="text-slate-200 whitespace-pre-wrap break-all text-xs font-mono">
                                      {activeRes.input || '(empty)'}
                                    </pre>
                                  </div>

                                  <div className="bg-black/50 p-2.5 rounded-lg border border-white/5 space-y-1">
                                    <span className="text-[10px] text-slate-400 uppercase font-mono block font-semibold">
                                      Expected Output
                                    </span>
                                    <pre className="text-emerald-400 whitespace-pre-wrap break-all text-xs font-mono">
                                      {activeRes.expectedOutput}
                                    </pre>
                                  </div>

                                  <div
                                    className={`p-2.5 rounded-lg border space-y-1 ${
                                      activeRes.passed
                                        ? 'bg-black/50 border-white/5'
                                        : 'bg-rose-500/10 border-rose-500/30'
                                    }`}
                                  >
                                    <span
                                      className={`text-[10px] uppercase font-mono block font-semibold ${
                                        activeRes.passed ? 'text-slate-400' : 'text-rose-400'
                                      }`}
                                    >
                                      Your Output
                                    </span>
                                    <pre
                                      className={`whitespace-pre-wrap break-all text-xs font-mono ${
                                        activeRes.passed ? 'text-slate-200' : 'text-rose-300 font-bold'
                                      }`}
                                    >
                                      {activeRes.actualOutput || '(no output)'}
                                    </pre>
                                  </div>
                                </div>
                              ) : (
                                <div className="p-3 bg-white/5 rounded-lg border border-white/5 text-slate-400 text-xs">
                                  This is a hidden evaluation test case. Inputs and expected outputs are hidden to maintain assessment integrity.
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    )
                  ) : (
                    <div className="bg-black/60 p-3 rounded-xl border border-white/5 h-full">
                      <pre className="text-slate-300 whitespace-pre-wrap break-all text-[11px] font-mono leading-relaxed">
                        {rawConsoleOutput || 'No output logged yet. Run tests to see stdout and execution logs.'}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MCQ Submit Confirmation Modal */}
      {showMcqSubmitConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121216] border border-white/10 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl text-slate-100 animate-fade-in">
            <h3 className="font-bold text-base text-white">
              Submit MCQ Section & Proceed to Coding?
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              You have answered{' '}
              <strong className="text-emerald-400">
                {Object.keys(mcqAnswers).length} of {assessment.mcqQuestions.length}
              </strong>{' '}
              MCQ questions.
            </p>
            <p className="text-xs text-amber-300 bg-amber-500/10 p-3 rounded-xl border border-amber-500/20">
              Note: Once submitted, you will immediately enter the auto-advancing{' '}
              <strong>{assessment.intervalCountdownSeconds}-second transition</strong>, and Section 2 (Coding) will begin. You cannot return to change your MCQ answers.
            </p>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowMcqSubmitConfirm(false)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-xs font-semibold transition-all border border-white/10 cursor-pointer"
              >
                Continue Reviewing
              </button>
              <button
                type="button"
                onClick={handleTransitionToInterval}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
              >
                Yes, Submit Section 1
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Coding Submit Confirmation Modal */}
      {showCodingSubmitConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121216] border border-white/10 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl text-slate-100 animate-fade-in">
            <h3 className="font-bold text-base text-white">Submit Final Assessment?</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you are ready to submit your coding solutions and finalize your assessment? You will not be able to make further changes after submitting.
            </p>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCodingSubmitConfirm(false)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-xs font-semibold transition-all border border-white/10 cursor-pointer"
              >
                Keep Coding
              </button>
              <button
                type="button"
                disabled={isSubmittingFinal}
                onClick={() => handleFinalSubmit()}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-emerald-600/30 transition-all flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
              >
                {isSubmittingFinal && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Yes, Submit Assessment</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Real-time AI Face Proctor Widget for Hybrid Candidate Portal */}
      {phase !== 'entry' && phase !== 'submitted' && Boolean(assessment.proctor_enabled) && (
        <ProctorCameraWidget
          isEnabled={Boolean(assessment.proctor_enabled) && phase !== 'entry' && phase !== 'submitted'}
          maxStrikes={4}
          onViolationStrike={handleProctorViolationStrike}
          onMaxStrikesReached={handleProctorTermination}
        />
      )}

      {/* Secure Browser Warning & Strike Modal */}
      {securityModal && securityModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div
            className={`max-w-md w-full bg-[#121216] border rounded-3xl p-6 sm:p-7 space-y-5 shadow-2xl text-slate-100 ${
              securityModal.isTerminal
                ? 'border-rose-500/50 shadow-rose-950/40'
                : securityModal.strikeNumber === 2
                ? 'border-rose-500/40 shadow-rose-950/20'
                : 'border-amber-500/40 shadow-amber-950/20'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                  securityModal.isTerminal || securityModal.strikeNumber === 2
                    ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                    : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                }`}
              >
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border ${
                      securityModal.isTerminal
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                        : securityModal.strikeNumber === 2
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    }`}
                  >
                    {securityModal.isTerminal ? 'Disqualified' : `Strike ${securityModal.strikeNumber} of 3`}
                  </span>
                </div>
                <h3 className="font-bold text-base text-white mt-1 leading-tight">
                  {securityModal.title}
                </h3>
              </div>
            </div>

            {/* Strike indicator pills */}
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map((num) => {
                const isTripped = num <= securityModal.strikeNumber;
                return (
                  <div
                    key={num}
                    className={`p-2 rounded-xl border text-center transition-all ${
                      isTripped
                        ? num === 3
                          ? 'bg-rose-600 text-white border-rose-500 font-bold'
                          : 'bg-rose-500/20 text-rose-300 border-rose-500/40 font-semibold'
                        : 'bg-white/5 text-slate-500 border-white/5 font-medium'
                    }`}
                  >
                    <span className="text-[10px] font-mono block">Strike {num}</span>
                    <span className="text-[9px] uppercase tracking-wider block opacity-80">
                      {num === 1 ? 'Warning' : num === 2 ? 'Final Notice' : 'Disqualified'}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="p-3.5 bg-black/40 rounded-xl border border-white/5 space-y-1.5 text-xs text-slate-300 leading-relaxed">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Violation Event
              </span>
              <p className="whitespace-pre-line text-[11px] font-mono">
                {securityModal.message}
              </p>
            </div>

            {!securityModal.isTerminal && (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleResumeAfterSecurityWarning}
                  className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold tracking-wide shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Maximize2 className="w-4 h-4" />
                  <span>Acknowledge & Re-enter Fullscreen</span>
                </button>
                <p className="text-[10px] text-center text-slate-500">
                  You must stay in fullscreen mode until your final assessment is submitted.
                </p>
              </div>
            )}

            {securityModal.isTerminal && (
              <div className="text-center text-rose-300 text-xs font-medium py-1 animate-pulse">
                Submitting recorded answers and finalizing report...
              </div>
            )}
          </div>
        </div>
      )}

      {/* External Paste Blocked Floating Toast Notification */}
      {externalPasteAlert && (
        <div className="fixed bottom-6 right-6 z-50 bg-rose-950/90 border border-rose-500/40 text-rose-200 px-4 py-3 rounded-2xl shadow-2xl flex items-center space-x-3 text-xs max-w-sm animate-fade-in backdrop-blur-md">
          <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="font-bold text-white block">External Paste Prohibited</span>
            <span className="text-[11px] text-rose-300/90 block">
              {externalPasteAlert}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setExternalPasteAlert(null)}
            className="text-rose-400 hover:text-white text-sm px-1 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};
