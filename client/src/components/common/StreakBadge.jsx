import React from 'react';
import { Flame } from 'lucide-react';
import { Link } from 'react-router-dom';

export const StreakBadge = ({ streakCount = 0, consistencyPercent = 0, compact = false }) => {
  return (
    <Link
      to="/streaks"
      className={`group inline-flex items-center gap-2 rounded-full border transition-all duration-200 ${
        streakCount > 0
          ? 'bg-[#FEF8E3] border-[#F7E5A0] text-[#8E6814] hover:bg-[#FDF2C8] hover:border-[#F2D779] shadow-sm'
          : 'bg-[#F2EFFB] border-[#E5E2F0] text-[#718096] hover:text-[#26324A] hover:bg-[#EAE5F7]'
      } ${compact ? 'px-2.5 py-1 text-xs' : 'px-3.5 py-1.5 text-xs font-semibold'}`}
    >
      <Flame
        className={`${compact ? 'w-3.5 h-3.5' : 'w-4 h-4'} ${
          streakCount > 0 ? 'text-[#D99A1C] fill-[#D99A1C] animate-pulse-subtle' : 'text-[#9AA5B8]'
        }`}
      />
      <span className="font-bold tracking-tight">
        {streakCount} Day{streakCount === 1 ? '' : 's'} Streak
      </span>
      {!compact && consistencyPercent > 0 && (
        <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-[#FFFFFF] text-[#8E6814] border border-[#F7E5A0] font-bold">
          {consistencyPercent}%
        </span>
      )}
    </Link>
  );
};
