import React, { useState, useEffect } from 'react';
import { useTimer } from '../context/TimerContext';
import {
  Timer as TimerIcon,
  Play,
  Square,
  CheckCircle2,
  Clock,
  Plus,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';
import { taskApi, timeLogApi } from '../services/api';

export const TimeTrackerPage = () => {
  const { activeSession, formattedElapsed, startSession, stopSession } = useTimer();
  const [tasks, setTasks] = useState([]);
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [sessionNotes, setSessionNotes] = useState('');
  const [timeLogs, setTimeLogs] = useState([]);
  const [manualMinutes, setManualMinutes] = useState(30);

  const fetchData = async () => {
    try {
      const [tasksRes, logsRes] = await Promise.all([
        taskApi.getTasks({ status: 'pending' }),
        timeLogApi.getTimeLogs(),
      ]);

      if (tasksRes.data.success) {
        setTasks(tasksRes.data.tasks);
        if (tasksRes.data.tasks.length > 0 && !selectedTaskId) {
          setSelectedTaskId(tasksRes.data.tasks[0]._id);
        }
      }
      if (logsRes.data.success) setTimeLogs(logsRes.data.logs);
    } catch (err) {
      console.error('Failed to load tracker data:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStart = async () => {
    if (!selectedTaskId) return;
    await startSession(selectedTaskId, null, sessionNotes);
    fetchData();
  };

  const handleStop = async (markComplete) => {
    await stopSession(markComplete);
    setSessionNotes('');
    fetchData();
  };

  const handleManualLog = async (e) => {
    e.preventDefault();
    if (!selectedTaskId || !manualMinutes) return;
    const now = new Date();
    const startTime = new Date(now.getTime() - manualMinutes * 60 * 1000);

    await timeLogApi.logManual({
      taskId: selectedTaskId,
      startTime: startTime.toISOString(),
      endTime: now.toISOString(),
      durationMinutes: Number(manualMinutes),
      notes: sessionNotes,
    });

    setSessionNotes('');
    fetchData();
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2.5">
          <TimerIcon className="w-6 h-6 text-brand-400" />
          Time Tracking & Live Execution
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Measure actual effort against planned schedule. Real execution feeds consistency streaks and adherence algorithms.
        </p>
      </div>

      {/* Main Focus Card */}
      <div className="glass-panel p-6 sm:p-8 relative overflow-hidden border-brand-500/30 glow-brand">
        <div className="max-w-2xl mx-auto flex flex-col items-center text-center space-y-6">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 text-brand-300 border border-brand-500/20 text-xs font-semibold">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${activeSession ? 'bg-emerald-400' : 'bg-brand-400'} opacity-75`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${activeSession ? 'bg-emerald-500' : 'bg-brand-500'}`}></span>
            </span>
            <span>{activeSession ? 'Live Focus In Progress' : 'Ready for Deep Work'}</span>
          </div>

          {/* Big Digital Clock */}
          <div className="font-mono text-5xl sm:text-7xl font-extrabold tracking-wider bg-gradient-to-r from-white via-brand-200 to-indigo-300 bg-clip-text text-transparent">
            {activeSession ? formattedElapsed : '00:00:00'}
          </div>

          {activeSession ? (
            <div className="space-y-3">
              <div className="text-sm font-semibold text-slate-200">
                Active Task: <span className="text-brand-300">{activeSession.taskId?.title}</span>
              </div>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => handleStop(false)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold transition-all"
                >
                  <Square className="w-4 h-4 fill-current" />
                  <span>Pause & Save Log</span>
                </button>
                <button
                  onClick={() => handleStop(true)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-bold shadow-glow-emerald transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Mark Task Complete</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="w-full max-w-md space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 text-left">
                  Select Task to Track
                </label>
                <select
                  value={selectedTaskId}
                  onChange={(e) => setSelectedTaskId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-brand-500"
                >
                  {tasks.length === 0 ? (
                    <option value="">No pending tasks available</option>
                  ) : (
                    tasks.map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.title} ({t.estimatedDuration}m est)
                      </option>
                    ))
                  )}
                </select>
              </div>

              <input
                type="text"
                placeholder="Session notes (optional)..."
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs placeholder-slate-500 focus:outline-none focus:border-brand-500"
              />

              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={!selectedTaskId}
                  onClick={handleStart}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-sm shadow-glow disabled:opacity-50 transition-all"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Start Live Stopwatch</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Manual Time Logging Card */}
      <div className="glass-panel p-5 sm:p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
          <Clock className="w-4 h-4 text-brand-400" />
          Log Offline Session Manually
        </h3>
        <form onSubmit={handleManualLog} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="sm:col-span-2">
            <select
              value={selectedTaskId}
              onChange={(e) => setSelectedTaskId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200"
            >
              {tasks.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <input
              type="number"
              min="5"
              step="5"
              placeholder="Minutes"
              value={manualMinutes}
              onChange={(e) => setManualMinutes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200"
            />
          </div>
          <div>
            <button
              type="submit"
              className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
            >
              Add Time Log
            </button>
          </div>
        </form>
      </div>

      {/* Execution Session History Table */}
      <div className="glass-panel p-5 sm:p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-200">Recent Time Logs</h3>
        {timeLogs.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center">No time logs recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="text-slate-500 uppercase text-[10px] border-b border-slate-800 pb-2">
                <tr>
                  <th className="pb-2">Task</th>
                  <th className="pb-2">Date & Time</th>
                  <th className="pb-2">Actual Duration</th>
                  <th className="pb-2">Mode</th>
                  <th className="pb-2">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 font-medium">
                {timeLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-900/40">
                    <td className="py-2.5 font-semibold text-slate-200">{log.taskId?.title || 'Task'}</td>
                    <td className="py-2.5 text-slate-400">
                      {new Date(log.startTime).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-2.5 font-mono text-brand-300 font-bold">{log.durationMinutes} mins</td>
                    <td className="py-2.5">
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400">
                        {log.isLiveSession ? 'Stopwatch' : 'Manual'}
                      </span>
                    </td>
                    <td className="py-2.5 text-slate-400 truncate max-w-xs">{log.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
