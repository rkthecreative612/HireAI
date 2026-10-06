import React, { useState } from 'react';
import {
  Bot,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Loader2,
  CheckCircle2,
  ExternalLink,
  KeyRound
} from 'lucide-react';
import {
  loginRecruiter,
  signUpRecruiter,
  RecruiterUser,
  DEFAULT_ADMIN_EMAIL,
  DEFAULT_ADMIN_PASS
} from '../../lib/authService';
import { isSupabaseConfigured } from '../../lib/supabase';

interface LoginPageProps {
  onLoginSuccess: (user: RecruiterUser) => void;
  onNavigateToCandidateTest?: (token: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onNavigateToCandidateTest
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Candidate token quick entry
  const [candidateToken, setCandidateToken] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      if (mode === 'signin') {
        const result = await loginRecruiter(email, password);
        if (result.success && result.user) {
          onLoginSuccess(result.user);
        } else {
          setErrorMessage(result.error || 'Failed to sign in. Please verify your credentials.');
        }
      } else {
        const result = await signUpRecruiter(email, password);
        if (result.success && result.user) {
          if (result.message) {
            setSuccessMessage(result.message);
          }
          // If auto-logged in, navigate
          setTimeout(() => {
            if (result.user) onLoginSuccess(result.user);
          }, 1500);
        } else {
          setErrorMessage(result.error || 'Failed to register account.');
        }
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Unexpected authentication error.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail(DEFAULT_ADMIN_EMAIL);
    setPassword(DEFAULT_ADMIN_PASS);
    setErrorMessage('');
  };

  const handleCandidateJump = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = candidateToken.trim().replace(/^.*\/test\//, '');
    if (!clean) return;
    if (onNavigateToCandidateTest) {
      onNavigateToCandidateTest(clean);
    } else {
      window.location.href = `/test/${clean}`;
    }
  };

  return (
    <div className="min-h-screen bg-[#09090D] text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* Top minimal header */}
      <header className="border-b border-white/5 bg-[#0e0e13]/60 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white shadow-md shadow-indigo-600/30">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-base tracking-tight text-white">HireAi</span>
            <span className="ml-2 text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Recruiter Portal
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono">
          <span
            className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full border text-[11px] ${
              isSupabaseConfigured
                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                : 'bg-amber-500/10 text-amber-300 border-amber-500/20'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isSupabaseConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span>{isSupabaseConfigured ? 'Supabase Auth Ready' : 'Local Sandbox Mode'}</span>
          </span>
        </div>
      </header>

      {/* Center Auth Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="max-w-md w-full space-y-6">
          {/* Brand Heading */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-600/15 border border-indigo-500/25 text-indigo-400 mb-1">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              {mode === 'signin' ? 'Recruiter Sign In' : 'Create Recruiter Profile'}
            </h1>
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
              Sign in to manage role question pools, assessment sets, and candidate interview reports.
            </p>
          </div>

          {/* Form Container */}
          <div className="bg-[#121218] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-5">
            {/* Mode Switcher Tabs */}
            <div className="grid grid-cols-2 p-1 bg-black/40 border border-white/5 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
                className={`py-2 rounded-lg transition-all ${
                  mode === 'signin'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
                className={`py-2 rounded-lg transition-all ${
                  mode === 'signup'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="flex items-start space-x-2.5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <span className="leading-snug">{errorMessage}</span>
              </div>
            )}

            {/* Success Message */}
            {successMessage && (
              <div className="flex items-start space-x-2.5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                <span className="leading-snug">{successMessage}</span>
              </div>
            )}

            {/* Main Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Recruiter Email / Username</span>
                  <span className="text-[10px] text-slate-500 font-mono">Required</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="recruiter@hireai.com or admin"
                    className="w-full pl-10 pr-3 py-2.5 bg-black/50 border border-white/10 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                  <span>Password</span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-black/50 border border-white/10 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2 cursor-pointer mt-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying with Supabase...</span>
                  </>
                ) : (
                  <>
                    <span>{mode === 'signin' ? 'Sign In to Portal' : 'Register Account'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Candidate Access Gateway (In case candidate lands on root or trimmed URL) */}
          <div className="bg-[#0e0e13]/80 border border-white/5 rounded-2xl p-4 text-center space-y-2">
            <div className="flex items-center justify-center space-x-1.5 text-xs text-slate-400 font-medium">
              <span>Are you a candidate taking an interview?</span>
            </div>
            <form onSubmit={handleCandidateJump} className="flex items-center space-x-2">
              <input
                type="text"
                value={candidateToken}
                onChange={(e) => setCandidateToken(e.target.value)}
                placeholder="Paste token or link (e.g. hyb-a1b2c3)"
                className="flex-1 px-3 py-1.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
              />
              <button
                type="submit"
                disabled={!candidateToken.trim()}
                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 disabled:opacity-30 text-white rounded-xl text-xs font-semibold transition-all border border-white/10 flex items-center space-x-1 shrink-0"
              >
                <span>Enter Test</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </form>
          </div>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-white/5 py-4 px-6 text-center text-xs text-slate-600 font-mono">
        HireAi Assessment Engine • Secure Recruiter Portal
      </footer>
    </div>
  );
};
