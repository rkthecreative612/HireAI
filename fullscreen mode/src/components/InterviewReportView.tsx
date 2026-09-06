import React, { useState } from 'react';
import { InterviewReport } from '../types';
import { 
  Award, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  FileText, 
  Printer, 
  Copy, 
  Download, 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  ArrowLeft,
  Check,
  Brain,
  ShieldAlert,
  ShieldCheck,
  XCircle,
  Layers,
  Code2,
  Terminal,
  Filter,
  Eye,
  CheckCheck,
  Info
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell, 
  LineChart, 
  Line, 
  CartesianGrid 
} from 'recharts';

interface InterviewReportViewProps {
  report: InterviewReport;
  onBack: () => void;
}

export const InterviewReportView: React.FC<InterviewReportViewProps> = ({
  report,
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'mcq' | 'coding' | 'integrity' | 'summary'>('all');
  const [mcqFilter, setMcqFilter] = useState<'all' | 'correct' | 'wrong' | 'unattempted'>('all');
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [expandedCodingTests, setExpandedCodingTests] = useState<{ [qId: string]: boolean }>({});
  const [expandedStandardIdx, setExpandedStandardIdx] = useState<number | null>(null);

  const isHybrid = report.assessmentType === 'hybrid' || Boolean(report.hybridReportData);
  const isCodingOnly = report.assessmentType === 'coding' && !report.hybridReportData;
  const isStandard = !isHybrid && !isCodingOnly;

  // Derive hybridData safely if report.hybridReportData is present or can be inferred
  const hybridData = report.hybridReportData || (() => {
    if (report.assessmentType === 'hybrid' && report.codingReportData && report.questionSessions && report.questionSessions.length > 0) {
      const mcqQs = report.questionSessions.filter((qs) => qs.question?.options && qs.question.options.length > 0);
      if (mcqQs.length > 0) {
        let correct = 0;
        let attempted = 0;
        let wrong = 0;
        const mcqResults = mcqQs.map((qs) => {
          const isAttended = qs.candidateAnswer && qs.candidateAnswer !== '(Unattempted)';
          if (isAttended) attempted++;
          const isCorr = qs.evaluation?.score === 100;
          if (isCorr) correct++;
          else if (isAttended) wrong++;
          const correctIdx = (qs.question.options || []).indexOf(qs.question.correctAnswer || '');
          const candIdx = (qs.question.options || []).indexOf(qs.candidateAnswer || '');
          return {
            questionId: qs.question.id,
            questionText: qs.question.questionText,
            options: qs.question.options || [],
            correctAnswerIndex: correctIdx >= 0 ? correctIdx : 0,
            candidateAnswerIndex: isAttended && candIdx >= 0 ? candIdx : null,
            isCorrect: isCorr,
            difficulty: qs.question.difficulty
          };
        });
        return {
          mcqTotal: mcqQs.length,
          mcqAttempted: attempted,
          mcqCorrect: correct,
          mcqWrong: wrong,
          mcqScorePercent: Math.round((correct / mcqQs.length) * 100),
          mcqTimeSpentSeconds: 0,
          mcqResults,
          codingReportData: report.codingReportData
        };
      }
    }
    return undefined;
  })();

  const cData = hybridData?.codingReportData || report.codingReportData;
  const mcqList = hybridData?.mcqResults || [];

  // Filtered MCQ items
  const filteredMcqs = mcqList.filter((q) => {
    const isAttended = q.candidateAnswerIndex !== null && q.candidateAnswerIndex !== undefined;
    if (mcqFilter === 'correct') return q.isCorrect;
    if (mcqFilter === 'wrong') return isAttended && !q.isCorrect;
    if (mcqFilter === 'unattempted') return !isAttended;
    return true;
  });

  // Calculate strike counts & status
  const secStrikes = report.security_strikes_count ?? 0;
  const procStrikes = report.proctor_strikes_count ?? report.proctorStrikesCount ?? 0;
  const totalStrikes = secStrikes + procStrikes;
  const isTerminated = report.proctor_terminated || report.proctorTerminated || report.browser_lock_terminated || totalStrikes >= 3 || report.summary.toLowerCase().includes('terminated') || report.summary.toLowerCase().includes('disqualified');

  const allSecurityEvents = [
    ...(report.security_events || []).map(e => ({ ...e, source: 'Browser Integrity' })),
    ...(report.proctor_events || report.proctorEvents || []).map(e => ({ ...e, source: 'AI Camera Proctor' }))
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Print Report Handler
  const handlePrint = () => {
    window.print();
  };

  // Copy Summary Handler
  const handleCopySummary = () => {
    const text = `ASSESSMENT EVALUATION REPORT
Candidate: ${report.candidateName}
Role / Set: ${report.roleName}
Total Score: ${report.overallScore}/100
Recommendation: ${report.recommendation}
Status: ${isTerminated ? 'DISQUALIFIED / TERMINATED (Integrity Policy Violation)' : 'COMPLETED'}

SECTION 1 (MCQ PERFORMANCE):
- Correct: ${hybridData?.mcqCorrect ?? 0} / ${hybridData?.mcqTotal ?? 0} (${hybridData?.mcqScorePercent ?? 0}%)
- Attended: ${hybridData?.mcqAttempted ?? 0} | Wrong Attempts: ${hybridData?.mcqWrong ?? 0}

SECTION 2 (CODING PERFORMANCE):
- Solved: ${cData?.solvedQuestions ?? 0} / ${cData?.totalQuestions ?? 0} Problems
- Test Cases: ${cData?.passedTestCases ?? 0} / ${cData?.totalTestCases ?? 0} Passed (${cData?.totalTestCases ? Math.round(((cData?.passedTestCases ?? 0) / cData.totalTestCases) * 100) : 100}%)

INTEGRITY AUDIT:
- Integrity Strikes Recorded: ${totalStrikes}
- Termination: ${isTerminated ? 'Yes' : 'No'}

EXECUTIVE SUMMARY:
${report.summary}`;

    navigator.clipboard.writeText(text);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  // Copy Code Handler
  const handleCopyCode = (qId: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(qId);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  // Export JSON Report
  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(report, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `assessment_report_${report.candidateName.replace(/\s+/g, '_')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const getRecommendationBadge = (rec: string) => {
    if (isTerminated) {
      return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
    }
    switch (rec) {
      case 'Strong Hire':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'Hire':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'Borderline':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      default:
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
    }
  };

  const getCodingStatusBadge = (status: string) => {
    switch (status) {
      case 'Solved':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'Partial':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'Failed':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      default:
        return 'bg-slate-800 text-slate-400 border-white/10';
    }
  };

  const formatSec = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s}s`;
  };

  // Clean assessment name
  const cleanRoleName = report.roleName
    .replace(/\s*\[\s*hybrid\s*\]/gi, '')
    .replace(/\s*\(\s*hybrid\s*\)/gi, '')
    .trim();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6 text-slate-100">
      {/* Top Header & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 no-print">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-[#0F0F12] border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 text-xs font-semibold transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Reports Directory</span>
        </button>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopySummary}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-[#0F0F12] border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 text-xs font-semibold transition-all cursor-pointer"
          >
            {copiedSummary ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copiedSummary ? 'Copied Summary' : 'Copy Summary'}</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-[#0F0F12] border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 text-xs font-semibold transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Main Candidate Card */}
      <div className="bg-[#0F0F12] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
        {/* Candidate Identity and Key Badges */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-white/10">
          <div className="space-y-2.5">
            <div className="flex items-center space-x-2.5 flex-wrap gap-y-2">
              <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                {isHybrid ? 'Dual Assessment Report' : isCodingOnly ? 'Coding Assessment Report' : 'Interview Report'}
              </span>

              {isHybrid && (
                <span className="text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center space-x-1">
                  <Layers className="w-3 h-3" />
                  <span>MCQ + Coding</span>
                </span>
              )}

              {/* Integrity Strike Badge */}
              <span
                className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-lg border flex items-center space-x-1.5 ${
                  isTerminated
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-sm shadow-rose-500/20'
                    : totalStrikes > 0
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                }`}
              >
                {isTerminated ? (
                  <>
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                    <span>Terminated: Disqualified (3 Strikes)</span>
                  </>
                ) : totalStrikes > 0 ? (
                  <>
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                    <span>{totalStrikes} Integrity Strike(s)</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Clean Integrity (0 Strikes)</span>
                  </>
                )}
              </span>

              <span className="text-xs text-slate-400 font-mono flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>{Math.round(report.totalTimeSpentSeconds / 60)} mins total duration</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {report.candidateName}
            </h1>

            <p className="text-xs sm:text-sm text-slate-400">
              Assessment Set: <span className="text-white font-semibold">{cleanRoleName}</span>
              {report.candidateEmail && (
                <span className="ml-2 font-mono text-slate-400">| {report.candidateEmail}</span>
              )}
            </p>
          </div>

          {/* Overall Score & Recommendation Cards */}
          <div className="flex items-center space-x-4 sm:space-x-6 bg-white/5 p-4 sm:p-5 rounded-2xl border border-white/5 shrink-0">
            {/* Total / Overall Score */}
            <div className="text-center min-w-[100px]">
              <div className="text-3xl sm:text-4xl font-mono font-bold text-white tracking-tight">
                {report.overallScore}
                <span className="text-sm font-normal text-slate-500">/100</span>
              </div>
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mt-1">
                Total Score
              </div>
              {isHybrid && (
                <div className="text-[9px] text-indigo-400/80 font-mono mt-0.5">
                  40% MCQ + 60% Code
                </div>
              )}
            </div>

            <div className="h-12 w-px bg-white/10" />

            {/* Recommendation */}
            <div className="text-center min-w-[110px]">
              <span
                className={`inline-block px-3.5 py-1.5 rounded-xl border text-xs font-extrabold uppercase tracking-widest ${getRecommendationBadge(
                  report.recommendation
                )}`}
              >
                {report.recommendation}
              </span>
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mt-1.5">
                Recommendation
              </div>
            </div>
          </div>
        </div>

        {/* Section Score Breakdown Ribbon */}
        {isHybrid && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-black/40 p-3.5 rounded-2xl border border-white/5">
            {/* MCQ Breakdown */}
            <div className="p-2.5 rounded-xl bg-indigo-500/5 border border-indigo-500/20 space-y-0.5">
              <span className="text-[10px] uppercase font-bold text-indigo-300 tracking-wider block">
                Section 1: MCQ Score
              </span>
              <div className="text-lg font-mono font-bold text-white">
                {hybridData?.mcqScorePercent ?? 0}%{' '}
                <span className="text-xs text-indigo-400 font-normal">
                  ({hybridData?.mcqCorrect ?? 0}/{hybridData?.mcqTotal ?? 0} Correct)
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">
                {hybridData?.mcqAttempted ?? 0} Attended • {hybridData?.mcqWrong ?? 0} Wrong
              </p>
            </div>

            {/* Coding Breakdown */}
            <div className="p-2.5 rounded-xl bg-purple-500/5 border border-purple-500/20 space-y-0.5">
              <span className="text-[10px] uppercase font-bold text-purple-300 tracking-wider block">
                Section 2: Coding Score
              </span>
              <div className="text-lg font-mono font-bold text-white">
                {cData?.totalTestCases
                  ? Math.round(((cData?.passedTestCases ?? 0) / cData.totalTestCases) * 100)
                  : 100}%{' '}
                <span className="text-xs text-purple-400 font-normal">
                  ({cData?.passedTestCases ?? 0}/{cData?.totalTestCases ?? 0} Tests)
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">
                {cData?.solvedQuestions ?? 0}/{cData?.totalQuestions ?? 0} Problems Solved
              </p>
            </div>

            {/* Score Calculation Formula */}
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 space-y-0.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Score Weighting
              </span>
              <div className="text-sm font-mono font-bold text-slate-200 mt-1">
                {(hybridData?.mcqScorePercent ?? 0) * 0.4} + {(cData?.totalTestCases ? Math.round(((cData?.passedTestCases ?? 0) / cData.totalTestCases) * 100) : 100) * 0.6}
              </div>
              <p className="text-[10px] text-slate-400 font-mono">
                = {report.overallScore} / 100 Final
              </p>
            </div>

            {/* Security Audit */}
            <div className={`p-2.5 rounded-xl border space-y-0.5 ${
              isTerminated ? 'bg-rose-500/10 border-rose-500/30' : totalStrikes > 0 ? 'bg-amber-500/10 border-amber-500/30' : 'bg-emerald-500/5 border-emerald-500/20'
            }`}>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Integrity Status
              </span>
              <div className={`text-sm font-mono font-bold mt-1 ${isTerminated ? 'text-rose-400' : totalStrikes > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {isTerminated ? 'Disqualified' : totalStrikes > 0 ? `${totalStrikes} Strike(s)` : '100% Verified'}
              </div>
              <p className="text-[10px] text-slate-400 font-mono">
                {totalStrikes === 0 ? 'Zero Violations' : `${allSecurityEvents.length} log events`}
              </p>
            </div>
          </div>
        )}

        {/* Navigation Tabs for Easy Deep-Dive */}
        <div className="flex items-center space-x-2 border-b border-white/10 pb-3 overflow-x-auto no-print">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
              activeTab === 'all'
                ? 'bg-white/15 text-white font-bold border border-white/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            Show Full Report
          </button>

          {isHybrid && (
            <button
              type="button"
              onClick={() => setActiveTab('mcq')}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                activeTab === 'mcq'
                  ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30 border border-indigo-500'
                  : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5 text-indigo-300" />
              <span>MCQ Responses ({hybridData?.mcqCorrect ?? 0}/{hybridData?.mcqTotal ?? 0})</span>
            </button>
          )}

          {(isHybrid || isCodingOnly) && (
            <button
              type="button"
              onClick={() => setActiveTab('coding')}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                activeTab === 'coding'
                  ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-600/30 border border-purple-500'
                  : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <Code2 className="w-3.5 h-3.5 text-purple-300" />
              <span>Coding Submissions ({cData?.solvedQuestions ?? 0}/{cData?.totalQuestions ?? 0})</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setActiveTab('integrity')}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
              activeTab === 'integrity'
                ? totalStrikes > 0 ? 'bg-rose-600 text-white font-bold' : 'bg-emerald-600 text-white font-bold'
                : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            {totalStrikes > 0 ? <ShieldAlert className="w-3.5 h-3.5 text-rose-200" /> : <ShieldCheck className="w-3.5 h-3.5 text-emerald-200" />}
            <span>Integrity & Strikes ({totalStrikes})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('summary')}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
              activeTab === 'summary'
                ? 'bg-white/15 text-white font-bold border border-white/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Executive Summary</span>
          </button>
        </div>

        {/* SECTION 1: MCQ AUDIT (Attended vs Right vs Wrong) */}
        {(activeTab === 'all' || activeTab === 'mcq') && isHybrid && (
          <div className="bg-[#121217] border border-indigo-500/30 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
            {/* Section 1 Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
              <div>
                <div className="flex items-center space-x-2 text-indigo-400 font-bold text-xs uppercase tracking-widest">
                  <Layers className="w-4 h-4" />
                  <span>Section 1: Multiple Choice Questions (MCQ)</span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-white mt-1">
                  MCQ Response Audit — Right vs. Wrong Responses
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Full question-by-question breakdown showing candidate choices and correct options.
                </p>
              </div>

              {/* Stat summary pills */}
              <div className="flex items-center space-x-2 flex-wrap gap-y-2">
                <span className="px-3 py-1.5 rounded-xl bg-blue-500/10 text-blue-300 border border-blue-500/20 text-xs font-mono font-bold">
                  {hybridData?.mcqAttempted ?? 0} Attended
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-xs font-mono font-bold flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{hybridData?.mcqCorrect ?? 0} Right</span>
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-300 border border-rose-500/20 text-xs font-mono font-bold flex items-center space-x-1">
                  <XCircle className="w-3.5 h-3.5 text-rose-400" />
                  <span>{hybridData?.mcqWrong ?? 0} Wrong</span>
                </span>
                {(hybridData?.mcqTotal ?? 0) > (hybridData?.mcqAttempted ?? 0) && (
                  <span className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-400 border border-white/10 text-xs font-mono">
                    {(hybridData?.mcqTotal ?? 0) - (hybridData?.mcqAttempted ?? 0)} Unattempted
                  </span>
                )}
              </div>
            </div>

            {/* Filter Chips */}
            <div className="flex items-center space-x-2 flex-wrap gap-y-2">
              <span className="text-xs text-slate-400 font-semibold flex items-center space-x-1 mr-1">
                <Filter className="w-3.5 h-3.5 text-slate-500" />
                <span>Filter:</span>
              </span>
              <button
                type="button"
                onClick={() => setMcqFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  mcqFilter === 'all'
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                    : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
                }`}
              >
                All Questions ({mcqList.length})
              </button>
              <button
                type="button"
                onClick={() => setMcqFilter('correct')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  mcqFilter === 'correct'
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-600/30'
                    : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
                }`}
              >
                Right / Correct ({hybridData?.mcqCorrect ?? 0})
              </button>
              <button
                type="button"
                onClick={() => setMcqFilter('wrong')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  mcqFilter === 'wrong'
                    ? 'bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-600/30'
                    : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
                }`}
              >
                Wrong Attempted ({hybridData?.mcqWrong ?? 0})
              </button>
              {(hybridData?.mcqTotal ?? 0) > (hybridData?.mcqAttempted ?? 0) && (
                <button
                  type="button"
                  onClick={() => setMcqFilter('unattempted')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    mcqFilter === 'unattempted'
                      ? 'bg-slate-700 text-white border-slate-600'
                      : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
                  }`}
                >
                  Unattempted ({(hybridData?.mcqTotal ?? 0) - (hybridData?.mcqAttempted ?? 0)})
                </button>
              )}
            </div>

            {/* Questions List */}
            <div className="space-y-4">
              {filteredMcqs.length === 0 ? (
                <div className="p-8 text-center bg-white/5 rounded-2xl border border-white/5 text-slate-400 text-xs">
                  No MCQ questions matching filter "{mcqFilter}".
                </div>
              ) : (
                filteredMcqs.map((q, idx) => {
                  const isAttended = q.candidateAnswerIndex !== null && q.candidateAnswerIndex !== undefined;
                  const isCorrect = q.isCorrect;
                  const isWrong = isAttended && !isCorrect;
                  const isUnattempted = !isAttended;

                  return (
                    <div
                      key={q.questionId || idx}
                      className={`bg-white/5 border rounded-2xl p-5 space-y-3.5 transition-all ${
                        isCorrect
                          ? 'border-emerald-500/40 bg-emerald-950/10'
                          : isWrong
                          ? 'border-rose-500/40 bg-rose-950/10'
                          : 'border-white/10'
                      }`}
                    >
                      {/* Header of Question */}
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-slate-300 font-mono bg-black/40 px-2 py-1 rounded-lg border border-white/10">
                            Q{idx + 1}
                          </span>
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                              q.difficulty === 'easy'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : q.difficulty === 'hard'
                                ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            }`}
                          >
                            {q.difficulty || 'Medium'}
                          </span>
                        </div>

                        {/* Status Badges */}
                        {isCorrect && (
                          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/50">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span>Right / Correct Answer</span>
                          </span>
                        )}
                        {isWrong && (
                          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/50">
                            <XCircle className="w-4 h-4 text-rose-400" />
                            <span>Wrong Attempt</span>
                          </span>
                        )}
                        {isUnattempted && (
                          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-500/15 text-slate-400 border border-white/10">
                            <AlertTriangle className="w-4 h-4 text-slate-400" />
                            <span>Not Attempted / Skipped</span>
                          </span>
                        )}
                      </div>

                      {/* Question Text */}
                      <p className="text-sm font-semibold text-white leading-relaxed">
                        {q.questionText}
                      </p>

                      {/* Options Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                        {q.options.map((opt, optIdx) => {
                          const isCandidateChoice = q.candidateAnswerIndex === optIdx;
                          const isActualCorrect = q.correctAnswerIndex === optIdx;

                          let optionStyle = 'bg-black/40 border-white/10 text-slate-300';
                          if (isCandidateChoice && isActualCorrect) {
                            optionStyle =
                              'bg-emerald-500/20 border-emerald-500/60 text-emerald-100 font-bold shadow-[0_0_12px_rgba(16,185,129,0.25)]';
                          } else if (isCandidateChoice && !isActualCorrect) {
                            optionStyle =
                              'bg-rose-500/20 border-rose-500/60 text-rose-100 font-bold shadow-[0_0_12px_rgba(244,63,94,0.2)]';
                          } else if (isActualCorrect) {
                            optionStyle =
                              'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 border-dashed font-semibold';
                          }

                          return (
                            <div
                              key={optIdx}
                              className={`p-3.5 rounded-xl border text-xs flex items-start justify-between space-x-2 transition-all ${optionStyle}`}
                            >
                              <div className="flex items-start space-x-2 min-w-0">
                                <span className={`w-5 h-5 rounded-md text-[10px] font-mono font-bold flex items-center justify-center shrink-0 border ${
                                  isCandidateChoice && isActualCorrect
                                    ? 'bg-emerald-500 text-black border-emerald-400'
                                    : isCandidateChoice && !isActualCorrect
                                    ? 'bg-rose-500 text-white border-rose-400'
                                    : isActualCorrect
                                    ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500/40'
                                    : 'bg-black/60 text-slate-400 border-white/10'
                                }`}>
                                  {String.fromCharCode(65 + optIdx)}
                                </span>
                                <span className="pt-0.5 break-words leading-relaxed">{opt}</span>
                              </div>

                              <div className="shrink-0 flex items-center space-x-1 text-[10px]">
                                {isCandidateChoice && isActualCorrect && (
                                  <span className="px-2 py-0.5 rounded bg-emerald-500/30 text-emerald-200 font-bold border border-emerald-500/50 flex items-center space-x-1">
                                    <Check className="w-3 h-3" />
                                    <span>Selected (Right)</span>
                                  </span>
                                )}
                                {isCandidateChoice && !isActualCorrect && (
                                  <span className="px-2 py-0.5 rounded bg-rose-500/30 text-rose-200 font-bold border border-rose-500/50 flex items-center space-x-1">
                                    <XCircle className="w-3 h-3" />
                                    <span>Selected (Wrong)</span>
                                  </span>
                                )}
                                {!isCandidateChoice && isActualCorrect && (
                                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                                    Correct Option
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* SECTION 2: CODING SOLUTIONS & TEST CASE ASSERTIONS */}
        {(activeTab === 'all' || activeTab === 'coding') && cData && (
          <div className="bg-[#121217] border border-purple-500/30 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
            {/* Section 2 Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
              <div>
                <div className="flex items-center space-x-2 text-purple-400 font-bold text-xs uppercase tracking-widest">
                  <Code2 className="w-4 h-4" />
                  <span>Section 2: Coding Sandbox & Automated Assertions</span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-white mt-1">
                  Submitted Source Code & Test Execution Results
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Review the exact code submitted by the candidate alongside test case assertion logs.
                </p>
              </div>

              <div className="flex items-center space-x-3 shrink-0">
                <span className="text-xs font-mono text-purple-300 px-3 py-1.5 bg-purple-500/10 rounded-xl border border-purple-500/20 font-bold">
                  {cData.solvedQuestions} / {cData.totalQuestions} Solved
                </span>
                <span className="text-xs font-mono text-indigo-300 px-3 py-1.5 bg-indigo-500/10 rounded-xl border border-indigo-500/20 font-bold">
                  {cData.passedTestCases} / {cData.totalTestCases} Tests Passed
                </span>
              </div>
            </div>

            {/* Coding Problems List */}
            <div className="space-y-6">
              {cData.questionResults.map((qRes, idx) => {
                const isTestsExpanded = expandedCodingTests[qRes.questionId] ?? true;

                return (
                  <div
                    key={qRes.questionId || idx}
                    className="bg-white/5 border border-white/10 rounded-2xl p-5 sm:p-6 space-y-4"
                  >
                    {/* Problem Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                      <div className="flex items-center space-x-3">
                        <span className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono font-bold text-sm flex items-center justify-center shrink-0">
                          Q{idx + 1}
                        </span>
                        <div>
                          <h3 className="font-bold text-white text-base">
                            {qRes.questionTitle}
                          </h3>
                          <div className="flex items-center space-x-2 text-[10px] mt-0.5">
                            <span
                              className={`px-2 py-0.5 rounded font-bold uppercase ${
                                qRes.difficulty === 'easy'
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : qRes.difficulty === 'medium'
                                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              }`}
                            >
                              {qRes.difficulty}
                            </span>
                            {qRes.timeTakenSeconds !== undefined && (
                              <span className="text-slate-400 font-mono">
                                • Time: {formatSec(qRes.timeTakenSeconds)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 shrink-0">
                        <span
                          className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-xl border ${getCodingStatusBadge(
                            qRes.status
                          )}`}
                        >
                          {qRes.status}
                        </span>
                        <div className="text-right font-mono">
                          <div className="text-xs font-bold text-white">
                            {qRes.passedCount} / {qRes.totalTestCases}{' '}
                            <span className="text-[10px] text-slate-400 font-normal">Passed</span>
                          </div>
                          <div className="text-[10px] text-indigo-400 font-bold">
                            Score: {qRes.score}%
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Submitted Code Block */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
                          <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Candidate Submitted Code</span>
                        </span>

                        {qRes.codeSubmitted && (
                          <button
                            type="button"
                            onClick={() => handleCopyCode(qRes.questionId, qRes.codeSubmitted)}
                            className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs border border-white/10 transition-all cursor-pointer"
                          >
                            {copiedCodeId === qRes.questionId ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-emerald-300">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5 text-slate-400" />
                                <span>Copy Code</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>

                      {qRes.codeSubmitted ? (
                        <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#09090c]">
                          <div className="bg-black/60 px-4 py-2 border-b border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-400">
                            <span className="text-indigo-300 font-semibold">
                              {report.roleName.includes('Python') ? 'solution.py' : 'Solution.java'}
                            </span>
                            <span>{qRes.codeSubmitted.split('\n').length} lines</span>
                          </div>
                          <pre className="p-4 text-xs font-mono text-emerald-300 overflow-x-auto max-h-72 leading-relaxed selection:bg-emerald-900 selection:text-white">
                            {qRes.codeSubmitted}
                          </pre>
                        </div>
                      ) : (
                        <div className="p-4 bg-black/40 rounded-xl border border-white/5 text-xs text-slate-400 italic">
                          No solution code submitted for this problem.
                        </div>
                      )}
                    </div>

                    {/* Test Case Execution Breakdown (if available) */}
                    {qRes.testCasesResults && qRes.testCasesResults.length > 0 && (
                      <div className="space-y-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setExpandedCodingTests(prev => ({ ...prev, [qRes.questionId]: !isTestsExpanded }))}
                          className="flex items-center space-x-1.5 text-xs font-bold text-slate-300 hover:text-white cursor-pointer"
                        >
                          {isTestsExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          <span>Test Case Execution Results ({qRes.passedCount}/{qRes.totalTestCases} Passed)</span>
                        </button>

                        {isTestsExpanded && (
                          <div className="grid grid-cols-1 gap-2 pt-1">
                            {qRes.testCasesResults.map((tc, tIdx) => (
                              <div
                                key={tIdx}
                                className={`p-3 rounded-xl border text-xs font-mono flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                                  tc.passed
                                    ? 'bg-emerald-500/5 border-emerald-500/20 text-slate-300'
                                    : 'bg-rose-500/10 border-rose-500/30 text-rose-200'
                                }`}
                              >
                                <div className="flex items-center space-x-2">
                                  {tc.passed ? (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                  ) : (
                                    <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                                  )}
                                  <span className="font-bold">Test Case {tIdx + 1}:</span>
                                  <span className="text-slate-400">Input: <code className="text-slate-200">{tc.input}</code></span>
                                </div>

                                <div className="flex items-center space-x-3 text-[11px]">
                                  <span>Expected: <code className="text-slate-200">{tc.expectedOutput}</code></span>
                                  {!tc.passed && tc.actualOutput && (
                                    <span className="text-rose-300 font-bold">Actual: <code>{tc.actualOutput}</code></span>
                                  )}
                                  <span className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${
                                    tc.passed ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                                  }`}>
                                    {tc.passed ? 'Passed' : 'Failed'}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SECTION 3: INTEGRITY & PROCTOR AUDIT (Clear Strike Violations) */}
        {(activeTab === 'all' || activeTab === 'integrity') && (
          <div
            className={`rounded-3xl p-6 sm:p-8 space-y-5 border shadow-xl ${
              isTerminated
                ? 'bg-rose-950/20 border-rose-500/40'
                : totalStrikes > 0
                ? 'bg-amber-950/20 border-amber-500/40'
                : 'bg-emerald-950/15 border-emerald-500/30'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${
                  isTerminated
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    : totalStrikes > 0
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                }`}>
                  {isTerminated ? <ShieldAlert className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg text-white">
                    Exam Integrity & Strike Audit Log
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Real-time monitoring of fullscreen locks, tab switches, developer tools, and camera gaze.
                  </p>
                </div>
              </div>

              <span
                className={`text-xs font-mono font-bold px-3 py-1.5 rounded-xl border shrink-0 ${
                  isTerminated
                    ? 'bg-rose-500/30 text-rose-200 border-rose-500/50 animate-pulse'
                    : totalStrikes > 0
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                }`}
              >
                {isTerminated
                  ? '⛔ 3/3 STRIKES — DISQUALIFIED & AUTO-TERMINATED'
                  : totalStrikes > 0
                  ? `⚠️ ${totalStrikes}/3 STRIKES RECORDED`
                  : '🟢 ZERO VIOLATIONS (CLEAN RECORD)'}
              </span>
            </div>

            {/* Termination Cause Banner */}
            {isTerminated && (
              <div className="p-4 bg-rose-500/20 border border-rose-500/40 rounded-2xl text-xs text-rose-100 space-y-1">
                <div className="font-bold text-sm text-rose-200 flex items-center space-x-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span>Assessment Disqualified</span>
                </div>
                <p>
                  The candidate exceeded the maximum integrity threshold (3 strikes) or triggered an immediate violation rule. Assessment was terminated early.
                </p>
                {(report.browser_lock_termination_reason || report.proctor_termination_reason) && (
                  <p className="font-mono text-[11px] text-rose-300/90 pt-1">
                    Cause: {report.browser_lock_termination_reason || report.proctor_termination_reason}
                  </p>
                )}
              </div>
            )}

            {/* Timeline of Strikes & Evidence */}
            {allSecurityEvents.length > 0 ? (
              <div className="space-y-2 pt-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                  Detailed Violation Timeline ({allSecurityEvents.length} Recorded)
                </span>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {allSecurityEvents.map((ev, eIdx) => (
                    <div
                      key={eIdx}
                      className="flex flex-col sm:flex-row sm:items-center justify-between text-xs bg-black/50 p-3 rounded-xl border border-white/10 text-slate-300 font-mono gap-2"
                    >
                      <div className="flex items-center space-x-2.5">
                        <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold shrink-0">
                          Strike {ev.strikeNumber || eIdx + 1}
                        </span>
                        <span className="text-white font-semibold">{ev.message}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-[11px] text-slate-400 shrink-0">
                        <span className="text-slate-500">{ev.source}</span>
                        <span>•</span>
                        <span>{ev.formattedTime || (ev.timestamp ? new Date(ev.timestamp).toLocaleTimeString() : '')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center space-x-3 text-xs text-emerald-300">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <h4 className="font-bold text-emerald-200">Integrity Verified</h4>
                  <p className="text-emerald-300/90">
                    The candidate maintained continuous fullscreen focus and adhered to all exam integrity guidelines with 0 strikes.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SECTION 4: EXECUTIVE SUMMARY & AI FEEDBACK */}
        {(activeTab === 'all' || activeTab === 'summary') && (
          <div className="space-y-6">
            {/* Executive Summary Card */}
            <div className="bg-[#121217] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
              <div className="flex items-center space-x-2 text-indigo-400 font-bold text-xs uppercase tracking-widest">
                <FileText className="w-4 h-4" />
                <span>Executive Evaluation Summary</span>
              </div>
              <div className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-black/40 p-5 rounded-2xl border border-white/5 space-y-2">
                {report.summary.includes('\n') || report.summary.includes('•') ? (
                  <div className="space-y-2">
                    {report.summary
                      .split(/\n+/)
                      .filter((line) => line.trim().length > 0)
                      .map((line, idx) => {
                        const cleanLine = line.replace(/^[•\-\*]\s*/, '').trim();
                        return (
                          <div key={idx} className="flex items-start space-x-2">
                            <span className="text-indigo-400 font-bold shrink-0 mt-0.5">•</span>
                            <span>{cleanLine}</span>
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  <p>{report.summary}</p>
                )}
              </div>
            </div>

            {/* Strengths & Weaknesses */}
            {((report.strengths && report.strengths.length > 0) || (report.weaknesses && report.weaknesses.length > 0)) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Strengths */}
                <div className="bg-[#121217] border border-white/10 rounded-3xl p-6 space-y-4 shadow-xl">
                  <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs uppercase tracking-widest">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Candidate Strengths</span>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {report.strengths.map((s, idx) => (
                      <li key={idx} className="flex items-start space-x-2.5 bg-white/5 p-3 rounded-xl border border-white/5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                        <span className="leading-relaxed">{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Weaknesses / Gaps */}
                <div className="bg-[#121217] border border-white/10 rounded-3xl p-6 space-y-4 shadow-xl">
                  <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs uppercase tracking-widest">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Knowledge Gaps & Weak Spots</span>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {report.weaknesses.map((w, idx) => (
                      <li key={idx} className="flex items-start space-x-2.5 bg-white/5 p-3 rounded-xl border border-white/5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                        <span className="leading-relaxed">{w}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Recommended Follow-up Questions for Interviewer */}
            {report.followUpQuestionsForInterviewer && report.followUpQuestionsForInterviewer.length > 0 && (
              <div className="bg-[#121217] border border-indigo-500/30 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
                <div className="flex items-center space-x-2 text-indigo-400 font-extrabold text-xs uppercase tracking-widest">
                  <Brain className="w-4 h-4 text-indigo-400" />
                  <span>Interviewer Follow-up Cheat Sheet — Live Probing Questions</span>
                </div>
                <p className="text-xs text-slate-400">
                  Recommended technical questions to ask in subsequent live interviews based on candidate performance:
                </p>

                <div className="grid grid-cols-1 gap-2.5 pt-1">
                  {report.followUpQuestionsForInterviewer.map((q, idx) => (
                    <div
                      key={idx}
                      className="flex items-start space-x-3 bg-white/5 p-3.5 rounded-xl border border-white/5 text-slate-200 text-xs font-medium leading-relaxed"
                    >
                      <span className="w-5 h-5 rounded-md bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 flex items-center justify-center font-bold text-xs font-mono shrink-0">
                        {idx + 1}
                      </span>
                      <p className="pt-0.5">{q}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
