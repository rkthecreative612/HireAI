import { HybridQuestionSet, HybridAssessmentRecord, InterviewReport, RoleQuestionPool } from '../types';
import { getSupabaseClient } from './supabase';
import { DEFAULT_PYTHON_QUESTIONS } from '../data/pythonQuestions';
import { DEFAULT_JAVA_QUESTIONS } from '../data/javaQuestions';

export const TABLE_HYBRID_QUESTION_SETS = 'hybrid_question_sets';
const STORAGE_KEY_HYBRID_SETS = 'hybrid_question_sets_v1';
const STORAGE_KEY_HYBRID_ASSESSMENTS = 'hybrid_assessments_v1';

export const HYBRID_SETS_SCHEMA_SQL = `
-- Create hybrid_question_sets table for Interview Mode Assessment Sets
CREATE TABLE IF NOT EXISTS public.hybrid_question_sets (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  coding_language TEXT NOT NULL DEFAULT 'python',
  mcq_duration_seconds INTEGER NOT NULL DEFAULT 600,
  interval_countdown_seconds INTEGER NOT NULL DEFAULT 15,
  coding_duration_seconds INTEGER NOT NULL DEFAULT 1800,
  mcq_questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  coding_questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security (RLS) and allow public read/write
ALTER TABLE public.hybrid_question_sets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public all on hybrid_question_sets"
  ON public.hybrid_question_sets
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

GRANT ALL ON public.hybrid_question_sets TO anon, authenticated;
GRANT USAGE ON SCHEMA public TO anon, authenticated;
`;

export function secondsToMMSS(totalSeconds: number): string {
  if (isNaN(totalSeconds) || totalSeconds < 0) return '00:00';
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function mmssToSeconds(mmss: string): number {
  if (!mmss || typeof mmss !== 'string') return 0;
  const parts = mmss.trim().split(':');
  if (parts.length === 1) {
    const num = parseInt(parts[0], 10);
    return isNaN(num) ? 0 : Math.max(0, num * 60);
  }
  const mins = parseInt(parts[0], 10) || 0;
  const secs = parseInt(parts[1], 10) || 0;
  return Math.max(0, mins * 60 + secs);
}

export const PRESET_HYBRID_SETS: HybridQuestionSet[] = [
  {
    id: 'hybrid-set-fullstack-java',
    title: 'Full-Stack Developer Screening (Java + Core MCQ)',
    description: 'Combines multiple-choice fundamental knowledge evaluation with hands-on Java problem solving.',
    createdAt: new Date().toISOString(),
    mcqDurationSeconds: 600, // 10:00
    intervalCountdownSeconds: 15, // 00:15
    codingDurationSeconds: 1800, // 30:00
    codingLanguage: 'java',
    mcqQuestions: [
      {
        id: 'hmcq-java-1',
        questionText: 'Which of the following statements is true regarding Java memory management?',
        options: [
          'Garbage Collection guarantees immediate memory reclamation when an object becomes unreachable.',
          'Objects created with new are allocated on the Heap, while local primitive references reside on the Stack.',
          'The finalize() method is always executed before any memory deallocation in modern JVMs.',
          'Static variables are stored on the thread execution Stack.'
        ],
        correctAnswerIndex: 1,
        difficulty: 'medium',
        category: 'domain'
      },
      {
        id: 'hmcq-java-2',
        questionText: 'What is the time complexity of searching an element in a balanced Binary Search Tree (AVL/Red-Black)?',
        options: [
          'O(1)',
          'O(n)',
          'O(log n)',
          'O(n log n)'
        ],
        correctAnswerIndex: 2,
        difficulty: 'easy',
        category: 'domain'
      },
      {
        id: 'hmcq-java-3',
        questionText: 'In Java concurrency, what is the primary purpose of the volatile keyword?',
        options: [
          'It provides mutual exclusion and acts as a lightweight synchronized block.',
          'It ensures visibility of changes to variables across threads by preventing CPU caching.',
          'It makes compound operations like counter++ atomic.',
          'It forces the JVM to run garbage collection on stale thread memories.'
        ],
        correctAnswerIndex: 1,
        difficulty: 'hard',
        category: 'domain'
      },
      {
        id: 'hmcq-java-4',
        questionText: 'Which HTTP status code is most appropriate when a requested resource is permanently moved to a new URI?',
        options: [
          '301 Moved Permanently',
          '302 Found',
          '307 Temporary Redirect',
          '404 Not Found'
        ],
        correctAnswerIndex: 0,
        difficulty: 'easy',
        category: 'basic'
      }
    ],
    codingQuestions: [
      DEFAULT_JAVA_QUESTIONS[0],
      DEFAULT_JAVA_QUESTIONS[1]
    ]
  },
  {
    id: 'hybrid-set-python-backend',
    title: 'Python Backend Engineer (Algorithms + Python MCQ)',
    description: 'Assesses Python language mechanics, data structures, and algorithmic execution with live stdin/stdout tests.',
    createdAt: new Date().toISOString(),
    mcqDurationSeconds: 600, // 10:00
    intervalCountdownSeconds: 15, // 00:15
    codingDurationSeconds: 1800, // 30:00
    codingLanguage: 'python',
    mcqQuestions: [
      {
        id: 'hmcq-py-1',
        questionText: 'What is the key difference between a Python list and a Python tuple?',
        options: [
          'Lists are immutable, while tuples are mutable.',
          'Tuples are immutable, while lists are mutable.',
          'Lists can only store integers, while tuples can store mixed types.',
          'Tuples cannot be used as dictionary keys under any circumstances.'
        ],
        correctAnswerIndex: 1,
        difficulty: 'easy',
        category: 'basic'
      },
      {
        id: 'hmcq-py-2',
        questionText: 'How does Python handle default arguments in function definitions like def append_to(val, lst=[]): ?',
        options: [
          'A fresh new list is created every time the function is called.',
          'The default list is evaluated once at function definition time and mutated across subsequent calls.',
          'Python throws a SyntaxError on mutable default arguments.',
          'The list is automatically converted to an immutable tuple.'
        ],
        correctAnswerIndex: 1,
        difficulty: 'medium',
        category: 'domain'
      },
      {
        id: 'hmcq-py-3',
        questionText: 'What is the average time complexity of checking key existence in a Python dictionary (key in dict)?',
        options: [
          'O(n)',
          'O(log n)',
          'O(1)',
          'O(n^2)'
        ],
        correctAnswerIndex: 2,
        difficulty: 'easy',
        category: 'basic'
      },
      {
        id: 'hmcq-py-4',
        questionText: 'What does the Global Interpreter Lock (GIL) in CPython prevent?',
        options: [
          'It prevents multiple native threads from executing Python bytecodes simultaneously in one process.',
          'It prevents multiprocessing from utilizing multiple CPU cores.',
          'It prevents asynchronous IO with asyncio from running concurrently.',
          'It stops infinite recursion in recursive functions.'
        ],
        correctAnswerIndex: 0,
        difficulty: 'hard',
        category: 'domain'
      }
    ],
    codingQuestions: [
      DEFAULT_PYTHON_QUESTIONS[0],
      DEFAULT_PYTHON_QUESTIONS[1]
    ]
  }
];

/**
 * Fetch hybrid question sets from Supabase database
 */
export async function fetchHybridSetsFromDb(): Promise<HybridQuestionSet[] | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from(TABLE_HYBRID_QUESTION_SETS)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase fetchHybridSets error:', error.message);
      return null;
    }

    if (!data || data.length === 0) {
      return [];
    }

    return data.map((row: any) => ({
      id: row.id,
      title: row.title,
      description: row.description || '',
      codingLanguage: (row.coding_language as 'java' | 'python') || 'python',
      mcqDurationSeconds: row.mcq_duration_seconds ?? 600,
      intervalCountdownSeconds: row.interval_countdown_seconds ?? 15,
      codingDurationSeconds: row.coding_duration_seconds ?? 1800,
      mcqQuestions: Array.isArray(row.mcq_questions) ? row.mcq_questions : [],
      codingQuestions: Array.isArray(row.coding_questions) ? row.coding_questions : [],
      createdAt: row.created_at || new Date().toISOString()
    }));
  } catch (err) {
    console.warn('Supabase fetchHybridSets exception:', err);
    return null;
  }
}

/**
 * Seed initial preset hybrid question sets into Supabase if table is empty
 */
export async function seedInitialHybridSetsIfEmpty(presets: HybridQuestionSet[]): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client || !presets || presets.length === 0) return false;

  try {
    const { count, error: countError } = await client
      .from(TABLE_HYBRID_QUESTION_SETS)
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.warn('Could not check hybrid_question_sets count:', countError.message);
      return false;
    }

    if (count === 0) {
      const rows = presets.map((s) => ({
        id: s.id,
        title: s.title,
        description: s.description || '',
        coding_language: s.codingLanguage || 'python',
        mcq_duration_seconds: s.mcqDurationSeconds ?? 600,
        interval_countdown_seconds: s.intervalCountdownSeconds ?? 15,
        coding_duration_seconds: s.codingDurationSeconds ?? 1800,
        mcq_questions: s.mcqQuestions || [],
        coding_questions: s.codingQuestions || [],
        created_at: s.createdAt || new Date().toISOString()
      }));

      const { error: insertError } = await client
        .from(TABLE_HYBRID_QUESTION_SETS)
        .insert(rows);

      if (insertError) {
        console.warn('Error seeding initial hybrid_question_sets:', insertError.message);
        return false;
      }
      return true;
    }
    return false;
  } catch (err) {
    console.warn('Exception seeding hybrid_question_sets:', err);
    return false;
  }
}

/**
 * Save / Upsert hybrid question set directly into Supabase database
 */
export async function saveHybridSetToDb(set: HybridQuestionSet): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const payload = {
      id: set.id,
      title: set.title,
      description: set.description || '',
      coding_language: set.codingLanguage || 'python',
      mcq_duration_seconds: set.mcqDurationSeconds ?? 600,
      interval_countdown_seconds: set.intervalCountdownSeconds ?? 15,
      coding_duration_seconds: set.codingDurationSeconds ?? 1800,
      mcq_questions: set.mcqQuestions || [],
      coding_questions: set.codingQuestions || [],
      created_at: set.createdAt || new Date().toISOString()
    };

    const { error } = await client
      .from(TABLE_HYBRID_QUESTION_SETS)
      .upsert(payload, { onConflict: 'id' });

    if (error) {
      console.warn('Supabase saveHybridSetToDb error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase saveHybridSetToDb exception:', err);
    return false;
  }
}

/**
 * Delete a hybrid question set from Supabase database
 */
export async function deleteHybridSetFromDb(setId: string): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client
      .from(TABLE_HYBRID_QUESTION_SETS)
      .delete()
      .eq('id', setId);

    if (error) {
      console.warn('Supabase deleteHybridSetFromDb error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase deleteHybridSetFromDb exception:', err);
    return false;
  }
}

/**
 * Async master fetch: Retrieves sets from Supabase SQL, seeds if needed,
 * updates local storage cache, and falls back to local storage if Supabase is unavailable.
 */
export async function fetchHybridSetsAsync(): Promise<HybridQuestionSet[]> {
  try {
    const dbSets = await fetchHybridSetsFromDb();
    if (dbSets !== null) {
      if (dbSets.length === 0) {
        // Table is empty, seed presets to Supabase
        await seedInitialHybridSetsIfEmpty(PRESET_HYBRID_SETS);
        const reloaded = await fetchHybridSetsFromDb();
        const finalSets = (reloaded && reloaded.length > 0) ? reloaded : PRESET_HYBRID_SETS;
        localStorage.setItem(STORAGE_KEY_HYBRID_SETS, JSON.stringify(finalSets));
        return finalSets;
      }
      // Save freshest SQL data into localStorage cache
      localStorage.setItem(STORAGE_KEY_HYBRID_SETS, JSON.stringify(dbSets));
      return dbSets;
    }
  } catch (err) {
    console.warn('Error fetching hybrid sets async from DB:', err);
  }

  // Fallback to local storage if DB is unreachable
  return fetchHybridSetsFromStorage();
}

/**
 * Async master save: Updates local cache immediately and persists to Supabase SQL.
 */
export async function saveHybridSetAsync(set: HybridQuestionSet): Promise<boolean> {
  // Update local cache
  saveHybridSetToStorage(set);
  // Persist to Supabase
  return await saveHybridSetToDb(set);
}

/**
 * Async master delete: Deletes from local cache and Supabase SQL.
 */
export async function deleteHybridSetAsync(setId: string): Promise<boolean> {
  deleteHybridSetFromStorage(setId);
  return await deleteHybridSetFromDb(setId);
}

export function fetchHybridSetsFromStorage(): HybridQuestionSet[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_HYBRID_SETS);
    if (raw === null) {
      localStorage.setItem(STORAGE_KEY_HYBRID_SETS, JSON.stringify(PRESET_HYBRID_SETS));
      return PRESET_HYBRID_SETS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return PRESET_HYBRID_SETS;
  } catch (err) {
    console.warn('Error fetching hybrid sets from storage:', err);
    return PRESET_HYBRID_SETS;
  }
}

export function saveHybridSetToStorage(set: HybridQuestionSet): void {
  try {
    const existing = fetchHybridSetsFromStorage();
    const index = existing.findIndex((s) => s.id === set.id);
    let updated: HybridQuestionSet[];
    if (index >= 0) {
      updated = [...existing];
      updated[index] = set;
    } else {
      updated = [set, ...existing];
    }
    localStorage.setItem(STORAGE_KEY_HYBRID_SETS, JSON.stringify(updated));
  } catch (err) {
    console.warn('Error saving hybrid set to storage:', err);
  }

  // Background sync to Supabase SQL
  saveHybridSetToDb(set).catch((err) => {
    console.warn('Background sync error saving hybrid set to Supabase:', err);
  });
}

export function deleteHybridSetFromStorage(setId: string): void {
  try {
    const existing = fetchHybridSetsFromStorage();
    const filtered = existing.filter((s) => s.id !== setId);
    localStorage.setItem(STORAGE_KEY_HYBRID_SETS, JSON.stringify(filtered));
  } catch (err) {
    console.warn('Error deleting hybrid set from storage:', err);
  }

  // Background sync to Supabase SQL
  deleteHybridSetFromDb(setId).catch((err) => {
    console.warn('Background sync error deleting hybrid set from Supabase:', err);
  });
}

export function generateSecureHybridToken(): string {
  try {
    const array = new Uint8Array(6);
    window.crypto.getRandomValues(array);
    const randomHex = Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
    return `hyb-${randomHex}`;
  } catch {
    return `hyb-${Math.random().toString(36).substring(2, 10)}${Date.now().toString(36).substring(4)}`;
  }
}

export function saveHybridAssessment(assessment: HybridAssessmentRecord): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_HYBRID_ASSESSMENTS);
    const existing: HybridAssessmentRecord[] = raw ? JSON.parse(raw) : [];
    const index = existing.findIndex((a) => a.id === assessment.id || a.token === assessment.token);
    let updated: HybridAssessmentRecord[];
    if (index >= 0) {
      updated = [...existing];
      updated[index] = assessment;
    } else {
      updated = [assessment, ...existing];
    }
    localStorage.setItem(STORAGE_KEY_HYBRID_ASSESSMENTS, JSON.stringify(updated));
  } catch (err) {
    console.warn('Error saving hybrid assessment to storage:', err);
  }

  // Also sync to Supabase coding_assessments if available so link works across browsers/devices
  try {
    const client = getSupabaseClient();
    if (client) {
      const payload = {
        id: assessment.id,
        token: assessment.token,
        title: assessment.title,
        language: assessment.codingLanguage,
        set_id: assessment.setId || null,
        set_name: assessment.setName,
        questions: assessment.codingQuestions.map((q, idx) =>
          idx === 0
            ? {
                ...q,
                _is_hybrid: true,
                _hybrid_mcq_questions: assessment.mcqQuestions,
                _mcq_duration_seconds: assessment.mcqDurationSeconds,
                _interval_seconds: assessment.intervalCountdownSeconds,
                _coding_duration_seconds: assessment.codingDurationSeconds,
                _proctor_enabled: assessment.proctor_enabled ?? true,
                _browser_lock_enabled: assessment.browser_lock_enabled ?? true
              }
            : q
        ),
        duration_minutes: Math.ceil((assessment.mcqDurationSeconds + assessment.codingDurationSeconds) / 60),
        candidate_name: assessment.candidateName || null,
        candidate_email: assessment.candidateEmail || null,
        status: assessment.status || 'active',
        proctor_enabled: assessment.proctor_enabled ?? true,
        created_at: assessment.createdAt
      };

      client.from('coding_assessments').upsert(payload).then(({ error }) => {
        if (error) console.warn('Hybrid assessment sync to Supabase error:', error.message);
      });
    }
  } catch (err) {
    console.warn('Supabase sync exception:', err);
  }
}

export async function fetchHybridAssessmentByToken(
  token: string
): Promise<{ valid: boolean; assessment: HybridAssessmentRecord | null; error?: string }> {
  const cleanToken = (token || '').trim();
  if (!cleanToken) return { valid: false, assessment: null, error: 'Token is missing' };

  // 1. Check local storage first
  try {
    const raw = localStorage.getItem(STORAGE_KEY_HYBRID_ASSESSMENTS);
    if (raw) {
      const existing: HybridAssessmentRecord[] = JSON.parse(raw);
      const match = existing.find((a) => a.token === cleanToken);
      if (match) {
        return { valid: true, assessment: match };
      }
    }
  } catch (err) {
    console.warn('Error reading hybrid assessments from localStorage:', err);
  }

  // 2. Check Supabase coding_assessments table
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client
        .from('coding_assessments')
        .select('*')
        .eq('token', cleanToken)
        .maybeSingle();

      if (error) {
        console.warn('Supabase query error for hybrid token:', error.message);
      } else if (data) {
        const questions = Array.isArray(data.questions) ? data.questions : [];
        const firstQMeta: any = questions[0] || {};
        if (firstQMeta._is_hybrid) {
          const record: HybridAssessmentRecord = {
            id: data.id,
            token: data.token,
            title: data.title,
            setId: data.set_id || undefined,
            setName: data.set_name,
            codingLanguage: (data.language as 'java' | 'python') || 'python',
            mcqDurationSeconds: firstQMeta._mcq_duration_seconds || 600,
            intervalCountdownSeconds: firstQMeta._interval_seconds || 15,
            codingDurationSeconds: firstQMeta._coding_duration_seconds || 1800,
            mcqQuestions: Array.isArray(firstQMeta._hybrid_mcq_questions) ? firstQMeta._hybrid_mcq_questions : [],
            codingQuestions: questions,
            candidateName: data.candidate_name || undefined,
            candidateEmail: data.candidate_email || undefined,
            status: data.status || 'active',
            proctor_enabled: Boolean(data.proctor_enabled ?? firstQMeta._proctor_enabled ?? true),
            browser_lock_enabled: Boolean(firstQMeta._browser_lock_enabled ?? true),
            createdAt: data.created_at || new Date().toISOString()
          };
          return { valid: true, assessment: record };
        }
      }
    } catch (err) {
      console.warn('Supabase hybrid fetch exception:', err);
    }
  }

  return { valid: false, assessment: null, error: 'Assessment link not found or expired.' };
}

/**
 * Update hybrid assessment status in local storage and Supabase
 */
export async function updateHybridAssessmentStatus(
  token: string,
  status: 'active' | 'in_progress' | 'completed'
): Promise<void> {
  const cleanToken = (token || '').trim();
  if (!cleanToken) return;

  // 1. Update localStorage
  try {
    const raw = localStorage.getItem(STORAGE_KEY_HYBRID_ASSESSMENTS);
    if (raw) {
      const existing: HybridAssessmentRecord[] = JSON.parse(raw);
      const updated = existing.map((rec) =>
        rec.token === cleanToken ? { ...rec, status } : rec
      );
      localStorage.setItem(STORAGE_KEY_HYBRID_ASSESSMENTS, JSON.stringify(updated));
    }
  } catch (err) {
    console.warn('Error updating hybrid assessment in localStorage:', err);
  }

  // 2. Update Supabase
  const client = getSupabaseClient();
  if (client) {
    try {
      await client
        .from('coding_assessments')
        .update({ status })
        .eq('token', cleanToken);
    } catch (err) {
      console.warn('Error updating hybrid assessment in Supabase:', err);
    }
  }
}

