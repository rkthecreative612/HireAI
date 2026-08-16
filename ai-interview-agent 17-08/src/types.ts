export type Category = 'basic' | 'domain' | 'trends' | 'situational';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type AssessmentType = 'descriptive' | 'mcq' | 'coding';

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
  sampleInput: string;
  sampleOutput: string;
  testCases: CodingTestCase[];
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
  | 'report_view' 
  | 'past_reports' 
  | 'manage_pools'
  | 'coding';
