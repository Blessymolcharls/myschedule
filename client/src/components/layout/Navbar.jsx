import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { StreakBadge } from '../common/StreakBadge';
import { ReminderDropdown } from '../common/ReminderDropdown';
import { Sparkles, User, LogOut, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-850 bg-slate-950/80 px-4 sm:px-6 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 md:hidden transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white shadow-glow">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-base font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-brand-300 bg-clip-text text-transparent">
              MySchedule
            </span>
            <span className="hidden sm:inline-block ml-2 text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-brand-500/10 text-brand-400 border border-brand-500/20">
              Intelligent v1.0
            </span>
          </div>
        </Link>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        <StreakBadge />
        <ReminderDropdown />

        <div className="h-5 w-px bg-slate-800 hidden sm:block" />

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-600/30 text-brand-300 text-xs font-bold border border-brand-500/40">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <span className="text-xs font-semibold text-slate-200 hidden md:inline-block max-w-[120px] truncate">
              {user?.name || 'User'}
            </span>
          </div>

          <button
            onClick={logout}
            title="Log Out"
            className="p-2 rounded-xl bg-slate-900 hover:bg-red-500/10 text-slate-400 hover:text-red-400 border border-slate-800 hover:border-red-500/30 transition-all"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
