import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTimer } from '../context/TimerContext';
import {
  Sparkles,
  Flame,
  CheckCircle2,
  Clock,
  Calendar,
  Play,
  Square,
  Plus,
  ArrowUpRight,
  Shield,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import { scheduleApi, taskApi, streakApi } from '../services/api';
import { TaskModal } from '../components/tasks/TaskModal';
import { AutoScheduleModal } from '../components/schedule/AutoScheduleModal';
import { Link } from 'react-router-dom';

export const DashboardPage = () => {
  const { user, preferences } = useAuth();
  const { activeSession, startSession, stopSession, formattedElapsed } = useTimer();

  const [todayEvents, setTodayEvents] = useState([]);
  const [commitments, setCommitments] = useState([]);
  const [urgentTasks, setUrgentTasks] = useState([]);
  const [streakSummary, setStreakSummary] = useState(null);
  const [todayProgress, setTodayProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [autoScheduleOpen, setAutoScheduleOpen] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
      const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();

      const [eventsRes, tasksRes, streakRes] = await Promise.all([
        scheduleApi.getEvents({ startDate: startOfDay, endDate: endOfDay }),
        taskApi.getTasks({ status: 'pending' }),
        streakApi.getSummary(),
      ]);

      if (eventsRes.data.success) {
        setTodayEvents(eventsRes.data.events);
        setCommitments(eventsRes.data.commitments || []);
      }

      if (tasksRes.data.success) {
        setUrgentTasks(tasksRes.data.tasks.slice(0, 5));
      }

      if (streakRes.data.success) {
        setStreakSummary(streakRes.data.summary);
        const todayStr = new Date().toISOString().split('T')[0];
        const prog = streakRes.data.summary.recentHistory?.find((h) => h.dateString === todayStr);
        setTodayProgress(prog || null);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleCreateTask = async (taskData) => {
    const res = await taskApi.createTask(taskData);
    if (res.data.success) {
      setTaskModalOpen(false);
      fetchDashboardData();
    }
  };

  const handleCompleteEvent = async (ev) => {
    if (ev.taskId) {
      await taskApi.completeTask(ev.taskId._id || ev.taskId);
    } else {
      await scheduleApi.updateEvent(ev._id, { status: 'completed' });
    }
    fetchDashboardData();
  };

  const plannedMinutes = todayEvents.reduce((acc, e) => acc + (e.allocatedMinutes || 0), 0);
  const completedMinutes = todayEvents.reduce((acc, e) => acc + (e.completedMinutes || 0), 0);
  const adherencePercent =
    plannedMinutes > 0
      ? Math.min(100, Math.round((completedMinutes / plannedMinutes) * 100))
      : todayProgress?.adherencePercentage || 0;

  const userName = user?.name ? user.name.split(' ')[0] : 'Blessy';

  return (
    <div className="space-y-7 animate-in fade-in duration-300">
      {/* Welcome Section & Primary Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#26324A]">
            Welcome back, {userName}!
          </h1>
          <p className="text-xs sm:text-sm text-[#718096] mt-1 font-medium">
            Today is{' '}
            <span className="text-[#26324A] font-semibold">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
              })}
            </span>
            . Here is your intelligent productivity plan.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setTaskModalOpen(true)}
            className="btn-secondary-pastel flex items-center gap-2 px-4 py-2.5 text-xs"
          >
            <Plus className="w-4 h-4 text-[#8B7BE8]" />
            <span>New Task</span>
          </button>

          <button
            onClick={() => setAutoScheduleOpen(true)}
            className="btn-primary-pastel flex items-center gap-2 px-5 py-2.5 text-xs shadow-button"
          >
            <Sparkles className="w-4 h-4" />
            <span>Run Auto-Scheduler</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Current Streak */}
        <div className="pastel-card-interactive p-5 bg-[#FFFFFF]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#718096]">Current Streak</span>
            <div className="p-2 rounded-xl bg-[#FEF8E3] text-[#D99A1C] border border-[#F7E5A0]">
              <Flame className="w-4 h-4 fill-current animate-pulse-subtle" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#26324A]">
              {streakSummary?.currentStreak || 0}
            </span>
            <span className="text-xs font-bold text-[#D99A1C]">Days</span>
          </div>
          <div className="mt-2 text-[11px] text-[#718096] font-medium">
            Personal record: <span className="font-bold text-[#26324A]">{streakSummary?.longestStreak || 0} days</span>
          </div>
        </div>

        {/* Card 2: Schedule Adherence */}
        <div className="pastel-card-interactive p-5 bg-[#FFFFFF]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#718096]">Schedule Adherence</span>
            <div className="p-2 rounded-xl bg-[#E4F7F0] text-[#1E7B58] border border-[#BCECD9]">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#26324A]">
              {adherencePercent}%
            </span>
            <span className="text-[11px] text-[#718096] font-medium">
              Target: {preferences?.minAdherencePercentForStreak || 70}%
            </span>
          </div>
          <div className="mt-2.5 w-full bg-[#EAE7F5] rounded-full h-2 overflow-hidden">
            <div
              className="bg-[#78D6B0] h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, adherencePercent)}%` }}
            />
          </div>
        </div>

        {/* Card 3: Planned Today */}
        <div className="pastel-card-interactive p-5 bg-[#FFFFFF]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#718096]">Planned Today</span>
            <div className="p-2 rounded-xl bg-[#ECE9FB] text-[#7A68DE] border border-[#DCD5F7]">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#26324A]">
              {Math.round((plannedMinutes / 60) * 10) / 10}
            </span>
            <span className="text-xs font-bold text-[#7A68DE]">Hours</span>
          </div>
          <div className="mt-2 text-[11px] text-[#718096] font-medium">
            {todayEvents.length} scheduled session(s)
          </div>
        </div>

        {/* Card 4: Streak Protections */}
        <div className="pastel-card-interactive p-5 bg-[#FFFFFF]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#718096]">Streak Protections</span>
            <div className="p-2 rounded-xl bg-[#EEF2FC] text-[#3B5B9E] border border-[#D0DDF7]">
              <Shield className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#26324A]">
              {streakSummary?.availableStreakProtections ?? 2}
            </span>
            <span className="text-xs font-bold text-[#3B5B9E]">Shields</span>
          </div>
          <div className="mt-2 text-[11px] text-[#718096] font-medium">
            Emergency freeze available
          </div>
        </div>
      </div>

      {/* Main Grid: Today's Dynamic Timeline + Urgent Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Today's Dynamic Timeline (Main Visual Focus) */}
        <div className="lg:col-span-2 pastel-card p-6 bg-[#FFFFFF] space-y-4">
          <div className="flex items-center justify-between pb-3.5 border-b border-[#F0EDF9]">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#ECE9FB] text-[#7A68DE]">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#26324A]">Today's Dynamic Timeline</h2>
                <p className="text-[11px] text-[#718096]">Auto-allocated non-conflicting focus blocks</p>
              </div>
            </div>
            <Link
              to="/calendar"
              className="text-xs font-bold text-[#8B7BE8] hover:text-[#7A68DE] flex items-center gap-1 hover:underline"
            >
              Full Calendar <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {todayEvents.length === 0 ? (
            <div className="text-center py-12 px-4 space-y-3.5">
              <div className="w-14 h-14 rounded-2xl bg-[#F4F1FA] border border-[#EAE7F5] flex items-center justify-center mx-auto text-[#8B7BE8]">
                <Calendar className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-[#26324A]">No scheduled sessions for today yet</p>
                <p className="text-xs text-[#718096] max-w-sm mx-auto leading-relaxed">
                  Your smart auto-scheduler can transform your pending tasks and deadlines into a structured, balanced schedule in seconds.
                </p>
              </div>
              <button
                onClick={() => setAutoScheduleOpen(true)}
                className="btn-primary-pastel inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold"
              >
                <Sparkles className="w-4 h-4" />
                <span>Auto-Schedule Now</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {todayEvents.map((ev) => {
                const isCurrentActive = activeSession?.taskId?._id === ev.taskId?._id;
                const isCompleted = ev.status === 'completed';

                return (
                  <div
                    key={ev._id}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      isCompleted
                        ? 'bg-[#FAF9FD] border-[#EAE7F5] opacity-75'
                        : isCurrentActive
                        ? 'bg-[#F5F2FC] border-[#C8BFF2] shadow-sm'
                        : 'bg-[#FBFAFF] border-[#EAE7F5] hover:border-[#D6D0EB]'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="flex flex-col items-center justify-center w-14 py-2 rounded-xl bg-[#FFFFFF] border border-[#E5E2F0] text-[11px] font-mono font-bold text-[#26324A] shadow-xs">
                          <span>
                            {new Date(ev.startTime).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          <span className="text-[9px] text-[#718096] font-normal">
                            {ev.allocatedMinutes}m
                          </span>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`text-xs sm:text-sm font-bold ${
                                isCompleted ? 'line-through text-[#9AA5B8]' : 'text-[#26324A]'
                              }`}
                            >
                              {ev.title}
                            </span>
                            {ev.totalChunks > 1 && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#ECE9FB] text-[#7A68DE] font-semibold">
                                Session {ev.chunkIndex}/{ev.totalChunks}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-xs text-[#718096]">
                            <span>
                              {new Date(ev.startTime).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}{' '}
                              -{' '}
                              {new Date(ev.endTime).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                            {ev.taskId?.priority && (
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                  ev.taskId.priority === 'urgent'
                                    ? 'bg-[#FDECEC] text-[#9E3B3B] border border-[#F7C8C8]'
                                    : ev.taskId.priority === 'high'
                                    ? 'bg-[#FEF8E3] text-[#8E6814] border border-[#F7E5A0]'
                                    : 'bg-[#ECE9FB] text-[#6450C7] border border-[#DCD5F7]'
                                }`}
                              >
                                {ev.taskId.priority}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        {!isCompleted && (
                          <>
                            {isCurrentActive ? (
                              <button
                                onClick={() => stopSession(false)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FFFFFF] hover:bg-[#FAF9FD] text-xs font-bold text-[#26324A] border border-[#E5E2F0]"
                              >
                                <Square className="w-3.5 h-3.5 fill-current" />
                                <span>Pause</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => startSession(ev.taskId?._id || ev.taskId, ev._id)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#ECE9FB] hover:bg-[#E0DAF7] text-[#7A68DE] border border-[#D0C6F0] text-xs font-bold transition-all"
                              >
                                <Play className="w-3.5 h-3.5 fill-current" />
                                <span>Focus</span>
                              </button>
                            )}

                            <button
                              onClick={() => handleCompleteEvent(ev)}
                              title="Mark Completed"
                              className="p-1.5 rounded-xl bg-[#FFFFFF] hover:bg-[#E4F7F0] hover:text-[#1E7B58] text-[#718096] border border-[#E5E2F0] transition-colors"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {isCompleted && (
                          <span className="text-xs text-[#1E7B58] font-bold flex items-center gap-1 bg-[#E4F7F0] px-2.5 py-1 rounded-full border border-[#BCECD9]">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Done
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right 1 Col: Urgent Radar + Active Focus Widget */}
        <div className="space-y-6">
          {/* Active Live Session Box */}
          {activeSession && (
            <div className="pastel-card p-5 bg-gradient-to-b from-[#FFFFFF] to-[#F8F6FD] border-[#C8BFF2] shadow-card">
              <div className="flex items-center justify-between pb-3 border-b border-[#F0EDF9]">
                <span className="text-xs font-bold text-[#7A68DE] uppercase tracking-wider">
                  Live Focus Session
                </span>
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#78D6B0] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#54C497]"></span>
                </span>
              </div>
              <div className="mt-3">
                <h3 className="text-sm font-bold text-[#26324A] truncate">
                  {activeSession.taskId?.title || 'Current Task'}
                </h3>
                <div className="text-3xl font-extrabold font-mono text-[#8B7BE8] mt-2">
                  {formattedElapsed}
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => stopSession(false)}
                  className="flex-1 py-2 rounded-xl bg-[#FFFFFF] hover:bg-[#FAF9FD] text-xs font-bold text-[#26324A] border border-[#E5E2F0]"
                >
                  Pause & Save
                </button>
                <button
                  onClick={() => stopSession(true)}
                  className="flex-1 py-2 rounded-xl bg-[#78D6B0] hover:bg-[#68C8A2] text-xs font-bold text-[#14573D] shadow-sm"
                >
                  Complete Task
                </button>
              </div>
            </div>
          )}

          {/* Urgent & Approaching Tasks */}
          <div className="pastel-card p-5 bg-[#FFFFFF] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0EDF9]">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-lg bg-[#FEF8E3] text-[#8E6814]">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-[#26324A]">Urgent & Approaching</h3>
              </div>
              <Link
                to="/tasks"
                className="text-xs font-bold text-[#8B7BE8] hover:text-[#7A68DE] hover:underline"
              >
                View All
              </Link>
            </div>

            {urgentTasks.length === 0 ? (
              <div className="text-center py-6 text-xs text-[#9AA5B8] space-y-1">
                <p className="font-semibold text-[#718096]">All clear!</p>
                <p>No urgent deadlines approaching.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {urgentTasks.map((t) => (
                  <div
                    key={t._id}
                    className="p-3 rounded-xl bg-[#FBFAFF] border border-[#EAE7F5] text-xs flex items-center justify-between gap-2 hover:border-[#D6D0EB] transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="font-bold text-[#26324A] truncate">{t.title}</p>
                      <p className="text-[11px] text-[#718096] mt-0.5">
                        {t.deadline
                          ? `Due: ${new Date(t.deadline).toLocaleDateString([], {
                              month: 'short',
                              day: 'numeric',
                            })}`
                          : `${t.estimatedDuration}m estimated`}
                      </p>
                    </div>
                    <button
                      onClick={() => startSession(t._id)}
                      title="Start Session"
                      className="p-1.5 rounded-lg bg-[#ECE9FB] hover:bg-[#E0DAF7] text-[#7A68DE] transition-colors"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Task Creation Modal */}
      <TaskModal
        isOpen={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        onSave={handleCreateTask}
      />

      {/* Auto Scheduler Engine Modal */}
      <AutoScheduleModal
        isOpen={autoScheduleOpen}
        onClose={() => setAutoScheduleOpen(false)}
        onScheduleComplete={() => {
          fetchDashboardData();
        }}
      />
    </div>
  );
};
