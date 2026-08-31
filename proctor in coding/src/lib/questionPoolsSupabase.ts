import { getSupabaseClient, isSupabaseConfigured } from './supabase';
import { RoleQuestionPool, InterviewReport } from '../types';

export const TABLE_QUESTION_POOLS = 'question_pools';
export const TABLE_INTERVIEW_REPORTS = 'interview_reports';

/**
 * SQL DDL Schema for Question Pools & Non-coding Interview Reports in Supabase.
 * Users can run this in the Supabase SQL Editor.
 */
export const ALL_SQL_MIGRATION_SCHEMA = `
-- 1. Create question_pools table (MCQ, Descriptive & Role-specific banks)
CREATE TABLE IF NOT EXISTS public.question_pools (
  id TEXT PRIMARY KEY,
  role_name TEXT NOT NULL,
  experience_level TEXT NOT NULL DEFAULT 'Senior',
  assessment_type TEXT NOT NULL DEFAULT 'descriptive',
  description TEXT,
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create interview_reports table (Verbal, MCQ & Descriptive completed reports)
CREATE TABLE IF NOT EXISTS public.interview_reports (
  id TEXT PRIMARY KEY,
  candidate_name TEXT NOT NULL,
  candidate_email TEXT,
  role_name TEXT NOT NULL,
  experience_level TEXT NOT NULL DEFAULT 'Senior',
  assessment_type TEXT NOT NULL DEFAULT 'descriptive',
  overall_score NUMERIC NOT NULL DEFAULT 0,
  raw_technical_score NUMERIC,
  progression_bonus NUMERIC,
  progression_bonus_unlocked BOOLEAN DEFAULT false,
  recommendation TEXT NOT NULL DEFAULT 'Hire',
  summary TEXT,
  strengths JSONB NOT NULL DEFAULT '[]'::jsonb,
  weaknesses JSONB NOT NULL DEFAULT '[]'::jsonb,
  category_breakdown JSONB NOT NULL DEFAULT '[]'::jsonb,
  follow_up_questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  question_sessions JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_time_spent_seconds INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Create coding_question_sets table (Coding Questions & Sets)
CREATE TABLE IF NOT EXISTS public.coding_question_sets (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  language TEXT NOT NULL,
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.question_pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coding_question_sets ENABLE ROW LEVEL SECURITY;

-- 5. Policies for public access (Anon key)
DROP POLICY IF EXISTS "Allow public all on question_pools" ON public.question_pools;
CREATE POLICY "Allow public all on question_pools"
  ON public.question_pools FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public all on interview_reports" ON public.interview_reports;
CREATE POLICY "Allow public all on interview_reports"
  ON public.interview_reports FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public all on coding_question_sets" ON public.coding_question_sets;
CREATE POLICY "Allow public all on coding_question_sets"
  ON public.coding_question_sets FOR ALL TO public USING (true) WITH CHECK (true);

-- 6. Grant permissions to anon and authenticated roles
GRANT ALL ON TABLE public.question_pools TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.interview_reports TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.coding_question_sets TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.coding_assessments TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.coding_sessions TO anon, authenticated, service_role;
GRANT USAGE ON SCHEMA public TO anon, authenticated;
`;

/**
 * Fetch all role question pools from Supabase
 */
export async function fetchQuestionPoolsFromDb(): Promise<RoleQuestionPool[] | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from(TABLE_QUESTION_POOLS)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase fetchQuestionPools error:', error.message);
      return null;
    }

    if (!data || data.length === 0) {
      return [];
    }

    return data.map((row: any) => ({
      id: row.id,
      roleName: row.role_name,
      experienceLevel: row.experience_level,
      assessmentType: row.assessment_type || 'descriptive',
      description: row.description || '',
      createdAt: row.created_at || new Date().toISOString(),
      questions: Array.isArray(row.questions) ? row.questions : [],
    }));
  } catch (err) {
    console.warn('Supabase fetchQuestionPools exception:', err);
    return null;
  }
}

/**
 * Seed initial preset question pools into Supabase if the table is empty
 */
export async function seedInitialQuestionPoolsIfEmpty(presets: RoleQuestionPool[]): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client || !presets || presets.length === 0) return false;

  try {
    const { count, error: countError } = await client
      .from(TABLE_QUESTION_POOLS)
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.warn('Could not check question_pools count:', countError.message);
      return false;
    }

    if (count === 0) {
      const rows = presets.map((p) => ({
        id: p.id,
        role_name: p.roleName,
        experience_level: p.experienceLevel || 'Senior',
        assessment_type: p.assessmentType || 'descriptive',
        description: p.description || '',
        questions: p.questions || [],
        created_at: p.createdAt || new Date().toISOString(),
      }));

      const { error: insertError } = await client
        .from(TABLE_QUESTION_POOLS)
        .upsert(rows, { onConflict: 'id' });

      if (insertError) {
        console.warn('Error seeding preset question pools to Supabase:', insertError.message);
        return false;
      }
      return true;
    }
    return true;
  } catch (err) {
    console.warn('Exception during seeding question pools:', err);
    return false;
  }
}

/**
 * Save a question pool to Supabase
 */
export async function saveQuestionPoolToDb(pool: RoleQuestionPool): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client.from(TABLE_QUESTION_POOLS).upsert({
      id: pool.id,
      role_name: pool.roleName,
      experience_level: pool.experienceLevel,
      assessment_type: pool.assessmentType || 'descriptive',
      description: pool.description || '',
      questions: pool.questions || [],
      created_at: pool.createdAt || new Date().toISOString(),
    });

    if (error) {
      console.warn('Supabase saveQuestionPool error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase saveQuestionPool exception:', err);
    return false;
  }
}

/**
 * Delete a question pool from Supabase
 */
export async function deleteQuestionPoolFromDb(poolId: string): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client.from(TABLE_QUESTION_POOLS).delete().eq('id', poolId);
    if (error) {
      console.warn('Supabase deleteQuestionPool error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase deleteQuestionPool exception:', err);
    return false;
  }
}

/**
 * Fetch all verbal/MCQ/descriptive interview reports from Supabase
 */
export async function fetchInterviewReportsFromDb(): Promise<InterviewReport[] | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from(TABLE_INTERVIEW_REPORTS)
      .select('*')
      .order('completed_at', { ascending: false });

    if (error) {
      console.warn('Supabase fetchInterviewReports error:', error.message);
      return null;
    }

    if (!data || data.length === 0) {
      return [];
    }

    return data.map((row: any) => ({
      id: row.id,
      candidateName: row.candidate_name,
      candidateEmail: row.candidate_email || '',
      roleName: row.role_name,
      experienceLevel: row.experience_level,
      assessmentType: row.assessment_type || 'descriptive',
      overallScore: Number(row.overall_score || 0),
      rawTechnicalScore: row.raw_technical_score ? Number(row.raw_technical_score) : undefined,
      progressionBonus: row.progression_bonus ? Number(row.progression_bonus) : undefined,
      progressionBonusUnlocked: row.progression_bonus_unlocked || false,
      recommendation: row.recommendation || 'Hire',
      summary: row.summary || '',
      strengths: Array.isArray(row.strengths) ? row.strengths : [],
      weaknesses: Array.isArray(row.weaknesses) ? row.weaknesses : [],
      categoryBreakdown: Array.isArray(row.category_breakdown) ? row.category_breakdown : [],
      followUpQuestionsForInterviewer: Array.isArray(row.follow_up_questions) ? row.follow_up_questions : [],
      questionSessions: Array.isArray(row.question_sessions) ? row.question_sessions : [],
      totalTimeSpentSeconds: Number(row.total_time_spent_seconds || 0),
      completedAt: row.completed_at || new Date().toISOString(),
    }));
  } catch (err) {
    console.warn('Supabase fetchInterviewReports exception:', err);
    return null;
  }
}

/**
 * Save an interview report to Supabase
 */
export async function saveInterviewReportToDb(report: InterviewReport): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client.from(TABLE_INTERVIEW_REPORTS).upsert({
      id: report.id,
      candidate_name: report.candidateName,
      candidate_email: report.candidateEmail || null,
      role_name: report.roleName,
      experience_level: report.experienceLevel,
      assessment_type: report.assessmentType || 'descriptive',
      overall_score: report.overallScore,
      raw_technical_score: report.rawTechnicalScore || null,
      progression_bonus: report.progressionBonus || null,
      progression_bonus_unlocked: report.progressionBonusUnlocked || false,
      recommendation: report.recommendation,
      summary: report.summary,
      strengths: report.strengths || [],
      weaknesses: report.weaknesses || [],
      category_breakdown: report.categoryBreakdown || [],
      follow_up_questions: report.followUpQuestionsForInterviewer || [],
      question_sessions: report.questionSessions || [],
      total_time_spent_seconds: report.totalTimeSpentSeconds || 0,
      completed_at: report.completedAt || new Date().toISOString(),
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.warn('Supabase saveInterviewReport error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase saveInterviewReport exception:', err);
    return false;
  }
}

/**
 * Delete an interview report from Supabase
 */
export async function deleteInterviewReportFromDb(reportId: string): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client.from(TABLE_INTERVIEW_REPORTS).delete().eq('id', reportId);
    if (error) {
      console.warn('Supabase deleteInterviewReport error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase deleteInterviewReport exception:', err);
    return false;
  }
}
