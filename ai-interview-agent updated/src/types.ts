export type Category = 'basic' | 'domain' | 'trends' | 'situational';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type AssessmentType = 'descriptive' | 'mcq';

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

export interface InterviewReport {
  id: string;
  candidateName: string;
  candidateEmail?: string;
  roleName: string;
  experienceLevel: string;
  completedAt: string;
  totalTimeSpentSeconds: number;
  overallScore: number;
  recommendation: 'Strong Hire' | 'Hire' | 'Borderline' | 'No Hire';
  summary: string;
  strengths: string[];
  weaknesses: string[];
  categoryBreakdown: CategoryScore[];
  followUpQuestionsForInterviewer: string[];
  questionSessions: InterviewQuestionSession[];
  assessmentType?: AssessmentType;
}

export type AppMode = 
  | 'select_role' 
  | 'pool_generator' 
  | 'interview_kiosk' 
  | 'report_view' 
  | 'past_reports' 
  | 'manage_pools';
