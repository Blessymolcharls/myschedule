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
  Lock,
} from 'lucide-react';
import { scheduleApi, taskApi, streakApi, timeLogApi } from '../services/api';
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
  const adherencePercent = plannedMinutes > 0 ? Math.min(100, Math.round((completedMinutes / plannedMinutes) * 100)) : (todayProgress?.adherencePercentage || 0);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-brand-300 bg-clip-text text-transparent">
            Welcome back, {user?.name?.split(' ')[0] || 'Scheduler'}!
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Today is{' '}
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'short',
              day: 'numeric',
            })}
            . Here is your intelligent productivity plan.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setTaskModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700/80 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4 text-brand-400" />
            <span>New Task</span>
          </button>

          <button
            onClick={() => setAutoScheduleOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-bold shadow-glow transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Run Auto-Scheduler</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Streak */}
        <div className="glass-panel p-4 sm:p-5 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Current Streak</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Flame className="w-4 h-4 fill-amber-400 animate-pulse-subtle" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-300">
              {streakSummary?.currentStreak || 0}
            </span>
            <span className="text-xs text-slate-400 font-medium">Days</span>
          </div>
          <div className="mt-2 text-[11px] text-amber-400/90 font-medium flex items-center gap-1">
            <span>Longest: {streakSummary?.longestStreak || 0} days</span>
          </div>
        </div>

        {/* Metric 2: Today's Adherence */}
        <div className="glass-panel p-4 sm:p-5 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Schedule Adherence</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400">
              {adherencePercent}%
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Target: {preferences?.minAdherencePercentForStreak || 70}%
            </span>
          </div>
          <div className="mt-2 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, adherencePercent)}%` }}
            />
          </div>
        </div>

        {/* Metric 3: Planned Sessions */}
        <div className="glass-panel p-4 sm:p-5 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Planned Today</span>
            <div className="p-2 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-100">
              {Math.round((plannedMinutes / 60) * 10) / 10}
            </span>
            <span className="text-xs text-slate-400 font-medium">Hours</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            {todayEvents.length} scheduled session(s)
          </div>
        </div>

        {/* Metric 4: Protection Shields */}
        <div className="glass-panel p-4 sm:p-5 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Streak Protections</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Shield className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-indigo-300">
              {streakSummary?.availableStreakProtections ?? 2}
            </span>
            <span className="text-xs text-slate-400 font-medium">Available</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Auto-freezes missed days
          </div>
        </div>
      </div>

      {/* Main Grid: Today's Timeline + Urgent Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Today's Interactive Timeline */}
        <div className="lg:col-span-2 glass-panel p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-brand-400" />
              <h2 className="text-base font-bold text-slate-100">Today's Dynamic Timeline</h2>
            </div>
            <Link
              to="/calendar"
              className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1"
            >
              Full Calendar <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {todayEvents.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-850 flex items-center justify-center mx-auto text-slate-500">
                <Calendar className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-slate-300">No scheduled sessions for today yet.</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Click "Run Auto-Scheduler" to automatically allocate pending tasks into your available time slots.
              </p>
              <button
                onClick={() => setAutoScheduleOpen(true)}
                className="mt-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-glow"
              >
                Auto-Schedule Now
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
                        ? 'bg-slate-950/40 border-slate-800/40 opacity-70'
                        : isCurrentActive
                        ? 'bg-brand-950/40 border-brand-500/50 shadow-glow'
                        : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="flex flex-col items-center justify-center w-14 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono font-bold text-slate-300">
                          <span>{new Date(ev.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          <span className="text-[9px] text-slate-500 font-normal">
                            {ev.allocatedMinutes}m
                          </span>
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-semibold ${isCompleted ? 'line-through text-slate-400' : 'text-slate-100'}`}>
                              {ev.title}
                            </span>
                            {ev.totalChunks > 1 && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                                Chunk {ev.chunkIndex}/{ev.totalChunks}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                            <span>{new Date(ev.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(ev.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            {ev.taskId?.priority && (
                              <span
                                className={`text-[10px] uppercase font-bold px-1.5 py-0.2 rounded ${
                                  ev.taskId.priority === 'urgent'
                                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                    : ev.taskId.priority === 'high'
                                    ? 'bg-amber-500/20 text-amber-400'
                                    : 'bg-slate-800 text-slate-400'
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
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200"
                              >
                                <Square className="w-3.5 h-3.5 fill-current" />
                                <span>Pause</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => startSession(ev.taskId?._id || ev.taskId, ev._id)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-600/30 hover:bg-brand-600/50 text-brand-300 border border-brand-500/30 text-xs font-semibold transition-all"
                              >
                                <Play className="w-3.5 h-3.5 fill-current" />
                                <span>Start Focus</span>
                              </button>
                            )}

                            <button
                              onClick={() => handleCompleteEvent(ev)}
                              title="Mark Session Completed"
                              className="p-1.5 rounded-xl bg-slate-800 hover:bg-emerald-600/20 hover:text-emerald-400 text-slate-400 transition-colors"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {isCompleted && (
                          <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
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

        {/* Right 1 Col: Urgent Deadlines & Focus Box */}
        <div className="space-y-6">
          {/* Active Live Session Box */}
          {activeSession && (
            <div className="glass-panel p-5 border-brand-500/40 shadow-glow bg-gradient-to-b from-brand-950/40 to-slate-900/80">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs font-bold text-brand-400 uppercase tracking-wider">
                  Live Focus Session
                </span>
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
              </div>
              <div className="mt-3">
                <h3 className="text-sm font-bold text-slate-100">
                  {activeSession.taskId?.title || 'Current Task'}
                </h3>
                <div className="text-3xl font-extrabold font-mono text-brand-300 mt-2">
                  {formattedElapsed}
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => stopSession(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200"
                >
                  Pause & Save
                </button>
                <button
                  onClick={() => stopSession(true)}
                  className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white shadow-glow"
                >
                  Complete Task
                </button>
              </div>
            </div>
          )}

          {/* Urgent Deadlines Box */}
          <div className="glass-panel p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-slate-100">Urgent & Approaching</h3>
              </div>
              <Link to="/tasks" className="text-xs font-semibold text-brand-400 hover:underline">
                View All
              </Link>
            </div>

            {urgentTasks.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4">No urgent pending tasks!</p>
            ) : (
              <div className="space-y-2.5">
                {urgentTasks.map((t) => (
                  <div
                    key={t._id}
                    className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-200 truncate">{t.title}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {t.deadline
                          ? `Due: ${new Date(t.deadline).toLocaleDateString([], { month: 'short', day: 'numeric' })}`
                          : `${t.estimatedDuration}m estimated`}
                      </p>
                    </div>
                    <button
                      onClick={() => startSession(t._id)}
                      title="Start Session"
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-brand-600/30 text-slate-300 hover:text-brand-300 transition-colors"
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
