import React, { useState, useEffect } from 'react';
import {
  Layers,
  Plus,
  Clock,
  Code2,
  HelpCircle,
  Copy,
  Check,
  ExternalLink,
  Edit2,
  Trash2,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  Lock,
  Play,
  Database,
  RefreshCw,
  Info
} from 'lucide-react';
import {
  HybridQuestionSet,
  HybridAssessmentRecord,
  RoleQuestionPool
} from '../../types';
import {
  fetchHybridSetsFromStorage,
  fetchHybridSetsAsync,
  saveHybridSetAsync,
  deleteHybridSetAsync,
  generateSecureHybridToken,
  saveHybridAssessment,
  secondsToMMSS,
  HYBRID_SETS_SCHEMA_SQL
} from '../../lib/hybridStorage';
import { isSupabaseConfigured } from '../../lib/supabase';
import { HybridSetBuilderModal } from './HybridSetBuilderModal';

interface InterviewModeViewProps {
  pools: RoleQuestionPool[];
  onLaunchCandidateAssessment: (token: string) => void;
}

export const InterviewModeView: React.FC<InterviewModeViewProps> = ({
  pools,
  onLaunchCandidateAssessment
}) => {
  const [sets, setSets] = useState<HybridQuestionSet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedSetForEdit, setSelectedSetForEdit] = useState<HybridQuestionSet | null>(null);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [setToDelete, setSetToDelete] = useState<HybridQuestionSet | null>(null);
  const [showSqlModal, setShowSqlModal] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  // Link generation modal state
  const [linkModalSet, setLinkModalSet] = useState<HybridQuestionSet | null>(null);
  const [candidateNameInput, setCandidateNameInput] = useState('');
  const [candidateEmailInput, setCandidateEmailInput] = useState('');
  const [proctorToggle, setProctorToggle] = useState(true);
  const [browserLockToggle, setBrowserLockToggle] = useState(true);
  const [generatedLink, setGeneratedLink] = useState('');
  const [generatedToken, setGeneratedToken] = useState('');
  const [hasCopied, setHasCopied] = useState(false);

  useEffect(() => {
    // Initial fast load from cache, then sync with Supabase SQL
    const cached = fetchHybridSetsFromStorage();
    if (cached && cached.length > 0) {
      setSets(cached);
    }
    loadSets();
  }, []);

  const loadSets = async () => {
    try {
      setIsRefreshing(true);
      const loaded = await fetchHybridSetsAsync();
      setSets(loaded);
    } catch (err) {
      console.warn('Error loading hybrid sets:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleSaveSet = async (set: HybridQuestionSet) => {
    // Optimistic local state update
    setSets((prev) => {
      const idx = prev.findIndex((s) => s.id === set.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = set;
        return next;
      }
      return [set, ...prev];
    });

    // Save to SQL Database + Storage
    await saveHybridSetAsync(set);
    loadSets();
  };

  const handleConfirmDelete = async () => {
    if (!setToDelete) return;
    const targetId = setToDelete.id;
    setSets((prev) => prev.filter((s) => s.id !== targetId));
    setSetToDelete(null);

    // Delete from SQL Database + Storage
    await deleteHybridSetAsync(targetId);
  };

  const handleDuplicateSet = async (set: HybridQuestionSet) => {
    const duplicated: HybridQuestionSet = {
      ...set,
      id: `hybrid-set-${Date.now()}`,
      title: `${set.title} (Copy)`,
      createdAt: new Date().toISOString(),
      mcqQuestions: set.mcqQuestions.map((q) => ({
        ...q,
        id: `hmcq-dup-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
      })),
      codingQuestions: set.codingQuestions.map((q) => ({
        ...q,
        id: `coding-dup-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
      }))
    };
    
    setSets((prev) => [duplicated, ...prev]);
    await saveHybridSetAsync(duplicated);
    loadSets();
  };

  const openGenerateLinkModal = (set: HybridQuestionSet) => {
    setLinkModalSet(set);
    setCandidateNameInput('');
    setCandidateEmailInput('');
    setProctorToggle(true);
    setBrowserLockToggle(true);
    setGeneratedLink('');
    setGeneratedToken('');
    setHasCopied(false);
  };

  const handleCreateAssessmentLink = () => {
    if (!linkModalSet) return;
    const token = generateSecureHybridToken();

    const record: HybridAssessmentRecord = {
      id: `hyb-record-${Date.now()}`,
      token,
      title: linkModalSet.title,
      setId: linkModalSet.id,
      setName: linkModalSet.title,
      codingLanguage: linkModalSet.codingLanguage,
      mcqDurationSeconds: linkModalSet.mcqDurationSeconds,
      intervalCountdownSeconds: linkModalSet.intervalCountdownSeconds,
      codingDurationSeconds: linkModalSet.codingDurationSeconds,
      mcqQuestions: linkModalSet.mcqQuestions,
      codingQuestions: linkModalSet.codingQuestions,
      candidateName: candidateNameInput.trim() || undefined,
      candidateEmail: candidateEmailInput.trim() || undefined,
      status: 'active',
      proctor_enabled: proctorToggle,
      browser_lock_enabled: browserLockToggle,
      createdAt: new Date().toISOString()
    };

    saveHybridAssessment(record);

    const baseUrl = window.location.origin;
    const fullUrl = `${baseUrl}/test/${token}`;
    setGeneratedLink(fullUrl);
    setGeneratedToken(token);
  };

  const copyToClipboard = () => {
    if (!generatedLink) return;
    navigator.clipboard.writeText(generatedLink);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2500);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(HYBRID_SETS_SCHEMA_SQL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in text-slate-100">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-slate-900/50 border border-indigo-500/20 rounded-2xl p-6 sm:p-8 backdrop-blur-md relative overflow-hidden shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium">
              <Layers className="w-3.5 h-3.5" />
              <span>Assessment Architecture</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Interview Mode
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Construct multi-round assessment sets combining Multiple Choice Questions (MCQ) and Coding sandboxes with independent timers, auto-advancing transition intervals, and unified candidate reporting.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setSelectedSetForEdit(null);
              setIsBuilderOpen(true);
            }}
            className="self-start md:self-center px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-xl text-xs sm:text-sm shadow-lg shadow-indigo-600/30 transition-all flex items-center space-x-2 shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Assessment Set</span>
          </button>
        </div>
      </div>

      {/* Sets Grid Header & Controls */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <h2 className="text-sm font-bold text-white flex items-center space-x-2">
              <span>Available Assessment Sets</span>
              <span className="text-xs font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
                {sets.length}
              </span>
            </h2>

            {/* Supabase SQL Status Badge */}
            <span
              className={`text-[10px] font-mono px-2.5 py-1 rounded-lg border flex items-center space-x-1.5 ${
                isSupabaseConfigured
                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-300 border-amber-500/20'
              }`}
              title={
                isSupabaseConfigured
                  ? 'Connected to Supabase PostgreSQL - sets persist across all browsers'
                  : 'Operating in local cache fallback mode'
              }
            >
              <Database className="w-3 h-3" />
              <span>{isSupabaseConfigured ? 'SQL Database Connected' : 'Local Fallback'}</span>
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={loadSets}
              disabled={isRefreshing}
              className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-xl text-xs font-medium border border-white/10 transition-all flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-indigo-400' : ''}`} />
              <span>{isRefreshing ? 'Syncing...' : 'Sync Database'}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowSqlModal(true)}
              className="px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-xl text-xs font-medium transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <Database className="w-3.5 h-3.5" />
              <span>SQL Schema</span>
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-16 bg-[#121216] border border-white/10 rounded-2xl space-y-3">
            <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
            <p className="text-xs text-slate-400">Loading Assessment Sets from SQL database...</p>
          </div>
        ) : sets.length === 0 ? (
          <div className="text-center py-16 bg-[#121216] border border-dashed border-white/10 rounded-2xl space-y-3">
            <Layers className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-sm text-slate-400">No Assessment Sets created yet.</p>
            <button
              type="button"
              onClick={() => {
                setSelectedSetForEdit(null);
                setIsBuilderOpen(true);
              }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
            >
              Create First Assessment Set
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {sets.map((set) => (
              <div
                key={set.id}
                className="bg-[#121216] border border-white/10 hover:border-white/20 rounded-2xl p-5 space-y-4 shadow-lg transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 flex-wrap gap-1">
                        <h3 className="font-bold text-sm text-white">{set.title}</h3>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-300 border border-white/10 uppercase">
                          {set.codingLanguage === 'java' ? 'Java' : 'Python'}
                        </span>
                      </div>
                      {set.description && (
                        <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                          {set.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center space-x-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedSetForEdit(set);
                          setIsBuilderOpen(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-all"
                        title="Edit Set"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDuplicateSet(set)}
                        className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-all"
                        title="Duplicate Set"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setSetToDelete(set)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-all cursor-pointer"
                        title="Delete Set"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Badges / Round Details */}
                  <div className="grid grid-cols-3 gap-2 pt-1 text-xs">
                    <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 space-y-1">
                      <div className="flex items-center space-x-1 text-indigo-400 font-semibold text-[11px]">
                        <HelpCircle className="w-3 h-3" />
                        <span>Section 1: MCQ</span>
                      </div>
                      <p className="text-white font-medium">
                        {set.mcqQuestions.length} Questions
                      </p>
                      <p className="text-[10px] font-mono text-slate-400 flex items-center space-x-1">
                        <Clock className="w-2.5 h-2.5" />
                        <span>{secondsToMMSS(set.mcqDurationSeconds)}</span>
                      </p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 space-y-1">
                      <div className="flex items-center space-x-1 text-amber-400 font-semibold text-[11px]">
                        <ArrowRight className="w-3 h-3" />
                        <span>Transition</span>
                      </div>
                      <p className="text-white font-medium">Auto-Advance</p>
                      <p className="text-[10px] font-mono text-slate-400 flex items-center space-x-1">
                        <Clock className="w-2.5 h-2.5" />
                        <span>{set.intervalCountdownSeconds}s countdown</span>
                      </p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 space-y-1">
                      <div className="flex items-center space-x-1 text-purple-400 font-semibold text-[11px]">
                        <Code2 className="w-3 h-3" />
                        <span>Section 2: Code</span>
                      </div>
                      <p className="text-white font-medium">
                        {set.codingQuestions.length} Problems
                      </p>
                      <p className="text-[10px] font-mono text-slate-400 flex items-center space-x-1">
                        <Clock className="w-2.5 h-2.5" />
                        <span>{secondsToMMSS(set.codingDurationSeconds)}</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                  <span className="text-[10px] font-mono text-slate-500">
                    Total Questions: {set.mcqQuestions.length + set.codingQuestions.length}
                  </span>

                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => openGenerateLinkModal(set)}
                      className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all flex items-center space-x-1.5"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Generate Link</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Builder Modal */}
      {isBuilderOpen && (
        <HybridSetBuilderModal
          key={selectedSetForEdit ? selectedSetForEdit.id : 'new-set'}
          isOpen={isBuilderOpen}
          onClose={() => {
            setIsBuilderOpen(false);
            setSelectedSetForEdit(null);
          }}
          onSaveSet={handleSaveSet}
          initialSet={selectedSetForEdit}
          pools={pools}
        />
      )}

      {/* Generate Candidate Link Modal */}
      {linkModalSet && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121216] border border-white/10 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl text-slate-100 animate-fade-in">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <ExternalLink className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Generate Candidate Link</h3>
                  <p className="text-[11px] text-slate-400">{linkModalSet.title}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setLinkModalSet(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-all"
              >
                ✕
              </button>
            </div>

            {!generatedLink ? (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-200">
                    Candidate Name <span className="text-slate-500 font-normal">(Optional pre-fill)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Jane Doe"
                    value={candidateNameInput}
                    onChange={(e) => setCandidateNameInput(e.target.value)}
                    className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-200">
                    Candidate Email <span className="text-slate-500 font-normal">(Optional pre-fill)</span>
                  </label>
                  <input
                    type="email"
                    placeholder="jane@example.com"
                    value={candidateEmailInput}
                    onChange={(e) => setCandidateEmailInput(e.target.value)}
                    className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-2.5">
                  <label className="flex items-start space-x-3 p-3 bg-black/40 rounded-xl border border-white/5 cursor-pointer hover:border-white/10 transition-colors">
                    <input
                      type="checkbox"
                      checked={proctorToggle}
                      onChange={(e) => setProctorToggle(e.target.checked)}
                      className="mt-0.5 rounded border-white/20 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div className="text-xs">
                      <span className="font-semibold text-white flex items-center space-x-1.5">
                        <ShieldAlert className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Enable AI Proctoring</span>
                      </span>
                      <span className="text-[11px] text-slate-400 leading-relaxed block mt-0.5">
                        Continuous camera integrity, multi-face alerts, and head orientation tracking.
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start space-x-3 p-3 bg-black/40 rounded-xl border border-white/5 cursor-pointer hover:border-white/10 transition-colors">
                    <input
                      type="checkbox"
                      checked={browserLockToggle}
                      onChange={(e) => setBrowserLockToggle(e.target.checked)}
                      className="mt-0.5 rounded border-white/20 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div className="text-xs">
                      <span className="font-semibold text-white flex items-center space-x-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Enable Exam Integrity Guard</span>
                      </span>
                      <span className="text-[11px] text-slate-400 leading-relaxed block mt-0.5">
                        Mandatory fullscreen, tab switch detection, external paste protection, and 3-strike auto-disqualification.
                      </span>
                    </div>
                  </label>
                </div>

                <div className="pt-2 flex justify-end space-x-2.5">
                  <button
                    type="button"
                    onClick={() => setLinkModalSet(null)}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-xs font-semibold transition-all border border-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateAssessmentLink}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all flex items-center space-x-1.5"
                  >
                    <span>Generate Assessment Link</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-300 text-xs font-medium flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Unique candidate link created successfully!</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Candidate Assessment URL
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      readOnly
                      value={generatedLink}
                      className="flex-1 px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-white text-xs font-mono select-all focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={copyToClipboard}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1 shrink-0 ${
                        hasCopied
                          ? 'bg-emerald-600 text-white'
                          : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30'
                      }`}
                    >
                      {hasCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => {
                      setLinkModalSet(null);
                    }}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-xs font-semibold transition-all border border-white/10"
                  >
                    Done
                  </button>

                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => {
                        onLaunchCandidateAssessment(generatedToken);
                        setLinkModalSet(null);
                      }}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-purple-600/30 transition-all flex items-center space-x-1.5"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Test as Candidate</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {setToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#121216] border border-white/10 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl text-slate-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Delete Assessment Set?</h3>
                <p className="text-xs text-slate-400">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-black/40 p-3 rounded-xl border border-white/5">
              Are you sure you want to delete <strong className="text-white">&ldquo;{setToDelete.title}&rdquo;</strong>? All questions and configuration in this assessment set will be removed.
            </p>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setSetToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white rounded-xl hover:bg-white/5 transition-all border border-white/10 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-md shadow-rose-600/30 transition-all flex items-center space-x-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Set</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Supabase SQL Schema Modal */}
      {showSqlModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#121216] border border-indigo-500/30 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl text-slate-100 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Supabase SQL Schema - Interview Mode</h3>
                  <p className="text-[11px] text-slate-400">
                    Execute this query in your Supabase SQL Editor to persist sets across all devices
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowSqlModal(false)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded-lg hover:bg-white/5"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 overflow-y-auto flex-1 pr-1">
              <div className="bg-indigo-950/30 border border-indigo-500/20 rounded-xl p-3 flex items-start space-x-2.5 text-xs text-indigo-200">
                <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <p>
                  Running this SQL query creates the <code>hybrid_question_sets</code> table with public RLS policies so creating, editing, and deleting sets will instantly synchronize for all users and devices.
                </p>
              </div>

              <div className="relative">
                <pre className="bg-black/80 border border-white/10 rounded-xl p-4 text-[11px] font-mono text-emerald-300 overflow-x-auto whitespace-pre leading-relaxed select-all">
                  {HYBRID_SETS_SCHEMA_SQL.trim()}
                </pre>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={handleCopySql}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center space-x-1.5 cursor-pointer"
              >
                {copiedSql ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Copied SQL to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy SQL Schema Query</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setShowSqlModal(false)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium rounded-xl border border-white/10 transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
