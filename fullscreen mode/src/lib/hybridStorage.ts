import { HybridQuestionSet, HybridAssessmentRecord, InterviewReport, RoleQuestionPool } from '../types';
import { getSupabaseClient } from './supabase';
import { DEFAULT_PYTHON_QUESTIONS } from '../data/pythonQuestions';
import { DEFAULT_JAVA_QUESTIONS } from '../data/javaQuestions';

const STORAGE_KEY_HYBRID_SETS = 'hybrid_question_sets_v1';
const STORAGE_KEY_HYBRID_ASSESSMENTS = 'hybrid_assessments_v1';

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

export function fetchHybridSetsFromStorage(): HybridQuestionSet[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_HYBRID_SETS);
    if (raw === null) {
      localStorage.setItem(STORAGE_KEY_HYBRID_SETS, JSON.stringify(PRESET_HYBRID_SETS));
      return PRESET_HYBRID_SETS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
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
}

export function deleteHybridSetFromStorage(setId: string): void {
  try {
    const existing = fetchHybridSetsFromStorage();
    const filtered = existing.filter((s) => s.id !== setId);
    localStorage.setItem(STORAGE_KEY_HYBRID_SETS, JSON.stringify(filtered));
  } catch (err) {
    console.warn('Error deleting hybrid set from storage:', err);
  }
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

