import React from 'react';
import { useTimer } from '../../context/TimerContext';
import { Play, Square, CheckCircle2, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ActiveTimerBar = () => {
  const { activeSession, formattedElapsed, stopSession } = useTimer();

  if (!activeSession) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3.5 bg-slate-900/95 border border-brand-500/40 backdrop-blur-xl px-4 py-2.5 rounded-2xl shadow-2xl glow-brand animate-bounce-short">
      <div className="flex items-center gap-2">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
        </span>
        <div className="flex flex-col">
          <span className="text-xs text-slate-400 font-medium">Focusing on:</span>
          <Link
            to="/time-tracker"
            className="text-xs font-semibold text-slate-100 truncate max-w-[140px] hover:text-brand-300"
          >
            {activeSession.taskId?.title || 'Active Session'}
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-2 pl-2 border-l border-slate-700/60">
        <span className="font-mono text-sm font-bold text-brand-300 tracking-wider">
          {formattedElapsed}
        </span>
      </div>

      <div className="flex items-center gap-1.5 pl-1">
        <button
          onClick={() => stopSession(false)}
          title="Stop & Save Session"
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
        >
          <Square className="w-3.5 h-3.5 fill-current" />
        </button>
        <button
          onClick={() => stopSession(true)}
          title="Complete Task & Stop"
          className="p-1.5 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-400 hover:text-emerald-200 border border-emerald-500/30 transition-colors"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
