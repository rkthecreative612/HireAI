import React, { useState, useMemo } from 'react';
import { RoleQuestionPool, Category, Difficulty } from '../types';
import { 
  Sparkles, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  Search, 
  X, 
  Calendar, 
  Play, 
  Eye, 
  CheckCircle2, 
  BookOpen,
  Info
} from 'lucide-react';

interface ManagePoolsViewProps {
  pools: RoleQuestionPool[];
  onOpenGenerator: () => void;
  onDeletePool: (poolId: string) => void;
  onSelectPoolToLaunch: (pool: RoleQuestionPool) => void;
}

const CATEGORY_LABELS: Record<Category, { title: string; desc: string; color: string }> = {
  basic: { title: 'Basic Fundamentals', desc: 'Core concepts & foundational knowledge', color: 'text-sky-400 bg-sky-500/10 border-sky-500/20' },
  domain: { title: 'Domain Tech & Architecture', desc: 'Role-specific tech stack & design patterns', color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
  trends: { title: 'Modern Tools & Trends', desc: 'Industry shifts, security, & tooling', color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
  situational: { title: 'Situational & Scenarios', desc: 'Real-world debugging, tradeoffs, & leadership', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
};

const DIFFICULTY_CONFIG: Record<Difficulty, { label: string; badge: string }> = {
  easy: { label: 'Easy', badge: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  medium: { label: 'Medium', badge: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  hard: { label: 'Hard', badge: 'text-rose-400 bg-rose-500/10 border-rose-500/20' },
};

export const ManagePoolsView: React.FC<ManagePoolsViewProps> = ({
  pools,
  onOpenGenerator,
  onDeletePool,
  onSelectPoolToLaunch,
}) => {
  const [previewPool, setPreviewPool] = useState<RoleQuestionPool | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    basic: true,
    domain: true,
    trends: true,
    situational: true,
  });
  const [expandedCriteria, setExpandedCriteria] = useState<Record<string, boolean>>({});

  const toggleCategory = (cat: string) => {
    setExpandedCategories((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  const toggleAllCategories = (expand: boolean) => {
    setExpandedCategories({
      basic: expand,
      domain: expand,
      trends: expand,
      situational: expand,
    });
  };

  const toggleCriteria = (qId: string) => {
    setExpandedCriteria((prev) => ({ ...prev, [qId]: !prev[qId] }));
  };

  // Filter questions for the active modal
  const filteredQuestions = useMemo(() => {
    if (!previewPool) return [];
    const q = searchQuery.toLowerCase().trim();
    return previewPool.questions.filter((item) => {
      const matchesCategory = selectedCategoryFilter === 'all' || item.category === selectedCategoryFilter;
      const matchesSearch =
        !q ||
        item.questionText.toLowerCase().includes(q) ||
        (item.keyEvaluationCriteria && item.keyEvaluationCriteria.some((c) => c.toLowerCase().includes(q))) ||
        item.category.toLowerCase().includes(q) ||
        item.difficulty.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [previewPool, searchQuery, selectedCategoryFilter]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Preset Default Bank';
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return dateString;
      return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6 text-slate-100">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 p-6 rounded-3xl border border-white/10 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-6 h-6 text-indigo-400" />
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Role Question Banks Repository</h1>
          </div>
          <p className="text-slate-400 text-xs max-w-2xl">
            Question banks are generated once per role using AI and securely stored in your repository. Reuse existing banks instantly for unlimited candidate interviews.
          </p>
        </div>

        <button
          onClick={onOpenGenerator}
          className="flex items-center justify-center space-x-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition-all shrink-0 hover:scale-[1.02] active:scale-[0.98]"
        >
          <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" />
          <span>Generate New Question Bank</span>
        </button>
      </div>

      {/* Role Summary Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {pools.map((pool) => {
          const totalQ = pool.questions.length;
          const basicCount = pool.questions.filter((q) => q.category === 'basic').length;
          const domainCount = pool.questions.filter((q) => q.category === 'domain').length;
          const trendsCount = pool.questions.filter((q) => q.category === 'trends').length;
          const situationalCount = pool.questions.filter((q) => q.category === 'situational').length;

          return (
            <div
              key={pool.id}
              className="bg-[#0F1117] border border-white/10 rounded-2xl p-5 shadow-xl flex flex-col justify-between hover:border-indigo-500/40 transition-all space-y-4"
            >
              <div className="space-y-3">
                {/* Header info */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-bold text-lg text-white">
                        {pool.roleName}
                      </h3>
                      {pool.assessmentType === 'mcq' && (
                        <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                          MCQ
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-[10px] font-mono font-semibold uppercase px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                        {pool.experienceLevel} Level
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded font-semibold">
                        {totalQ} Questions Stored
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (confirm(`Are you sure you want to delete the "${pool.roleName}" question bank?`)) {
                        onDeletePool(pool.id);
                      }
                    }}
                    title="Delete Question Bank"
                    className="text-slate-500 hover:text-rose-400 p-2 rounded-xl hover:bg-rose-500/10 transition-colors shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {pool.description && (
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{pool.description}</p>
                )}

                {/* Category breakdown counts */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono pt-1">
                  <div className="bg-white/5 border border-white/5 rounded-xl p-2 text-center">
                    <span className="text-slate-400 block text-[9px] uppercase tracking-wider font-sans">Basic</span>
                    <span className="font-bold text-sky-400 text-xs">{basicCount}</span>
                  </div>
                  <div className="bg-white/5 border border-white/5 rounded-xl p-2 text-center">
                    <span className="text-slate-400 block text-[9px] uppercase tracking-wider font-sans">Domain</span>
                    <span className="font-bold text-indigo-400 text-xs">{domainCount}</span>
                  </div>
                  <div className="bg-white/5 border border-white/5 rounded-xl p-2 text-center">
                    <span className="text-slate-400 block text-[9px] uppercase tracking-wider font-sans">Trends</span>
                    <span className="font-bold text-purple-400 text-xs">{trendsCount}</span>
                  </div>
                  <div className="bg-white/5 border border-white/5 rounded-xl p-2 text-center">
                    <span className="text-slate-400 block text-[9px] uppercase tracking-wider font-sans">Situational</span>
                    <span className="font-bold text-amber-400 text-xs">{situationalCount}</span>
                  </div>
                </div>

                {/* Created Date */}
                <div className="flex items-center space-x-1.5 text-[11px] text-slate-500 pt-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Created: {formatDate(pool.createdAt)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-2.5 border-t border-white/5">
                <button
                  onClick={() => onSelectPoolToLaunch(pool)}
                  className="flex-1 flex items-center justify-center space-x-1.5 px-3.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md transition-all"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Select & Start Assessment</span>
                </button>

                <button
                  onClick={() => {
                    setPreviewPool(pool);
                    setSearchQuery('');
                    setSelectedCategoryFilter('all');
                  }}
                  className="flex items-center justify-center space-x-1.5 px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 font-medium text-xs transition-all shrink-0"
                >
                  <Eye className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Preview Question Bank</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {pools.length === 0 && (
        <div className="text-center py-16 bg-[#0F1117] border border-white/10 rounded-2xl space-y-3">
          <BookOpen className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Question Banks Available</h3>
          <p className="text-xs text-slate-400">Generate a new question bank to get started.</p>
          <button
            onClick={onOpenGenerator}
            className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold inline-flex items-center space-x-2"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Generate Now</span>
          </button>
        </div>
      )}

      {/* QUESTION BANK PREVIEW MODAL */}
      {previewPool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-6 overflow-hidden animate-fadeIn">
          <div className="bg-[#0F1117] border border-white/15 rounded-3xl w-full max-w-5xl h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-white/10 flex items-start justify-between gap-4 bg-slate-900/60 shrink-0">
              <div className="space-y-1">
                <div className="flex items-center space-x-3">
                  <h2 className="text-xl font-extrabold text-white">{previewPool.roleName}</h2>
                  <span className="text-xs font-mono font-semibold uppercase px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                    {previewPool.experienceLevel} Level
                  </span>
                  <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {previewPool.questions.length} Questions Pool
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Preview full question bank with categories, difficulty ratings, and key evaluation criteria.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    onSelectPoolToLaunch(previewPool);
                    setPreviewPool(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all flex items-center space-x-1.5"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Select & Start Assessment</span>
                </button>
                <button
                  onClick={() => setPreviewPool(null)}
                  className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Filters & Search Toolbar */}
            <div className="p-4 border-b border-white/10 bg-black/30 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
              {/* Search input */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search questions by keyword or topic..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-9 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center space-x-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-[11px]">
                <button
                  onClick={() => setSelectedCategoryFilter('all')}
                  className={`px-3 py-1.5 rounded-lg transition-all font-medium shrink-0 ${
                    selectedCategoryFilter === 'all'
                      ? 'bg-indigo-600 text-white font-semibold'
                      : 'bg-white/5 text-slate-400 hover:bg-white/10'
                  }`}
                >
                  All ({previewPool.questions.length})
                </button>
                {(['basic', 'domain', 'trends', 'situational'] as Category[]).map((cat) => {
                  const count = previewPool.questions.filter((q) => q.category === cat).length;
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategoryFilter(cat)}
                      className={`px-3 py-1.5 rounded-lg transition-all font-medium capitalize shrink-0 ${
                        selectedCategoryFilter === cat
                          ? 'bg-indigo-600 text-white font-semibold'
                          : 'bg-white/5 text-slate-400 hover:bg-white/10'
                      }`}
                    >
                      {cat} ({count})
                    </button>
                  );
                })}
              </div>

              {/* Expand / Collapse all controls */}
              <div className="flex items-center space-x-2 text-[11px] text-slate-400 shrink-0">
                <button
                  onClick={() => toggleAllCategories(true)}
                  className="hover:text-white underline font-mono"
                >
                  Expand All
                </button>
                <span>•</span>
                <button
                  onClick={() => toggleAllCategories(false)}
                  className="hover:text-white underline font-mono"
                >
                  Collapse All
                </button>
              </div>
            </div>

            {/* Modal Questions Content Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/10">
              {searchQuery && (
                <div className="text-xs text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 p-3 rounded-xl flex items-center justify-between">
                  <span>Found <strong>{filteredQuestions.length}</strong> question(s) matching &quot;{searchQuery}&quot;</span>
                  <button onClick={() => setSearchQuery('')} className="underline text-indigo-400 hover:text-indigo-200">
                    Clear Search
                  </button>
                </div>
              )}

              {(['basic', 'domain', 'trends', 'situational'] as Category[]).map((cat) => {
                if (selectedCategoryFilter !== 'all' && selectedCategoryFilter !== cat) return null;

                const catQuestions = filteredQuestions.filter((q) => q.category === cat);
                if (catQuestions.length === 0 && searchQuery) return null;

                const isCatExpanded = expandedCategories[cat] ?? true;
                const catMeta = CATEGORY_LABELS[cat];

                return (
                  <div key={cat} className="border border-white/10 rounded-2xl overflow-hidden bg-black/20">
                    {/* Category Group Header */}
                    <div
                      onClick={() => toggleCategory(cat)}
                      className="p-4 bg-white/5 hover:bg-white/10 cursor-pointer flex items-center justify-between transition-colors border-b border-white/5"
                    >
                      <div className="flex items-center space-x-3">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg border font-mono ${catMeta.color}`}>
                          {catQuestions.length} Questions
                        </span>
                        <div>
                          <h3 className="font-bold text-sm text-white flex items-center space-x-2">
                            <span>{catMeta.title}</span>
                          </h3>
                          <p className="text-[11px] text-slate-400">{catMeta.desc}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {isCatExpanded ? (
                          <ChevronUp className="w-5 h-5 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                    </div>

                    {/* Category Questions List Grouped by Difficulty */}
                    {isCatExpanded && (
                      <div className="p-4 space-y-4">
                        {(['easy', 'medium', 'hard'] as Difficulty[]).map((diff) => {
                          const diffQuestions = catQuestions.filter((q) => q.difficulty === diff);
                          if (diffQuestions.length === 0) return null;

                          const diffMeta = DIFFICULTY_CONFIG[diff];

                          return (
                            <div key={diff} className="space-y-2">
                              {/* Difficulty Subheader */}
                              <div className="flex items-center space-x-2 pt-1">
                                <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${diffMeta.badge}`}>
                                  {diffMeta.label} ({diffQuestions.length})
                                </span>
                                <div className="h-[1px] flex-1 bg-white/5" />
                              </div>

                              {/* Question Cards */}
                              <div className="grid grid-cols-1 gap-2.5">
                                {diffQuestions.map((q, idx) => {
                                  const showCriteria = expandedCriteria[q.id] || false;

                                  return (
                                    <div
                                      key={q.id || idx}
                                      className="p-4 rounded-xl bg-[#141722] border border-white/5 text-xs text-slate-200 space-y-2 hover:border-white/10 transition-colors"
                                    >
                                      {/* Question Main Bar */}
                                      <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-start space-x-2 flex-1">
                                          <span className="font-mono text-indigo-400 font-bold shrink-0 pt-0.5">
                                            #{idx + 1}
                                          </span>
                                          <div className="space-y-2 flex-1">
                                            <p className="font-medium text-white text-xs leading-relaxed">
                                              {q.questionText}
                                            </p>

                                            {/* MCQ Options list */}
                                            {q.options && q.options.length > 0 && (
                                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                                                {q.options.map((opt, optIdx) => {
                                                  const letter = ['A', 'B', 'C', 'D'][optIdx] || String(optIdx + 1);
                                                  const isCorrect = q.correctAnswer && (
                                                    opt.toLowerCase() === q.correctAnswer.toLowerCase() ||
                                                    opt.startsWith(q.correctAnswer) ||
                                                    q.correctAnswer.startsWith(opt)
                                                  );

                                                  return (
                                                    <div
                                                      key={optIdx}
                                                      className={`p-2 rounded-lg border flex items-center space-x-2 text-[11px] ${
                                                        isCorrect
                                                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                                                          : 'bg-white/5 border-white/5 text-slate-300'
                                                      }`}
                                                    >
                                                      <span className="font-mono font-bold shrink-0 text-[10px] bg-white/10 px-1.5 py-0.5 rounded">
                                                        {letter}
                                                      </span>
                                                      <span className="flex-1 leading-snug">{opt}</span>
                                                      {isCorrect && (
                                                        <span className="text-[9px] font-bold uppercase text-emerald-400 bg-emerald-500/20 px-1 rounded shrink-0">
                                                          Correct
                                                        </span>
                                                      )}
                                                    </div>
                                                  );
                                                })}
                                              </div>
                                            )}
                                          </div>
                                        </div>

                                        {/* Toggle Criteria Button */}
                                        {q.keyEvaluationCriteria && q.keyEvaluationCriteria.length > 0 && (
                                          <button
                                            onClick={() => toggleCriteria(q.id)}
                                            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-[11px] font-medium shrink-0 flex items-center space-x-1 transition-colors"
                                          >
                                            <Info className="w-3 h-3 text-indigo-400" />
                                            <span>{showCriteria ? 'Hide Criteria' : 'View Criteria'}</span>
                                          </button>
                                        )}
                                      </div>

                                      {/* Collapsible Key Evaluation Criteria */}
                                      {showCriteria && q.keyEvaluationCriteria && q.keyEvaluationCriteria.length > 0 && (
                                        <div className="mt-2 pt-3 border-t border-white/5 bg-black/40 p-3 rounded-lg space-y-1.5 animate-fadeIn">
                                          <span className="text-[10px] font-bold font-mono uppercase text-indigo-400 flex items-center space-x-1">
                                            <CheckCircle2 className="w-3 h-3 text-indigo-400" />
                                            <span>Key Evaluation Criteria Points ({q.keyEvaluationCriteria.length}):</span>
                                          </span>
                                          <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-300 pl-1">
                                            {q.keyEvaluationCriteria.map((criterion, cIdx) => (
                                              <li key={cIdx} className="leading-relaxed">
                                                {criterion}
                                              </li>
                                            ))}
                                          </ul>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}

              {filteredQuestions.length === 0 && (
                <div className="text-center py-12 text-slate-400 space-y-2">
                  <Search className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-xs">No questions found matching your filter options.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
