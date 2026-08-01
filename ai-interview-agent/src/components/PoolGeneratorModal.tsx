import React, { useState } from 'react';
import { RoleQuestionPool } from '../types';
import { Sparkles, X, Loader2, AlertCircle, CheckCircle2, HelpCircle } from 'lucide-react';

interface PoolGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPoolCreated: (pool: RoleQuestionPool) => void;
}

export const PoolGeneratorModal: React.FC<PoolGeneratorModalProps> = ({
  isOpen,
  onClose,
  onPoolCreated,
}) => {
  const [roleName, setRoleName] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('Senior');
  const [customFocus, setCustomFocus] = useState('');
  const [questionCount, setQuestionCount] = useState<number>(20);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleName.trim()) {
      setError('Please enter a role title (e.g. AI Systems Engineer).');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const res = await fetch('/api/question-bank/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roleName: roleName.trim(),
          experienceLevel,
          customFocus: customFocus.trim(),
          questionCount,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to generate question bank from server.');
      }

      const pool: RoleQuestionPool = await res.json();
      onPoolCreated(pool);
      onClose();
      // Reset form
      setRoleName('');
      setCustomFocus('');
    } catch (err: any) {
      console.error(err);
      let msg = err.message || 'Error communicating with Gemini API server.';
      if (msg.startsWith('{')) {
        try {
          const parsed = JSON.parse(msg);
          if (parsed.error?.message) {
            msg = parsed.error.message;
          }
        } catch {
          // ignore
        }
      }
      if (msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('rate limit')) {
        msg = 'Gemini API rate limit reached (429). Please wait ~15-30 seconds and try again, or select one of the existing question banks on the main screen.';
      }
      setError(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#0F0F12] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl text-slate-100">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/5">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Generate Role Question Pool</h3>
              <p className="text-[11px] font-mono text-slate-400">Step 1 — One-time setup via Gemini AI</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isGenerating}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleGenerate} className="p-6 space-y-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start space-x-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
              Target Role Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Senior Frontend Engineer, Cloud Architect, AI Product Manager"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              disabled={isGenerating}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-600 text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
              Target Experience Level
            </label>
            <select
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value)}
              disabled={isGenerating}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F0F12] border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all disabled:opacity-50"
            >
              <option value="Junior">Junior (0-2 years)</option>
              <option value="Mid-Level">Mid-Level (2-5 years)</option>
              <option value="Senior">Senior (5-8 years)</option>
              <option value="Lead / Principal">Lead / Principal (8+ years)</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
              Special Tech Focus or Key Requirements (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Focus heavily on React 19, GraphQL, Micro-frontends, high-concurrency systems, or distributed security"
              value={customFocus}
              onChange={(e) => setCustomFocus(e.target.value)}
              disabled={isGenerating}
              className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-600 text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all disabled:opacity-50 resize-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
              Questions to Generate in Pool
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[5, 10, 20].map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => setQuestionCount(count)}
                  disabled={isGenerating}
                  className={`py-2 px-3 rounded-xl border text-xs font-mono font-semibold transition-all flex flex-col items-center justify-center ${
                    questionCount === count
                      ? 'bg-indigo-600/30 border-indigo-500 text-white shadow-md shadow-indigo-950/50 ring-1 ring-indigo-500/50'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span className="text-xs font-bold text-white">{count} Questions</span>
                  <span className="text-[9px] uppercase tracking-wider text-slate-400">
                    {count === 5 ? 'Express' : count === 10 ? 'Standard' : 'Full Pool'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white/5 p-3.5 rounded-xl border border-white/5 text-xs text-slate-400 space-y-1">
            <div className="flex items-center space-x-1.5 text-indigo-400 font-bold uppercase tracking-wider text-[10px]">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>What happens next?</span>
            </div>
            <p className="text-slate-300 text-xs leading-relaxed">
              Gemini will generate a pool of {questionCount} categorized questions (Basic Fundamentals, Domain Specific, Recent Trends, Situational Scenarios) split across Easy, Medium, and Hard tiers with evaluation criteria.
            </p>
          </div>

          {/* Buttons */}
          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isGenerating}
              className="px-4 py-2.5 rounded-xl border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 text-xs font-semibold transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isGenerating || !roleName.trim()}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Generating {questionCount} Questions...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Generate Question Bank</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
