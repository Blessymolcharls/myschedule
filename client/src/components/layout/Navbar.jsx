import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { StreakBadge } from '../common/StreakBadge';
import { ReminderDropdown } from '../common/ReminderDropdown';
import { Sparkles, LogOut, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#E5E2F0] bg-[#FFFFFF]/90 px-4 sm:px-6 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-[#718096] hover:text-[#26324A] hover:bg-[#F2EFFB] md:hidden transition-colors"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-[#8B7BE8] to-[#7A68DE] text-white shadow-button transition-transform group-hover:scale-105">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-base font-extrabold tracking-tight text-[#26324A]">
              MySchedule
            </span>
            <span className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#ECE9FB] text-[#6450C7] border border-[#DCD5F7]">
              INTELLIGENT V1.0
            </span>
          </div>
        </Link>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        <StreakBadge />
        <ReminderDropdown />

        <div className="h-5 w-px bg-[#E5E2F0] hidden sm:block" />

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-[#FAF9FD] border border-[#E5E2F0]">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#ECE9FB] text-[#6450C7] text-xs font-bold border border-[#DCD5F7]">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <span className="text-xs font-semibold text-[#26324A] hidden md:inline-block max-w-[120px] truncate">
              {user?.name || 'User'}
            </span>
          </div>

          <button
            onClick={logout}
            title="Log Out"
            className="p-2 rounded-xl bg-[#FFFFFF] hover:bg-[#FDECEC] text-[#718096] hover:text-[#9E3B3B] border border-[#E5E2F0] hover:border-[#F7C8C8] transition-all shadow-xs"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
