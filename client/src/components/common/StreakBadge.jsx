import React from 'react';
import { Flame, Shield, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

export const StreakBadge = ({ streakCount = 0, consistencyPercent = 0, compact = false }) => {
  return (
    <Link
      to="/streaks"
      className={`group inline-flex items-center gap-2 rounded-full border transition-all duration-300 ${
        streakCount > 0
          ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:border-amber-400 hover:bg-amber-500/20 shadow-glow-amber'
          : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200'
      } ${compact ? 'px-2.5 py-1 text-xs' : 'px-3.5 py-1.5 text-sm font-semibold'}`}
    >
      <Flame
        className={`${compact ? 'w-3.5 h-3.5' : 'w-4 h-4'} ${
          streakCount > 0 ? 'text-amber-400 fill-amber-400 animate-pulse-subtle' : 'text-slate-500'
        }`}
      />
      <span className="font-bold tracking-tight">{streakCount} Day{streakCount === 1 ? '' : 's'} Streak</span>
      {!compact && consistencyPercent > 0 && (
        <span className="text-xs px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-200 border border-amber-500/30">
          {consistencyPercent}%
        </span>
      )}
    </Link>
  );
};
