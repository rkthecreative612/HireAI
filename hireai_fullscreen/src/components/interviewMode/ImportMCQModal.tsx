import React, { useState } from 'react';
import { Search, CheckSquare, Square, Filter, Database, Check, Layers } from 'lucide-react';
import { RoleQuestionPool, HybridMCQQuestion, Question } from '../../types';

interface ImportMCQModalProps {
  isOpen: boolean;
  onClose: () => void;
  pools: RoleQuestionPool[];
  onImportQuestions: (questions: HybridMCQQuestion[]) => void;
}

export const ImportMCQModal: React.FC<ImportMCQModalProps> = ({
  isOpen,
  onClose,
  pools,
  onImportQuestions
}) => {
  const [selectedPoolId, setSelectedPoolId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<Set<string>>(new Set());

  if (!isOpen) return null;

  // Gather all candidate questions from pools that have options (MCQ format)
  // Or convert question with options into HybridMCQQuestion
  const allAvailableMCQs: { poolName: string; q: Question }[] = [];

  pools.forEach((pool) => {
    if (selectedPoolId !== 'all' && pool.id !== selectedPoolId) return;
    pool.questions.forEach((q) => {
      // Check if it has options or if it's an MCQ question
      if (Array.isArray(q.options) && q.options.length >= 2) {
        if (!searchQuery || q.questionText.toLowerCase().includes(searchQuery.toLowerCase())) {
          allAvailableMCQs.push({ poolName: pool.roleName, q });
        }
      }
    });
  });

  const toggleSelect = (qId: string) => {
    setSelectedQuestionIds((prev) => {
      const next = new Set(prev);
      if (next.has(qId)) {
        next.delete(qId);
      } else {
        next.add(qId);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedQuestionIds.size === allAvailableMCQs.length) {
      setSelectedQuestionIds(new Set());
    } else {
      setSelectedQuestionIds(new Set(allAvailableMCQs.map((item) => item.q.id)));
    }
  };

  const handleImport = () => {
    const questionsToImport: HybridMCQQuestion[] = [];

    allAvailableMCQs.forEach(({ q }) => {
      if (selectedQuestionIds.has(q.id)) {
        const optionsList = Array.isArray(q.options) ? [...q.options] : [];
        let correctIdx = 0;
        if (q.correctAnswer) {
          const matchIdx = optionsList.findIndex(
            (opt) => opt.toLowerCase().trim() === q.correctAnswer?.toLowerCase().trim()
          );
          if (matchIdx >= 0) correctIdx = matchIdx;
        }

        // DEEP CLONE with fresh ID to guarantee original pool is untouched!
        questionsToImport.push({
          id: `hmcq-imported-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          questionText: q.questionText,
          options: optionsList,
          correctAnswerIndex: correctIdx,
          difficulty: q.difficulty,
          category: q.category
        });
      }
    });

    onImportQuestions(questionsToImport);
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
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Import MCQs from Existing Pools</h3>
              <p className="text-[11px] text-slate-400">
                Safely copies questions into this set without modifying the source pools.
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
              placeholder="Search question keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="relative">
            <Filter className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500 pointer-events-none" />
            <select
              value={selectedPoolId}
              onChange={(e) => setSelectedPoolId(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Question Pools ({pools.length})</option>
              {pools.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.roleName} ({p.questions.filter((q) => Array.isArray(q.options) && q.options.length > 0).length} MCQs)
                </option>
              ))}
            </select>
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
              {selectedQuestionIds.size === allAvailableMCQs.length && allAvailableMCQs.length > 0 ? (
                <CheckSquare className="w-3.5 h-3.5 text-indigo-400" />
              ) : (
                <Square className="w-3.5 h-3.5 text-slate-500" />
              )}
              <span>
                {selectedQuestionIds.size === allAvailableMCQs.length && allAvailableMCQs.length > 0
                  ? 'Deselect All'
                  : 'Select All'}
              </span>
            </button>
            <span className="text-slate-600">|</span>
            <span>Available: {allAvailableMCQs.length} questions</span>
          </div>
          <span className="text-emerald-400 font-mono text-[11px]">
            {selectedQuestionIds.size} selected
          </span>
        </div>

        {/* Questions list */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[220px] max-h-[340px]">
          {allAvailableMCQs.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs space-y-2 bg-black/20 rounded-xl border border-dashed border-white/5">
              <Layers className="w-6 h-6 mx-auto text-slate-600" />
              <p>No MCQ questions found in selected pool or filter.</p>
              <p className="text-[11px] text-slate-600">
                You can create custom hardcoded MCQs directly using &quot;+ Add Custom MCQ&quot;.
              </p>
            </div>
          ) : (
            allAvailableMCQs.map(({ poolName, q }) => {
              const isChecked = selectedQuestionIds.has(q.id);

              return (
                <div
                  key={q.id}
                  onClick={() => toggleSelect(q.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
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

                    <div className="flex-1 space-y-1.5 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-slate-400 border border-white/5">
                          {poolName}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 uppercase">
                          {q.difficulty}
                        </span>
                      </div>

                      <p className="text-xs font-medium text-white leading-relaxed line-clamp-2">
                        {q.questionText}
                      </p>

                      {Array.isArray(q.options) && (
                        <div className="grid grid-cols-2 gap-1 pt-1">
                          {q.options.slice(0, 4).map((opt, i) => (
                            <div
                              key={i}
                              className="text-[10px] text-slate-400 truncate bg-black/40 px-2 py-0.5 rounded border border-white/5"
                            >
                              <span className="font-mono text-slate-500 mr-1">
                                {String.fromCharCode(65 + i)}:
                              </span>
                              {opt}
                            </div>
                          ))}
                        </div>
                      )}
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
            {selectedQuestionIds.size} question{selectedQuestionIds.size === 1 ? '' : 's'} ready to import
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
