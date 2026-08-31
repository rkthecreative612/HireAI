import React, { useState, useEffect } from 'react';
import { 
  AppMode, 
  RoleQuestionPool, 
  InterviewReport, 
  InterviewQuestionSession 
} from './types';
import { PRESET_QUESTION_POOLS } from './data/presetPools';
import { Header } from './components/Header';
import { RoleSelector } from './components/RoleSelector';
import { PoolGeneratorModal } from './components/PoolGeneratorModal';
import { InterviewKiosk } from './components/InterviewKiosk';
import { InterviewReportView } from './components/InterviewReportView';
import { PastReportsView } from './components/PastReportsView';
import { ManagePoolsView } from './components/ManagePoolsView';
import { CodingRoundView } from './components/CodingRoundView';
import { CandidateCodingPortal } from './components/CandidateCodingPortal';
import { fetchCompletedCodingReportsFromDb, deleteCodingSessionFromDb } from './lib/codingSupabase';
import { Loader2, Sparkles, Brain } from 'lucide-react';

function getCandidateRouteInfo(): { isCandidateMode: boolean; token: string | null } {
  if (typeof window === 'undefined') return { isCandidateMode: false, token: null };
  const pathname = window.location.pathname || '';
  const search = new URLSearchParams(window.location.search);
  const hash = window.location.hash || '';

  // Direct pathname /test/:token or /test
  if (pathname.startsWith('/test')) {
    const parts = pathname.replace(/\/+$/, '').split('/');
    if (parts.length >= 3 && parts[2]) {
      return { isCandidateMode: true, token: decodeURIComponent(parts[2]) };
    }
    const queryToken = search.get('token') || search.get('test');
    if (queryToken) {
      return { isCandidateMode: true, token: queryToken };
    }
    return { isCandidateMode: true, token: null };
  }

  // Query parameter ?token=...
  if (search.has('token')) {
    return { isCandidateMode: true, token: search.get('token') };
  }

  // Hash route #/test/:token
  if (hash.startsWith('#/test') || hash.startsWith('#test')) {
    const clean = hash.replace(/^#\/?test\/?/, '');
    return { isCandidateMode: true, token: clean ? decodeURIComponent(clean) : null };
  }

  return { isCandidateMode: false, token: null };
}

export default function App() {
  // Candidate Portal Route State
  const [candidateRoute, setCandidateRoute] = useState(getCandidateRouteInfo);

  useEffect(() => {
    const handleLocationChange = () => {
      setCandidateRoute(getCandidateRouteInfo());
    };
    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  // Stored Pools
  const [pools, setPools] = useState<RoleQuestionPool[]>(() => {
    try {
      const local = localStorage.getItem('ai_interview_pools');
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const presetIds = new Set(PRESET_QUESTION_POOLS.map(p => p.id));
          const presetRoleNames = new Set(PRESET_QUESTION_POOLS.map(p => p.roleName.toLowerCase().trim()));
          const customPools = parsed.filter(
            (p: RoleQuestionPool) =>
              !presetIds.has(p.id) &&
              !presetRoleNames.has(p.roleName.toLowerCase().trim())
          );
          return [...PRESET_QUESTION_POOLS, ...customPools];
        }
      }
    } catch (e) {
      console.error('Failed to load local pools', e);
    }
    return PRESET_QUESTION_POOLS;
  });

  // Selected Pool for Kiosk
  const [selectedPool, setSelectedPool] = useState<RoleQuestionPool | null>(pools[0] || null);

  // App Navigation State
  const [currentMode, setCurrentMode] = useState<AppMode>('select_role');
  const [isCodingActive, setIsCodingActive] = useState<boolean>(false);

  // Candidate Details
  const [candidateName, setCandidateName] = useState('');
  const [candidateEmail, setCandidateEmail] = useState('');
  const [questionCount, setQuestionCount] = useState<number>(20);
  const [isProctorModeEnabled, setIsProctorModeEnabled] = useState<boolean>(false);

  // Past Reports
  const [reports, setReports] = useState<InterviewReport[]>(() => {
    try {
      const local = localStorage.getItem('ai_interview_reports');
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Failed to load local reports', e);
    }
    return [];
  });

  // Active Report
  const [activeReport, setActiveReport] = useState<InterviewReport | null>(null);

  // Supabase Reports Loading State
  const [isLoadingDbReports, setIsLoadingDbReports] = useState<boolean>(false);
  const [dbReportsError, setDbReportsError] = useState<string | null>(null);

  // Function to load coding reports strictly from Supabase
  const loadCodingReportsFromSupabase = async () => {
    setIsLoadingDbReports(true);
    setDbReportsError(null);
    try {
      const res = await fetchCompletedCodingReportsFromDb();
      if (!res.success) {
        setDbReportsError(res.error || 'Failed to retrieve reports from Supabase.');
      } else {
        const dbCodingReports = res.reports;
        setReports((prev) => {
          const nonCoding = prev.filter((r) => r.assessmentType !== 'coding');
          const existingCodingIds = new Set(dbCodingReports.map((r) => r.id));
          const localCoding = prev.filter(
            (r) => r.assessmentType === 'coding' && !existingCodingIds.has(r.id)
          );
          return [...dbCodingReports, ...localCoding, ...nonCoding];
        });
      }
    } catch (err: any) {
      console.warn('Error loading reports from Supabase:', err);
      setDbReportsError(err?.message || 'Unexpected error loading reports from Supabase.');
    } finally {
      setIsLoadingDbReports(false);
    }
  };

  // Load from Supabase on mount and whenever switching to past_reports mode
  useEffect(() => {
    loadCodingReportsFromSupabase();
  }, []);

  useEffect(() => {
    if (currentMode === 'past_reports') {
      loadCodingReportsFromSupabase();
    }
  }, [currentMode]);

  // Modal State
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);

  // Report Compiling State
  const [isCompilingReport, setIsCompilingReport] = useState(false);

  // Save Pools to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('ai_interview_pools', JSON.stringify(pools));
    } catch (e) {
      console.error('Error saving pools', e);
    }
  }, [pools]);

  // Save Reports to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('ai_interview_reports', JSON.stringify(reports));
    } catch (e) {
      console.error('Error saving reports', e);
    }
  }, [reports]);

  // Handle New Pool Created
  const handlePoolCreated = (newPool: RoleQuestionPool) => {
    setPools((prev) => [newPool, ...prev]);
    setSelectedPool(newPool);
  };

  // Handle Delete Pool
  const handleDeletePool = (poolId: string) => {
    setPools((prev) => prev.filter((p) => p.id !== poolId));
    if (selectedPool?.id === poolId) {
      const remaining = pools.filter((p) => p.id !== poolId);
      setSelectedPool(remaining[0] || null);
    }
  };

  // Start Interview Flow
  const handleStartInterview = (name: string, email: string, qCount: number = 20) => {
    setCandidateName(name);
    setCandidateEmail(email);
    setQuestionCount(qCount);
    setCurrentMode('interview_kiosk');
  };

  // Finish Interview & Call Server to Compile Report
  const handleFinishInterview = async (sessions: InterviewQuestionSession[]) => {
    if (!selectedPool) return;

    setIsCompilingReport(true);

    try {
      const res = await fetch('/api/interview/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateName: candidateName || 'Anonymous Candidate',
          candidateEmail,
          roleName: selectedPool.roleName,
          experienceLevel: selectedPool.experienceLevel,
          assessmentType: selectedPool.assessmentType,
          questionSessions: sessions,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to generate report from server.');
      }

      const report: InterviewReport = await res.json();
      setReports((prev) => [report, ...prev]);
      setActiveReport(report);
      setCurrentMode('report_view');
    } catch (err: any) {
      console.error(err);
      alert('Error generating final report: ' + (err.message || 'Unknown error'));
      setCurrentMode('select_role');
    } finally {
      setIsCompilingReport(false);
    }
  };

  // Delete Report
  const handleDeleteReport = async (reportId: string) => {
    // If it's a coding session, delete from Supabase
    const targetReport = reports.find((r) => r.id === reportId);
    if (targetReport?.assessmentType === 'coding') {
      deleteCodingSessionFromDb(reportId).catch((err) => {
        console.warn('Could not delete session from Supabase:', err);
      });
    }

    setReports((prev) => prev.filter((r) => r.id !== reportId));
    if (activeReport?.id === reportId) {
      setActiveReport(null);
      setCurrentMode('past_reports');
    }
  };

  // Pre-load Sample Demo Report
  const handleLoadSampleDemo = () => {
    const demoPool = PRESET_QUESTION_POOLS[0];
    const mockSessions: InterviewQuestionSession[] = demoPool.questions.map((q, idx) => ({
      questionIndex: idx,
      question: q,
      candidateAnswer: q.sampleGoodAnswerSummary 
        ? `In my experience as a senior engineer: ${q.sampleGoodAnswerSummary} We implemented this in production with high test coverage and benchmarked throughput.` 
        : `To address this systematically, I would evaluate the architectural constraints, implement non-blocking handling, write clear unit tests, and monitor key telemetry metrics.`,
      timeSpentSeconds: 45 + (idx % 3) * 15,
      evaluation: {
        score: 80 + (idx % 5) * 4,
        technicalAccuracy: 85,
        completeness: 80,
        clarity: 90,
        keyPointsCovered: q.keyEvaluationCriteria || ['Identified primary technical concepts', 'Clear communication'],
        missingOrInaccuratePoints: ['Could elaborate further on edge case performance under peak load'],
        constructiveFeedback: 'Strong, clear explanation demonstrating practical senior-level expertise.',
        suggestedDifficultyShift: idx % 2 === 0 ? 'harder' : 'same',
      },
    }));

    const sampleReport: InterviewReport = {
      id: `sample-report-${Date.now()}`,
      candidateName: 'Alex Morgan',
      candidateEmail: 'alex.morgan@example.com',
      roleName: demoPool.roleName,
      experienceLevel: demoPool.experienceLevel,
      completedAt: new Date().toISOString(),
      totalTimeSpentSeconds: 1240,
      overallScore: 88,
      recommendation: 'Strong Hire',
      summary: 'Alex Morgan demonstrated exceptional senior-level technical depth across React 19 fundamentals, modern Web Vitals optimization, and micro-frontend architecture. Communication was precise, structured, and backed by clear production trade-off analysis. High confidence recommendation for technical interview round.',
      strengths: [
        'Deep understanding of React 19 concurrent features and virtual DOM reconciliation mechanics.',
        'Extensive knowledge of performance profiling and Web Vitals (INP, LCP, CLS) optimization techniques.',
        'Strong architectural grasp of micro-frontends and state isolation principles.',
        'Articulate communication with practical production examples.'
      ],
      weaknesses: [
        'Slightly hand-wavy when discussing WebAssembly memory buffer boundary passing.',
        'Could provide deeper real-time circuit breaker details during catastrophic third-party API outages.'
      ],
      categoryBreakdown: [
        { category: 'basic', categoryName: 'Basic Fundamentals', score: 92, questionsAnswered: 3, easyCount: 1, mediumCount: 1, hardCount: 1 },
        { category: 'domain', categoryName: 'Domain Specific', score: 88, questionsAnswered: 9, easyCount: 2, mediumCount: 4, hardCount: 3 },
        { category: 'trends', categoryName: 'Recent Trends', score: 85, questionsAnswered: 4, easyCount: 1, mediumCount: 2, hardCount: 1 },
        { category: 'situational', categoryName: 'Situational / Scenarios', score: 86, questionsAnswered: 4, easyCount: 1, mediumCount: 2, hardCount: 1 },
      ],
      followUpQuestionsForInterviewer: [
        'Ask Alex to walk through a specific time they had to debug a memory leak caused by retained closure scopes in production.',
        'Probe into how they handle disagreement between team members regarding atomic state management vs local component state.',
        'Ask how they approach client-side WebAssembly fallback handling when user browser environments lack shared array buffer support.'
      ],
      questionSessions: mockSessions,
    };

    setReports((prev) => [sampleReport, ...prev]);
    setActiveReport(sampleReport);
    setCurrentMode('report_view');
  };

  // Candidate Assessment Mode (via link: /test/<token>)
  if (candidateRoute.isCandidateMode) {
    return (
      <CandidateCodingPortal
        token={candidateRoute.token}
        onSaveReport={(report) => {
          setReports((prev) => [report, ...prev]);
        }}
        onReturnToHome={() => {
          window.history.pushState({}, '', '/');
          setCandidateRoute({ isCandidateMode: false, token: null });
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100 flex flex-col antialiased selection:bg-indigo-500 selection:text-white">
      {/* App Header */}
      <Header
        currentMode={currentMode}
        onSelectMode={(mode) => {
          if (mode === 'select_role') setSelectedPool(pools[0] || null);
          setCurrentMode(mode);
        }}
        selectedPool={selectedPool}
        reportsCount={reports.length}
        poolsCount={pools.length}
        onLoadSampleDemo={handleLoadSampleDemo}
        isCodingActive={isCodingActive}
        onAbandonAssessment={() => setIsCodingActive(false)}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {/* Loading Overlay when generating final report */}
        {isCompilingReport && (
          <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6 space-y-4 animate-fade-in text-center">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <Brain className="w-8 h-8 animate-pulse" />
            </div>
            <div className="space-y-1 max-w-md">
              <h2 className="text-xl font-bold text-white">Compiling Interviewer Report...</h2>
              <p className="text-xs text-slate-400">
                Evaluating {questionCount} responses, mapping category scores, and extracting strengths & weaknesses...
              </p>
            </div>
            <div className="flex items-center space-x-2 text-indigo-400 font-semibold text-xs">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Processing...</span>
            </div>
          </div>
        )}

        {/* View Router */}
        {currentMode === 'select_role' && (
          <RoleSelector
            pools={pools}
            selectedPool={selectedPool}
            onSelectPool={setSelectedPool}
            onOpenGenerator={() => setIsGeneratorOpen(true)}
            onStartInterview={handleStartInterview}
            onDeletePool={handleDeletePool}
            isProctorModeEnabled={isProctorModeEnabled}
            onToggleProctorMode={setIsProctorModeEnabled}
          />
        )}

        {currentMode === 'interview_kiosk' && selectedPool && (
          <InterviewKiosk
            candidateName={candidateName}
            candidateEmail={candidateEmail}
            pool={selectedPool}
            questionCount={questionCount}
            isProctorModeEnabled={isProctorModeEnabled}
            onFinishInterview={handleFinishInterview}
            onCancel={() => setCurrentMode('select_role')}
          />
        )}

        {currentMode === 'report_view' && activeReport && (
          <InterviewReportView
            report={activeReport}
            onBack={() => setCurrentMode('past_reports')}
          />
        )}

        {currentMode === 'past_reports' && (
          <PastReportsView
            reports={reports}
            onSelectReport={(r) => {
              setActiveReport(r);
              setCurrentMode('report_view');
            }}
            onDeleteReport={handleDeleteReport}
            onNewInterview={() => setCurrentMode('select_role')}
            isLoadingReports={isLoadingDbReports}
            reportsError={dbReportsError}
            onRefreshReports={loadCodingReportsFromSupabase}
          />
        )}

        {currentMode === 'manage_pools' && (
          <ManagePoolsView
            pools={pools}
            onOpenGenerator={() => setIsGeneratorOpen(true)}
            onDeletePool={handleDeletePool}
            onSelectPoolToLaunch={(p) => {
              setSelectedPool(p);
              setCurrentMode('select_role');
            }}
          />
        )}

        {currentMode === 'coding' && (
          <CodingRoundView
            candidateName={candidateName}
            candidateEmail={candidateEmail}
            onCodingActiveChange={setIsCodingActive}
            onSaveReport={(report) => {
              setReports((prev) => [report, ...prev]);
            }}
            onViewReport={(report) => {
              setActiveReport(report);
              setCurrentMode('report_view');
            }}
          />
        )}
      </main>

      {/* Generator Modal */}
      <PoolGeneratorModal
        isOpen={isGeneratorOpen}
        onClose={() => setIsGeneratorOpen(false)}
        onPoolCreated={handlePoolCreated}
      />
    </div>
  );
}
