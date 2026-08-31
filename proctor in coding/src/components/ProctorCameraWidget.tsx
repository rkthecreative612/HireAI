import React, { useRef, useState } from 'react';
import { useFaceProctor } from '../hooks/useFaceProctor';
import { ProctorEvent } from '../types';
import { 
  Camera, 
  CameraOff, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Users, 
  EyeOff, 
  UserX, 
  ChevronDown, 
  ChevronUp, 
  History, 
  XCircle,
  Minimize2,
  Maximize2,
  RefreshCw
} from 'lucide-react';

interface ProctorCameraWidgetProps {
  isEnabled: boolean;
  maxStrikes?: number;
  onViolationStrike?: (strike: number, event: ProctorEvent) => void;
  onMaxStrikesReached?: (lastEvent: ProctorEvent, allEvents: ProctorEvent[]) => void;
}

export const ProctorCameraWidget: React.FC<ProctorCameraWidgetProps> = ({
  isEnabled,
  maxStrikes = 4,
  onViolationStrike,
  onMaxStrikesReached,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [showLogs, setShowLogs] = useState<boolean>(false);

  const {
    status,
    activeViolation,
    strikes,
    events,
    cameraActive,
    cameraError,
    startCamera,
  } = useFaceProctor(videoRef, {
    isEnabled,
    maxStrikes,
    onStrike: onViolationStrike,
    onMaxStrikesReached,
  });

  if (!isEnabled) {
    return null;
  }

  // Get status color & badge details
  const getStatusBadge = () => {
    switch (status) {
      case 'loading_model':
        return {
          label: 'Initializing AI Proctor...',
          color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
          dot: 'bg-indigo-400 animate-pulse',
          icon: RefreshCw,
        };
      case 'normal':
        return {
          label: 'In Frame (Verified)',
          color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
          dot: 'bg-emerald-400',
          icon: ShieldCheck,
        };
      case 'looking_away':
        return {
          label: 'Looking Away / Head Turned',
          color: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          dot: 'bg-amber-400 animate-ping',
          icon: EyeOff,
        };
      case 'multiple_faces':
        return {
          label: 'Multiple Faces Detected',
          color: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
          dot: 'bg-rose-400 animate-ping',
          icon: Users,
        };
      case 'no_face':
        return {
          label: 'No Face in Frame',
          color: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
          dot: 'bg-rose-400 animate-ping',
          icon: UserX,
        };
      case 'camera_error':
        return {
          label: 'Camera Error',
          color: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
          dot: 'bg-rose-400',
          icon: XCircle,
        };
      default:
        return {
          label: 'Connecting...',
          color: 'bg-slate-800 text-slate-400 border-slate-700',
          dot: 'bg-slate-400',
          icon: Camera,
        };
    }
  };

  const statusInfo = getStatusBadge();
  const StatusIcon = statusInfo.icon;

  return (
    <div
      id="proctor-camera-widget"
      className="fixed bottom-4 right-4 z-40 flex flex-col items-end space-y-2 select-none"
    >
      {/* Active Live Warning Banner (Only appears during active violation) */}
      {activeViolation && (
        <div
          id="proctor-active-warning-banner"
          className="max-w-xs w-full bg-rose-950/90 border border-rose-500/60 p-3 rounded-2xl shadow-2xl backdrop-blur-md animate-bounce flex items-start space-x-2.5 text-xs text-rose-200"
        >
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold text-rose-100 block">
              {activeViolation === 'no_face' && 'Candidate Not in Frame!'}
              {activeViolation === 'multiple_faces' && 'Multiple Persons Detected!'}
              {activeViolation === 'looking_away' && 'Please Look at the Screen!'}
            </span>
            <p className="text-[11px] text-rose-300 leading-snug">
              Continuous deviation will register an exam integrity strike.
            </p>
          </div>
        </div>
      )}

      {/* Main Widget Container */}
      <div className="bg-[#0e0e13]/95 border border-white/15 rounded-2xl shadow-2xl backdrop-blur-lg overflow-hidden transition-all duration-200 w-64">
        {/* Header Bar */}
        <div className="px-3 py-2 bg-white/5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-[11px] font-bold text-white tracking-wide">AI Proctor</span>
            {strikes > 0 && (
              <span
                className={`text-[9px] font-mono font-extrabold px-1.5 py-0.2 rounded border ${
                  strikes >= 3
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    : strikes === 2
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40'
                }`}
              >
                Strike {strikes}/3
              </span>
            )}
          </div>

          <div className="flex items-center space-x-1">
            <button
              type="button"
              onClick={() => setShowLogs(!showLogs)}
              title="View Proctor Violation Log"
              className={`p-1 rounded text-xs transition-all ${
                showLogs
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <History className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => setIsMinimized(!isMinimized)}
              title={isMinimized ? 'Expand Video Preview' : 'Minimize Video Preview'}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 text-xs transition-all"
            >
              {isMinimized ? (
                <Maximize2 className="w-3.5 h-3.5" />
              ) : (
                <Minimize2 className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* Video Camera Feed Area */}
        <div className={`relative bg-black transition-all overflow-hidden ${isMinimized ? 'h-0' : 'h-36'}`}>
          <video
            ref={videoRef}
            playsInline
            muted
            autoPlay
            className={`w-full h-full object-cover scale-x-[-1] ${
              !cameraActive ? 'opacity-20' : 'opacity-90'
            }`}
          />

          {/* Camera Error Overlay */}
          {cameraError && (
            <div className="absolute inset-0 bg-black/90 p-3 flex flex-col items-center justify-center text-center space-y-2">
              <CameraOff className="w-6 h-6 text-rose-400" />
              <p className="text-[10px] text-rose-300 leading-tight">{cameraError}</p>
              <button
                type="button"
                onClick={startCamera}
                className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg text-[10px] font-semibold transition-all"
              >
                Retry Camera
              </button>
            </div>
          )}

          {/* Strikes Counter Badges on Video Top */}
          <div className="absolute top-2 left-2 flex items-center space-x-1">
            {[1, 2, 3].map((num) => (
              <div
                key={num}
                className={`w-2.5 h-2.5 rounded-full border transition-all ${
                  strikes >= num
                    ? 'bg-rose-500 border-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.8)]'
                    : 'bg-black/50 border-white/30'
                }`}
                title={`Strike ${num} of 3`}
              />
            ))}
          </div>

          {/* Live Active Violation Overlay Indicator */}
          {activeViolation && (
            <div className="absolute inset-0 border-2 border-rose-500/80 pointer-events-none animate-pulse bg-rose-950/20 flex items-center justify-center">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-white bg-rose-600/90 px-2 py-0.5 rounded shadow">
                Violation Active
              </span>
            </div>
          )}
        </div>

        {/* Live Status Bar */}
        <div className="p-2.5 bg-black/40 border-t border-white/5 space-y-1.5">
          <div
            className={`flex items-center space-x-2 px-2.5 py-1.5 rounded-xl border text-xs font-semibold ${statusInfo.color}`}
          >
            <span className={`w-2 h-2 rounded-full ${statusInfo.dot}`} />
            <StatusIcon className="w-3.5 h-3.5 shrink-0" />
            <span className="text-[11px] truncate">{statusInfo.label}</span>
          </div>

          {/* Quick strike counter bar */}
          <div className="flex items-center justify-between text-[10px] text-slate-400 px-1 font-mono">
            <span>Integrity Violations:</span>
            <span
              className={`font-bold ${
                strikes === 0 ? 'text-emerald-400' : strikes === 1 ? 'text-yellow-400' : 'text-rose-400'
              }`}
            >
              {strikes} / 3 Strikes
            </span>
          </div>
        </div>

        {/* Expandable Violation Logs */}
        {showLogs && (
          <div className="max-h-40 overflow-y-auto p-2 bg-black/80 border-t border-white/10 space-y-1.5 text-left text-xs font-mono">
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase pb-1 border-b border-white/5">
              <span>Timestamped Events</span>
              <span>{events.length} Logs</span>
            </div>

            {events.length === 0 ? (
              <p className="text-[10px] text-slate-500 text-center py-3">No violations recorded yet.</p>
            ) : (
              events.map((evt) => (
                <div
                  key={evt.id}
                  className="p-1.5 rounded bg-white/5 border border-white/5 space-y-0.5 text-[10px]"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-rose-400 font-bold">Strike #{evt.strikeNumber}</span>
                    <span className="text-slate-400">{evt.formattedTime}</span>
                  </div>
                  <p className="text-slate-300 font-sans text-[10px] leading-tight">{evt.message}</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
