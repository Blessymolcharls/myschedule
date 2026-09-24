import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Plus,
  Lock,
  Clock,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';
import { scheduleApi, taskApi, commitmentApi } from '../services/api';
import { AutoScheduleModal } from '../components/schedule/AutoScheduleModal';
import { CommitmentModal } from '../components/commitments/CommitmentModal';
import { TaskModal } from '../components/tasks/TaskModal';

export const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('week'); // 'day', 'week', 'month'
  const [events, setEvents] = useState([]);
  const [commitments, setCommitments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [autoScheduleOpen, setAutoScheduleOpen] = useState(false);
  const [commitmentModalOpen, setCommitmentModalOpen] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [rescheduling, setRescheduling] = useState(false);

  const fetchCalendarEvents = async () => {
    try {
      setLoading(true);
      const start = new Date(currentDate);
      start.setDate(start.getDate() - 7);
      const end = new Date(currentDate);
      end.setDate(end.getDate() + 14);

      const res = await scheduleApi.getEvents({
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      });

      if (res.data.success) {
        setEvents(res.data.events);
        setCommitments(res.data.commitments || []);
      }
    } catch (err) {
      console.error('Failed to load schedule events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendarEvents();
  }, [currentDate]);

  const handlePrev = () => {
    const d = new Date(currentDate);
    if (viewMode === 'day') d.setDate(d.getDate() - 1);
    else if (viewMode === 'week') d.setDate(d.getDate() - 7);
    else d.setMonth(d.getMonth() - 1);
    setCurrentDate(d);
  };

  const handleNext = () => {
    const d = new Date(currentDate);
    if (viewMode === 'day') d.setDate(d.getDate() + 1);
    else if (viewMode === 'week') d.setDate(d.getDate() + 7);
    else d.setMonth(d.getMonth() + 1);
    setCurrentDate(d);
  };

  const handleDynamicReschedule = async () => {
    try {
      setRescheduling(true);
      await scheduleApi.autoGenerate({ daysAhead: 7 });
      await fetchCalendarEvents();
    } catch (err) {
      console.error('Dynamic reschedule failed:', err);
    } finally {
      setRescheduling(false);
    }
  };

  // Helper to generate 7 week days
  const getWeekDays = (baseDate) => {
    const curr = new Date(baseDate);
    const firstDay = curr.getDate() - curr.getDay() + 1; // Monday start
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(curr.setDate(firstDay + i));
      days.push(d);
    }
    return days;
  };

  const weekDays = getWeekDays(currentDate);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2.5">
            <CalendarIcon className="w-6 h-6 text-brand-400" />
            Smart Schedule & Calendar
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Visualized time allocations, recurring commitments, and non-conflicting intelligent blocks.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleDynamicReschedule}
            disabled={rescheduling}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-brand-400 ${rescheduling ? 'animate-spin' : ''}`} />
            <span>Dynamic Rebalance</span>
          </button>

          <button
            onClick={() => setCommitmentModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 text-xs font-semibold border border-rose-500/30 transition-all"
          >
            <Lock className="w-3.5 h-3.5 text-rose-400" />
            <span>Lock Fixed Block</span>
          </button>

          <button
            onClick={() => setAutoScheduleOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-bold shadow-glow transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Auto-Schedule Horizon</span>
          </button>
        </div>
      </div>

      {/* Date Navigation & View Selector */}
      <div className="glass-panel p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
          >
            Today
          </button>
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrev}
              className="p-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              className="p-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <span className="text-sm font-bold text-slate-200">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
        </div>

        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950 border border-slate-850">
          {['day', 'week', 'month'].map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                viewMode === mode
                  ? 'bg-brand-600 text-white shadow-glow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar Week View Grid */}
      <div className="glass-panel p-4 sm:p-6 overflow-x-auto">
        <div className="min-w-[760px] grid grid-cols-7 gap-3">
          {weekDays.map((day, idx) => {
            const isToday =
              day.toDateString() === new Date().toDateString();

            const dayEvents = events.filter((ev) => {
              const d = new Date(ev.startTime);
              return (
                d.getFullYear() === day.getFullYear() &&
                d.getMonth() === day.getMonth() &&
                d.getDate() === day.getDate()
              );
            });

            return (
              <div
                key={idx}
                className={`flex flex-col rounded-2xl border p-3 min-h-[420px] transition-all ${
                  isToday
                    ? 'bg-brand-950/20 border-brand-500/40 shadow-glow'
                    : 'bg-slate-950/50 border-slate-850'
                }`}
              >
                {/* Column Header */}
                <div className="pb-2 mb-2 border-b border-slate-800/80 text-center">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    {day.toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                  <div
                    className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold mt-1 ${
                      isToday
                        ? 'bg-brand-600 text-white shadow-glow'
                        : 'text-slate-200'
                    }`}
                  >
                    {day.getDate()}
                  </div>
                </div>

                {/* Day's Event Stack */}
                <div className="space-y-2 flex-1 overflow-y-auto">
                  {dayEvents.length === 0 ? (
                    <div className="text-center py-8 text-[11px] text-slate-600">
                      No events
                    </div>
                  ) : (
                    dayEvents.map((ev) => {
                      const isCompleted = ev.status === 'completed';
                      return (
                        <div
                          key={ev._id}
                          className={`p-2 rounded-xl border text-xs transition-all ${
                            isCompleted
                              ? 'bg-slate-950/60 border-slate-800 text-slate-500 line-through'
                              : 'bg-brand-900/20 border-brand-500/30 text-slate-200 hover:border-brand-400'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="font-mono text-[10px] text-brand-300 font-semibold">
                              {new Date(ev.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <span className="text-[9px] px-1 py-0.2 rounded bg-slate-800 text-slate-400">
                              {ev.allocatedMinutes}m
                            </span>
                          </div>
                          <div className="font-semibold text-slate-100 text-[11px] line-clamp-2">
                            {ev.title}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Auto Scheduler Modal */}
      <AutoScheduleModal
        isOpen={autoScheduleOpen}
        onClose={() => setAutoScheduleOpen(false)}
        onScheduleComplete={fetchCalendarEvents}
      />

      {/* Fixed Commitment Modal */}
      <CommitmentModal
        isOpen={commitmentModalOpen}
        onClose={() => setCommitmentModalOpen(false)}
        onSave={async (data) => {
          await commitmentApi.createCommitment(data);
          setCommitmentModalOpen(false);
          fetchCalendarEvents();
        }}
      />
    </div>
  );
};
