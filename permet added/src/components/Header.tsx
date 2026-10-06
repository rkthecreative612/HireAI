import React, { useState } from 'react';
import { AppMode, RoleQuestionPool } from '../types';
import { Bot, FileText, Database, Sparkles, UserCheck, Play, RotateCcw, AlertTriangle, Code2, Layers, LogOut, User } from 'lucide-react';

interface HeaderProps {
  currentMode: AppMode;
  onSelectMode: (mode: AppMode) => void;
  selectedPool: RoleQuestionPool | null;
  reportsCount: number;
  poolsCount: number;
  onLoadSampleDemo: () => void;
  isCodingActive?: boolean;
  onAbandonAssessment?: () => void;
  userEmail?: string | null;
  onSignOut?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentMode,
  onSelectMode,
  selectedPool,
  reportsCount,
  poolsCount,
  onLoadSampleDemo,
  isCodingActive = false,
  onAbandonAssessment,
  userEmail,
  onSignOut,
}) => {
  const [pendingTargetMode, setPendingTargetMode] = useState<AppMode | null>(null);

  const isAssessmentInProgress =
    (currentMode === 'interview_kiosk') ||
    (currentMode === 'coding' && isCodingActive);

  const handleNavClick = (mode: AppMode) => {
    if (isAssessmentInProgress && mode !== currentMode) {
      setPendingTargetMode(mode);
    } else {
      onSelectMode(mode);
    }
  };

  const confirmNavigation = () => {
    if (pendingTargetMode) {
      if (onAbandonAssessment && isAssessmentInProgress) {
        onAbandonAssessment();
      }
      onSelectMode(pendingTargetMode);
      setPendingTargetMode(null);
    }
  };

  return (
    <>
      <header className="bg-[#0F0F12] border-b border-white/10 text-white sticky top-0 z-30 shadow-xl">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3 sm:gap-6">
            {/* Logo & Branding */}
            <div className="flex items-center space-x-3 cursor-pointer shrink-0" onClick={() => handleNavClick('select_role')}>
              <div className="w-8 h-8 bg-indigo-600 rounded-md flex items-center justify-center font-bold text-white shadow-md shadow-indigo-600/30 shrink-0">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="shrink-0">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-base tracking-tight text-white whitespace-nowrap">
                    HireAi
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 whitespace-nowrap shrink-0">
                    Assessment Engine
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-normal whitespace-nowrap">Interview AI Agent</p>
              </div>
            </div>

            {/* Navigation Mode Tabs */}
            <nav className="hidden md:flex items-center space-x-1 bg-white/5 p-1 rounded-xl border border-white/10 shrink-0 whitespace-nowrap">
              <button
                type="button"
                onClick={() => handleNavClick('select_role')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                  currentMode === 'select_role' || currentMode === 'interview_kiosk'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Play className="w-3.5 h-3.5 shrink-0" />
                <span className="whitespace-nowrap">Start Interview</span>
              </button>

              <button
                type="button"
                onClick={() => handleNavClick('coding')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                  currentMode === 'coding'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Code2 className="w-3.5 h-3.5 shrink-0" />
                <span className="whitespace-nowrap">Coding</span>
              </button>

              <button
                type="button"
                onClick={() => handleNavClick('manage_pools')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                  currentMode === 'manage_pools'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Database className="w-3.5 h-3.5 shrink-0" />
                <span className="whitespace-nowrap">Question Pools ({poolsCount})</span>
              </button>

              <button
                type="button"
                onClick={() => handleNavClick('interview_mode')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                  currentMode === 'interview_mode'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span className="whitespace-nowrap">Interview Mode</span>
              </button>

              <button
                type="button"
                onClick={() => handleNavClick('past_reports')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                  currentMode === 'past_reports' || currentMode === 'report_view'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <FileText className="w-3.5 h-3.5 shrink-0" />
                <span className="whitespace-nowrap">Reports ({reportsCount})</span>
              </button>
            </nav>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2 sm:space-x-3 shrink-0 whitespace-nowrap">
              {selectedPool && (
                <div className="hidden xl:flex items-center space-x-2 px-2.5 py-1 rounded-lg bg-white/5 text-slate-300 text-xs border border-white/10 font-mono shrink-0 whitespace-nowrap">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] shrink-0" />
                  <span className="font-medium text-white truncate max-w-[160px] whitespace-nowrap">{selectedPool.roleName}</span>
                </div>
              )}

              {/* Recruiter User & Sign Out */}
              {userEmail && onSignOut && (
                <div className="flex items-center space-x-2 border-l border-white/10 pl-2 sm:pl-3 shrink-0 whitespace-nowrap">
                  <div className="flex items-center space-x-1.5 text-xs text-slate-300 font-mono px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 shrink-0 whitespace-nowrap">
                    <User className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span className="truncate max-w-[140px] text-white font-medium whitespace-nowrap">{userEmail}</span>
                  </div>
                  <button
                    type="button"
                    onClick={onSignOut}
                    className="p-1.5 text-slate-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-all border border-white/5 hover:border-rose-500/20 cursor-pointer shrink-0"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4 shrink-0" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Confirmation Dialog */}
      {pendingTargetMode && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121216] border border-white/10 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-fade-in text-slate-100">
            <div className="flex items-center space-x-3 text-amber-400">
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Assessment in Progress</h3>
                <p className="text-xs text-slate-400">Leaving will discard current answers.</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-white/5 p-3.5 rounded-xl border border-white/5 font-medium">
              Are you really sure you want to switch? Your progress will be lost and the assessment will end without saving.
            </p>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setPendingTargetMode(null)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold transition-all"
              >
                Stay in Assessment
              </button>
              <button
                type="button"
                onClick={confirmNavigation}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-lg shadow-amber-600/30 transition-all"
              >
                Yes, Leave Assessment
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
