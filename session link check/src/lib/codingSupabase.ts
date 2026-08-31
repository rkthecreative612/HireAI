import { getSupabaseClient, isSupabaseConfigured } from './supabase';
import {
  CodingQuestionSet,
  CodingSessionRecord,
  CodingAssessmentRecord,
  InterviewReport,
  CodingReportData
} from '../types';

export const CODING_TABLE_QUESTION_SETS = 'coding_question_sets';
export const CODING_TABLE_SESSIONS = 'coding_sessions';
export const CODING_TABLE_ASSESSMENTS = 'coding_assessments';

/**
 * SQL Schema definition for the user to run in Supabase SQL Editor
 */
export const CODING_SUPABASE_SQL_SCHEMA = `
-- Create coding_question_sets table
CREATE TABLE IF NOT EXISTS coding_question_sets (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  language TEXT NOT NULL,
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create coding_sessions table
CREATE TABLE IF NOT EXISTS coding_sessions (
  id TEXT PRIMARY KEY,
  candidate_name TEXT NOT NULL,
  candidate_email TEXT,
  language TEXT NOT NULL,
  set_id TEXT,
  set_name TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  time_spent_seconds INTEGER NOT NULL DEFAULT 0,
  overall_score NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'in_progress',
  code_submissions JSONB NOT NULL DEFAULT '{}'::jsonb,
  question_results JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Create coding_assessments table
CREATE TABLE IF NOT EXISTS coding_assessments (
  id TEXT PRIMARY KEY,
  token TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  language TEXT NOT NULL,
  set_id TEXT,
  set_name TEXT NOT NULL,
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  candidate_name TEXT,
  candidate_email TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS & allow public read/write (Anon Key access)
ALTER TABLE coding_question_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE coding_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE coding_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public all access on coding_question_sets" ON coding_question_sets
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public all access on coding_sessions" ON coding_sessions
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public all access on coding_assessments" ON coding_assessments
  FOR ALL USING (true) WITH CHECK (true);
`;

/**
 * Fetch all question sets from Supabase
 */
export async function fetchCodingQuestionSetsFromDb(
  language?: 'java' | 'python'
): Promise<CodingQuestionSet[] | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    let query = client.from(CODING_TABLE_QUESTION_SETS).select('*');
    if (language) {
      query = query.eq('language', language);
    }
    const { data, error } = await query.order('created_at', { ascending: true });

    if (error) {
      console.warn('Supabase fetchCodingQuestionSets warning/error:', error.message);
      return null;
    }

    if (!data || data.length === 0) {
      return [];
    }

    return data.map((row: any) => ({
      id: row.id,
      name: row.name,
      language: row.language as 'java' | 'python',
      createdAt: row.created_at || new Date().toISOString(),
      questions: Array.isArray(row.questions) ? row.questions : [],
    }));
  } catch (err) {
    console.warn('Supabase fetchCodingQuestionSets exception:', err);
    return null;
  }
}

/**
 * Save / Upsert a question set to Supabase
 */
export async function saveCodingQuestionSetToDb(set: CodingQuestionSet): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client.from(CODING_TABLE_QUESTION_SETS).upsert({
      id: set.id,
      name: set.name,
      language: set.language,
      questions: set.questions || [],
      created_at: set.createdAt || new Date().toISOString(),
    });

    if (error) {
      console.warn('Supabase saveCodingQuestionSet error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase saveCodingQuestionSet exception:', err);
    return false;
  }
}

/**
 * Delete a question set from Supabase
 */
export async function deleteCodingQuestionSetFromDb(setId: string): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client
      .from(CODING_TABLE_QUESTION_SETS)
      .delete()
      .eq('id', setId);

    if (error) {
      console.warn('Supabase deleteCodingQuestionSet error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase deleteCodingQuestionSet exception:', err);
    return false;
  }
}

/**
 * Seed initial question sets if database table is empty
 */
export async function seedInitialCodingQuestionSetsIfEmpty(
  allInitialSets: CodingQuestionSet[]
): Promise<void> {
  const client = getSupabaseClient();
  if (!client || allInitialSets.length === 0) return;

  try {
    const { data, error } = await client
      .from(CODING_TABLE_QUESTION_SETS)
      .select('id')
      .limit(1);

    if (error) {
      console.warn('Supabase seed check warning:', error.message);
      return;
    }

    // If table has 0 rows, seed initial sets
    if (!data || data.length === 0) {
      console.info('Seeding initial question sets to Supabase...');
      for (const s of allInitialSets) {
        await saveCodingQuestionSetToDb(s);
      }
    }
  } catch (err) {
    console.warn('Supabase seed exception:', err);
  }
}

/**
 * Save / Upsert a coding assessment session to Supabase
 */
export async function saveCodingSessionToDb(
  session: CodingSessionRecord
): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      success: false,
      error: 'Supabase client is not configured. Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.'
    };
  }

  try {
    const { error } = await client.from(CODING_TABLE_SESSIONS).upsert({
      id: session.id,
      candidate_name: session.candidate_name,
      candidate_email: session.candidate_email || null,
      language: session.language,
      set_id: session.set_id || null,
      set_name: session.set_name,
      duration_minutes: session.duration_minutes,
      time_spent_seconds: session.time_spent_seconds,
      overall_score: session.overall_score,
      status: session.status,
      code_submissions: session.code_submissions || {},
      question_results: session.question_results || [],
      created_at: session.created_at || new Date().toISOString(),
      completed_at: session.completed_at || null,
    });

    if (error) {
      console.warn('Supabase saveCodingSession error:', error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    console.warn('Supabase saveCodingSession exception:', err);
    return { success: false, error: err?.message || 'Database error saving session' };
  }
}

/**
 * Update active coding session in Supabase (e.g. intermediate run test cases or progress)
 */
export async function updateCodingSessionInDb(
  sessionId: string,
  updates: Partial<CodingSessionRecord>
): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client || !sessionId) return false;

  try {
    const payload: Record<string, any> = {};
    if (updates.candidate_name !== undefined) payload.candidate_name = updates.candidate_name;
    if (updates.candidate_email !== undefined) payload.candidate_email = updates.candidate_email;
    if (updates.time_spent_seconds !== undefined) payload.time_spent_seconds = updates.time_spent_seconds;
    if (updates.overall_score !== undefined) payload.overall_score = updates.overall_score;
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.code_submissions !== undefined) payload.code_submissions = updates.code_submissions;
    if (updates.question_results !== undefined) payload.question_results = updates.question_results;
    if (updates.completed_at !== undefined) payload.completed_at = updates.completed_at;

    const { error } = await client
      .from(CODING_TABLE_SESSIONS)
      .update(payload)
      .eq('id', sessionId);

    if (error) {
      console.warn('Supabase updateCodingSession error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase updateCodingSession exception:', err);
    return false;
  }
}

/**
 * Delete a coding session from Supabase
 */
export async function deleteCodingSessionFromDb(sessionId: string): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client || !sessionId) return false;

  try {
    const { error } = await client
      .from(CODING_TABLE_SESSIONS)
      .delete()
      .eq('id', sessionId);

    if (error) {
      console.warn('Supabase deleteCodingSession error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase deleteCodingSession exception:', err);
    return false;
  }
}

/**
 * Fetch all coding sessions from Supabase
 */
export async function fetchCodingSessionsFromDb(): Promise<CodingSessionRecord[]> {
  const client = getSupabaseClient();
  if (!client) return [];

  try {
    const { data, error } = await client
      .from(CODING_TABLE_SESSIONS)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase fetchCodingSessions error:', error.message);
      return [];
    }

    if (!data) return [];

    return data.map((row: any) => ({
      id: row.id,
      candidate_name: row.candidate_name,
      candidate_email: row.candidate_email || undefined,
      language: row.language as 'java' | 'python',
      set_id: row.set_id || undefined,
      set_name: row.set_name,
      duration_minutes: row.duration_minutes,
      time_spent_seconds: row.time_spent_seconds,
      overall_score: Number(row.overall_score) || 0,
      status: row.status as 'in_progress' | 'completed' | 'timed_out',
      code_submissions: row.code_submissions || {},
      question_results: Array.isArray(row.question_results) ? row.question_results : [],
      created_at: row.created_at,
      completed_at: row.completed_at,
    }));
  } catch (err) {
    console.warn('Supabase fetchCodingSessions exception:', err);
    return [];
  }
}

/**
 * Helper to convert a CodingSessionRecord into an InterviewReport
 */
export function codingSessionToInterviewReport(session: CodingSessionRecord): InterviewReport {
  const finalScore = Number(session.overall_score) || 0;
  let recommendation: 'Strong Hire' | 'Hire' | 'Borderline' | 'No Hire' = 'No Hire';
  if (finalScore >= 85) recommendation = 'Strong Hire';
  else if (finalScore >= 70) recommendation = 'Hire';
  else if (finalScore >= 50) recommendation = 'Borderline';

  const qResults = session.question_results || [];
  const solvedCount = qResults.filter((q) => q.status === 'Solved').length;
  const partialCount = qResults.filter((q) => q.status === 'Partial').length;
  const failedCount = qResults.filter((q) => q.status === 'Failed').length;
  const unattemptedCount = qResults.filter((q) => q.status === 'Not Attempted').length;
  const attemptedCount = solvedCount + partialCount + failedCount;

  let totalTests = 0;
  let passedTests = 0;
  qResults.forEach((q) => {
    totalTests += q.totalTestCases || 0;
    passedTests += q.passedCount || 0;
  });
  const failedTestCasesCount = Math.max(0, totalTests - passedTests);

  const durationSec = (session.duration_minutes || 30) * 60;
  const timeSpentSec = session.time_spent_seconds || 0;
  const timeRemainingSec = Math.max(0, durationSec - timeSpentSec);

  const submissionTime = session.completed_at
    ? new Date(session.completed_at).toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short'
      })
    : new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });

  const codingReportData: CodingReportData = {
    totalQuestions: qResults.length,
    attemptedQuestions: attemptedCount,
    solvedQuestions: solvedCount,
    partiallySolvedQuestions: partialCount,
    failedQuestions: failedCount,
    totalTestCases: totalTests,
    passedTestCases: passedTests,
    failedTestCases: failedTestCasesCount,
    totalTimeLimitSeconds: durationSec,
    timeSpentSeconds: timeSpentSec,
    timeRemainingSeconds: timeRemainingSec,
    submissionTime,
    questionResults: qResults
  };

  return {
    id: session.id,
    candidateName: session.candidate_name,
    candidateEmail: session.candidate_email,
    roleName: `${session.language === 'python' ? 'Python' : 'Java'} Coding Assessment (${session.set_name})`,
    experienceLevel: 'Mid',
    assessmentType: 'coding',
    completedAt: session.completed_at || session.created_at || new Date().toISOString(),
    totalTimeSpentSeconds: timeSpentSec,
    overallScore: finalScore,
    recommendation,
    summary: `Candidate ${session.candidate_name} completed ${session.language === 'python' ? 'Python' : 'Java'} coding assessment (${session.set_name}). Passed ${passedTests} of ${totalTests} test cases (${finalScore}%). Solved ${solvedCount} of ${qResults.length} questions. Overall evaluation: ${recommendation}.`,
    strengths: qResults.filter((q) => q.status === 'Solved').map((q) => `Fully solved "${q.questionTitle}" passing all test assertions.`),
    weaknesses: qResults.filter((q) => q.status !== 'Solved').map((q) => `${q.status === 'Not Attempted' ? 'Did not attempt' : 'Partial / Failed'} "${q.questionTitle}" (${q.passedCount}/${q.totalTestCases} test cases passed).`),
    categoryBreakdown: [
      {
        category: 'domain',
        categoryName: `${session.language === 'python' ? 'Python' : 'Java'} Problem Solving`,
        score: finalScore,
        questionsAnswered: qResults.length,
        easyCount: qResults.filter((q) => q.difficulty === 'easy').length,
        mediumCount: qResults.filter((q) => q.difficulty === 'medium').length,
        hardCount: qResults.filter((q) => q.difficulty === 'hard').length
      }
    ],
    followUpQuestionsForInterviewer: [
      'Ask the candidate to explain their time and space complexity analysis for their implemented solution.',
      'Discuss edge case handling, constraint validation, and memory efficiency under heavy workloads.'
    ],
    questionSessions: [],
    codingReportData
  };
}

/**
 * Fetch all completed coding reports directly from Supabase coding_sessions table
 */
export async function fetchCompletedCodingReportsFromDb(): Promise<{
  success: boolean;
  reports: InterviewReport[];
  error?: string;
}> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      success: false,
      reports: [],
      error: 'Supabase client is not initialized or configured.'
    };
  }

  try {
    const { data, error } = await client
      .from(CODING_TABLE_SESSIONS)
      .select('*')
      .eq('status', 'completed')
      .order('completed_at', { ascending: false });

    if (error) {
      console.warn('Supabase fetchCompletedCodingReports error:', error.message);
      return {
        success: false,
        reports: [],
        error: error.message
      };
    }

    if (!data || data.length === 0) {
      return { success: true, reports: [] };
    }

    const reports: InterviewReport[] = data.map((row: any) => {
      const sessionRecord: CodingSessionRecord = {
        id: row.id,
        candidate_name: row.candidate_name,
        candidate_email: row.candidate_email || undefined,
        language: row.language as 'java' | 'python',
        set_id: row.set_id || undefined,
        set_name: row.set_name,
        duration_minutes: row.duration_minutes,
        time_spent_seconds: row.time_spent_seconds,
        overall_score: Number(row.overall_score) || 0,
        status: row.status,
        code_submissions: row.code_submissions || {},
        question_results: Array.isArray(row.question_results) ? row.question_results : [],
        created_at: row.created_at,
        completed_at: row.completed_at,
      };
      return codingSessionToInterviewReport(sessionRecord);
    });

    return { success: true, reports };
  } catch (err: any) {
    console.warn('Supabase fetchCompletedCodingReports exception:', err);
    return {
      success: false,
      reports: [],
      error: err?.message || 'Failed to query completed reports from database'
    };
  }
}

/**
 * Generate a cryptographically secure, clean candidate token (e.g. 'cd-9a8b7c6d5e')
 */
export function generateSecureAssessmentToken(): string {
  try {
    const array = new Uint8Array(6);
    window.crypto.getRandomValues(array);
    const randomHex = Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
    return `cd-${randomHex}`;
  } catch {
    return `cd-${Math.random().toString(36).substring(2, 10)}${Date.now().toString(36).substring(4)}`;
  }
}

/**
 * Build the full candidate test URL
 */
export function buildCandidateAssessmentUrl(token: string): string {
  const origin = window.location.origin;
  return `${origin}/test/${token}`;
}

/**
 * Save / Publish a new coding assessment strictly to Supabase (sole source of truth)
 */
export async function createCodingAssessmentInDb(
  assessment: CodingAssessmentRecord
): Promise<{ success: boolean; assessment?: CodingAssessmentRecord; error?: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      success: false,
      error: 'Supabase is not configured or connected. Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.'
    };
  }

  try {
    const { error } = await client.from(CODING_TABLE_ASSESSMENTS).upsert({
      id: assessment.id,
      token: assessment.token,
      title: assessment.title,
      language: assessment.language,
      set_id: assessment.set_id || null,
      set_name: assessment.set_name,
      questions: assessment.questions || [],
      duration_minutes: assessment.duration_minutes,
      candidate_name: assessment.candidate_name || null,
      candidate_email: assessment.candidate_email || null,
      status: assessment.status || 'active',
      created_at: assessment.created_at || new Date().toISOString(),
    });

    if (error) {
      console.warn('Supabase createCodingAssessment error:', error.message);
      return { success: false, error: error.message };
    }
    return { success: true, assessment };
  } catch (err: any) {
    console.warn('Supabase createCodingAssessment exception:', err);
    return { success: false, error: err?.message || 'Database error creating assessment' };
  }
}

/**
 * Fetch and validate an assessment strictly by candidate token from Supabase
 */
export async function fetchCodingAssessmentByToken(
  token: string
): Promise<{ valid: boolean; assessment: CodingAssessmentRecord | null; error?: string }> {
  const cleanToken = (token || '').trim();
  if (!cleanToken) {
    return { valid: false, assessment: null, error: 'Token is missing or empty' };
  }

  const client = getSupabaseClient();
  if (!client) {
    return {
      valid: false,
      assessment: null,
      error: 'Supabase database is not connected. Unable to retrieve assessment.'
    };
  }

  try {
    const { data, error } = await client
      .from(CODING_TABLE_ASSESSMENTS)
      .select('*')
      .eq('token', cleanToken)
      .maybeSingle();

    if (error) {
      console.warn('Supabase query error for token:', cleanToken, error.message);
      return {
        valid: false,
        assessment: null,
        error: `Supabase query error: ${error.message}`
      };
    }

    if (!data) {
      return {
        valid: false,
        assessment: null,
        error: 'Assessment link not found or invalid. No assessment matching this token exists in the database.'
      };
    }

    const record: CodingAssessmentRecord = {
      id: data.id,
      token: data.token,
      title: data.title,
      language: data.language as 'java' | 'python',
      set_id: data.set_id || undefined,
      set_name: data.set_name,
      questions: Array.isArray(data.questions) ? data.questions : [],
      duration_minutes: data.duration_minutes || 30,
      candidate_name: data.candidate_name || undefined,
      candidate_email: data.candidate_email || undefined,
      status: (data.status as 'active' | 'completed' | 'expired') || 'active',
      created_at: data.created_at,
    };

    if (record.status !== 'active') {
      return {
        valid: false,
        assessment: record,
        error: `This assessment link has already been marked as ${record.status}.`,
      };
    }

    return { valid: true, assessment: record };
  } catch (err: any) {
    console.warn('Error fetching assessment from Supabase by token:', err);
    return {
      valid: false,
      assessment: null,
      error: `Failed to fetch assessment: ${err?.message || 'Database connection failure'}`
    };
  }
}

/**
 * Mark assessment as completed or expired strictly in Supabase
 */
export async function updateCodingAssessmentStatus(
  token: string,
  status: 'active' | 'completed' | 'expired'
): Promise<{ success: boolean; error?: string }> {
  const cleanToken = (token || '').trim();
  if (!cleanToken) return { success: false, error: 'Empty token' };

  const client = getSupabaseClient();
  if (!client) {
    return { success: false, error: 'Supabase client not configured' };
  }

  try {
    const { error } = await client
      .from(CODING_TABLE_ASSESSMENTS)
      .update({ status })
      .eq('token', cleanToken);

    if (error) {
      console.warn('Supabase updateCodingAssessmentStatus error:', error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    console.warn('Supabase updateCodingAssessmentStatus exception:', err);
    return { success: false, error: err?.message || 'Database error updating status' };
  }
}

