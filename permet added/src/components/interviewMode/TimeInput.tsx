import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { secondsToMMSS, mmssToSeconds } from '../../lib/hybridStorage';

interface TimeInputProps {
  id?: string;
  label: string;
  sublabel?: string;
  valueSeconds: number;
  onChange: (seconds: number) => void;
  minSeconds?: number;
  maxSeconds?: number;
}

export const TimeInput: React.FC<TimeInputProps> = ({
  id,
  label,
  sublabel,
  valueSeconds,
  onChange,
  minSeconds = 5,
  maxSeconds = 7200 // 2 hours
}) => {
  const [textValue, setTextValue] = useState<string>(secondsToMMSS(valueSeconds));
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!isFocused) {
      setTextValue(secondsToMMSS(valueSeconds));
    }
  }, [valueSeconds, isFocused]);

  const handleBlur = () => {
    setIsFocused(false);
    let sec = mmssToSeconds(textValue);
    if (isNaN(sec) || sec < minSeconds) sec = minSeconds;
    if (sec > maxSeconds) sec = maxSeconds;
    setTextValue(secondsToMMSS(sec));
    onChange(sec);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
  };

  const adjustSeconds = (delta: number) => {
    const next = Math.min(maxSeconds, Math.max(minSeconds, valueSeconds + delta));
    setTextValue(secondsToMMSS(next));
    onChange(next);
  };

  return (
    <div className="space-y-1.5" id={id}>
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-200 flex items-center space-x-1.5">
          <Clock className="w-3.5 h-3.5 text-indigo-400" />
          <span>{label}</span>
        </label>
        {sublabel && (
          <span className="text-[10px] text-slate-400 font-mono">
            {sublabel}
          </span>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={textValue}
            placeholder="00:00"
            onFocus={() => setIsFocused(true)}
            onChange={(e) => setTextValue(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-xl text-white font-mono text-sm tracking-wider text-center focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-inner"
          />
          <span className="absolute right-3 top-2.5 text-[10px] uppercase font-mono text-slate-500 pointer-events-none">
            MM:SS
          </span>
        </div>

        {/* Quick nudge buttons */}
        <div className="flex items-center space-x-1 shrink-0">
          <button
            type="button"
            onClick={() => adjustSeconds(-60)}
            className="px-2 py-2 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg text-xs font-mono border border-white/5 transition-all"
            title="Subtract 1 minute"
          >
            -1m
          </button>
          <button
            type="button"
            onClick={() => adjustSeconds(60)}
            className="px-2 py-2 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg text-xs font-mono border border-white/5 transition-all"
            title="Add 1 minute"
          >
            +1m
          </button>
        </div>
      </div>
    </div>
  );
};
