import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Lock,
  RefreshCw,
} from 'lucide-react';
import { scheduleApi, commitmentApi } from '../services/api';
import { AutoScheduleModal } from '../components/schedule/AutoScheduleModal';
import { CommitmentModal } from '../components/commitments/CommitmentModal';

export const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('week');
  const [events, setEvents] = useState([]);
  const [commitments, setCommitments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [autoScheduleOpen, setAutoScheduleOpen] = useState(false);
  const [commitmentModalOpen, setCommitmentModalOpen] = useState(false);
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
          <h1 className="text-2xl font-extrabold text-[#26324A] flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#ECE9FB] text-[#7A68DE]">
              <CalendarIcon className="w-5 h-5" />
            </div>
            Smart Schedule & Calendar
          </h1>
          <p className="text-xs text-[#718096] mt-1 font-medium">
            Visualized time allocations, recurring commitments, and non-conflicting intelligent blocks.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleDynamicReschedule}
            disabled={rescheduling}
            className="btn-secondary-pastel flex items-center gap-2 px-3.5 py-2 text-xs disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#8B7BE8] ${rescheduling ? 'animate-spin' : ''}`} />
            <span>Dynamic Rebalance</span>
          </button>

          <button
            onClick={() => setCommitmentModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#FDECEC] hover:bg-[#FCD8D8] text-[#9E3B3B] text-xs font-bold border border-[#F7C8C8] transition-all shadow-xs"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Lock Fixed Block</span>
          </button>

          <button
            onClick={() => setAutoScheduleOpen(true)}
            className="btn-primary-pastel flex items-center gap-2 px-4 py-2 text-xs shadow-button"
          >
            <Sparkles className="w-4 h-4" />
            <span>Auto-Schedule Horizon</span>
          </button>
        </div>
      </div>

      {/* Date Navigation & View Selector */}
      <div className="pastel-card p-4 bg-[#FFFFFF] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentDate(new Date())}
            className="btn-secondary-pastel px-3.5 py-1.5 text-xs"
          >
            Today
          </button>
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrev}
              className="p-1.5 rounded-xl bg-[#FAF9FD] border border-[#E5E2F0] hover:bg-[#F2EFFB] text-[#718096] hover:text-[#26324A]"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              className="p-1.5 rounded-xl bg-[#FAF9FD] border border-[#E5E2F0] hover:bg-[#F2EFFB] text-[#718096] hover:text-[#26324A]"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <span className="text-sm font-bold text-[#26324A]">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
        </div>

        <div className="flex items-center gap-1 p-1 rounded-xl bg-[#FAF9FD] border border-[#EAE7F5]">
          {['day', 'week', 'month'].map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all ${
                viewMode === mode
                  ? 'bg-[#FFFFFF] text-[#6450C7] shadow-xs border border-[#E2DCF7]'
                  : 'text-[#718096] hover:text-[#26324A]'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar Week View Grid */}
      <div className="pastel-card p-5 bg-[#FFFFFF] overflow-x-auto">
        <div className="min-w-[760px] grid grid-cols-7 gap-3">
          {weekDays.map((day, idx) => {
            const isToday = day.toDateString() === new Date().toDateString();

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
                    ? 'bg-[#F9F7FD] border-[#C8BFF2] shadow-sm'
                    : 'bg-[#FBFAFF] border-[#EAE7F5]'
                }`}
              >
                {/* Column Header */}
                <div className="pb-2 mb-2 border-b border-[#F0EDF9] text-center">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#718096]">
                    {day.toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                  <div
                    className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold mt-1 ${
                      isToday
                        ? 'bg-[#8B7BE8] text-white shadow-button'
                        : 'text-[#26324A]'
                    }`}
                  >
                    {day.getDate()}
                  </div>
                </div>

                {/* Day's Event Stack */}
                <div className="space-y-2 flex-1 overflow-y-auto">
                  {dayEvents.length === 0 ? (
                    <div className="text-center py-10 text-[11px] text-[#9AA5B8]">
                      No events
                    </div>
                  ) : (
                    dayEvents.map((ev) => {
                      const isCompleted = ev.status === 'completed';
                      return (
                        <div
                          key={ev._id}
                          className={`p-2.5 rounded-xl border text-xs transition-all ${
                            isCompleted
                              ? 'bg-[#FAF9FD] border-[#EAE7F5] text-[#9AA5B8] line-through'
                              : 'bg-[#FFFFFF] border-[#E2DCF7] text-[#26324A] hover:border-[#8B7BE8] shadow-xs'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="font-mono text-[10px] text-[#8B7BE8] font-bold">
                              {new Date(ev.startTime).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-[#ECE9FB] text-[#7A68DE] font-bold">
                              {ev.allocatedMinutes}m
                            </span>
                          </div>
                          <div className="font-bold text-[#26324A] text-[11px] line-clamp-2">
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
