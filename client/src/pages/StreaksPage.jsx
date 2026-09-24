import React, { useState, useEffect } from 'react';
import {
  Flame,
  Shield,
  Calendar,
  CheckCircle2,
  Zap,
  RefreshCw,
} from 'lucide-react';
import { streakApi } from '../services/api';
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
        setActionMessage(
          `Daily adherence evaluated: ${res.data.dailyProgress?.adherencePercentage}% (${res.data.dailyProgress?.status})`
        );
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
        return 'bg-[#E4F7F0] text-[#1E7B58] border-[#BCECD9]';
      case 'rest':
        return 'bg-[#EEF2FC] text-[#3B5B9E] border-[#D0DDF7]';
      case 'protected':
        return 'bg-[#ECE9FB] text-[#6450C7] border-[#DCD5F7]';
      case 'partial':
        return 'bg-[#FEF8E3] text-[#8E6814] border-[#F7E5A0]';
      default:
        return 'bg-[#FDECEC] text-[#9E3B3B] border-[#F7C8C8]';
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#26324A] flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#FEF8E3] text-[#D99A1C]">
              <Flame className="w-5 h-5 fill-current" />
            </div>
            Systematic Streaks & Adherence Measurement
          </h1>
          <p className="text-xs text-[#718096] mt-1 font-medium">
            Streaks in MySchedule are earned through actual schedule execution adherence, not empty app logins.
          </p>
        </div>

        <button
          onClick={handleEvaluateDay}
          disabled={evaluating}
          className="btn-primary-pastel flex items-center gap-2 px-4 py-2 text-xs font-bold shadow-button self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${evaluating ? 'animate-spin' : ''}`} />
          <span>Evaluate Today's Streak</span>
        </button>
      </div>

      {actionMessage && (
        <div className="p-3.5 rounded-2xl bg-[#ECE9FB] border border-[#DCD5F7] text-xs text-[#6450C7] font-semibold animate-in fade-in">
          {actionMessage}
        </div>
      )}

      {/* Big Streak Showcase Banner */}
      <div className="pastel-card p-6 sm:p-8 relative overflow-hidden bg-gradient-to-br from-[#FFFFFF] via-[#FFFDF8] to-[#FEFBF2] border-[#F7E5A0] shadow-card">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-[#FEF8E3] border border-[#F7E5A0] text-[#D99A1C] shadow-sm animate-pulse-subtle">
              <Flame className="w-10 h-10 fill-current" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#8E6814]">
                Active Execution Streak
              </div>
              <div className="text-4xl sm:text-5xl font-extrabold text-[#26324A] mt-1 flex items-baseline gap-2">
                <span>{summary?.currentStreak || 0}</span>
                <span className="text-lg text-[#D99A1C] font-bold">Days</span>
              </div>
              <p className="text-xs text-[#718096] mt-1">
                Personal Record: <span className="font-bold text-[#26324A]">{summary?.longestStreak || 0} days</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleApplyFreeze}
              disabled={(summary?.availableStreakProtections ?? 0) <= 0}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#EEF2FC] hover:bg-[#E0EAFB] border border-[#D0DDF7] text-[#3B5B9E] text-xs font-bold transition-all disabled:opacity-40"
            >
              <Shield className="w-4 h-4 text-[#3B5B9E]" />
              <span>Use Shield ({summary?.availableStreakProtections ?? 0} left)</span>
            </button>

            <button
              onClick={handleRecoverStreak}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FEF8E3] hover:bg-[#FDF2C8] border border-[#F7E5A0] text-[#8E6814] text-xs font-bold transition-all"
            >
              <Zap className="w-4 h-4 text-[#D99A1C]" />
              <span>Streak Recovery</span>
            </button>
          </div>
        </div>
      </div>

      {/* Consistency Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="pastel-card p-5 text-center bg-[#FFFFFF]">
          <span className="text-xs text-[#718096] font-bold">7-Day Consistency</span>
          <div className="text-2xl font-extrabold text-[#1E7B58] mt-1">
            {summary?.weeklyConsistencyPercent || 0}%
          </div>
        </div>
        <div className="pastel-card p-5 text-center bg-[#FFFFFF]">
          <span className="text-xs text-[#718096] font-bold">30-Day Consistency</span>
          <div className="text-2xl font-extrabold text-[#7A68DE] mt-1">
            {summary?.monthlyConsistencyPercent || 0}%
          </div>
        </div>
        <div className="pastel-card p-5 text-center bg-[#FFFFFF]">
          <span className="text-xs text-[#718096] font-bold">Qualifying Days</span>
          <div className="text-2xl font-extrabold text-[#D99A1C] mt-1">
            {summary?.totalSuccessfulDays || 0}
          </div>
        </div>
        <div className="pastel-card p-5 text-center bg-[#FFFFFF]">
          <span className="text-xs text-[#718096] font-bold">Rest Days Preserved</span>
          <div className="text-2xl font-extrabold text-[#3B5B9E] mt-1">
            {summary?.totalRestDays || 0}
          </div>
        </div>
      </div>

      {/* Adherence History Table */}
      <div className="pastel-card p-5 sm:p-6 bg-[#FFFFFF] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#F0EDF9]">
          <h3 className="text-xs font-bold text-[#26324A] flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#8B7BE8]" />
            30-Day Daily Execution & Adherence Ledger
          </h3>
          <span className="text-xs text-[#718096]">{history.length} recorded days</span>
        </div>

        {history.length === 0 ? (
          <p className="text-xs text-[#9AA5B8] py-6 text-center">
            No adherence history yet. Work on scheduled tasks and click "Evaluate Today's Streak"!
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#718096]">
              <thead className="text-[#9AA5B8] uppercase text-[10px] border-b border-[#F0EDF9] pb-2 font-bold">
                <tr>
                  <th className="pb-2">Date</th>
                  <th className="pb-2">Planned Time</th>
                  <th className="pb-2">Actual Completed</th>
                  <th className="pb-2">Adherence</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2">Streak Qualified</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5F2FC] font-medium">
                {history.map((row) => (
                  <tr key={row._id} className="hover:bg-[#FAF9FD]">
                    <td className="py-2.5 font-bold text-[#26324A]">{row.dateString}</td>
                    <td className="py-2.5 font-mono text-[#718096]">{row.plannedMinutes} mins</td>
                    <td className="py-2.5 font-mono text-[#8B7BE8] font-bold">{row.completedMinutes} mins</td>
                    <td className="py-2.5 font-bold">
                      <span className={row.adherencePercentage >= 70 ? 'text-[#1E7B58]' : 'text-[#D99A1C]'}>
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
                        <span className="text-[#1E7B58] font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Qualified
                        </span>
                      ) : (
                        <span className="text-[#9AA5B8]">Missed</span>
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
