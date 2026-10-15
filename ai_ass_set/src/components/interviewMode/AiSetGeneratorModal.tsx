import React, { useState, useMemo } from 'react';
import { HybridQuestionSet } from '../../types';
import {
  Sparkles,
  X,
  Search,
  Check,
  Loader2,
  Code2,
  HelpCircle,
  AlertCircle,
  Zap,
  Clock,
  Layers,
  Sliders,
  CheckCircle2,
  Briefcase
} from 'lucide-react';

interface AiSetGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSetCreated: (set: HybridQuestionSet) => Promise<void> | void;
}

interface RoleCategory {
  categoryName: string;
  roles: { title: string; defaultFocus: string; tag: string }[];
}

const ROLE_SUGGESTIONS: RoleCategory[] = [
  {
    categoryName: 'QA, Testing & Reliability',
    roles: [
      {
        title: 'Performance Test Engineer',
        defaultFocus: 'JMeter, k6, load generation, p95/p99 latency analysis, throughput bottlenecks, resource saturation',
        tag: 'Popular'
      },
      {
        title: 'QA Automation Engineer (SDET)',
        defaultFocus: 'Selenium, Playwright, PyTest/TestNG, CI/CD pipeline test gates, page object pattern, flaky test mitigation',
        tag: 'High Demand'
      },
      {
        title: 'API & Integration Test Specialist',
        defaultFocus: 'Postman, REST Assured, contract testing, mock services, OAuth flow validation, payload fuzzing',
        tag: 'Specialized'
      },
      {
        title: 'Site Reliability Engineer (SRE)',
        defaultFocus: 'SLO/SLI budgeting, alerting thresholds, incident postmortems, Kubernetes pod health, chaos testing',
        tag: 'Cloud'
      }
    ]
  },
  {
    categoryName: 'Backend & Cloud Engineering',
    roles: [
      {
        title: 'Backend Engineer (Python / FastAPI)',
        defaultFocus: 'AsyncIO concurrency, SQLAlchemy, Pydantic validation, Redis caching, microservices architecture',
        tag: 'Trending'
      },
      {
        title: 'Backend Engineer (Java / Spring Boot)',
        defaultFocus: 'Spring Security, JPA/Hibernate performance, multithreading, Kafka event streaming, JVM tuning',
        tag: 'Enterprise'
      },
      {
        title: 'Cloud & DevOps Architect',
        defaultFocus: 'Terraform, Docker containerization, AWS/GCP architecture, GitOps CI/CD, security compliance',
        tag: 'DevOps'
      },
      {
        title: 'Distributed Systems Engineer',
        defaultFocus: 'Consensus algorithms, Raft, eventual consistency, CAP theorem tradeoffs, database sharding',
        tag: 'Core'
      }
    ]
  },
  {
    categoryName: 'Full Stack & Web Architecture',
    roles: [
      {
        title: 'Full Stack Developer',
        defaultFocus: 'React component lifecycle, state management, REST/GraphQL APIs, relational database design',
        tag: 'Versatile'
      },
      {
        title: 'Frontend Systems Architect',
        defaultFocus: 'TypeScript, Next.js / Vite build optimization, Web Workers, client-side caching, web vitals performance',
        tag: 'Frontend'
      }
    ]
  },
  {
    categoryName: 'Data & AI Platform',
    roles: [
      {
        title: 'Data Engineer (Pipelines & Warehousing)',
        defaultFocus: 'Apache Spark, dbt, Snowflake/BigQuery, data schema evolution, batch vs stream processing',
        tag: 'Data'
      },
      {
        title: 'MLOps & Applied AI Engineer',
        defaultFocus: 'Model deployment, latency profiling, feature stores, LLM prompt evaluation, token economics',
        tag: 'AI/ML'
      }
    ]
  }
];

export const AiSetGeneratorModal: React.FC<AiSetGeneratorModalProps> = ({
  isOpen,
  onClose,
  onSetCreated
}) => {
  // Form State
  const [roleTitle, setRoleTitle] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [customFocus, setCustomFocus] = useState('');
  const [experienceLevel, setExperienceLevel] = useState<'Junior' | 'Mid-Level' | 'Senior' | 'Lead / Principal'>('Senior');
  const [mcqCount, setMcqCount] = useState<number>(10);
  const [codingCount, setCodingCount] = useState<number>(2);
  const [codingLanguage, setCodingLanguage] = useState<'python' | 'java'>('python');

  // Generation & Streaming Progress State
  const [isGenerating, setIsGenerating] = useState(false);
  const [progressStep, setProgressStep] = useState<string>('');
  const [mcqDone, setMcqDone] = useState(false);
  const [codingDone, setCodingDone] = useState(false);
  const [cascadeModel, setCascadeModel] = useState<string>('gemini-3.8-flash');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Filtered Roles based on user search
  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) return ROLE_SUGGESTIONS;
    const term = searchTerm.toLowerCase();
    return ROLE_SUGGESTIONS.map((cat) => ({
      ...cat,
      roles: cat.roles.filter(
        (r) =>
          r.title.toLowerCase().includes(term) ||
          r.defaultFocus.toLowerCase().includes(term) ||
          r.tag.toLowerCase().includes(term)
      )
    })).filter((cat) => cat.roles.length > 0);
  }, [searchTerm]);

  if (!isOpen) return null;

  const handleSelectRole = (title: string, defaultFocus: string) => {
    setRoleTitle(title);
    if (!customFocus.trim() || customFocus.includes('JMeter') || customFocus.includes('FastAPI')) {
      setCustomFocus(defaultFocus);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalRole = roleTitle.trim();
    if (!finalRole) {
      setErrorMessage('Please select or specify a role title.');
      return;
    }

    if (mcqCount === 0 && codingCount === 0) {
      setErrorMessage('Please select at least 1 MCQ question or 1 Coding challenge.');
      return;
    }

    setIsGenerating(true);
    setErrorMessage(null);
    setMcqDone(mcqCount === 0);
    setCodingDone(codingCount === 0);
    setProgressStep('Connecting to AI Assessment Architect...');

    try {
      const res = await fetch('/api/interview-mode/ai-generate-set', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'text/event-stream'
        },
        body: JSON.stringify({
          roleName: finalRole,
          experienceLevel,
          customFocus: customFocus.trim(),
          mcqCount,
          codingCount,
          codingLanguage,
          stream: true
        })
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        throw new Error(errJson?.error || `Generation failed with status ${res.status}`);
      }

      if (res.headers.get('content-type')?.includes('text/event-stream') && res.body) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split('\n\n');
          buffer = parts.pop() || '';

          for (const part of parts) {
            if (part.startsWith('data: ')) {
              try {
                const event = JSON.parse(part.slice(6));

                if (event.type === 'status') {
                  setProgressStep(event.message || '');
                  if (event.phase === 'mcq_done') setMcqDone(true);
                  if (event.phase === 'coding_done') setCodingDone(true);
                } else if (event.type === 'cascade_update' && event.modelLabel) {
                  setCascadeModel(event.modelLabel);
                  if (event.message) setProgressStep(event.message);
                } else if (event.type === 'error') {
                  throw new Error(event.error || 'AI generation encountered an error.');
                } else if (event.type === 'completed' && event.set) {
                  setProgressStep('Saving assessment set to your Interview Mode workspace...');
                  await onSetCreated(event.set);
                  setIsGenerating(false);
                  onClose();
                  return;
                }
              } catch (parseErr: any) {
                if (parseErr.message && !parseErr.message.includes('Unexpected end of JSON')) {
                  console.warn('SSE Parse error:', parseErr);
                }
              }
            }
          }
        }
      } else {
        // Fallback for non-stream JSON response
        const data = await res.json();
        if (data.set) {
          await onSetCreated(data.set);
          setIsGenerating(false);
          onClose();
          return;
        }
        throw new Error('No assessment set received from server.');
      }
    } catch (err: any) {
      console.error('Error generating set with AI:', err);
      setErrorMessage(err.message || 'Failed to generate assessment set. Please try again.');
      setIsGenerating(false);
    }
  };

  // Estimated timing
  const estimatedMcqMinutes = Math.round((mcqCount * 90) / 60);
  const estimatedCodingMinutes = Math.round((codingCount * 900) / 60);
  const totalEstimatedMinutes = estimatedMcqMinutes + estimatedCodingMinutes + 1; // +1 min transition

  return (
    <div className="fixed inset-0 z-50 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white dark:bg-[#121216] border border-slate-200 dark:border-white/10 rounded-3xl w-full max-w-3xl my-8 overflow-hidden shadow-2xl transition-colors flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-200 dark:border-white/10 shrink-0 bg-slate-50/70 dark:bg-white/[0.02]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base sm:text-lg tracking-tight">
                  AI Assessment Set Architect
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-500/10 dark:text-purple-300 dark:border-purple-500/20 font-bold">
                  Gemini 3.8 Dual-Round
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Generate high-relevance MCQ & coding sandboxes tailored specifically to any role.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isGenerating}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer disabled:opacity-40"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <form onSubmit={handleGenerate} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 flex items-start space-x-2.5 text-xs text-rose-800 dark:text-rose-300 animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Section 1: Role Suggestions & Selection */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
                <Briefcase className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Target Job Role or Domain</span>
              </label>

              {/* Search Bar for Suggestions */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter role suggestions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  disabled={isGenerating}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Quick-Pick Categorized Role Chips */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/5 space-y-3 max-h-48 overflow-y-auto">
              {filteredCategories.map((cat, cIdx) => (
                <div key={cIdx} className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                    {cat.categoryName}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {cat.roles.map((r, rIdx) => {
                      const isSelected = roleTitle.trim().toLowerCase() === r.title.toLowerCase();
                      return (
                        <button
                          key={rIdx}
                          type="button"
                          onClick={() => handleSelectRole(r.title, r.defaultFocus)}
                          disabled={isGenerating}
                          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center space-x-1.5 cursor-pointer ${
                            isSelected
                              ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30 border border-indigo-500'
                              : 'bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10'
                          }`}
                        >
                          <span>{r.title}</span>
                          <span
                            className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono ${
                              isSelected
                                ? 'bg-white/20 text-white'
                                : 'bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400'
                            }`}
                          >
                            {r.tag}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Direct Input for Custom Role Name */}
            <div className="pt-1">
              <input
                type="text"
                placeholder="Or type any specific role (e.g. Lead Performance Test Engineer, Rust Embedded Dev)..."
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
                disabled={isGenerating}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 text-xs font-semibold focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          {/* Section 2: Technical Focus & Experience Level */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Custom Focus / Topics Prompt */}
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
                <Sliders className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                <span>Technical Focus & Key Topics (Optional)</span>
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Focus on JMeter load generation, p95 response times, database connection pools, and memory leaks..."
                value={customFocus}
                onChange={(e) => setCustomFocus(e.target.value)}
                disabled={isGenerating}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 resize-none transition-colors"
              />
            </div>

            {/* Experience Level */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
                Seniority Level
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {(['Junior', 'Mid-Level', 'Senior', 'Lead / Principal'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setExperienceLevel(lvl)}
                    disabled={isGenerating}
                    className={`py-1.5 px-2 rounded-xl text-[11px] font-semibold border transition-all cursor-pointer ${
                      experienceLevel === lvl
                        ? 'bg-purple-600 text-white border-purple-500 shadow-sm'
                        : 'bg-slate-50 dark:bg-white/5 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 3: Dual-Round Question Counts & Coding Language */}
          <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-black/30 border border-slate-200 dark:border-white/10 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center space-x-2">
              <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Assessment Composition & Round Mix</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Round 1: MCQ Question Count */}
              <div className="p-3 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 flex items-center space-x-1.5">
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Round 1: MCQ Count</span>
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                    {mcqCount} Qs
                  </span>
                </div>

                <div className="flex items-center space-x-1.5">
                  {[0, 5, 10, 15, 20].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setMcqCount(num)}
                      disabled={isGenerating}
                      className={`flex-1 py-1 text-xs font-mono rounded-lg border transition-all cursor-pointer ${
                        mcqCount === num
                          ? 'bg-indigo-600 text-white font-bold border-indigo-500'
                          : 'bg-slate-50 dark:bg-white/5 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-white/10'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-slate-500 font-mono">
                  ~1.5m per question (~{estimatedMcqMinutes} mins total)
                </p>
              </div>

              {/* Round 2: Coding Challenges Count */}
              <div className="p-3 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-700 dark:text-purple-300 flex items-center space-x-1.5">
                    <Code2 className="w-3.5 h-3.5" />
                    <span>Round 2: Coding Problems</span>
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                    {codingCount} Task{codingCount === 1 ? '' : 's'}
                  </span>
                </div>

                <div className="flex items-center space-x-1.5">
                  {[0, 1, 2, 3, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setCodingCount(num)}
                      disabled={isGenerating}
                      className={`flex-1 py-1 text-xs font-mono rounded-lg border transition-all cursor-pointer ${
                        codingCount === num
                          ? 'bg-purple-600 text-white font-bold border-purple-500'
                          : 'bg-slate-50 dark:bg-white/5 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-white/10'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-slate-500 font-mono">
                  ~15m per challenge (~{estimatedCodingMinutes} mins total)
                </p>
              </div>

              {/* Coding Sandbox Language */}
              <div className="p-3 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 space-y-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  Coding Sandbox Language
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setCodingLanguage('python')}
                    disabled={isGenerating || codingCount === 0}
                    className={`py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                      codingLanguage === 'python'
                        ? 'bg-emerald-600 text-white border-emerald-500 font-bold'
                        : 'bg-slate-50 dark:bg-white/5 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-white/10'
                    }`}
                  >
                    Python 3
                  </button>
                  <button
                    type="button"
                    onClick={() => setCodingLanguage('java')}
                    disabled={isGenerating || codingCount === 0}
                    className={`py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                      codingLanguage === 'java'
                        ? 'bg-amber-600 text-white border-amber-500 font-bold'
                        : 'bg-slate-50 dark:bg-white/5 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-white/10'
                    }`}
                  >
                    Java 17
                  </button>
                </div>
                <div className="text-[10px] text-slate-500 font-mono flex items-center justify-between">
                  <span>Break: 1 min</span>
                  <span>Est Total: ~{totalEstimatedMinutes}m</span>
                </div>
              </div>
            </div>
          </div>

          {/* Active Generation Progress Screen */}
          {isGenerating && (
            <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-500/30 space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-indigo-700 dark:text-indigo-300 font-bold text-xs">
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-600 dark:text-indigo-400" />
                  <span>{progressStep || 'Synthesizing dual-round questions...'}</span>
                </div>
                <span className="text-[10px] font-mono text-slate-500">
                  Model: {cascadeModel}
                </span>
              </div>

              {/* Dual Parallel Tracks */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-2.5 rounded-xl bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="flex items-center space-x-1 text-slate-700 dark:text-slate-300">
                      <HelpCircle className="w-3.5 h-3.5 text-indigo-500" />
                      <span>MCQ Bank ({mcqCount} Qs)</span>
                    </span>
                    {mcqDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <span className="text-[10px] font-mono text-indigo-500 animate-pulse">generating...</span>
                    )}
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        mcqDone ? 'w-full bg-emerald-500' : 'w-2/3 bg-indigo-500 animate-pulse'
                      }`}
                    />
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="flex items-center space-x-1 text-slate-700 dark:text-slate-300">
                      <Code2 className="w-3.5 h-3.5 text-purple-500" />
                      <span>Coding ({codingCount} Tasks)</span>
                    </span>
                    {codingDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <span className="text-[10px] font-mono text-purple-500 animate-pulse">generating...</span>
                    )}
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        codingDone ? 'w-full bg-emerald-500' : 'w-2/3 bg-purple-500 animate-pulse'
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Modal Footer Controls */}
          <div className="flex items-center justify-end space-x-3 pt-2 border-t border-slate-200 dark:border-white/10">
            <button
              type="button"
              onClick={onClose}
              disabled={isGenerating}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer disabled:opacity-40"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isGenerating || !roleTitle.trim()}
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md shadow-indigo-600/30 flex items-center space-x-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Set...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Assessment Set</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
