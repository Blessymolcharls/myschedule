import React from 'react';
import { useTimer } from '../../context/TimerContext';
import { Square, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ActiveTimerBar = () => {
  const { activeSession, formattedElapsed, stopSession } = useTimer();

  if (!activeSession) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3.5 bg-[#FFFFFF] border border-[#E2DCF7] px-4 py-3 rounded-2xl shadow-popover animate-in fade-in slide-in-from-bottom-3 duration-300">
      <div className="flex items-center gap-2.5">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#78D6B0] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-[#54C497]"></span>
        </span>
        <div className="flex flex-col">
          <span className="text-[11px] text-[#718096] font-medium leading-none">Focusing on:</span>
          <Link
            to="/time-tracker"
            className="text-xs font-bold text-[#26324A] truncate max-w-[150px] hover:text-[#8B7BE8] mt-0.5"
          >
            {activeSession.taskId?.title || 'Active Session'}
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-2 pl-3 border-l border-[#E5E2F0]">
        <span className="font-mono text-sm font-bold text-[#8B7BE8] tracking-wider">
          {formattedElapsed}
        </span>
      </div>

      <div className="flex items-center gap-1.5 pl-1">
        <button
          onClick={() => stopSession(false)}
          title="Pause & Save"
          className="p-1.5 rounded-lg bg-[#FAF9FD] hover:bg-[#EFECFA] text-[#718096] hover:text-[#26324A] border border-[#E5E2F0] transition-colors"
        >
          <Square className="w-3.5 h-3.5 fill-current" />
        </button>
        <button
          onClick={() => stopSession(true)}
          title="Complete Task"
          className="p-1.5 rounded-lg bg-[#E4F7F0] hover:bg-[#D0F2E5] text-[#1E7B58] border border-[#BCECD9] transition-colors"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
