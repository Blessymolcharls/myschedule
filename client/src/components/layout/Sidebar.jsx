import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  CheckSquare,
  Lock,
  Timer,
  Flame,
  BarChart3,
  Settings,
  Sparkles,
  Zap,
} from 'lucide-react';

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/calendar', label: 'Smart Calendar', icon: Calendar },
  { path: '/tasks', label: 'Tasks & Planning', icon: CheckSquare },
  { path: '/commitments', label: 'Fixed Commitments', icon: Lock },
  { path: '/time-tracker', label: 'Focus & Timer', icon: Timer },
  { path: '/streaks', label: 'Streaks & Adherence', icon: Flame },
  { path: '/analytics', label: 'Productivity Analytics', icon: BarChart3 },
  { path: '/settings', label: 'Preferences & Engine', icon: Settings },
];

export const Sidebar = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 flex-col justify-between border-r border-slate-850 bg-slate-950/95 p-4 backdrop-blur-xl transition-transform duration-300 md:translate-x-0 ${
          isOpen ? 'translate-x-0 flex' : '-translate-x-full md:flex'
        }`}
      >
        <div className="space-y-6">
          <div className="px-2 py-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Workspace & Scheduling
            </span>
          </div>

          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-brand-600/20 to-indigo-600/10 border border-brand-500/30 text-brand-300 shadow-glow'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/60'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                          isActive ? 'text-brand-400' : 'text-slate-400'
                        }`}
                      />
                      <span>{item.label}</span>
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Engine Status Card */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-b from-brand-950/40 to-slate-900/60 border border-brand-500/20">
          <div className="flex items-center gap-2 mb-1.5">
            <Zap className="w-4 h-4 text-brand-400 fill-brand-400 animate-pulse-subtle" />
            <span className="text-xs font-bold text-brand-200">Adaptive Engine</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-snug">
            Autonomous conflict-free scheduling and dynamic adherence tracking active.
          </p>
        </div>
      </aside>
    </>
  );
};
