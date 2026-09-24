import React, { useState, useEffect } from 'react';
import { useTimer } from '../context/TimerContext';
import {
  Timer as TimerIcon,
  Play,
  Square,
  CheckCircle2,
  Clock,
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
        <h1 className="text-2xl font-extrabold text-[#26324A] flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#ECE9FB] text-[#7A68DE]">
            <TimerIcon className="w-5 h-5" />
          </div>
          Time Tracking & Live Execution
        </h1>
        <p className="text-xs text-[#718096] mt-1 font-medium">
          Measure actual effort against planned schedule. Real execution feeds consistency streaks and adherence algorithms.
        </p>
      </div>

      {/* Main Focus Card */}
      <div className="pastel-card p-6 sm:p-8 relative overflow-hidden bg-gradient-to-b from-[#FFFFFF] via-[#FBFAFF] to-[#F7F5FC] border-[#DCD5F7] shadow-card">
        <div className="max-w-2xl mx-auto flex flex-col items-center text-center space-y-6">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#ECE9FB] text-[#6450C7] border border-[#DCD5F7] text-xs font-bold">
            <span className="relative flex h-2 w-2">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full ${
                  activeSession ? 'bg-[#78D6B0]' : 'bg-[#8B7BE8]'
                } opacity-75`}
              ></span>
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  activeSession ? 'bg-[#54C497]' : 'bg-[#8B7BE8]'
                }`}
              ></span>
            </span>
            <span>{activeSession ? 'Live Focus In Progress' : 'Ready for Deep Work'}</span>
          </div>

          {/* Big Digital Clock */}
          <div className="font-mono text-5xl sm:text-7xl font-extrabold tracking-wider text-[#26324A]">
            {activeSession ? formattedElapsed : '00:00:00'}
          </div>

          {activeSession ? (
            <div className="space-y-3">
              <div className="text-sm font-bold text-[#26324A]">
                Active Task: <span className="text-[#8B7BE8]">{activeSession.taskId?.title}</span>
              </div>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => handleStop(false)}
                  className="btn-secondary-pastel flex items-center gap-2 px-5 py-2.5 text-xs font-bold"
                >
                  <Square className="w-4 h-4 fill-current" />
                  <span>Pause & Save Log</span>
                </button>
                <button
                  onClick={() => handleStop(true)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#78D6B0] hover:bg-[#68C8A2] text-[#14573D] text-xs font-bold shadow-sm transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Mark Task Complete</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="w-full max-w-md space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#26324A] mb-1.5 text-left">
                  Select Task to Track
                </label>
                <select
                  value={selectedTaskId}
                  onChange={(e) => setSelectedTaskId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFFFFF] border border-[#E5E2F0] text-[#26324A] text-xs font-semibold focus:outline-none focus:border-[#8B7BE8]"
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
                className="w-full px-3.5 py-2 rounded-xl bg-[#FFFFFF] border border-[#E5E2F0] text-[#26324A] text-xs placeholder-[#9AA5B8] focus:outline-none focus:border-[#8B7BE8]"
              />

              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={!selectedTaskId}
                  onClick={handleStart}
                  className="w-full btn-primary-pastel flex items-center justify-center gap-2 py-3 text-xs font-bold shadow-button disabled:opacity-50"
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
      <div className="pastel-card p-5 sm:p-6 bg-[#FFFFFF] space-y-4">
        <h3 className="text-xs font-bold text-[#26324A] flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#8B7BE8]" />
          Log Offline Session Manually
        </h3>
        <form onSubmit={handleManualLog} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="sm:col-span-2">
            <select
              value={selectedTaskId}
              onChange={(e) => setSelectedTaskId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#FAF9FD] border border-[#E5E2F0] text-xs text-[#26324A] font-semibold"
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
              className="w-full px-3 py-2 rounded-xl bg-[#FAF9FD] border border-[#E5E2F0] text-xs text-[#26324A] font-semibold"
            />
          </div>
          <div>
            <button
              type="submit"
              className="w-full btn-secondary-pastel py-2 text-xs font-bold"
            >
              Add Time Log
            </button>
          </div>
        </form>
      </div>

      {/* Execution Session History Table */}
      <div className="pastel-card p-5 sm:p-6 bg-[#FFFFFF] space-y-4">
        <h3 className="text-xs font-bold text-[#26324A]">Recent Time Logs</h3>
        {timeLogs.length === 0 ? (
          <p className="text-xs text-[#9AA5B8] py-4 text-center">No time logs recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#718096]">
              <thead className="text-[#9AA5B8] uppercase text-[10px] border-b border-[#F0EDF9] pb-2 font-bold">
                <tr>
                  <th className="pb-2">Task</th>
                  <th className="pb-2">Date & Time</th>
                  <th className="pb-2">Actual Duration</th>
                  <th className="pb-2">Mode</th>
                  <th className="pb-2">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5F2FC] font-medium">
                {timeLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-[#FAF9FD]">
                    <td className="py-2.5 font-bold text-[#26324A]">{log.taskId?.title || 'Task'}</td>
                    <td className="py-2.5 text-[#718096]">
                      {new Date(log.startTime).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-2.5 font-mono text-[#8B7BE8] font-bold">
                      {log.durationMinutes} mins
                    </td>
                    <td className="py-2.5">
                      <span className="px-2 py-0.5 rounded-full bg-[#ECE9FB] text-[10px] font-bold text-[#6450C7]">
                        {log.isLiveSession ? 'Stopwatch' : 'Manual'}
                      </span>
                    </td>
                    <td className="py-2.5 text-[#718096] truncate max-w-xs">{log.notes || '-'}</td>
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
