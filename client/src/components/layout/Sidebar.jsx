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
          className="fixed inset-0 z-40 bg-[#26324A]/20 backdrop-blur-xs md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 flex-col justify-between border-r border-[#E5E2F0] bg-[#EFECFA] p-4 backdrop-blur-md transition-transform duration-300 md:translate-x-0 ${
          isOpen ? 'translate-x-0 flex' : '-translate-x-full md:flex'
        }`}
      >
        <div className="space-y-6">
          <div className="px-3 py-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#9AA5B8]">
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
                    `group relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                      isActive
                        ? 'bg-[#E2DCF7] text-[#5A4AB8] border border-[#D0C6F0] shadow-xs'
                        : 'text-[#4A5568] hover:text-[#26324A] hover:bg-[#E7E2F5]'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-4 bg-[#8B7BE8] rounded-full" />
                      )}
                      <Icon
                        className={`w-4 h-4 transition-transform group-hover:scale-105 ${
                          isActive ? 'text-[#7A68DE]' : 'text-[#8B7BE8]'
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

        {/* Adaptive Engine Card */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-b from-[#FFFFFF] to-[#F5F2FC] border border-[#E2DCF7] shadow-xs">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="p-1 rounded-lg bg-[#ECE9FB] text-[#7A68DE]">
              <Zap className="w-3.5 h-3.5 fill-current" />
            </div>
            <span className="text-xs font-bold text-[#26324A]">Adaptive Engine</span>
          </div>
          <p className="text-[11px] text-[#718096] leading-relaxed">
            Autonomous conflict-free scheduling & systematic adherence active.
          </p>
        </div>
      </aside>
    </>
  );
};
