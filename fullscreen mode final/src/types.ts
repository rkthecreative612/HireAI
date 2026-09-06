export type Category = 'basic' | 'domain' | 'trends' | 'situational';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type AssessmentType = 'descriptive' | 'mcq' | 'coding' | 'hybrid';

export interface Question {
  id: string;
  category: Category;
  difficulty: Difficulty;
  questionText: string;
  keyEvaluationCriteria: string[];
  sampleGoodAnswerSummary?: string;
  options?: string[];
  correctAnswer?: string;
}

export interface RoleQuestionPool {
  id: string;
  roleName: string;
  experienceLevel: string; // e.g. "Junior", "Mid", "Senior", "Lead"
  createdAt: string;
  description?: string;
  assessmentType?: AssessmentType;
  questions: Question[];
}

export interface AnswerEvaluation {
  score: number; // 0 to 100
  technicalAccuracy: number; // 0 to 100
  completeness: number; // 0 to 100
  clarity: number; // 0 to 100
  keyPointsCovered: string[];
  missingOrInaccuratePoints: string[];
  constructiveFeedback: string;
  suggestedDifficultyShift: 'harder' | 'easier' | 'same';
}

export interface InterviewQuestionSession {
  questionIndex: number; // 0-based
  question: Question;
  candidateAnswer: string;
  timeSpentSeconds: number;
  evaluation?: AnswerEvaluation;
}

export interface CategoryScore {
  category: Category;
  categoryName: string;
  score: number;
  questionsAnswered: number;
  easyCount: number;
  mediumCount: number;
  hardCount: number;
}

export interface QuestionCodingResult {
  questionId: string;
  questionTitle: string;
  difficulty: Difficulty;
  passedCount: number;
  totalTestCases: number;
  score: number;
  status: 'Solved' | 'Partial' | 'Failed' | 'Not Attempted';
  timeTakenSeconds?: number;
  codeSubmitted?: string;
  testCasesResults?: CodingTestCaseResult[];
}

export interface CodingReportData {
  totalQuestions: number;
  attemptedQuestions: number;
  solvedQuestions: number;
  partiallySolvedQuestions: number;
  failedQuestions: number;
  totalTestCases: number;
  passedTestCases: number;
  failedTestCases: number;
  totalTimeLimitSeconds: number;
  timeSpentSeconds: number;
  timeRemainingSeconds: number;
  submissionTime: string;
  questionResults: QuestionCodingResult[];
}

export interface HybridMCQResult {
  questionId: string;
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
  candidateAnswerIndex: number | null;
  isCorrect: boolean;
  difficulty?: Difficulty;
}

export interface HybridReportData {
  mcqTotal: number;
  mcqAttempted: number;
  mcqCorrect: number;
  mcqWrong: number;
  mcqScorePercent: number;
  mcqTimeSpentSeconds?: number;
  mcqResults: HybridMCQResult[];
  codingReportData: CodingReportData;
}

export interface InterviewReport {
  id: string;
  candidateName: string;
  candidateEmail?: string;
  roleName: string;
  experienceLevel: string;
  completedAt: string;
  totalTimeSpentSeconds: number;
  overallScore: number;
  rawTechnicalScore?: number;
  progressionBonus?: number;
  progressionBonusUnlocked?: boolean;
  recommendation: 'Strong Hire' | 'Hire' | 'Borderline' | 'No Hire';
  summary: string;
  strengths: string[];
  weaknesses: string[];
  categoryBreakdown: CategoryScore[];
  followUpQuestionsForInterviewer: string[];
  questionSessions: InterviewQuestionSession[];
  assessmentType?: AssessmentType;
  codingReportData?: CodingReportData;
  hybridReportData?: HybridReportData;
  proctor_enabled?: boolean;
  proctor_events?: ProctorEvent[];
  proctor_terminated?: boolean;
  proctor_termination_reason?: string;
  proctor_strikes_count?: number;
  proctorEvents?: ProctorEvent[];
  proctorTerminated?: boolean;
  proctorTerminationReason?: string;
  proctorStrikesCount?: number;
  browser_lock_enabled?: boolean;
  security_events?: SecurityEvent[];
  security_strikes_count?: number;
  browser_lock_terminated?: boolean;
  browser_lock_termination_reason?: string;
}

export interface CodingTestCase {
  id: string;
  input: string;
  expectedOutput: string;
  isHidden?: boolean;
}

export interface CodingQuestionSet {
  id: string;
  name: string;
  language: 'java' | 'python';
  createdAt: string;
  questions: JavaCodingQuestion[];
}

export interface JavaCodingQuestion {
  id: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  javaStarterCode: string;
  starterCode?: string;
  sampleInput: string;
  sampleOutput: string;
  testCases: CodingTestCase[];
}

export interface CodingSessionRecord {
  id: string;
  candidate_name: string;
  candidate_email?: string;
  language: 'java' | 'python';
  set_id?: string;
  set_name: string;
  duration_minutes: number;
  time_spent_seconds: number;
  overall_score: number;
  status: 'in_progress' | 'completed' | 'timed_out' | 'terminated_cheating';
  code_submissions: Record<string, string>;
  question_results: QuestionCodingResult[];
  created_at?: string;
  completed_at?: string;
  proctor_enabled?: boolean;
  proctor_events?: ProctorEvent[];
  proctor_terminated?: boolean;
  proctor_termination_reason?: string;
  proctor_strikes_count?: number;
}

export interface CodingAssessmentRecord {
  id: string;
  token: string;
  title: string;
  language: 'java' | 'python';
  set_id?: string;
  set_name: string;
  questions: JavaCodingQuestion[];
  duration_minutes: number;
  candidate_name?: string;
  candidate_email?: string;
  status: 'active' | 'in_progress' | 'completed' | 'expired';
  proctor_enabled?: boolean;
  created_at?: string;
}

export interface CodingTestCaseResult {
  testCaseId: string;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  passed: boolean;
  isHidden?: boolean;
  error?: string;
}

export interface JavaExecutionResponse {
  output?: string;
  statusCode?: number;
  memory?: string;
  cpuTime?: string;
  compilationStatus?: any;
  error?: string;
}

export type AppMode = 
  | 'select_role' 
  | 'pool_generator' 
  | 'interview_kiosk' 
  | 'interview_submitted'
  | 'report_view' 
  | 'past_reports' 
  | 'manage_pools'
  | 'coding'
  | 'interview_mode';

export interface HybridMCQQuestion {
  id: string;
  questionText: string;
  options: string[];
  correctAnswerIndex: number; // 0 for A, 1 for B, 2 for C, etc.
  difficulty?: Difficulty;
  category?: Category;
}

export interface HybridQuestionSet {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  mcqDurationSeconds: number; // Stored in seconds, edited as MM:SS
  intervalCountdownSeconds: number; // Stored in seconds, edited as MM:SS or seconds
  codingDurationSeconds: number; // Stored in seconds, edited as MM:SS
  codingLanguage: 'java' | 'python';
  mcqQuestions: HybridMCQQuestion[];
  codingQuestions: JavaCodingQuestion[];
}

export interface HybridAssessmentRecord {
  id: string;
  token: string;
  title: string;
  setId?: string;
  setName: string;
  codingLanguage: 'java' | 'python';
  mcqDurationSeconds: number;
  intervalCountdownSeconds: number;
  codingDurationSeconds: number;
  mcqQuestions: HybridMCQQuestion[];
  codingQuestions: JavaCodingQuestion[];
  candidateName?: string;
  candidateEmail?: string;
  status: 'active' | 'in_progress' | 'completed' | 'expired';
  proctor_enabled?: boolean;
  browser_lock_enabled?: boolean;
  createdAt: string;
}

export interface HybridMCQAnswer {
  questionId: string;
  selectedIndex: number; // -1 if not answered
  isCorrect: boolean;
  timeSpentSeconds?: number;
}

export type ProctorViolationType = 'no_face' | 'multiple_faces' | 'looking_away';

export type ProctorStatus = 
  | 'idle'
  | 'loading_model'
  | 'ready'
  | 'normal'
  | 'no_face'
  | 'multiple_faces'
  | 'looking_away'
  | 'camera_error';

export interface ProctorEvent {
  id: string;
  type: ProctorViolationType;
  timestamp: string;
  formattedTime: string;
  message: string;
  strikeNumber: number;
}

export type SecurityViolationType =
  | 'tab_switch'
  | 'fullscreen_exit'
  | 'external_paste_attempt'
  | 'developer_tools_attempt'
  | 'window_defocus';

export interface SecurityEvent {
  id: string;
  type: SecurityViolationType;
  timestamp: string;
  formattedTime: string;
  message: string;
  strikeNumber: number;
}
