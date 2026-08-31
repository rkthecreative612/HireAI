import React, { useState } from 'react';
import { InterviewReport } from '../types';
import { FileText, Search, UserCheck, Calendar, Clock, Award, ChevronRight, Trash2, RefreshCw, AlertCircle, Cloud, Loader2 } from 'lucide-react';

interface PastReportsViewProps {
  reports: InterviewReport[];
  onSelectReport: (report: InterviewReport) => void;
  onDeleteReport: (reportId: string) => void;
  onNewInterview: () => void;
  isLoadingReports?: boolean;
  reportsError?: string | null;
  onRefreshReports?: () => void;
}

export const PastReportsView: React.FC<PastReportsViewProps> = ({
  reports,
  onSelectReport,
  onDeleteReport,
  onNewInterview,
  isLoadingReports = false,
  reportsError = null,
  onRefreshReports,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = reports.filter(
    (r) =>
      r.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.roleName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRecommendationBadge = (rec: string) => {
    switch (rec) {
      case 'Strong Hire':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'Hire':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'Borderline':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      default:
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6 text-slate-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center space-x-2">
            <span>Interviewer Reports Directory</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono font-medium">
              {reports.length} Total
            </span>
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Browse and review candidate technical assessment reports and coding submissions loaded from Supabase.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          {onRefreshReports && (
            <button
              onClick={onRefreshReports}
              disabled={isLoadingReports}
              title="Sync latest reports from Supabase"
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingReports ? 'animate-spin text-indigo-400' : ''}`} />
              <span>{isLoadingReports ? 'Syncing...' : 'Refresh'}</span>
            </button>
          )}

          <button
            onClick={onNewInterview}
            className="flex items-center justify-center space-x-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 transition-all shrink-0 cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>Launch New Interview</span>
          </button>
        </div>
      </div>

      {/* Supabase Error Alert if query fails */}
      {reportsError && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-start space-x-3 text-xs text-rose-300">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-rose-200">Database Sync Error</h4>
            <p className="text-rose-300/90 leading-relaxed">{reportsError}</p>
            {onRefreshReports && (
              <button
                onClick={onRefreshReports}
                className="mt-1 text-xs text-rose-300 underline hover:text-rose-200 font-semibold cursor-pointer"
              >
                Retry Fetching from Supabase
              </button>
            )}
          </div>
        </div>
      )}

      {/* Search Input & Status Info */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by candidate name or role title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
          />
        </div>

        {isLoadingReports && (
          <div className="flex items-center space-x-2 text-xs text-indigo-400 font-mono">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Syncing reports from Supabase...</span>
          </div>
        )}
      </div>

      {/* Reports List */}
      {filtered.length === 0 ? (
        <div className="bg-[#0F0F12] border border-white/10 rounded-2xl p-12 text-center space-y-3">
          <FileText className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="font-bold text-white text-base">No Candidate Reports Found</h3>
          <p className="text-slate-400 text-xs max-w-sm mx-auto">
            {searchTerm ? 'No candidate matches your search terms.' : 'No completed candidate interviews or coding submissions found.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((report) => (
            <div
              key={report.id}
              className="bg-[#0F0F12] border border-white/10 hover:border-indigo-500/50 rounded-2xl p-5 space-y-4 transition-all shadow-xl group relative"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-base text-white group-hover:text-indigo-300 transition-colors">
                      {report.candidateName}
                    </h3>
                    {report.assessmentType === 'coding' && (
                      <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                        CODING
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">
                    {report.roleName} • <span className="font-mono text-slate-300">{report.experienceLevel}</span>
                  </p>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded border ${getRecommendationBadge(report.recommendation)}`}>
                    {report.recommendation}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Delete report for ${report.candidateName}?`)) {
                        onDeleteReport(report.id);
                      }
                    }}
                    className="text-slate-500 hover:text-rose-400 p-1 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                    title="Delete report"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs text-slate-400">
                <div className="flex items-center space-x-3 font-mono">
                  <span className="font-bold text-white text-sm">
                    {report.overallScore}<span className="text-xs text-slate-500 font-normal">/100</span>
                  </span>
                  <span>•</span>
                  <span>{new Date(report.completedAt).toLocaleDateString()}</span>
                </div>

                <button
                  onClick={() => onSelectReport(report)}
                  className="flex items-center space-x-1 text-indigo-400 font-semibold group-hover:translate-x-0.5 transition-transform cursor-pointer"
                >
                  <span>View Report</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
