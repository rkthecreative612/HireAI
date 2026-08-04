import React, { useState } from 'react';
import { RoleQuestionPool } from '../types';
import { User, Mail, Play, Plus, Sparkles, CheckCircle2, ChevronRight, Layers, HelpCircle, ShieldCheck, Clock, Trash2, AlertTriangle } from 'lucide-react';

interface RoleSelectorProps {
  pools: RoleQuestionPool[];
  selectedPool: RoleQuestionPool | null;
  onSelectPool: (pool: RoleQuestionPool) => void;
  onOpenGenerator: () => void;
  onStartInterview: (candidateName: string, candidateEmail: string, questionCount: number) => void;
  onDeletePool?: (poolId: string) => void;
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({
  pools,
  selectedPool,
  onSelectPool,
  onOpenGenerator,
  onStartInterview,
  onDeletePool,
}) => {
  const [candidateName, setCandidateName] = useState('');
  const [candidateEmail, setCandidateEmail] = useState('');
  const [questionCount, setQuestionCount] = useState<number>(20);
  const [formError, setFormError] = useState<string | null>(null);
  const [poolToDelete, setPoolToDelete] = useState<RoleQuestionPool | null>(null);

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPool) {
      setFormError('Please select or generate a role question bank first.');
      return;
    }
    if (!candidateName.trim()) {
      setFormError('Please enter candidate name.');
      return;
    }

    setFormError(null);
    onStartInterview(candidateName.trim(), candidateEmail.trim(), questionCount);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[11px] font-bold uppercase tracking-widest">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Automated Assessment Engine</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          HireAI
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-2xl mx-auto">
          HireAI dynamically evaluates candidate technical depth using adaptive AI questions and automatically generates actionable, executive-level interview reports.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Role Pool Selection (Step 1) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-5 h-5 rounded-md bg-indigo-600 text-white font-mono text-xs flex items-center justify-center font-bold">
                1
              </span>
              <h2 className="font-bold text-base text-white">Select Role Question Bank</h2>
            </div>
            <button
              onClick={onOpenGenerator}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Generate Custom Role</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {pools.map((pool) => {
              const isSelected = selectedPool?.id === pool.id;
              const basicCount = pool.questions.filter((q) => q.category === 'basic').length;
              const domainCount = pool.questions.filter((q) => q.category === 'domain').length;
              const trendsCount = pool.questions.filter((q) => q.category === 'trends').length;
              const situationalCount = pool.questions.filter((q) => q.category === 'situational').length;

              return (
                <div
                  key={pool.id}
                  onClick={() => onSelectPool(pool)}
                  className={`group relative p-5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-950/40 border-indigo-500 ring-2 ring-indigo-500/50 shadow-xl shadow-indigo-600/20'
                      : 'bg-[#0F0F12] border-white/10 hover:border-white/20 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-base text-white group-hover:text-indigo-300 transition-colors">
                          {pool.roleName}
                        </h3>
                        <span className="text-[10px] font-mono font-semibold uppercase px-2 py-0.5 rounded bg-white/5 text-slate-300 border border-white/10">
                          {pool.experienceLevel}
                        </span>
                        {pool.assessmentType === 'mcq' && (
                          <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                            MCQ
                          </span>
                        )}
                        {isSelected && (
                          <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 animate-pulse">
                            Active Selected Role
                          </span>
                        )}
                      </div>
                      {pool.description && (
                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{pool.description}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 shrink-0">
                      {onDeletePool && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPoolToDelete(pool);
                          }}
                          title="Delete Question Bank"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                          isSelected ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/50' : 'border border-slate-700 text-transparent'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  {/* Question Category Pills */}
                  <div className="mt-4 pt-3 border-t border-white/5 flex flex-wrap items-center gap-2 text-[11px] text-slate-400 font-mono">
                    <span className="flex items-center space-x-1 px-2 py-0.5 rounded bg-black/40 border border-white/10 text-white">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                      <span>{pool.questions.length} Questions</span>
                    </span>
                    <span className="px-2 py-0.5 rounded bg-black/20 border border-white/5 text-slate-400">
                      Basic ({basicCount})
                    </span>
                    <span className="px-2 py-0.5 rounded bg-black/20 border border-white/5 text-slate-400">
                      Domain ({domainCount})
                    </span>
                    <span className="px-2 py-0.5 rounded bg-black/20 border border-white/5 text-slate-400">
                      Trends ({trendsCount})
                    </span>
                    <span className="px-2 py-0.5 rounded bg-black/20 border border-white/5 text-slate-400">
                      Situational ({situationalCount})
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Candidate Launch Form (Step 2) */}
        <div className="lg:col-span-5 bg-[#0F0F12] border border-white/10 rounded-2xl p-6 space-y-6 shadow-2xl sticky top-24">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-5 h-5 rounded-md bg-indigo-600 text-white font-mono text-xs flex items-center justify-center font-bold">
                2
              </span>
              <h2 className="font-bold text-base text-white">Candidate Details & Launch</h2>
            </div>
          </div>

          {/* Active Target Role Indicator Banner */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-indigo-950/60 to-purple-950/40 border border-indigo-500/30 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 inline mr-1" />
                Active Question Bank Target
              </span>
              <div className="flex items-center space-x-1.5">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-200 border border-indigo-500/30 uppercase font-semibold">
                  {selectedPool?.experienceLevel || 'N/A'}
                </span>
                {selectedPool?.assessmentType === 'mcq' && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-200 border border-purple-500/30 uppercase font-bold">
                    MCQ
                  </span>
                )}
              </div>
            </div>
            <div className="text-base font-extrabold text-white flex items-center justify-between">
              <span>{selectedPool?.roleName || 'Select a Role on Left'}</span>
              <span className="text-xs font-mono font-medium text-emerald-400">
                {selectedPool ? `${selectedPool.questions.length} Que Pool` : ''}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Candidate assessment questions will be generated from this role bank. Click any card on the left panel to change roles.
            </p>
          </div>

          {formError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
              {formError}
            </div>
          )}

          <form onSubmit={handleStart} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                Candidate Full Name <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Morgan"
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-600 text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                Candidate Email / ID (Optional)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  placeholder="e.g. alex.morgan@example.com"
                  value={candidateEmail}
                  onChange={(e) => setCandidateEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-600 text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>

            {/* Assessment Question Count Selector */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Target Question Count
                </label>
                <span className="text-[10px] text-indigo-400 font-mono font-semibold">
                  {questionCount} Questions Selected
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[5, 10, 20].map((count) => {
                  const isSelected = questionCount === count;
                  return (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setQuestionCount(count)}
                      className={`py-2 px-3 rounded-xl border text-xs font-mono font-semibold transition-all flex flex-col items-center justify-center space-y-0.5 ${
                        isSelected
                          ? 'bg-indigo-600/30 border-indigo-500 text-white shadow-md shadow-indigo-950/50 ring-1 ring-indigo-500/50'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <span className="text-sm font-extrabold text-white">{count} Que</span>
                      <span className="text-[9px] uppercase tracking-wider text-slate-400">
                        {count === 5 ? 'Express (5m)' : count === 10 ? 'Standard (10m)' : 'Full (20m)'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Summary Card */}
            <div className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-2 text-xs">
              <div className="text-slate-400 font-medium flex items-center justify-between">
                <span>Selected Active Role:</span>
                <div className="flex items-center space-x-1.5">
                  <span className="text-indigo-400 font-semibold">{selectedPool?.roleName || 'None'}</span>
                  {selectedPool && (
                    <span className="text-[10px] font-mono text-purple-300 px-1.5 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 font-semibold">
                      {selectedPool.experienceLevel}{selectedPool.assessmentType === 'mcq' ? ' • MCQ' : ''}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between text-slate-400 font-mono text-[11px]">
                <span>Assessment Questions:</span>
                <span className="text-white font-semibold">{selectedPool ? questionCount : 0} items</span>
              </div>
              <div className="flex items-center justify-between text-slate-400 font-mono text-[11px]">
                <span>Adaptive Scaling Engine:</span>
                <span className="text-emerald-400 font-semibold">Active</span>
              </div>
            </div>

            {/* Launch Button */}
            <button
              type="submit"
              disabled={!selectedPool || !candidateName.trim()}
              className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <Play className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" />
              <span>Launch Candidate Assessment</span>
            </button>
          </form>

          <div className="pt-2 border-t border-white/5 flex items-center space-x-2 text-[11px] text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>HireAI presents {questionCount} questions in ordered category sequence with real-time AI scoring.</span>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {poolToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121216] border border-white/10 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-fade-in">
            <div className="flex items-center space-x-3 text-rose-400">
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Delete Question Bank?</h3>
                <p className="text-xs text-slate-400">This action cannot be undone.</p>
              </div>
            </div>
            
            <p className="text-xs text-slate-300 leading-relaxed bg-white/5 p-3.5 rounded-xl border border-white/5">
              Are you sure you want to delete the question bank for <strong className="text-white">{poolToDelete.roleName}</strong> ({poolToDelete.experienceLevel}) with {poolToDelete.questions.length} questions?
            </p>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setPoolToDelete(null)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onDeletePool) {
                    onDeletePool(poolToDelete.id);
                  }
                  setPoolToDelete(null);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-600/30 transition-all"
              >
                Yes, Delete Question Bank
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
