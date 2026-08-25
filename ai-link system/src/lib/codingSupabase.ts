import { getSupabaseClient, isSupabaseConfigured } from './supabase';
import { CodingQuestionSet, CodingSessionRecord, CodingAssessmentRecord } from '../types';

export const CODING_TABLE_QUESTION_SETS = 'coding_question_sets';
export const CODING_TABLE_SESSIONS = 'coding_sessions';
export const CODING_TABLE_ASSESSMENTS = 'coding_assessments';

const LOCAL_ASSESSMENTS_KEY = 'hireai_coding_assessments';

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
export async function saveCodingSessionToDb(session: CodingSessionRecord): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

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
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase saveCodingSession exception:', err);
    return false;
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
 * Save / Publish a new coding assessment to Supabase (and local cache)
 */
export async function createCodingAssessmentInDb(
  assessment: CodingAssessmentRecord
): Promise<{ success: boolean; assessment: CodingAssessmentRecord }> {
  // Always cache locally as fallback
  try {
    const existing = JSON.parse(localStorage.getItem(LOCAL_ASSESSMENTS_KEY) || '[]');
    const filtered = existing.filter((a: any) => a.id !== assessment.id && a.token !== assessment.token);
    localStorage.setItem(LOCAL_ASSESSMENTS_KEY, JSON.stringify([assessment, ...filtered]));
  } catch (err) {
    console.warn('Could not cache assessment locally:', err);
  }

  const client = getSupabaseClient();
  if (!client) {
    return { success: true, assessment };
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
      // Still return true because local copy exists
      return { success: true, assessment };
    }
    return { success: true, assessment };
  } catch (err) {
    console.warn('Supabase createCodingAssessment exception:', err);
    return { success: true, assessment };
  }
}

/**
 * Fetch and validate an assessment by candidate token
 */
export async function fetchCodingAssessmentByToken(
  token: string
): Promise<{ valid: boolean; assessment: CodingAssessmentRecord | null; error?: string }> {
  const cleanToken = (token || '').trim();
  if (!cleanToken) {
    return { valid: false, assessment: null, error: 'Token is missing or empty' };
  }

  // 1. Try Supabase first if configured
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client
        .from(CODING_TABLE_ASSESSMENTS)
        .select('*')
        .eq('token', cleanToken)
        .maybeSingle();

      if (!error && data) {
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
            error: `This assessment link is ${record.status}.`,
          };
        }

        return { valid: true, assessment: record };
      }
    } catch (err) {
      console.warn('Error fetching assessment from Supabase by token:', err);
    }
  }

  // 2. Check local storage fallback
  try {
    const local = localStorage.getItem(LOCAL_ASSESSMENTS_KEY);
    if (local) {
      const parsed: CodingAssessmentRecord[] = JSON.parse(local);
      const match = parsed.find((a) => a.token === cleanToken);
      if (match) {
        if (match.status !== 'active') {
          return {
            valid: false,
            assessment: match,
            error: `This assessment link is ${match.status}.`,
          };
        }
        return { valid: true, assessment: match };
      }
    }
  } catch (err) {
    console.warn('Error fetching local assessment by token:', err);
  }

  return { valid: false, assessment: null, error: 'Assessment token not found or invalid.' };
}

/**
 * Mark assessment as completed or expired in Supabase & Local Cache
 */
export async function updateCodingAssessmentStatus(
  token: string,
  status: 'active' | 'completed' | 'expired'
): Promise<boolean> {
  const cleanToken = (token || '').trim();
  if (!cleanToken) return false;

  // Local storage update
  try {
    const local = localStorage.getItem(LOCAL_ASSESSMENTS_KEY);
    if (local) {
      const parsed: CodingAssessmentRecord[] = JSON.parse(local);
      const updated = parsed.map((a) => (a.token === cleanToken ? { ...a, status } : a));
      localStorage.setItem(LOCAL_ASSESSMENTS_KEY, JSON.stringify(updated));
    }
  } catch (err) {
    console.warn('Local storage update error for assessment:', err);
  }

  // Supabase update
  const client = getSupabaseClient();
  if (!client) return true;

  try {
    const { error } = await client
      .from(CODING_TABLE_ASSESSMENTS)
      .update({ status })
      .eq('token', cleanToken);

    if (error) {
      console.warn('Supabase updateCodingAssessmentStatus error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase updateCodingAssessmentStatus exception:', err);
    return false;
  }
}

