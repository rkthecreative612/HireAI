import React, { useState, useEffect } from 'react';
import { Search, CheckSquare, Square, Code2, Check, Database } from 'lucide-react';
import { JavaCodingQuestion, CodingQuestionSet } from '../../types';
import { DEFAULT_JAVA_QUESTIONS } from '../../data/javaQuestions';
import { DEFAULT_PYTHON_QUESTIONS } from '../../data/pythonQuestions';
import { fetchCodingQuestionSetsFromDb } from '../../lib/codingSupabase';

interface ImportCodingModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'java' | 'python';
  onImportQuestions: (questions: JavaCodingQuestion[]) => void;
}

export const ImportCodingModal: React.FC<ImportCodingModalProps> = ({
  isOpen,
  onClose,
  language,
  onImportQuestions
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<Set<string>>(new Set());
  const [allPools, setAllPools] = useState<CodingQuestionSet[]>([]);
  const [filterLang, setFilterLang] = useState<'all' | 'java' | 'python'>(language);

  useEffect(() => {
    if (isOpen) {
      setFilterLang(language);
      fetchCodingQuestionSetsFromDb().then((sets) => {
        if (Array.isArray(sets)) {
          setAllPools(sets);
        }
      });
    }
  }, [isOpen, language]);

  if (!isOpen) return null;

  // Aggregate default questions + any custom sets from DB
  const poolQuestions: { origin: string; lang: 'java' | 'python'; q: JavaCodingQuestion }[] = [];

  // Default Java
  DEFAULT_JAVA_QUESTIONS.forEach((q) => {
    poolQuestions.push({ origin: 'Default Java Bank', lang: 'java', q });
  });

  // Default Python
  DEFAULT_PYTHON_QUESTIONS.forEach((q) => {
    poolQuestions.push({ origin: 'Default Python Bank', lang: 'python', q });
  });

  // Custom sets from DB
  allPools.forEach((set) => {
    (set.questions || []).forEach((q) => {
      // Avoid duplicate IDs if already present
      if (!poolQuestions.some((item) => item.q.id === q.id)) {
        poolQuestions.push({ origin: set.name, lang: set.language, q });
      }
    });
  });

  // Filter
  const filtered = poolQuestions.filter((item) => {
    if (filterLang !== 'all' && item.lang !== filterLang) return false;
    if (searchQuery) {
      const lower = searchQuery.toLowerCase();
      return (
        item.q.title.toLowerCase().includes(lower) ||
        item.q.description.toLowerCase().includes(lower)
      );
    }
    return true;
  });

  const toggleSelect = (id: string) => {
    setSelectedQuestionIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedQuestionIds.size === filtered.length) {
      setSelectedQuestionIds(new Set());
    } else {
      setSelectedQuestionIds(new Set(filtered.map((item) => item.q.id)));
    }
  };

  const handleImport = () => {
    const imported: JavaCodingQuestion[] = [];
    filtered.forEach(({ q }) => {
      if (selectedQuestionIds.has(q.id)) {
        // Deep copy with a unique ID so original set is completely safe and undisturbed!
        const cloned: JavaCodingQuestion = {
          ...q,
          id: `coding-cloned-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          testCases: (q.testCases || []).map((tc) => ({
            ...tc,
            id: `tc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
          }))
        };
        imported.push(cloned);
      }
    });

    onImportQuestions(imported);
    setSelectedQuestionIds(new Set());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#121216] border border-white/10 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl text-slate-100 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Code2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Import Coding Questions from Sets</h3>
              <p className="text-[11px] text-slate-400">
                Copies problem statements and test suites into this hybrid set without affecting source sets.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-all"
          >
            ✕
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500 pointer-events-none" />
            <input
              type="text"
              placeholder="Search problem title or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center space-x-1.5 bg-black/40 p-1 rounded-xl border border-white/10">
            <button
              type="button"
              onClick={() => setFilterLang('all')}
              className={`flex-1 py-1 text-xs rounded-lg font-medium transition-all ${
                filterLang === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setFilterLang('java')}
              className={`flex-1 py-1 text-xs rounded-lg font-medium transition-all ${
                filterLang === 'java' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Java
            </button>
            <button
              type="button"
              onClick={() => setFilterLang('python')}
              className={`flex-1 py-1 text-xs rounded-lg font-medium transition-all ${
                filterLang === 'python' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Python
            </button>
          </div>
        </div>

        {/* Selection summary bar */}
        <div className="flex items-center justify-between px-1 py-1 text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleSelectAll}
              className="flex items-center space-x-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              {selectedQuestionIds.size === filtered.length && filtered.length > 0 ? (
                <CheckSquare className="w-3.5 h-3.5 text-indigo-400" />
              ) : (
                <Square className="w-3.5 h-3.5 text-slate-500" />
              )}
              <span>
                {selectedQuestionIds.size === filtered.length && filtered.length > 0
                  ? 'Deselect All'
                  : 'Select All'}
              </span>
            </button>
            <span className="text-slate-600">|</span>
            <span>Available: {filtered.length} problems</span>
          </div>
          <span className="text-emerald-400 font-mono text-[11px]">
            {selectedQuestionIds.size} selected
          </span>
        </div>

        {/* Questions list */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[220px] max-h-[340px]">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs space-y-2 bg-black/20 rounded-xl border border-dashed border-white/5">
              <Database className="w-6 h-6 mx-auto text-slate-600" />
              <p>No coding problems found matching this filter.</p>
            </div>
          ) : (
            filtered.map(({ origin, lang, q }) => {
              const isChecked = selectedQuestionIds.has(q.id);

              return (
                <div
                  key={q.id}
                  onClick={() => toggleSelect(q.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isChecked
                      ? 'bg-indigo-500/10 border-indigo-500/40 text-white'
                      : 'bg-black/30 border-white/5 hover:border-white/20 text-slate-300'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="mt-0.5 shrink-0">
                      {isChecked ? (
                        <div className="w-4 h-4 rounded bg-indigo-600 text-white flex items-center justify-center">
                          <Check className="w-3 h-3" />
                        </div>
                      ) : (
                        <div className="w-4 h-4 rounded border border-white/20 bg-black/40" />
                      )}
                    </div>

                    <div className="flex-1 space-y-1 min-w-0">
                      <div className="flex items-center space-x-2 flex-wrap gap-1">
                        <span className="font-semibold text-xs text-white">{q.title}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 uppercase">
                          {q.difficulty}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/5 text-slate-400 border border-white/5">
                          {lang === 'java' ? 'Java' : 'Python'}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">
                          {origin}
                        </span>
                        <span className="text-[10px] text-emerald-400 font-mono ml-auto">
                          {q.testCases?.length || 0} test cases
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
                        {q.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-white/10">
          <span className="text-xs text-slate-400">
            {selectedQuestionIds.size} problem{selectedQuestionIds.size === 1 ? '' : 's'} ready to import
          </span>
          <div className="flex items-center space-x-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-xs font-semibold transition-all border border-white/10"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={selectedQuestionIds.size === 0}
              onClick={handleImport}
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all flex items-center space-x-1.5"
            >
              <span>Import Selected ({selectedQuestionIds.size})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
