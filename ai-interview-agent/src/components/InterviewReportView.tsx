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
  UserCheck, 
  Clock, 
  Sparkles, 
  BarChart2, 
  TrendingUp, 
  ArrowLeft,
  Check,
  Brain
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
  const [expandedQuestionIdx, setExpandedQuestionIdx] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  // Print Report Handler
  const handlePrint = () => {
    window.print();
  };

  // Copy Summary Handler
  const handleCopySummary = () => {
    const text = `INTERVIEW ASSESSMENT REPORT
Candidate: ${report.candidateName}
Role: ${report.roleName} (${report.experienceLevel})
Overall Score: ${report.overallScore}/100
Recommendation: ${report.recommendation}

EXECUTIVE SUMMARY:
${report.summary}

STRENGTHS:
${report.strengths.map((s) => `- ${s}`).join('\n')}

WEAKNESSES / GAPS:
${report.weaknesses.map((w) => `- ${w}`).join('\n')}

RECOMMENDED LIVE FOLLOW-UP QUESTIONS:
${report.followUpQuestionsForInterviewer.map((q, i) => `${i + 1}. ${q}`).join('\n')}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Export JSON Report
  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(report, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `interview_report_${report.candidateName.replace(/\s+/g, '_')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const getRecommendationBadge = (rec: string) => {
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

  // Category Chart Colors
  const categoryColors = ['#6366f1', '#3b82f6', '#14b8a6', '#f59e0b'];

  // Map difficulty levels to numeric values for line chart
  const difficultyLineData = report.questionSessions.map((s, idx) => {
    const diff = s.question?.difficulty || 'medium';
    const diffVal = diff === 'easy' ? 1 : diff === 'medium' ? 2 : 3;
    return {
      question: `Q${idx + 1}`,
      difficultyVal: diffVal,
      difficultyLabel: diff.toUpperCase(),
      score: s.evaluation?.score || 0,
    };
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 text-slate-100">
      {/* Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 no-print">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-[#0F0F12] border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 text-xs font-semibold transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Candidates / Pools</span>
        </button>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopySummary}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-[#0F0F12] border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 text-xs font-semibold transition-all"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied!' : 'Copy Summary'}</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-[#0F0F12] border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 text-xs font-semibold transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Candidate Header Card */}
      <div className="bg-[#0F0F12] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/10">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Official Assessment
              </span>
              <span className="text-xs text-slate-400 font-mono flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>{Math.round(report.totalTimeSpentSeconds / 60)} mins elapsed</span>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              {report.candidateName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Role: <span className="text-white font-semibold">{report.roleName}</span> ({report.experienceLevel})
              {report.candidateEmail && <span className="ml-2 font-mono text-slate-500">| {report.candidateEmail}</span>}
            </p>
          </div>

          {/* Score Ring & Recommendation Badge */}
          <div className="flex items-center space-x-6 bg-white/5 p-5 rounded-2xl border border-white/5 shrink-0">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-mono font-bold text-white">
                {report.overallScore}
                <span className="text-sm font-normal text-slate-500">/100</span>
              </div>
              <div className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mt-0.5">
                AI Score
              </div>
            </div>

            <div className="h-10 w-px bg-white/10" />

            <div className="text-center">
              <span
                className={`inline-block px-3.5 py-1.5 rounded-xl border text-xs font-extrabold uppercase tracking-widest ${getRecommendationBadge(
                  report.recommendation
                )}`}
              >
                {report.recommendation}
              </span>
              <div className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mt-1">
                Recommendation
              </div>
            </div>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-indigo-400 font-bold text-xs uppercase tracking-widest">
            <FileText className="w-4 h-4" />
            <span>Executive Summary</span>
          </div>
          <div className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-white/5 p-5 rounded-2xl border border-white/5 space-y-2">
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
      </div>

      {/* Analytics & Graphs Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category Breakdown Chart */}
        <div className="bg-[#0F0F12] border border-white/10 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-white flex items-center space-x-2">
              <BarChart2 className="w-4 h-4 text-indigo-400" />
              <span>Category Score Breakdown</span>
            </h3>
            <span className="text-xs font-mono text-slate-500">0 - 100 Scale</span>
          </div>

          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={report.categoryBreakdown} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="categoryName" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} tickLine={false} />
                <Tooltip
                  cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                  contentStyle={{ backgroundColor: '#0F0F12', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', color: '#f8fafc' }}
                />
                <Bar dataKey="score" radius={[8, 8, 0, 0]}>
                  {report.categoryBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={categoryColors[index % categoryColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Adaptive Difficulty Progression Line Chart */}
        <div className="bg-[#0F0F12] border border-white/10 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-white flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Adaptive Difficulty Trajectory</span>
            </h3>
            <span className="text-xs font-mono text-slate-500">Easy (1) → Hard (3)</span>
          </div>

          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={difficultyLineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="question" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} domain={[1, 3]} ticks={[1, 2, 3]} tickLine={false} />
                <Tooltip
                  cursor={{ stroke: 'rgba(255, 255, 255, 0.2)', strokeWidth: 1 }}
                  contentStyle={{ backgroundColor: '#0F0F12', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', color: '#f8fafc' }}
                  formatter={(value: any, name: any, item: any) => [`Tier: ${item.payload.difficultyLabel}, Score: ${item.payload.score}/100`, 'Trajectory']}
                />
                <Line type="monotone" dataKey="difficultyVal" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Strengths & Weaknesses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="bg-[#0F0F12] border border-white/10 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs uppercase tracking-widest">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>Key Candidate Strengths</span>
          </div>
          <ul className="space-y-2.5 text-xs text-slate-300">
            {report.strengths.map((s, idx) => (
              <li key={idx} className="flex items-start space-x-2.5 bg-white/5 p-3.5 rounded-xl border border-white/5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                <span className="leading-relaxed">{s}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Weaknesses */}
        <div className="bg-[#0F0F12] border border-white/10 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs uppercase tracking-widest">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>Technical Gaps & Weak Spots</span>
          </div>
          <ul className="space-y-2.5 text-xs text-slate-300">
            {report.weaknesses.map((w, idx) => (
              <li key={idx} className="flex items-start space-x-2.5 bg-white/5 p-3.5 rounded-xl border border-white/5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                <span className="leading-relaxed">{w}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Interviewer Cheat Sheet: Targeted Live Follow-up Questions */}
      <div className="bg-[#0F0F12] border border-indigo-500/30 rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl relative">
        <div className="flex items-center space-x-2 text-indigo-400 font-extrabold text-xs uppercase tracking-widest">
          <Brain className="w-5 h-5 text-indigo-400" />
          <span>Interviewer Live Cheat Sheet — Recommended Probing Questions</span>
        </div>
        <p className="text-xs text-slate-400">
          Hand these specific follow-up questions to the human interviewer for face-to-face probing based on identified technical gaps:
        </p>

        <div className="grid grid-cols-1 gap-3 pt-2">
          {report.followUpQuestionsForInterviewer.map((q, idx) => (
            <div
              key={idx}
              className="flex items-start space-x-3 bg-white/5 p-4 rounded-2xl border border-white/5 text-slate-200 text-xs font-medium leading-relaxed"
            >
              <span className="w-6 h-6 rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 flex items-center justify-center font-bold text-xs font-mono shrink-0">
                {idx + 1}
              </span>
              <p className="pt-0.5">{q}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Question-by-Question Detailed Audit Log */}
      <div className="bg-[#0F0F12] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-base text-white flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <span>Complete {report.questionSessions?.length || 20}-Question Session Audit Log</span>
          </h3>
          <span className="text-xs text-slate-500">Click any question to view transcript & evaluation</span>
        </div>

        <div className="space-y-3">
          {report.questionSessions.map((session, idx) => {
            const isExpanded = expandedQuestionIdx === idx;
            const evalData = session.evaluation;
            const score = evalData?.score || 0;
            const scoreColor = score >= 75 ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' : score >= 50 ? 'text-amber-400 border-amber-500/30 bg-amber-500/10' : 'text-rose-400 border-rose-500/30 bg-rose-500/10';

            return (
              <div
                key={idx}
                className="bg-white/5 border border-white/5 rounded-2xl overflow-hidden transition-all"
              >
                {/* Accordion Header */}
                <div
                  onClick={() => setExpandedQuestionIdx(isExpanded ? null : idx)}
                  className="p-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center space-x-3 overflow-hidden">
                    <span className="w-7 h-7 rounded-lg bg-white/10 text-white font-mono font-bold text-xs flex items-center justify-center shrink-0">
                      Q{idx + 1}
                    </span>
                    <div className="truncate">
                      <p className="text-xs font-semibold text-white truncate">
                        {session.question?.questionText}
                      </p>
                      <div className="flex items-center space-x-2 text-[10px] text-slate-500 mt-0.5 font-mono">
                        <span className="uppercase">{session.question?.category}</span>
                        <span>•</span>
                        <span className="uppercase">{session.question?.difficulty} Tier</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 shrink-0">
                    <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg border ${scoreColor}`}>
                      {score}/100
                    </span>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </div>
                </div>

                {/* Expanded Accordion Body */}
                {isExpanded && (
                  <div className="p-5 border-t border-white/5 bg-black/30 space-y-4 text-xs">
                    <div>
                      <span className="font-bold text-slate-500 uppercase tracking-widest text-[10px] block mb-1">
                        Candidate Response:
                      </span>
                      <p className="text-slate-200 bg-white/5 p-3.5 rounded-xl border border-white/5 leading-relaxed font-serif-italic text-sm">
                        "{session.candidateAnswer}"
                      </p>
                    </div>

                    {evalData && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                        <div className="space-y-2">
                          <span className="font-bold text-emerald-400 uppercase tracking-widest text-[10px] block">
                            Key Criteria Addressed:
                          </span>
                          <ul className="space-y-1 list-disc list-inside text-slate-300">
                            {evalData.keyPointsCovered.map((kp, kIdx) => (
                              <li key={kIdx}>{kp}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="space-y-2">
                          <span className="font-bold text-rose-400 uppercase tracking-widest text-[10px] block">
                            Missing Points / Suggestions:
                          </span>
                          <ul className="space-y-1 list-disc list-inside text-slate-300">
                            {evalData.missingOrInaccuratePoints.map((mp, mIdx) => (
                              <li key={mIdx}>{mp}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
