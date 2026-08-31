import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import {
  Code2,
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  Plus,
  Trash2,
  AlertTriangle,
  Terminal,
  FileCode2,
  HelpCircle,
  Database,
  Lock,
  Unlock,
  Check,
  Send,
  Sparkles,
  Layers,
  ArrowRight,
  Pencil,
  FolderPlus,
  User,
  Mail,
  Copy,
  ExternalLink,
  Link as LinkIcon,
  CheckCheck,
  Share2,
  AlertCircle
} from 'lucide-react';
import {
  JavaCodingQuestion,
  CodingTestCase,
  CodingTestCaseResult,
  JavaExecutionResponse,
  InterviewReport,
  CodingReportData,
  QuestionCodingResult,
  CodingQuestionSet,
  CodingSessionRecord,
  CodingAssessmentRecord
} from '../types';
import { DEFAULT_JAVA_QUESTIONS } from '../data/javaQuestions';
import { DEFAULT_PYTHON_QUESTIONS } from '../data/pythonQuestions';
import {
  fetchCodingQuestionSetsFromDb,
  saveCodingQuestionSetToDb,
  deleteCodingQuestionSetFromDb,
  seedInitialCodingQuestionSetsIfEmpty,
  saveCodingSessionToDb,
  updateCodingSessionInDb,
  createCodingAssessmentInDb,
  generateSecureAssessmentToken,
  buildCandidateAssessmentUrl
} from '../lib/codingSupabase';
import { isSupabaseConfigured } from '../lib/supabase';

const JAVA_SETS_STORAGE_KEY = 'hireai_java_coding_sets';
const PYTHON_SETS_STORAGE_KEY = 'hireai_python_coding_sets';

const DEFAULT_JAVA_SETS: CodingQuestionSet[] = [
  {
    id: 'java-set-1',
    name: 'Set 1',
    language: 'java',
    createdAt: new Date().toISOString(),
    questions: DEFAULT_JAVA_QUESTIONS,
  }
];

const DEFAULT_PYTHON_SETS: CodingQuestionSet[] = [
  {
    id: 'python-set-1',
    name: 'Set 1',
    language: 'python',
    createdAt: new Date().toISOString(),
    questions: DEFAULT_PYTHON_QUESTIONS,
  }
];

interface CodingRoundViewProps {
  candidateName?: string;
  candidateEmail?: string;
  onSaveReport?: (report: InterviewReport) => void;
  onViewReport?: (report: InterviewReport) => void;
  onCodingActiveChange?: (isActive: boolean) => void;
}

export const CodingRoundView: React.FC<CodingRoundViewProps> = ({
  candidateName = 'Candidate',
  candidateEmail = '',
  onSaveReport,
  onViewReport,
  onCodingActiveChange,
}) => {
  // Navigation inside Coding Section
  const [activeTab, setActiveTab] = useState<'coding_room' | 'manage_bank'>('coding_room');

  // Question Bank Language Selector in Management Tab
  const [bankLanguage, setBankLanguage] = useState<'java' | 'python'>('java');

  // Candidate Selected Assessment Language (for Coding Room)
  const [selectedLanguage, setSelectedLanguage] = useState<'java' | 'python'>('java');

  // Candidate input fields for Start Assessment Screen
  const [inputCandidateName, setInputCandidateName] = useState<string>(candidateName || '');
  const [inputCandidateEmail, setInputCandidateEmail] = useState<string>(candidateEmail || '');
  const [nameError, setNameError] = useState<string>('');

  // Java Question Sets State
  const [javaSets, setJavaSets] = useState<CodingQuestionSet[]>(() => {
    try {
      const saved = localStorage.getItem(JAVA_SETS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      // Migrate old single list if present
      const oldSaved = localStorage.getItem('hireai_java_questions');
      if (oldSaved) {
        const parsedOld = JSON.parse(oldSaved);
        if (Array.isArray(parsedOld) && parsedOld.length > 0) {
          return [{
            id: 'java-set-1',
            name: 'Set 1',
            language: 'java',
            createdAt: new Date().toISOString(),
            questions: parsedOld
          }];
        }
      }
    } catch (e) {
      console.error('Failed to load saved Java sets:', e);
    }
    return DEFAULT_JAVA_SETS;
  });

  // Python Question Sets State
  const [pythonSets, setPythonSets] = useState<CodingQuestionSet[]>(() => {
    try {
      const saved = localStorage.getItem(PYTHON_SETS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      // Migrate old single list if present
      const oldSaved = localStorage.getItem('hireai_python_questions');
      if (oldSaved) {
        const parsedOld = JSON.parse(oldSaved);
        if (Array.isArray(parsedOld) && parsedOld.length > 0) {
          return [{
            id: 'python-set-1',
            name: 'Set 1',
            language: 'python',
            createdAt: new Date().toISOString(),
            questions: parsedOld
          }];
        }
      }
    } catch (e) {
      console.error('Failed to load saved Python sets:', e);
    }
    return DEFAULT_PYTHON_SETS;
  });

  // Selected Set ID for Candidate Room
  const [selectedJavaSetId, setSelectedJavaSetId] = useState<string>(() => javaSets[0]?.id || 'java-set-1');
  const [selectedPythonSetId, setSelectedPythonSetId] = useState<string>(() => pythonSets[0]?.id || 'python-set-1');

  // Selected Set ID for Management Tab
  const [bankJavaSetId, setBankJavaSetId] = useState<string>(() => javaSets[0]?.id || 'java-set-1');
  const [bankPythonSetId, setBankPythonSetId] = useState<string>(() => pythonSets[0]?.id || 'python-set-1');

  // Ensure selected IDs exist
  useEffect(() => {
    if (!javaSets.some((s) => s.id === selectedJavaSetId) && javaSets.length > 0) {
      setSelectedJavaSetId(javaSets[0].id);
    }
    if (!javaSets.some((s) => s.id === bankJavaSetId) && javaSets.length > 0) {
      setBankJavaSetId(javaSets[0].id);
    }
  }, [javaSets, selectedJavaSetId, bankJavaSetId]);

  useEffect(() => {
    if (!pythonSets.some((s) => s.id === selectedPythonSetId) && pythonSets.length > 0) {
      setSelectedPythonSetId(pythonSets[0].id);
    }
    if (!pythonSets.some((s) => s.id === bankPythonSetId) && pythonSets.length > 0) {
      setBankPythonSetId(pythonSets[0].id);
    }
  }, [pythonSets, selectedPythonSetId, bankPythonSetId]);

  // Persist Java Sets
  useEffect(() => {
    try {
      localStorage.setItem(JAVA_SETS_STORAGE_KEY, JSON.stringify(javaSets));
    } catch (e) {
      console.error('Failed to save Java sets:', e);
    }
  }, [javaSets]);

  // Persist Python Sets
  useEffect(() => {
    try {
      localStorage.setItem(PYTHON_SETS_STORAGE_KEY, JSON.stringify(pythonSets));
    } catch (e) {
      console.error('Failed to save Python sets:', e);
    }
  }, [pythonSets]);

  // Supabase Question Sets Sync & Status
  const [supabaseSyncStatus, setSupabaseSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'local'>(
    isSupabaseConfigured ? 'syncing' : 'local'
  );

  useEffect(() => {
    let isMounted = true;
    async function syncSetsWithSupabase() {
      if (!isSupabaseConfigured) {
        if (isMounted) setSupabaseSyncStatus('local');
        return;
      }

      try {
        if (isMounted) setSupabaseSyncStatus('syncing');
        // 1. Seed initial sets to DB if table is empty
        await seedInitialCodingQuestionSetsIfEmpty([...DEFAULT_JAVA_SETS, ...DEFAULT_PYTHON_SETS]);

        // 2. Fetch sets from Supabase
        const dbSets = await fetchCodingQuestionSetsFromDb();
        if (isMounted && dbSets && dbSets.length > 0) {
          const javaFromDb = dbSets.filter((s) => s.language === 'java');
          const pythonFromDb = dbSets.filter((s) => s.language === 'python');

          if (javaFromDb.length > 0) {
            setJavaSets(javaFromDb);
          } else {
            // Push local java sets to DB
            for (const s of javaSets) {
              await saveCodingQuestionSetToDb(s);
            }
          }

          if (pythonFromDb.length > 0) {
            setPythonSets(pythonFromDb);
          } else {
            // Push local python sets to DB
            for (const s of pythonSets) {
              await saveCodingQuestionSetToDb(s);
            }
          }

          setSupabaseSyncStatus('synced');
        } else if (isMounted) {
          // If fetch returned empty, save existing sets to DB
          for (const s of [...javaSets, ...pythonSets]) {
            await saveCodingQuestionSetToDb(s);
          }
          setSupabaseSyncStatus('synced');
        }
      } catch (err) {
        console.warn('Failed to sync coding sets with Supabase:', err);
        if (isMounted) setSupabaseSyncStatus('local');
      }
    }

    syncSetsWithSupabase();
    return () => {
      isMounted = false;
    };
  }, []);

  // Active Assessment Start State
  const [isAssessmentStarted, setIsAssessmentStarted] = useState<boolean>(false);
  const [currentSessionId, setCurrentSessionId] = useState<string>('');

  // Active set for candidate room
  const activeAssessmentSet = selectedLanguage === 'java'
    ? javaSets.find((s) => s.id === selectedJavaSetId) || javaSets[0]
    : pythonSets.find((s) => s.id === selectedPythonSetId) || pythonSets[0];

  // Active set for management tab
  const activeBankSet = bankLanguage === 'java'
    ? javaSets.find((s) => s.id === bankJavaSetId) || javaSets[0]
    : pythonSets.find((s) => s.id === bankPythonSetId) || pythonSets[0];

  // Active Assessment Questions for current room
  const questions = activeAssessmentSet?.questions || [];

  // Selected Question Index inside Assessment
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<number>(0);
  const currentQuestion = questions[selectedQuestionIndex] || questions[0];

  // Code state map: questionId -> code
  const [codeMap, setCodeMap] = useState<Record<string, string>>({});
  const currentCode = codeMap[currentQuestion?.id] || currentQuestion?.starterCode || currentQuestion?.javaStarterCode || '';

  // Test Results map: questionId -> CodingTestCaseResult[]
  const [testResultsMap, setTestResultsMap] = useState<Record<string, CodingTestCaseResult[]>>({});
  // Question Status map: questionId -> 'not_attempted' | 'passed' | 'failed'
  const [questionStatusMap, setQuestionStatusMap] = useState<Record<string, 'not_attempted' | 'passed' | 'failed'>>({});

  // Execution state
  const [isRunningCode, setIsRunningCode] = useState<boolean>(false);
  const [rawConsoleOutput, setRawConsoleOutput] = useState<string>('');
  const [activeOutputTab, setActiveOutputTab] = useState<'test_results' | 'console'>('test_results');

  // Assessment Duration State (Default 30 minutes)
  const [assessmentDurationMinutes, setAssessmentDurationMinutes] = useState<number>(30);

  // Assessment Link Creation State
  const [createdAssessment, setCreatedAssessment] = useState<CodingAssessmentRecord | null>(null);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState<boolean>(false);
  const [hasCopiedLink, setHasCopiedLink] = useState<boolean>(false);
  const [isCreatingAssessment, setIsCreatingAssessment] = useState<boolean>(false);
  const [createAssessmentError, setCreateAssessmentError] = useState<string | null>(null);

  // Timer State (Default 30 minutes = 1800s)
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState<number>(1800);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [isRoundSubmitted, setIsRoundSubmitted] = useState<boolean>(false);
  const [showSubmitModal, setShowSubmitModal] = useState<boolean>(false);
  const [submittedReport, setSubmittedReport] = useState<InterviewReport | null>(null);
  const [isEvaluatingAll, setIsEvaluatingAll] = useState<boolean>(false);

  // Set Delete Modal State
  const [showDeleteSetModal, setShowDeleteSetModal] = useState<boolean>(false);
  const [deleteWarningMessage, setDeleteWarningMessage] = useState<string>('');

  // Set Rename / Create Modal State
  const [showRenameModal, setShowRenameModal] = useState<boolean>(false);
  const [renameValue, setRenameValue] = useState<string>('');
  const [showCreateSetModal, setShowCreateSetModal] = useState<boolean>(false);
  const [newSetName, setNewSetName] = useState<string>('');

  // New Question Modal State (for Management Tab)
  const [showAddQuestionModal, setShowAddQuestionModal] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newDesc, setNewDesc] = useState<string>('');
  const [newDifficulty, setNewDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [newStarterCode, setNewStarterCode] = useState<string>('');
  const [newSampleInput, setNewSampleInput] = useState<string>('');
  const [newSampleOutput, setNewSampleOutput] = useState<string>('');
  const [newTestCases, setNewTestCases] = useState<CodingTestCase[]>([
    { id: 'tc-new-1', input: '', expectedOutput: '', isHidden: false },
    { id: 'tc-new-2', input: '', expectedOutput: '', isHidden: true }
  ]);

  // Notify parent component when assessment active status changes
  useEffect(() => {
    const isActive = isAssessmentStarted && !isRoundSubmitted;
    if (onCodingActiveChange) {
      onCodingActiveChange(isActive);
    }
  }, [isAssessmentStarted, isRoundSubmitted, onCodingActiveChange]);

  // Handle Create/Publish Assessment Link
  const handleCreateAssessmentLink = async () => {
    setIsCreatingAssessment(true);
    setCreateAssessmentError(null);
    try {
      const token = generateSecureAssessmentToken();
      const assessmentRecord: CodingAssessmentRecord = {
        id: `ca-${Date.now()}`,
        token,
        title: `${selectedLanguage === 'python' ? 'Python' : 'Java'} Coding Assessment - ${activeAssessmentSet?.name || 'Set 1'}`,
        language: selectedLanguage,
        set_id: activeAssessmentSet?.id,
        set_name: activeAssessmentSet?.name || 'Set 1',
        questions: questions,
        duration_minutes: assessmentDurationMinutes,
        candidate_name: inputCandidateName.trim() || undefined,
        candidate_email: inputCandidateEmail.trim() || undefined,
        status: 'active',
        created_at: new Date().toISOString(),
      };

      const result = await createCodingAssessmentInDb(assessmentRecord);
      if (!result.success) {
        setCreateAssessmentError(result.error || 'Failed to save assessment to Supabase database.');
        return;
      }
      setCreatedAssessment(assessmentRecord);
      setIsLinkModalOpen(true);
      setHasCopiedLink(false);
    } catch (err: any) {
      console.error('Error creating assessment link:', err);
      setCreateAssessmentError(err?.message || 'Unexpected error creating assessment link.');
    } finally {
      setIsCreatingAssessment(false);
    }
  };

  // Handle Start Assessment button click
  const handleStartAssessment = () => {
    const candidateDisplayName = inputCandidateName.trim() || 'Candidate';
    setNameError('');

    const initialMap: Record<string, string> = {};
    questions.forEach((q) => {
      initialMap[q.id] = q.starterCode || q.javaStarterCode;
    });
    setCodeMap(initialMap);
    setSelectedQuestionIndex(0);
    setTimeRemainingSeconds(assessmentDurationMinutes * 60);
    setIsAssessmentStarted(true);
    setIsTimerRunning(true);
    setIsLinkModalOpen(false);

    // Generate session ID and initialize session in Supabase
    const newSessionId = `coding-session-${Date.now()}`;
    setCurrentSessionId(newSessionId);

    const initialSession: CodingSessionRecord = {
      id: newSessionId,
      candidate_name: candidateDisplayName,
      candidate_email: inputCandidateEmail.trim() || undefined,
      language: selectedLanguage,
      set_id: activeAssessmentSet?.id,
      set_name: activeAssessmentSet?.name || 'Set 1',
      duration_minutes: assessmentDurationMinutes,
      time_spent_seconds: 0,
      overall_score: 0,
      status: 'in_progress',
      code_submissions: initialMap,
      question_results: [],
      created_at: new Date().toISOString()
    };

    saveCodingSessionToDb(initialSession).catch((err) => {
      console.warn('Could not save initial coding session to Supabase:', err);
    });
  };

  // Update current code if question changes and not set yet
  useEffect(() => {
    if (isAssessmentStarted && currentQuestion && !(currentQuestion.id in codeMap)) {
      setCodeMap((prev) => ({
        ...prev,
        [currentQuestion.id]: currentQuestion.starterCode || currentQuestion.javaStarterCode
      }));
    }
  }, [isAssessmentStarted, currentQuestion, codeMap]);

  // Countdown Timer Interval
  useEffect(() => {
    if (!isTimerRunning || isRoundSubmitted) return;

    const interval = setInterval(() => {
      setTimeRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmitAndLock();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimerRunning, isRoundSubmitted]);

  // Helper: Format seconds to MM:SS
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Helper: Execute Code via backend proxy endpoint
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

  // Run Code against all test cases for current question
  const handleRunCode = async () => {
    if (!currentQuestion) return;
    setIsRunningCode(true);
    setRawConsoleOutput(`Compiling and executing ${selectedLanguage === 'python' ? 'Python' : 'Java'} code...\n`);
    setActiveOutputTab('test_results');

    const results: CodingTestCaseResult[] = [];
    let consoleLogAccumulator = '';
    let allPassed = true;

    try {
      for (let i = 0; i < currentQuestion.testCases.length; i++) {
        const tc = currentQuestion.testCases[i];
        consoleLogAccumulator += `--- Running Test Case ${i + 1} (${tc.isHidden ? 'Hidden' : 'Public'}) ---\nInput:\n${tc.input || '(empty)'}\n`;

        const res = await executeCode(currentCode, tc.input, selectedLanguage);
        const rawOutput = res.output || res.error || '';
        consoleLogAccumulator += `Output:\n${rawOutput}\n`;

        if (res.memory || res.cpuTime) {
          consoleLogAccumulator += `[Execution Stats: Memory ${res.memory} KB, CPU Time ${res.cpuTime}s]\n\n`;
        }

        const cleanActual = rawOutput.trim().replace(/\r\n/g, '\n');
        const cleanExpected = tc.expectedOutput.trim().replace(/\r\n/g, '\n');
        const passed = cleanActual === cleanExpected;

        if (!passed) {
          allPassed = false;
        }

        results.push({
          testCaseId: tc.id,
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          actualOutput: rawOutput,
          passed,
          isHidden: tc.isHidden,
          error: res.error
        });
      }

      setTestResultsMap((prev) => ({
        ...prev,
        [currentQuestion.id]: results
      }));

      setQuestionStatusMap((prev) => ({
        ...prev,
        [currentQuestion.id]: allPassed ? 'passed' : 'failed'
      }));

      setRawConsoleOutput(consoleLogAccumulator);

      // Sync intermediate code progress to Supabase
      if (currentSessionId) {
        const updatedCodeMap = { ...codeMap, [currentQuestion.id]: currentCode };
        updateCodingSessionInDb(currentSessionId, {
          code_submissions: updatedCodeMap,
        }).catch((err) => {
          console.warn('Could not sync code progress to Supabase:', err);
        });
      }
    } catch (err: any) {
      console.error('Error running test cases:', err);
      setRawConsoleOutput((prev) => prev + `\nExecution Failed:\n${err?.message || 'Unknown error'}`);
    } finally {
      setIsRunningCode(false);
    }
  };

  // Reset current question code back to starter code
  const handleResetCode = () => {
    if (!currentQuestion) return;
    setCodeMap((prev) => ({
      ...prev,
      [currentQuestion.id]: currentQuestion.starterCode || currentQuestion.javaStarterCode
    }));
  };

  // Submit and lock coding assessment, calculate scores & generate report
  const handleSubmitAndLock = async () => {
    setIsEvaluatingAll(true);
    setShowSubmitModal(false);
    setIsTimerRunning(false);
    setIsRoundSubmitted(true);

    const totalLimit = assessmentDurationMinutes * 60;
    const timeSpent = Math.max(0, totalLimit - timeRemainingSeconds);
    const timeRemaining = timeRemainingSeconds;

    const newResultsMap: Record<string, CodingTestCaseResult[]> = { ...testResultsMap };
    const questionResultsList: QuestionCodingResult[] = [];

    let totalTestCasesCount = 0;
    let passedTestCasesCount = 0;

    let solvedCount = 0;
    let partialCount = 0;
    let failedCount = 0;
    let unattemptedCount = 0;

    for (const q of questions) {
      const qCode = codeMap[q.id] || q.starterCode || q.javaStarterCode || '';
      const originalStarter = q.starterCode || q.javaStarterCode || '';
      const isCodeModified = qCode.trim() !== originalStarter.trim() && qCode.trim().length > 0;

      let resList = newResultsMap[q.id];

      if ((!resList || resList.length === 0) && isCodeModified) {
        const computed: CodingTestCaseResult[] = [];
        for (const tc of q.testCases) {
          try {
            const execRes = await executeCode(qCode, tc.input, selectedLanguage);
            const rawOutput = execRes.output || execRes.error || '';
            const cleanActual = rawOutput.trim().replace(/\r\n/g, '\n');
            const cleanExpected = tc.expectedOutput.trim().replace(/\r\n/g, '\n');
            const passed = cleanActual === cleanExpected;
            computed.push({
              testCaseId: tc.id,
              input: tc.input,
              expectedOutput: tc.expectedOutput,
              actualOutput: rawOutput,
              passed,
              isHidden: tc.isHidden,
              error: execRes.error
            });
          } catch (e: any) {
            computed.push({
              testCaseId: tc.id,
              input: tc.input,
              expectedOutput: tc.expectedOutput,
              actualOutput: e?.message || 'Execution Error',
              passed: false,
              isHidden: tc.isHidden,
              error: e?.message
            });
          }
        }
        resList = computed;
        newResultsMap[q.id] = computed;
      } else if (!resList || resList.length === 0) {
        resList = q.testCases.map((tc) => ({
          testCaseId: tc.id,
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          actualOutput: 'Not Attempted',
          passed: false,
          isHidden: tc.isHidden
        }));
        newResultsMap[q.id] = resList;
      }

      const passedCases = resList.filter((r) => r.passed).length;
      const totalCases = q.testCases.length;
      const qScore = totalCases > 0 ? Math.round((passedCases / totalCases) * 100) : 0;

      totalTestCasesCount += totalCases;
      passedTestCasesCount += passedCases;

      let status: 'Solved' | 'Partial' | 'Failed' | 'Not Attempted' = 'Not Attempted';
      if (!isCodeModified && passedCases === 0) {
        status = 'Not Attempted';
        unattemptedCount++;
      } else if (passedCases === totalCases && totalCases > 0) {
        status = 'Solved';
        solvedCount++;
      } else if (passedCases > 0) {
        status = 'Partial';
        partialCount++;
      } else {
        status = 'Failed';
        failedCount++;
      }

      questionResultsList.push({
        questionId: q.id,
        questionTitle: q.title,
        difficulty: q.difficulty,
        passedCount: passedCases,
        totalTestCases: totalCases,
        score: qScore,
        status,
        timeTakenSeconds: Math.round(timeSpent / (questions.length || 1)),
        codeSubmitted: qCode,
        testCasesResults: resList
      });
    }

    setTestResultsMap(newResultsMap);

    const finalScore = totalTestCasesCount > 0
      ? Math.round((passedTestCasesCount / totalTestCasesCount) * 100)
      : 0;

    const attemptedCount = solvedCount + partialCount + failedCount;
    const failedTestCasesCount = totalTestCasesCount - passedTestCasesCount;

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
      totalTestCases: totalTestCasesCount,
      passedTestCases: passedTestCasesCount,
      failedTestCases: failedTestCasesCount,
      totalTimeLimitSeconds: totalLimit,
      timeSpentSeconds: timeSpent,
      timeRemainingSeconds: timeRemaining,
      submissionTime,
      questionResults: questionResultsList
    };

    const finalCandidateName = inputCandidateName.trim() || candidateName || 'Candidate';
    const finalCandidateEmail = inputCandidateEmail.trim() || candidateEmail || '';
    const langLabel = selectedLanguage === 'java' ? 'Java' : 'Python';
    const setNameLabel = activeAssessmentSet?.name || 'Set 1';

    const report: InterviewReport = {
      id: `coding-report-${Date.now()}`,
      candidateName: finalCandidateName,
      candidateEmail: finalCandidateEmail,
      roleName: `${langLabel} Developer`,
      experienceLevel: setNameLabel,
      completedAt: new Date().toISOString(),
      totalTimeSpentSeconds: timeSpent,
      overallScore: finalScore,
      recommendation: finalScore >= 85 ? 'Strong Hire' : finalScore >= 70 ? 'Hire' : finalScore >= 50 ? 'Borderline' : 'No Hire',
      summary: `${langLabel} Coding Assessment (${setNameLabel}) submitted by ${finalCandidateName}. Final Score: ${finalScore}% (${passedTestCasesCount}/${totalTestCasesCount} test cases passed). Solved: ${solvedCount}/${questions.length} questions.`,
      strengths: questionResultsList.filter(q => q.status === 'Solved').map(q => `Fully solved "${q.questionTitle}" passing all test cases.`),
      weaknesses: questionResultsList.filter(q => q.status !== 'Solved').map(q => `${q.status === 'Not Attempted' ? 'Did not attempt' : 'Partial/Failed'} "${q.questionTitle}" (${q.passedCount}/${q.totalTestCases} test cases passed).`),
      categoryBreakdown: [],
      followUpQuestionsForInterviewer: [],
      questionSessions: [],
      assessmentType: 'coding',
      codingReportData: codingData
    };

    setSubmittedReport(report);
    setIsEvaluatingAll(false);

    if (onSaveReport) {
      onSaveReport(report);
    }

    // Persist final completed coding session to Supabase
    const sessionToSave: CodingSessionRecord = {
      id: currentSessionId || `coding-session-${Date.now()}`,
      candidate_name: finalCandidateName,
      candidate_email: finalCandidateEmail || undefined,
      language: selectedLanguage,
      set_id: activeAssessmentSet?.id,
      set_name: setNameLabel,
      duration_minutes: assessmentDurationMinutes,
      time_spent_seconds: timeSpent,
      overall_score: finalScore,
      status: 'completed',
      code_submissions: codeMap,
      question_results: questionResultsList,
      completed_at: new Date().toISOString()
    };

    saveCodingSessionToDb(sessionToSave).catch((err) => {
      console.warn('Could not save final completed coding session to Supabase:', err);
    });
  };

  // Handle renaming active set
  const handleRenameActiveSet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!renameValue.trim()) return;

    if (bankLanguage === 'java') {
      const target = javaSets.find((s) => s.id === bankJavaSetId);
      if (target) {
        saveCodingQuestionSetToDb({ ...target, name: renameValue.trim() }).catch((err) =>
          console.warn('Could not rename set in Supabase:', err)
        );
      }
      setJavaSets((prev) =>
        prev.map((s) => (s.id === bankJavaSetId ? { ...s, name: renameValue.trim() } : s))
      );
    } else {
      const target = pythonSets.find((s) => s.id === bankPythonSetId);
      if (target) {
        saveCodingQuestionSetToDb({ ...target, name: renameValue.trim() }).catch((err) =>
          console.warn('Could not rename set in Supabase:', err)
        );
      }
      setPythonSets((prev) =>
        prev.map((s) => (s.id === bankPythonSetId ? { ...s, name: renameValue.trim() } : s))
      );
    }

    setShowRenameModal(false);
  };

  // Handle creating a new set (EMPTY on creation)
  const handleCreateNewSet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSetName.trim()) return;

    const newId = `${bankLanguage}-set-${Date.now()}`;
    const newSetObj: CodingQuestionSet = {
      id: newId,
      name: newSetName.trim(),
      language: bankLanguage,
      createdAt: new Date().toISOString(),
      questions: [], // Fresh empty set as requested
    };

    saveCodingQuestionSetToDb(newSetObj).catch((err) => {
      console.warn('Could not save new question set to Supabase:', err);
    });

    if (bankLanguage === 'java') {
      setJavaSets((prev) => [...prev, newSetObj]);
      setBankJavaSetId(newId);
    } else {
      setPythonSets((prev) => [...prev, newSetObj]);
      setBankPythonSetId(newId);
    }

    setNewSetName('');
    setShowCreateSetModal(false);
  };

  // Trigger delete confirmation modal
  const handleDeleteButtonClick = () => {
    const currentSets = bankLanguage === 'java' ? javaSets : pythonSets;
    if (currentSets.length <= 1) {
      setDeleteWarningMessage(`Cannot delete "${activeBankSet?.name}". At least one question set must remain in the ${bankLanguage === 'java' ? 'Java' : 'Python'} Question Bank.`);
      setShowDeleteSetModal(true);
      return;
    }
    setDeleteWarningMessage('');
    setShowDeleteSetModal(true);
  };

  // Confirm delete active set
  const handleConfirmDeleteSet = () => {
    const currentSets = bankLanguage === 'java' ? javaSets : pythonSets;
    if (currentSets.length <= 1) {
      setShowDeleteSetModal(false);
      return;
    }

    if (bankLanguage === 'java') {
      deleteCodingQuestionSetFromDb(bankJavaSetId).catch((err) => {
        console.warn('Could not delete set from Supabase:', err);
      });
      const nextSets = javaSets.filter((s) => s.id !== bankJavaSetId);
      setJavaSets(nextSets);
      setBankJavaSetId(nextSets[0]?.id || '');
    } else {
      deleteCodingQuestionSetFromDb(bankPythonSetId).catch((err) => {
        console.warn('Could not delete set from Supabase:', err);
      });
      const nextSets = pythonSets.filter((s) => s.id !== bankPythonSetId);
      setPythonSets(nextSets);
      setBankPythonSetId(nextSets[0]?.id || '');
    }
    setShowDeleteSetModal(false);
  };

  // Test Case handlers in Add Question Modal
  const handleAddNewTestCase = () => {
    setNewTestCases((prev) => [
      ...prev,
      {
        id: `tc-${Date.now()}-${prev.length + 1}`,
        input: '',
        expectedOutput: '',
        isHidden: false
      }
    ]);
  };

  const handleRemoveTestCase = (tcId: string) => {
    setNewTestCases((prev) => prev.filter((t) => t.id !== tcId));
  };

  // Handle adding custom question to active set
  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDesc.trim() || !activeBankSet) return;

    const validTestCases = newTestCases.filter((tc) => tc.input.trim() || tc.expectedOutput.trim());
    if (validTestCases.length === 0) {
      alert('Please add at least one test case with an input or expected output.');
      return;
    }

    const currentQuestions = activeBankSet.questions || [];

    const created: JavaCodingQuestion = {
      id: `${bankLanguage}-custom-q-${Date.now()}`,
      title: `${currentQuestions.length + 1}. ${newTitle.trim()}`,
      description: newDesc.trim(),
      difficulty: newDifficulty,
      javaStarterCode: newStarterCode || (bankLanguage === 'python' ? `import sys\n\ndef main():\n    pass\n\nif __name__ == '__main__':\n    main()` : `import java.util.Scanner;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner scanner = new Scanner(System.in);\n    }\n}`),
      sampleInput: newSampleInput,
      sampleOutput: newSampleOutput,
      testCases: validTestCases
    };

    if (bankLanguage === 'java') {
      const target = javaSets.find((s) => s.id === bankJavaSetId);
      if (target) {
        saveCodingQuestionSetToDb({
          ...target,
          questions: [...target.questions, created]
        }).catch((err) => console.warn('Could not save updated set to Supabase:', err));
      }
      setJavaSets((prev) =>
        prev.map((s) =>
          s.id === bankJavaSetId ? { ...s, questions: [...s.questions, created] } : s
        )
      );
    } else {
      const target = pythonSets.find((s) => s.id === bankPythonSetId);
      if (target) {
        saveCodingQuestionSetToDb({
          ...target,
          questions: [...target.questions, created]
        }).catch((err) => console.warn('Could not save updated set to Supabase:', err));
      }
      setPythonSets((prev) =>
        prev.map((s) =>
          s.id === bankPythonSetId ? { ...s, questions: [...s.questions, created] } : s
        )
      );
    }

    setShowAddQuestionModal(false);

    // Reset form
    setNewTitle('');
    setNewDesc('');
    setNewDifficulty('easy');
    setNewSampleInput('');
    setNewSampleOutput('');
    setNewTestCases([
      { id: `tc-new-1-${Date.now()}`, input: '', expectedOutput: '', isHidden: false },
      { id: `tc-new-2-${Date.now()}`, input: '', expectedOutput: '', isHidden: true }
    ]);
  };

  // Reset questions in active set to defaults
  const handleResetQuestionsToDefault = () => {
    const langName = bankLanguage === 'java' ? 'Java' : 'Python';
    if (window.confirm(`Populate/Reset "${activeBankSet?.name}" with original 5 default ${langName} questions?`)) {
      if (bankLanguage === 'java') {
        const target = javaSets.find((s) => s.id === bankJavaSetId);
        if (target) {
          saveCodingQuestionSetToDb({
            ...target,
            questions: DEFAULT_JAVA_QUESTIONS
          }).catch((err) => console.warn('Could not reset questions in Supabase:', err));
        }
        setJavaSets((prev) =>
          prev.map((s) =>
            s.id === bankJavaSetId ? { ...s, questions: DEFAULT_JAVA_QUESTIONS } : s
          )
        );
      } else {
        const target = pythonSets.find((s) => s.id === bankPythonSetId);
        if (target) {
          saveCodingQuestionSetToDb({
            ...target,
            questions: DEFAULT_PYTHON_QUESTIONS
          }).catch((err) => console.warn('Could not reset questions in Supabase:', err));
        }
        setPythonSets((prev) =>
          prev.map((s) =>
            s.id === bankPythonSetId ? { ...s, questions: DEFAULT_PYTHON_QUESTIONS } : s
          )
        );
      }
    }
  };

  // Open modal prefilled with current bank language starter code and initial test cases
  const handleOpenAddQuestionModal = () => {
    if (bankLanguage === 'python') {
      setNewStarterCode(`import sys

def main():
    # Write solution here
    pass

if __name__ == '__main__':
    main()`);
    } else {
      setNewStarterCode(`import java.util.Scanner;

public class Solution {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        // Write your solution here
    }
}`);
    }
    setNewTestCases([
      { id: `tc-1-${Date.now()}`, input: '', expectedOutput: '', isHidden: false },
      { id: `tc-2-${Date.now()}`, input: '', expectedOutput: '', isHidden: true }
    ]);
    setShowAddQuestionModal(true);
  };

  // Stats calculation
  const totalQuestionsCount = questions.length;
  const passedQuestionsCount = Object.values(questionStatusMap).filter((s) => s === 'passed').length;
  const attemptedQuestionsCount = Object.keys(questionStatusMap).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header Bar */}
      <div className="bg-[#0F0F12] border border-white/10 rounded-2xl p-4 sm:p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
              <Code2 className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">Coding Assessment Round</h1>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono">
              {selectedLanguage === 'python' ? 'Python' : 'Java'}
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Write clean algorithm solutions, run test cases against live execution engine, and submit before time expires.
          </p>
        </div>

        {/* Section Tabs */}
        <div className="flex items-center space-x-2 bg-white/5 p-1 rounded-xl border border-white/10 self-stretch md:self-auto">
          <button
            onClick={() => setActiveTab('coding_room')}
            className={`flex-1 md:flex-initial flex items-center justify-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'coding_room'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <FileCode2 className="w-4 h-4" />
            <span>Coding Room</span>
          </button>
          <button
            onClick={() => setActiveTab('manage_bank')}
            className={`flex-1 md:flex-initial flex items-center justify-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'manage_bank'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Question Bank</span>
          </button>
        </div>
      </div>

      {/* Main View Mode Switch */}
      {activeTab === 'coding_room' ? (
        <div className="space-y-6">
          {/* Submitted Banner */}
          {isRoundSubmitted && submittedReport && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-400 shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Coding Assessment Submitted & Locked</h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Candidate: <strong className="text-white">{submittedReport.candidateName}</strong> • Score: <strong className="text-emerald-400 font-mono text-sm">{submittedReport.overallScore}%</strong> • Test Cases Passed: <strong className="text-indigo-300 font-mono">{submittedReport.codingReportData?.passedTestCases}/{submittedReport.codingReportData?.totalTestCases}</strong>
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3 shrink-0">
                {onViewReport && (
                  <button
                    onClick={() => onViewReport(submittedReport)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-emerald-600/30 transition-all flex items-center space-x-2"
                  >
                    <span>View Report in Interview Reports</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Start Assessment Landing Screen */}
          {!isAssessmentStarted && !isRoundSubmitted ? (
            <div className="bg-[#0F0F12] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6 max-w-2xl mx-auto shadow-2xl">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                  <Code2 className="w-7 h-7" />
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight">Ready to Start Coding Assessment?</h2>
                <p className="text-xs text-slate-400 max-w-lg mx-auto">
                  Select your programming language and question set below, provide candidate details, and click start.
                </p>
              </div>

              {/* Language Selection Toggle */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block text-center">
                  Select Programming Language
                </label>
                <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                  <button
                    type="button"
                    onClick={() => setSelectedLanguage('java')}
                    className={`p-4 rounded-xl border text-left transition-all space-y-1 ${
                      selectedLanguage === 'java'
                        ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg ring-2 ring-indigo-500/50'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold text-sm">
                      <span>Java</span>
                      {selectedLanguage === 'java' && <Check className="w-4 h-4 text-indigo-400" />}
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Standard Java with Scanner I/O ({javaSets.length} {javaSets.length === 1 ? 'Set' : 'Sets'})
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedLanguage('python')}
                    className={`p-4 rounded-xl border text-left transition-all space-y-1 ${
                      selectedLanguage === 'python'
                        ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg ring-2 ring-indigo-500/50'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold text-sm">
                      <span>Python</span>
                      {selectedLanguage === 'python' && <Check className="w-4 h-4 text-indigo-400" />}
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Standard Python with sys.stdin ({pythonSets.length} {pythonSets.length === 1 ? 'Set' : 'Sets'})
                    </p>
                  </button>
                </div>
              </div>

              {/* Set Selection for Selected Language */}
              <div className="space-y-2 max-w-md mx-auto">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block text-center">
                  Select Question Set ({selectedLanguage === 'java' ? 'Java' : 'Python'})
                </label>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {(selectedLanguage === 'java' ? javaSets : pythonSets).map((set) => {
                    const isSelected = selectedLanguage === 'java' ? selectedJavaSetId === set.id : selectedPythonSetId === set.id;
                    return (
                      <button
                        key={set.id}
                        type="button"
                        onClick={() => {
                          if (selectedLanguage === 'java') {
                            setSelectedJavaSetId(set.id);
                          } else {
                            setSelectedPythonSetId(set.id);
                          }
                        }}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center space-x-2 ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-500 shadow-md ring-2 ring-indigo-500/40'
                            : 'bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <span>{set.name}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/30 opacity-80 font-mono">
                          {set.questions.length} Qs
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Candidate Details Form Inputs & Timing */}
              <div className="space-y-3 max-w-md mx-auto pt-2 bg-white/5 p-4 rounded-2xl border border-white/10">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                    <User className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Candidate Name <strong className="text-rose-400">*</strong></span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter candidate full name"
                    value={inputCandidateName}
                    onChange={(e) => {
                      setInputCandidateName(e.target.value);
                      if (nameError) setNameError('');
                    }}
                    className={`w-full px-3.5 py-2 rounded-xl bg-black/40 border text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-1 transition-all ${
                      nameError
                        ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500'
                        : 'border-white/10 focus:border-indigo-500 focus:ring-indigo-500'
                    }`}
                  />
                  {nameError && (
                    <p className="text-[11px] text-rose-400 font-medium">{nameError}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                    <Mail className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Candidate Email <span className="text-slate-500 font-normal">(Optional)</span></span>
                  </label>
                  <input
                    type="email"
                    placeholder="candidate@example.com"
                    value={inputCandidateEmail}
                    onChange={(e) => setInputCandidateEmail(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                    <Clock className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Assessment Duration</span>
                  </label>
                  <select
                    value={assessmentDurationMinutes}
                    onChange={(e) => setAssessmentDurationMinutes(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer"
                  >
                    <option value={30} className="bg-[#121216] text-white">30 mins (Default)</option>
                    <option value={45} className="bg-[#121216] text-white">45 mins</option>
                    <option value={60} className="bg-[#121216] text-white">1 hr (60 mins)</option>
                  </select>
                </div>
              </div>

              {/* Action Button & Supabase error display */}
              <div className="pt-2 text-center space-y-3">
                {createAssessmentError && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 text-left flex items-start space-x-2 max-w-md mx-auto">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-rose-200">Supabase Error</p>
                      <p className="text-[11px] text-rose-300/90">{createAssessmentError}</p>
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleCreateAssessmentLink}
                  disabled={isCreatingAssessment}
                  className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2 mx-auto disabled:opacity-50 cursor-pointer"
                >
                  {isCreatingAssessment ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Generating Assessment Link...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" />
                      <span>Start Coding Assessment</span>
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </>
                  )}
                </button>
                <p className="text-[11px] text-slate-400">
                  Clicking generates a secure candidate test link published to the cloud.
                </p>
              </div>
            </div>
          ) : (
            <>
          {/* Top Info Strip: Timer & Overall Progress */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Timer Card */}
            <div className={`p-4 rounded-xl border flex items-center justify-between ${
              timeRemainingSeconds <= 300
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                : 'bg-[#0F0F12] border-white/10 text-white'
            }`}>
              <div className="flex items-center space-x-3">
                <div className={`p-2.5 rounded-xl ${
                  timeRemainingSeconds <= 300 ? 'bg-amber-500/20 text-amber-400' : 'bg-indigo-500/10 text-indigo-400'
                }`}>
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                    Time Remaining
                  </span>
                  <span className="text-xl font-mono font-bold">{formatTime(timeRemainingSeconds)}</span>
                </div>
              </div>

              {!isRoundSubmitted && (
                <button
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className="text-xs px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 transition-all"
                >
                  {isTimerRunning ? 'Pause' : 'Resume'}
                </button>
              )}
            </div>

            {/* Test Progress Card */}
            <div className="p-4 rounded-xl bg-[#0F0F12] border border-white/10 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                    Questions Solved
                  </span>
                  <span className="text-xl font-mono font-bold text-white">
                    {passedQuestionsCount} / {totalQuestionsCount}
                  </span>
                </div>
              </div>
              <span className="text-xs text-slate-400 font-medium">
                {attemptedQuestionsCount} Attempted
              </span>
            </div>

            {/* Submit Action Card */}
            <div className="p-4 rounded-xl bg-[#0F0F12] border border-white/10 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                  Assessment Status
                </span>
                <span className={`text-xs font-bold ${isRoundSubmitted ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {isRoundSubmitted ? 'Submitted & Locked' : 'In Progress'}
                </span>
              </div>

              {!isRoundSubmitted ? (
                <button
                  onClick={() => setShowSubmitModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-600/30 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Round</span>
                </button>
              ) : (
                <span className="px-3 py-1 rounded-lg bg-slate-800 text-slate-400 text-xs font-mono border border-white/5">
                  Locked
                </span>
              )}
            </div>
          </div>

          {/* IDE Layout: Sidebar + Main Code Area */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Sidebar Question List (3 Cols) */}
            <div className="lg:col-span-4 space-y-3 bg-[#0F0F12] border border-white/10 rounded-2xl p-4">
              <h2 className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center justify-between">
                <span>Questions List</span>
                <span className="text-[10px] font-mono text-slate-500">{questions.length} Items</span>
              </h2>

              <div className="space-y-2">
                {questions.map((q, idx) => {
                  const isCurrent = idx === selectedQuestionIndex;
                  const status = questionStatusMap[q.id] || 'not_attempted';

                  return (
                    <button
                      key={q.id}
                      onClick={() => setSelectedQuestionIndex(idx)}
                      className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between ${
                        isCurrent
                          ? 'bg-indigo-600/20 border-indigo-500/50 text-white shadow-md'
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
                        {status === 'passed' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : status === 'failed' ? (
                          <XCircle className="w-4 h-4 text-rose-400" />
                        ) : (
                          <div className="w-2.5 h-2.5 rounded-full bg-slate-600" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Problem Description Drawer inside Sidebar */}
              {currentQuestion && (
                <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
                  <h3 className="text-xs font-bold text-white tracking-tight">{currentQuestion.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{currentQuestion.description}</p>

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

            {/* Main Monaco Code Editor & Execution Panel (8 Cols) */}
            <div className="lg:col-span-8 space-y-4">
              {/* Editor Container */}
              <div className="bg-[#0F0F12] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                {/* Editor Header Bar */}
                <div className="bg-black/40 px-4 py-2.5 border-b border-white/10 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FileCode2 className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-mono font-bold text-slate-200">
                      {selectedLanguage === 'python' ? 'solution.py' : 'Solution.java'}
                    </span>
                    {isRoundSubmitted && (
                      <span className="text-[10px] bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded border border-rose-500/20">
                        Read Only
                      </span>
                    )}
                  </div>

                  {!isRoundSubmitted && (
                    <button
                      onClick={handleResetCode}
                      className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white px-2 py-1 rounded-lg hover:bg-white/5 transition-all"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset Code</span>
                    </button>
                  )}
                </div>

                {/* Monaco Editor Component */}
                <div className="h-[380px] w-full">
                  <Editor
                    height="100%"
                    defaultLanguage={selectedLanguage === 'python' ? 'python' : 'java'}
                    language={selectedLanguage === 'python' ? 'python' : 'java'}
                    theme="vs-dark"
                    value={currentCode}
                    onChange={(val) => {
                      if (currentQuestion && !isRoundSubmitted) {
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
                      readOnly: isRoundSubmitted,
                      automaticLayout: true,
                      tabSize: 4
                    }}
                  />
                </div>

                {/* Editor Footer / Run Action */}
                <div className="p-3 bg-black/40 border-t border-white/10 flex items-center justify-between">
                  <div className="text-[11px] text-slate-400 font-mono">
                    Target: <span className="text-white font-semibold">{selectedLanguage === 'python' ? 'Python Execution Engine' : 'Java Execution Engine'}</span>
                  </div>

                  <button
                    onClick={handleRunCode}
                    disabled={isRunningCode || isRoundSubmitted}
                    className={`flex items-center space-x-2 px-5 py-2 rounded-xl font-bold text-xs shadow-lg transition-all ${
                      isRunningCode || isRoundSubmitted
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
                    }`}
                  >
                    {isRunningCode ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Executing Code...</span>
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

              {/* Bottom Test Case Results & Console Section */}
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
                    Console Output & Logs
                  </button>
                </div>

                {/* Tab 1: Test Results */}
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

                {/* Tab 2: Console Output */}
                {activeOutputTab === 'console' && (
                  <div className="bg-black/60 p-3 rounded-xl border border-white/10 font-mono text-xs text-slate-300 min-h-[120px] max-h-[220px] overflow-y-auto whitespace-pre-wrap">
                    {rawConsoleOutput || '// Standard output and compilation messages will appear here after running your code.'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
        </div>
      ) : (
        /* Tab: Manage Question Bank */
        <div className="space-y-6">
          <div className="bg-[#0F0F12] border border-white/10 rounded-2xl p-6 space-y-6">
            {/* Top Bar: Bank Language Selector & Main Actions */}
            <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-white/10">
              <div className="space-y-1">
                <div className="flex items-center space-x-3 flex-wrap gap-2">
                  <h2 className="text-lg font-bold text-white">
                    {bankLanguage === 'java' ? 'Java' : 'Python'} Question Bank Management
                  </h2>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono">
                    {bankLanguage === 'java' ? 'Java' : 'Python'}
                  </span>
                  {isSupabaseConfigured && (
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded flex items-center space-x-1 font-mono border ${
                        supabaseSyncStatus === 'synced'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : supabaseSyncStatus === 'syncing'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse'
                          : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                      }`}
                      title={supabaseSyncStatus === 'synced' ? 'Persisted directly to Supabase cloud' : 'Syncing with Supabase...'}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${supabaseSyncStatus === 'synced' ? 'bg-emerald-400' : supabaseSyncStatus === 'syncing' ? 'bg-amber-400' : 'bg-slate-400'}`}></span>
                      <span>Supabase {supabaseSyncStatus === 'synced' ? 'Cloud Synced' : supabaseSyncStatus === 'syncing' ? 'Syncing...' : 'Ready'}</span>
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400">
                  Organize and customize coding question sets for {bankLanguage === 'java' ? 'Java' : 'Python'} candidate assessments.
                </p>
              </div>

              {/* Bank Language Tabs */}
              <div className="flex items-center space-x-2 bg-white/5 p-1 rounded-xl border border-white/10">
                <button
                  type="button"
                  onClick={() => setBankLanguage('java')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    bankLanguage === 'java'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Java Sets ({javaSets.length})
                </button>
                <button
                  type="button"
                  onClick={() => setBankLanguage('python')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    bankLanguage === 'python'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Python Sets ({pythonSets.length})
                </button>
              </div>
            </div>

            {/* Set Management Bar: Select active set, Rename set, Add new set, Delete set */}
            <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-2 w-full md:w-auto">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Select & Manage Question Sets
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  {(bankLanguage === 'java' ? javaSets : pythonSets).map((set) => {
                    const isActive = bankLanguage === 'java' ? bankJavaSetId === set.id : bankPythonSetId === set.id;
                    return (
                      <button
                        key={set.id}
                        type="button"
                        onClick={() => {
                          if (bankLanguage === 'java') {
                            setBankJavaSetId(set.id);
                          } else {
                            setBankPythonSetId(set.id);
                          }
                        }}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 border ${
                          isActive
                            ? 'bg-indigo-600 text-white border-indigo-500 shadow-md ring-1 ring-indigo-400'
                            : 'bg-black/40 text-slate-300 border-white/10 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <span>{set.name}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/40 font-mono opacity-80">
                          {set.questions.length} Qs
                        </span>
                      </button>
                    );
                  })}

                  {/* Add New Set Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setNewSetName(`Set ${(bankLanguage === 'java' ? javaSets : pythonSets).length + 1}`);
                      setShowCreateSetModal(true);
                    }}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-slate-200 border border-white/10 flex items-center space-x-1.5 transition-all"
                  >
                    <FolderPlus className="w-3.5 h-3.5 text-indigo-400" />
                    <span>+ New Set</span>
                  </button>
                </div>
              </div>

              {/* Set Actions: Rename Set & Delete Set */}
              {activeBankSet && (
                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setRenameValue(activeBankSet.name);
                      setShowRenameModal(true);
                    }}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold border border-white/10 transition-all shadow"
                    title="Rename Set"
                  >
                    <Pencil className="w-3.5 h-3.5 text-amber-400" />
                    <span>Rename Set</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDeleteButtonClick}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-semibold border border-rose-500/20 transition-all"
                    title="Delete Set"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                    <span>Delete Set</span>
                  </button>
                </div>
              )}
            </div>

            {/* Questions Header inside Active Set */}
            <div className="flex items-center justify-between flex-wrap gap-4 pt-2">
              <div className="space-y-0.5">
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <span>Questions in {activeBankSet?.name}</span>
                  <span className="text-xs text-slate-400 font-normal">({activeBankSet?.questions.length || 0} Questions)</span>
                </h3>
                <p className="text-[11px] text-slate-400">Add or edit individual algorithm questions in this set.</p>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={handleResetQuestionsToDefault}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold border border-white/10 transition-all"
                >
                  Reset to 5 Defaults
                </button>
                <button
                  type="button"
                  onClick={handleOpenAddQuestionModal}
                  className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Add Question to {activeBankSet?.name}</span>
                </button>
              </div>
            </div>

            {/* Questions Grid inside Active Set */}
            {(activeBankSet?.questions || []).length === 0 ? (
              <div className="py-12 px-4 text-center bg-black/20 border border-dashed border-white/10 rounded-2xl space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center mx-auto">
                  <FileCode2 className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white">{activeBankSet?.name} is currently empty</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    This question set contains no coding questions. Add custom questions with test cases or populate with standard default questions.
                  </p>
                </div>
                <div className="flex items-center justify-center space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={handleOpenAddQuestionModal}
                    className="flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add First Question</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleResetQuestionsToDefault}
                    className="px-4 py-2 bg-white/10 hover:bg-white/15 text-slate-200 rounded-xl text-xs font-semibold border border-white/10 transition-all"
                  >
                    Load 5 Defaults
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(activeBankSet?.questions || []).map((q) => (
                  <div
                    key={q.id}
                    className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-white">{q.title}</span>
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                            q.difficulty === 'easy'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : q.difficulty === 'medium'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          {q.difficulty}
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 line-clamp-2">{q.description}</p>

                      <div className="flex items-center space-x-4 text-[11px] text-slate-400 pt-1 font-mono">
                        <span>Test Cases: {q.testCases.length}</span>
                        <span>
                          Hidden: {q.testCases.filter((tc) => tc.isHidden).length}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-mono text-[10px]">{q.id}</span>
                      <button
                        type="button"
                        onClick={() => {
                          if (bankLanguage === 'java') {
                            const target = javaSets.find((s) => s.id === bankJavaSetId);
                            if (target) {
                              saveCodingQuestionSetToDb({
                                ...target,
                                questions: target.questions.filter((item) => item.id !== q.id)
                              }).catch((err) => console.warn('Could not update set in Supabase:', err));
                            }
                            setJavaSets((prev) =>
                              prev.map((s) =>
                                s.id === bankJavaSetId
                                  ? { ...s, questions: s.questions.filter((item) => item.id !== q.id) }
                                  : s
                              )
                            );
                          } else {
                            const target = pythonSets.find((s) => s.id === bankPythonSetId);
                            if (target) {
                              saveCodingQuestionSetToDb({
                                ...target,
                                questions: target.questions.filter((item) => item.id !== q.id)
                              }).catch((err) => console.warn('Could not update set in Supabase:', err));
                            }
                            setPythonSets((prev) =>
                              prev.map((s) =>
                                s.id === bankPythonSetId
                                  ? { ...s, questions: s.questions.filter((item) => item.id !== q.id) }
                                  : s
                              )
                            );
                          }
                        }}
                        className="text-rose-400 hover:text-rose-300 p-1.5 rounded bg-rose-500/10 hover:bg-rose-500/20 transition-all"
                        title="Delete Question"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Rename Set Modal */}
      {showRenameModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121216] border border-white/10 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl text-slate-100">
            <div className="flex items-center space-x-3 text-amber-400">
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <Pencil className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Rename Set</h3>
                <p className="text-xs text-slate-400">Update the name of this {bankLanguage === 'java' ? 'Java' : 'Python'} question set.</p>
              </div>
            </div>

            <form onSubmit={handleRenameActiveSet} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Set Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Set 1, Core Algorithms, Set A"
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRenameModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-600/30"
                >
                  Save Set Name
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create New Set Modal */}
      {showCreateSetModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121216] border border-white/10 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl text-slate-100">
            <div className="flex items-center space-x-3 text-indigo-400">
              <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                <FolderPlus className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Create New {bankLanguage === 'java' ? 'Java' : 'Python'} Set</h3>
                <p className="text-xs text-slate-400">Creates a fresh, empty set ready for your custom questions.</p>
              </div>
            </div>

            <form onSubmit={handleCreateNewSet} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">New Set Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Set 2, Advanced Set, Set B"
                  value={newSetName}
                  onChange={(e) => setNewSetName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateSetModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-600/30"
                >
                  Create Empty Set
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Set Confirmation Modal */}
      {showDeleteSetModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121216] border border-white/10 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl text-slate-100 animate-in fade-in zoom-in duration-150">
            {deleteWarningMessage ? (
              <>
                <div className="flex items-center space-x-3 text-amber-400">
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                    <XCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-white">Cannot Delete Set</h3>
                    <p className="text-xs text-slate-400">Question bank requirement</p>
                  </div>
                </div>

                <div className="bg-amber-500/10 border border-amber-500/20 p-3.5 rounded-xl text-xs text-amber-200 leading-relaxed">
                  {deleteWarningMessage}
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setShowDeleteSetModal(false)}
                    className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs transition-all"
                  >
                    Got It
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center space-x-3 text-rose-400">
                  <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
                    <Trash2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-white">Delete Question Set?</h3>
                    <p className="text-xs text-slate-400">This action cannot be undone.</p>
                  </div>
                </div>

                <div className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Set Name:</span>
                    <span className="font-bold text-white">{activeBankSet?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Language:</span>
                    <span className="font-bold text-indigo-400">{bankLanguage === 'java' ? 'Java' : 'Python'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Questions Contained:</span>
                    <span className="font-bold text-slate-200">{activeBankSet?.questions.length || 0} Questions</span>
                  </div>
                </div>

                <p className="text-xs text-slate-300">
                  Are you sure you want to permanently delete <strong className="text-white">"{activeBankSet?.name}"</strong>? All custom questions in this set will be removed.
                </p>

                <div className="flex justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowDeleteSetModal(false)}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmDeleteSet}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-600/30 transition-all flex items-center space-x-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Yes, Delete Set</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Submit Round Summary Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121216] border border-white/10 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl text-slate-100">
            <div className="flex items-center space-x-3 text-emerald-400">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Submit Coding Round?</h3>
                <p className="text-xs text-slate-400">This will finalize and compile candidate evaluation under {inputCandidateName || candidateName || 'Candidate'}.</p>
              </div>
            </div>

            <div className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Candidate:</span>
                <span className="font-bold text-white">{inputCandidateName || candidateName || 'Candidate'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Language & Set:</span>
                <span className="font-bold text-indigo-400">{selectedLanguage === 'java' ? 'Java' : 'Python'} • {activeAssessmentSet?.name || 'Set 1'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Questions:</span>
                <span className="font-bold text-white">{totalQuestionsCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Questions Solved (Passed):</span>
                <span className="font-bold text-emerald-400">{passedQuestionsCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Time Used:</span>
                <span className="font-bold text-white font-mono">{formatTime(1800 - timeRemainingSeconds)}</span>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold transition-all"
              >
                Continue Coding
              </button>
              <button
                type="button"
                onClick={handleSubmitAndLock}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/30 transition-all flex items-center space-x-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit & Lock Assessment</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Evaluating All Overlay */}
      {isEvaluatingAll && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#121216] border border-white/10 rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mx-auto animate-pulse">
              <Sparkles className="w-6 h-6 animate-spin" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Evaluating Solutions...</h3>
              <p className="text-xs text-slate-400 mt-1">Testing submitted code against test cases & compiling Coding Assessment Report...</p>
            </div>
          </div>
        </div>
      )}

      {/* Add Custom Question Modal */}
      {showAddQuestionModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121216] border border-white/10 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-white">Add New {bankLanguage === 'java' ? 'Java' : 'Python'} Question</h3>
              <button
                type="button"
                onClick={() => setShowAddQuestionModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddQuestion} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Question Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Find Factorial of a Number"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Difficulty</label>
                  <select
                    value={newDifficulty}
                    onChange={(e) => setNewDifficulty(e.target.value as any)}
                    className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Description</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe the problem, input/output constraints..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Sample Input</label>
                  <input
                    type="text"
                    placeholder="e.g. 5"
                    value={newSampleInput}
                    onChange={(e) => setNewSampleInput(e.target.value)}
                    className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Sample Output</label>
                  <input
                    type="text"
                    placeholder="e.g. 120"
                    value={newSampleOutput}
                    onChange={(e) => setNewSampleOutput(e.target.value)}
                    className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Starter Code ({bankLanguage === 'java' ? 'Java' : 'Python'})</label>
                <textarea
                  rows={5}
                  value={newStarterCode}
                  onChange={(e) => setNewStarterCode(e.target.value)}
                  className="w-full p-3 bg-black/60 border border-white/10 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Test Cases List with + Add Test Case */}
              <div className="space-y-2 border-t border-white/10 pt-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-white block">Test Cases</label>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {newTestCases.length} {newTestCases.length === 1 ? 'case' : 'cases'}
                  </span>
                </div>

                <div className="space-y-2">
                  {newTestCases.map((tc, idx) => (
                    <div
                      key={tc.id}
                      className="flex items-center space-x-2 bg-black/40 p-2 rounded-xl border border-white/10"
                    >
                      <input
                        type="text"
                        placeholder="Input (stdin)"
                        value={tc.input}
                        onChange={(e) => {
                          const val = e.target.value;
                          setNewTestCases((prev) =>
                            prev.map((t) => (t.id === tc.id ? { ...t, input: val } : t))
                          );
                        }}
                        className="flex-1 px-3 py-1.5 bg-black/60 border border-white/10 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
                      />
                      <input
                        type="text"
                        placeholder="Expected Output"
                        value={tc.expectedOutput}
                        onChange={(e) => {
                          const val = e.target.value;
                          setNewTestCases((prev) =>
                            prev.map((t) => (t.id === tc.id ? { ...t, expectedOutput: val } : t))
                          );
                        }}
                        className="flex-1 px-3 py-1.5 bg-black/60 border border-white/10 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
                      />
                      <label className="flex items-center space-x-1.5 text-xs text-slate-300 cursor-pointer px-2 py-1 select-none shrink-0">
                        <input
                          type="checkbox"
                          checked={tc.isHidden}
                          onChange={(e) => {
                            const val = e.target.checked;
                            setNewTestCases((prev) =>
                              prev.map((t) => (t.id === tc.id ? { ...t, isHidden: val } : t))
                            );
                          }}
                          className="rounded border-white/20 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-[11px]">Hidden</span>
                      </label>

                      {newTestCases.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveTestCase(tc.id)}
                          className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-all shrink-0"
                          title="Remove Test Case"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* + Add Test Case Button */}
                <button
                  type="button"
                  onClick={handleAddNewTestCase}
                  className="w-full py-2.5 px-3 rounded-xl border border-dashed border-indigo-500/40 hover:border-indigo-500 bg-indigo-500/5 hover:bg-indigo-500/10 text-indigo-400 hover:text-indigo-300 text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all shadow-sm cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add Test Case</span>
                </button>
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddQuestionModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-600/30"
                >
                  Save Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Assessment Link Created & Copy Link */}
      {isLinkModalOpen && createdAssessment && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0F0F12] border border-white/15 rounded-2xl max-w-lg w-full p-6 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl">
                  <CheckCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Assessment Link Generated</h3>
                  <p className="text-xs text-slate-400">Share this unique test link with the candidate.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsLinkModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Assessment Details Badge Strip */}
            <div className="grid grid-cols-3 gap-2 bg-white/5 p-3 rounded-xl border border-white/10 text-center">
              <div>
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">Language</span>
                <span className="text-xs font-bold text-indigo-400 uppercase font-mono">{createdAssessment.language}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">Question Set</span>
                <span className="text-xs font-bold text-white truncate block">{createdAssessment.set_name}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">Duration</span>
                <span className="text-xs font-bold text-emerald-400 font-mono">{createdAssessment.duration_minutes} Mins</span>
              </div>
            </div>

            {/* Copyable Link Box */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span className="flex items-center space-x-1.5">
                  <LinkIcon className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Candidate Test Link</span>
                </span>
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Token: {createdAssessment.token}
                </span>
              </label>

              <div className="flex items-center space-x-2 bg-black/60 p-2 rounded-xl border border-indigo-500/30">
                <input
                  type="text"
                  readOnly
                  value={buildCandidateAssessmentUrl(createdAssessment.token)}
                  className="flex-1 bg-transparent px-2 py-1 text-xs text-indigo-200 font-mono focus:outline-none select-all truncate"
                />
                <button
                  type="button"
                  onClick={() => {
                    const url = buildCandidateAssessmentUrl(createdAssessment.token);
                    navigator.clipboard.writeText(url).then(() => {
                      setHasCopiedLink(true);
                      setTimeout(() => setHasCopiedLink(false), 2500);
                    });
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all shrink-0 cursor-pointer ${
                    hasCopiedLink
                      ? 'bg-emerald-600 text-white'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow'
                  }`}
                >
                  {hasCopiedLink ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>
              </div>

              {hasCopiedLink && (
                <p className="text-[11px] text-emerald-400 font-medium flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Link copied to clipboard! Send it to the candidate to take the assessment.</span>
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-white/10 flex-wrap gap-2">
              <a
                href={buildCandidateAssessmentUrl(createdAssessment.token)}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-slate-300 hover:text-white flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
                <span>Open in New Tab</span>
              </a>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => handleStartAssessment()}
                  className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-semibold transition-all cursor-pointer"
                  title="Test assessment immediately in this window"
                >
                  Start Assessment Now (Preview)
                </button>

                <button
                  type="button"
                  onClick={() => setIsLinkModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
