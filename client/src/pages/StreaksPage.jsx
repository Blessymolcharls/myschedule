import React, { useState, useEffect } from 'react';
import {
  Flame,
  Shield,
  Award,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  Zap,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { streakApi, userApi } from '../services/api';
import confetti from 'canvas-confetti';

export const StreaksPage = () => {
  const [summary, setSummary] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [actionMessage, setActionMessage] = useState('');

  const fetchStreakData = async () => {
    try {
      setLoading(true);
      const [sumRes, histRes] = await Promise.all([
        streakApi.getSummary(),
        streakApi.getAdherenceHistory({}),
      ]);

      if (sumRes.data.success) setSummary(sumRes.data.summary);
      if (histRes.data.success) setHistory(histRes.data.history);
    } catch (err) {
      console.error('Failed to load streak data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStreakData();
  }, []);

  const handleEvaluateDay = async () => {
    try {
      setEvaluating(true);
      const res = await streakApi.evaluateDay({});
      if (res.data.success) {
        if (res.data.dailyProgress?.qualifiesForStreak) {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
          });
        }
        setActionMessage(`Daily adherence evaluated: ${res.data.dailyProgress?.adherencePercentage}% (${res.data.dailyProgress?.status})`);
        fetchStreakData();
      }
    } catch (err) {
      console.error('Day evaluation failed:', err);
    } finally {
      setEvaluating(false);
    }
  };

  const handleApplyFreeze = async () => {
    try {
      const res = await streakApi.applyFreeze({});
      if (res.data.success) {
        setActionMessage('Streak protection shield applied successfully! Streak preserved.');
        fetchStreakData();
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleRecoverStreak = async () => {
    try {
      const res = await streakApi.recover();
      if (res.data.success) {
        if (res.data.recovered) {
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.5 },
          });
        }
        setActionMessage(res.data.message);
        fetchStreakData();
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'rest':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'protected':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
      case 'partial':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      default:
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2.5">
            <Flame className="w-6 h-6 text-amber-400 fill-amber-400" />
            Systematic Streaks & Adherence Measurement
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Streaks in MySchedule are earned through actual schedule execution adherence, not empty app logins.
          </p>
        </div>

        <button
          onClick={handleEvaluateDay}
          disabled={evaluating}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-bold shadow-glow-amber transition-all self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${evaluating ? 'animate-spin' : ''}`} />
          <span>Evaluate Today's Streak</span>
        </button>
      </div>

      {actionMessage && (
        <div className="p-3.5 rounded-2xl bg-brand-950/40 border border-brand-500/30 text-xs text-brand-200 font-medium animate-in fade-in">
          {actionMessage}
        </div>
      )}

      {/* Big Streak Showcase Banner */}
      <div className="glass-panel p-6 sm:p-8 relative overflow-hidden bg-gradient-to-br from-amber-950/30 via-slate-900/60 to-slate-950/80 border-amber-500/30 shadow-glow-amber">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-500/20 border border-amber-500/40 text-amber-400 shadow-glow-amber animate-pulse-subtle">
              <Flame className="w-10 h-10 fill-amber-400" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Active Execution Streak
              </div>
              <div className="text-4xl sm:text-5xl font-extrabold text-slate-100 mt-1 flex items-baseline gap-2">
                <span>{summary?.currentStreak || 0}</span>
                <span className="text-lg text-amber-400 font-semibold">Days</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Personal Record: <span className="font-bold text-slate-200">{summary?.longestStreak || 0} days</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleApplyFreeze}
              disabled={(summary?.availableStreakProtections ?? 0) <= 0}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-200 text-xs font-semibold transition-all disabled:opacity-40"
            >
              <Shield className="w-4 h-4 text-indigo-400" />
              <span>Use Shield ({summary?.availableStreakProtections ?? 0} left)</span>
            </button>

            <button
              onClick={handleRecoverStreak}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600/30 hover:bg-amber-600/50 border border-amber-500/40 text-amber-200 text-xs font-semibold transition-all"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Streak Recovery</span>
            </button>
          </div>
        </div>
      </div>

      {/* Consistency Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-4 text-center">
          <span className="text-xs text-slate-400">7-Day Consistency</span>
          <div className="text-2xl font-extrabold text-emerald-400 mt-1">
            {summary?.weeklyConsistencyPercent || 0}%
          </div>
        </div>
        <div className="glass-panel p-4 text-center">
          <span className="text-xs text-slate-400">30-Day Consistency</span>
          <div className="text-2xl font-extrabold text-brand-300 mt-1">
            {summary?.monthlyConsistencyPercent || 0}%
          </div>
        </div>
        <div className="glass-panel p-4 text-center">
          <span className="text-xs text-slate-400">Total Qualifying Days</span>
          <div className="text-2xl font-extrabold text-amber-300 mt-1">
            {summary?.totalSuccessfulDays || 0}
          </div>
        </div>
        <div className="glass-panel p-4 text-center">
          <span className="text-xs text-slate-400">Rest Days Preserved</span>
          <div className="text-2xl font-extrabold text-blue-300 mt-1">
            {summary?.totalRestDays || 0}
          </div>
        </div>
      </div>

      {/* Adherence History Table */}
      <div className="glass-panel p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-brand-400" />
            30-Day Daily Execution & Adherence Ledger
          </h3>
          <span className="text-xs text-slate-400">{history.length} recorded days</span>
        </div>

        {history.length === 0 ? (
          <p className="text-xs text-slate-500 py-6 text-center">
            No adherence history yet. Work on scheduled tasks and click "Evaluate Today's Streak"!
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="text-slate-500 uppercase text-[10px] border-b border-slate-800 pb-2">
                <tr>
                  <th className="pb-2">Date</th>
                  <th className="pb-2">Planned Time</th>
                  <th className="pb-2">Actual Completed</th>
                  <th className="pb-2">Adherence</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2">Streak Qualified</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 font-medium">
                {history.map((row) => (
                  <tr key={row._id} className="hover:bg-slate-900/40">
                    <td className="py-2.5 font-semibold text-slate-200">{row.dateString}</td>
                    <td className="py-2.5 font-mono text-slate-400">{row.plannedMinutes} mins</td>
                    <td className="py-2.5 font-mono text-brand-300">{row.completedMinutes} mins</td>
                    <td className="py-2.5 font-bold">
                      <span className={row.adherencePercentage >= 70 ? 'text-emerald-400' : 'text-amber-400'}>
                        {row.adherencePercentage}%
                      </span>
                    </td>
                    <td className="py-2.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getStatusColor(row.status)}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="py-2.5">
                      {row.qualifiesForStreak ? (
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Qualified
                        </span>
                      ) : (
                        <span className="text-slate-500">Missed</span>
                      )}
                    </td>
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
