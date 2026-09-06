import React, { useState, useEffect } from 'react';
import {
  Layers,
  HelpCircle,
  Code2,
  Plus,
  Trash2,
  Database,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import {
  HybridQuestionSet,
  HybridMCQQuestion,
  JavaCodingQuestion,
  RoleQuestionPool
} from '../../types';
import { TimeInput } from './TimeInput';
import { AddCustomMCQModal } from './AddCustomMCQModal';
import { ImportMCQModal } from './ImportMCQModal';
import { AddCustomCodingModal } from './AddCustomCodingModal';
import { ImportCodingModal } from './ImportCodingModal';

interface HybridSetBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveSet: (set: HybridQuestionSet) => void;
  initialSet?: HybridQuestionSet | null;
  pools: RoleQuestionPool[];
}

export const HybridSetBuilderModal: React.FC<HybridSetBuilderModalProps> = ({
  isOpen,
  onClose,
  onSaveSet,
  initialSet,
  pools
}) => {
  const [title, setTitle] = useState(initialSet?.title || '');
  const [description, setDescription] = useState(initialSet?.description || '');
  const [codingLanguage, setCodingLanguage] = useState<'java' | 'python'>(
    initialSet?.codingLanguage || 'java'
  );

  // Timers in seconds
  const [mcqDurationSeconds, setMcqDurationSeconds] = useState<number>(
    initialSet?.mcqDurationSeconds ?? 600 // 10:00 default
  );
  const [intervalCountdownSeconds, setIntervalCountdownSeconds] = useState<number>(
    initialSet?.intervalCountdownSeconds ?? 15 // 00:15 default
  );
  const [codingDurationSeconds, setCodingDurationSeconds] = useState<number>(
    initialSet?.codingDurationSeconds ?? 1800 // 30:00 default
  );

  // Questions in this set
  const [mcqQuestions, setMcqQuestions] = useState<HybridMCQQuestion[]>(
    initialSet?.mcqQuestions ? [...initialSet.mcqQuestions] : []
  );
  const [codingQuestions, setCodingQuestions] = useState<JavaCodingQuestion[]>(
    initialSet?.codingQuestions ? [...initialSet.codingQuestions] : []
  );

  // Sub-modals
  const [showAddMCQ, setShowAddMCQ] = useState(false);
  const [showImportMCQ, setShowImportMCQ] = useState(false);
  const [showAddCoding, setShowAddCoding] = useState(false);
  const [showImportCoding, setShowImportCoding] = useState(false);

  const [error, setError] = useState('');

  // Sync state when editing a set or opening/closing modal
  useEffect(() => {
    if (isOpen) {
      setTitle(initialSet?.title || '');
      setDescription(initialSet?.description || '');
      setCodingLanguage(initialSet?.codingLanguage || 'java');
      setMcqDurationSeconds(initialSet?.mcqDurationSeconds ?? 600);
      setIntervalCountdownSeconds(initialSet?.intervalCountdownSeconds ?? 15);
      setCodingDurationSeconds(initialSet?.codingDurationSeconds ?? 1800);
      setMcqQuestions(initialSet?.mcqQuestions ? [...initialSet.mcqQuestions] : []);
      setCodingQuestions(initialSet?.codingQuestions ? [...initialSet.codingQuestions] : []);
      setError('');
    }
  }, [initialSet, isOpen]);

  if (!isOpen) return null;

  const handleAddMCQ = (newQ: HybridMCQQuestion) => {
    setMcqQuestions((prev) => [...prev, newQ]);
  };

  const handleImportMCQs = (imported: HybridMCQQuestion[]) => {
    setMcqQuestions((prev) => [...prev, ...imported]);
  };

  const handleRemoveMCQ = (id: string) => {
    setMcqQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const handleAddCoding = (newQ: JavaCodingQuestion) => {
    setCodingQuestions((prev) => [...prev, newQ]);
  };

  const handleImportCoding = (imported: JavaCodingQuestion[]) => {
    setCodingQuestions((prev) => [...prev, ...imported]);
  };

  const handleRemoveCoding = (id: string) => {
    setCodingQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const handleSave = () => {
    if (!title.trim()) {
      setError('Please provide a name for this Assessment Set.');
      return;
    }

    if (mcqQuestions.length === 0 && codingQuestions.length === 0) {
      setError('Please add at least one MCQ or Coding question to this set.');
      return;
    }

    const set: HybridQuestionSet = {
      id: initialSet?.id || `hybrid-set-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      createdAt: initialSet?.createdAt || new Date().toISOString(),
      mcqDurationSeconds,
      intervalCountdownSeconds,
      codingDurationSeconds,
      codingLanguage,
      mcqQuestions,
      codingQuestions
    };

    onSaveSet(set);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-[#101014] border border-white/10 rounded-2xl max-w-4xl w-full p-6 space-y-6 shadow-2xl text-slate-100 max-h-[92vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shadow-inner">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">
                  {initialSet ? 'Edit Assessment Set' : 'Create Assessment Set'}
                </h2>
                <p className="text-xs text-slate-400">
                  MCQ knowledge round + live coding sandbox with customizable timers and interval transitions.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-all"
            >
              ✕
            </button>
          </div>

          {error && (
            <div className="flex items-center space-x-2 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Scrollable Form Body */}
          <div className="flex-1 overflow-y-auto space-y-6 pr-1">
            {/* Meta Information */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-black/40 p-4 rounded-xl border border-white/5">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-semibold text-slate-200">
                  Set Title <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Senior Java Fullstack Assessment (MCQ + Coding)"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setError('');
                  }}
                  className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-200">
                  Coding Language Target
                </label>
                <div className="grid grid-cols-2 gap-1.5 bg-black/60 p-1 rounded-xl border border-white/10">
                  <button
                    type="button"
                    onClick={() => setCodingLanguage('java')}
                    className={`py-1 text-xs rounded-lg font-medium transition-all ${
                      codingLanguage === 'java'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Java
                  </button>
                  <button
                    type="button"
                    onClick={() => setCodingLanguage('python')}
                    className={`py-1 text-xs rounded-lg font-medium transition-all ${
                      codingLanguage === 'python'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Python
                  </button>
                </div>
              </div>

              <div className="sm:col-span-3 space-y-1">
                <label className="text-xs font-semibold text-slate-200">
                  Description <span className="text-slate-500 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Evaluates core concepts, multithreading, and algorithmic execution..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Editable Timers (00:00 format - No dropdowns!) */}
            <div className="bg-black/40 p-4 rounded-xl border border-white/5 space-y-3">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <div>
                  <h3 className="font-bold text-xs text-white">Section Timers & Interval Control</h3>
                  <p className="text-[11px] text-slate-400">
                    All timers are fully editable in <code className="text-indigo-300">MM:SS</code> format without fixed dropdown restrictions.
                  </p>
                </div>
                <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                  Configurable
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <TimeInput
                  id="mcq-timer-input"
                  label="1. MCQ Section Timer"
                  sublabel="Duration for MCQs"
                  valueSeconds={mcqDurationSeconds}
                  onChange={setMcqDurationSeconds}
                  minSeconds={30}
                />

                <TimeInput
                  id="interval-timer-input"
                  label="2. Transition Interval"
                  sublabel="Auto-advance countdown"
                  valueSeconds={intervalCountdownSeconds}
                  onChange={setIntervalCountdownSeconds}
                  minSeconds={5}
                  maxSeconds={300}
                />

                <TimeInput
                  id="coding-timer-input"
                  label="3. Coding Section Timer"
                  sublabel="Duration for coding"
                  valueSeconds={codingDurationSeconds}
                  onChange={setCodingDurationSeconds}
                  minSeconds={60}
                />
              </div>

              <div className="text-[11px] text-slate-400 bg-white/5 p-2.5 rounded-lg border border-white/5 flex items-center space-x-2">
                <ArrowRight className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>
                  Candidate flow: Complete MCQs within{' '}
                  <strong className="text-white font-mono">
                    {Math.floor(mcqDurationSeconds / 60)}m {mcqDurationSeconds % 60}s
                  </strong>{' '}
                  → Auto-advancing{' '}
                  <strong className="text-amber-400 font-mono">
                    {intervalCountdownSeconds}s
                  </strong>{' '}
                  interval countdown → Coding sandbox with{' '}
                  <strong className="text-white font-mono">
                    {Math.floor(codingDurationSeconds / 60)}m {codingDurationSeconds % 60}s
                  </strong>
                  .
                </span>
              </div>
            </div>

            {/* Section 1: MCQ Questions */}
            <div className="bg-black/40 p-4 rounded-xl border border-white/5 space-y-3">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <div className="flex items-center space-x-2">
                  <HelpCircle className="w-4 h-4 text-indigo-400" />
                  <h3 className="font-bold text-xs text-white">Section 1: Multiple Choice Questions</h3>
                  <span className="text-[10px] font-mono text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                    {mcqQuestions.length} {mcqQuestions.length === 1 ? 'question' : 'questions'}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowImportMCQ(true)}
                    className="flex items-center space-x-1 px-2.5 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-lg text-xs font-medium border border-white/10 transition-all"
                  >
                    <Database className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Import from Pools</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowAddMCQ(true)}
                    className="flex items-center space-x-1 px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium shadow-md shadow-indigo-600/30 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Custom MCQ</span>
                  </button>
                </div>
              </div>

              {mcqQuestions.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-xs border border-dashed border-white/5 rounded-xl space-y-1">
                  <p>No MCQ questions added yet.</p>
                  <p className="text-[11px] text-slate-600">
                    Import existing questions from your question pools, or click &quot;Add Custom MCQ&quot; to write your own.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {mcqQuestions.map((q, idx) => (
                    <div
                      key={q.id}
                      className="p-3 bg-black/60 rounded-xl border border-white/10 flex items-start justify-between space-x-3"
                    >
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-indigo-400 font-mono">
                            Q{idx + 1}.
                          </span>
                          <span className="text-xs text-white font-medium line-clamp-1">
                            {q.questionText}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-[10px] text-slate-400">
                          <span>{q.options.length} options</span>
                          <span>•</span>
                          <span className="text-emerald-400 font-medium">
                            Correct: Option {String.fromCharCode(65 + q.correctAnswerIndex)} (
                            {q.options[q.correctAnswerIndex] || 'Selected'})
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveMCQ(q.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                        title="Remove question"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Section 2: Coding Questions */}
            <div className="bg-black/40 p-4 rounded-xl border border-white/5 space-y-3">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <div className="flex items-center space-x-2">
                  <Code2 className="w-4 h-4 text-purple-400" />
                  <h3 className="font-bold text-xs text-white">Section 2: Coding Problems</h3>
                  <span className="text-[10px] font-mono text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                    {codingQuestions.length} {codingQuestions.length === 1 ? 'problem' : 'problems'}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowImportCoding(true)}
                    className="flex items-center space-x-1 px-2.5 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-lg text-xs font-medium border border-white/10 transition-all"
                  >
                    <Database className="w-3.5 h-3.5 text-purple-400" />
                    <span>Import from Sets</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowAddCoding(true)}
                    className="flex items-center space-x-1 px-2.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-medium shadow-md shadow-purple-600/30 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Custom Problem</span>
                  </button>
                </div>
              </div>

              {codingQuestions.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-xs border border-dashed border-white/5 rounded-xl space-y-1">
                  <p>No coding problems added yet.</p>
                  <p className="text-[11px] text-slate-600">
                    Import existing problems from question sets, or create a new dedicated problem.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {codingQuestions.map((q, idx) => (
                    <div
                      key={q.id}
                      className="p-3 bg-black/60 rounded-xl border border-white/10 flex items-start justify-between space-x-3"
                    >
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-purple-400 font-mono">
                            P{idx + 1}.
                          </span>
                          <span className="text-xs text-white font-medium">{q.title}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 uppercase">
                            {q.difficulty}
                          </span>
                          <span className="text-[10px] font-mono text-emerald-400">
                            {q.testCases?.length || 0} test cases
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-1">
                          {q.description}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveCoding(q.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                        title="Remove problem"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <div className="text-xs text-slate-400">
              Total Questions:{' '}
              <strong className="text-white">
                {mcqQuestions.length} MCQs + {codingQuestions.length} Coding
              </strong>
            </div>

            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-xs font-semibold transition-all border border-white/10"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all flex items-center space-x-1.5"
              >
                <span>Save Assessment Set</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-modals */}
      <AddCustomMCQModal
        isOpen={showAddMCQ}
        onClose={() => setShowAddMCQ(false)}
        onAddQuestion={handleAddMCQ}
      />

      <ImportMCQModal
        isOpen={showImportMCQ}
        onClose={() => setShowImportMCQ(false)}
        pools={pools}
        onImportQuestions={handleImportMCQs}
      />

      <AddCustomCodingModal
        isOpen={showAddCoding}
        onClose={() => setShowAddCoding(false)}
        language={codingLanguage}
        onAddQuestion={handleAddCoding}
      />

      <ImportCodingModal
        isOpen={showImportCoding}
        onClose={() => setShowImportCoding(false)}
        language={codingLanguage}
        onImportQuestions={handleImportCoding}
      />
    </>
  );
};
