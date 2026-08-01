import React, { useState } from 'react';
import { RoleQuestionPool } from '../types';
import { Database, Plus, Sparkles, Trash2, ChevronDown, ChevronUp, Layers, HelpCircle, FileText } from 'lucide-react';

interface ManagePoolsViewProps {
  pools: RoleQuestionPool[];
  onOpenGenerator: () => void;
  onDeletePool: (poolId: string) => void;
  onSelectPoolToLaunch: (pool: RoleQuestionPool) => void;
}

export const ManagePoolsView: React.FC<ManagePoolsViewProps> = ({
  pools,
  onOpenGenerator,
  onDeletePool,
  onSelectPoolToLaunch,
}) => {
  const [expandedPoolId, setExpandedPoolId] = useState<string | null>(pools[0]?.id || null);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6 text-slate-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Role Question Banks Repository</h1>
          <p className="text-slate-400 text-xs mt-1">
            Question banks are generated once per role via Gemini AI and reused across multiple candidates.
          </p>
        </div>

        <button
          onClick={onOpenGenerator}
          className="flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 transition-all shrink-0"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Generate New Role Question Pool</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {pools.map((pool) => {
          const isExpanded = expandedPoolId === pool.id;
          const basicCount = pool.questions.filter((q) => q.category === 'basic').length;
          const domainCount = pool.questions.filter((q) => q.category === 'domain').length;
          const trendsCount = pool.questions.filter((q) => q.category === 'trends').length;
          const situationalCount = pool.questions.filter((q) => q.category === 'situational').length;

          return (
            <div
              key={pool.id}
              className="bg-[#0F0F12] border border-white/10 rounded-2xl overflow-hidden shadow-xl transition-all"
            >
              {/* Pool Header */}
              <div
                onClick={() => setExpandedPoolId(isExpanded ? null : pool.id)}
                className="p-5 flex items-start justify-between gap-4 cursor-pointer hover:bg-white/5 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-base text-white">{pool.roleName}</h3>
                    <span className="text-[10px] font-mono font-semibold uppercase px-2 py-0.5 rounded bg-white/5 text-slate-300 border border-white/10">
                      {pool.experienceLevel}
                    </span>
                  </div>
                  {pool.description && (
                    <p className="text-xs text-slate-400 line-clamp-1">{pool.description}</p>
                  )}
                  <div className="flex items-center space-x-3 text-[11px] font-mono text-slate-400 pt-1">
                    <span>{pool.questions.length} Total Questions</span>
                    <span>•</span>
                    <span>Basic ({basicCount})</span>
                    <span>•</span>
                    <span>Domain ({domainCount})</span>
                    <span>•</span>
                    <span>Trends ({trendsCount})</span>
                    <span>•</span>
                    <span>Situational ({situationalCount})</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectPoolToLaunch(pool);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold hover:bg-indigo-600 hover:text-white transition-all"
                  >
                    Select & Start Assessment
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Delete pool "${pool.roleName}"?`)) {
                        onDeletePool(pool.id);
                      }
                    }}
                    className="text-slate-500 hover:text-rose-400 p-1.5 rounded-xl hover:bg-white/5 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                </div>
              </div>

              {/* Pool Questions Detail */}
              {isExpanded && (
                <div className="p-5 border-t border-white/10 bg-black/40 space-y-4">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono">
                    Question Bank Breakdown ({pool.questions.length} Items)
                  </h4>

                  <div className="grid grid-cols-1 gap-2.5">
                    {pool.questions.map((q, qIdx) => (
                      <div
                        key={q.id || qIdx}
                        className="p-3.5 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-200 space-y-1.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-white">
                            Q{qIdx + 1}. {q.questionText}
                          </span>
                          <div className="flex items-center space-x-2 shrink-0 text-[10px] font-mono">
                            <span className="uppercase px-2 py-0.5 rounded bg-black/40 text-slate-300 border border-white/5">
                              {q.category}
                            </span>
                            <span className="uppercase px-2 py-0.5 rounded bg-black/40 text-slate-300 border border-white/5">
                              {q.difficulty}
                            </span>
                          </div>
                        </div>

                        {q.keyEvaluationCriteria && q.keyEvaluationCriteria.length > 0 && (
                          <div className="text-[11px] text-slate-400 pt-1">
                            <span className="font-semibold text-indigo-400">Key Criteria: </span>
                            {q.keyEvaluationCriteria.join(' • ')}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
