import React, { useState } from 'react';
import { X, Sparkles, CheckCircle, AlertTriangle, Calendar, Layers, Clock } from 'lucide-react';
import { scheduleApi } from '../../services/api';
import confetti from 'canvas-confetti';

export const AutoScheduleModal = ({ isOpen, onClose, onScheduleComplete }) => {
  const [daysAhead, setDaysAhead] = useState(7);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  if (!isOpen) return null;

  const handleRun = async () => {
    try {
      setLoading(true);
      const res = await scheduleApi.autoGenerate({ daysAhead: Number(daysAhead) });
      if (res.data.success) {
        setResult(res.data.result);
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
        });
        if (onScheduleComplete) onScheduleComplete(res.data);
      }
    } catch (err) {
      console.error('Auto schedule failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-brand-500/30 shadow-2xl p-6 sm:p-7 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Intelligent Auto-Scheduler</h2>
              <p className="text-xs text-slate-400">
                Calculates deadline urgency, priority score & fits tasks into free windows.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!result ? (
          <div className="mt-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Planning Horizon
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { days: 3, label: '3 Days Ahead' },
                  { days: 7, label: '7 Days (Weekly)' },
                  { days: 14, label: '14 Days (Bi-weekly)' },
                ].map((item) => (
                  <button
                    type="button"
                    key={item.days}
                    onClick={() => setDaysAhead(item.days)}
                    className={`py-3 px-2 rounded-2xl border text-xs font-semibold transition-all ${
                      daysAhead === item.days
                        ? 'bg-brand-600/30 border-brand-500 text-brand-200 shadow-glow'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5 text-xs text-slate-400">
              <div className="font-semibold text-slate-300 flex items-center gap-2">
                <Layers className="w-4 h-4 text-brand-400" />
                Scheduling Engine Rules Applied:
              </div>
              <ul className="list-disc list-inside space-y-1 pl-1 text-[11px]">
                <li>Strict adherence to configured Working Hours and Sleep Cycles</li>
                <li>Fixed commitments are 100% protected and unmoveable</li>
                <li>Tasks with impending deadlines received elevated priority weighting</li>
                <li>Sessions longer than max threshold are cleanly chunked with buffers</li>
              </ul>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleRun}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-sm font-semibold shadow-glow transition-all disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                {loading ? 'Optimizing Schedule...' : 'Generate Optimized Schedule'}
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-5 space-y-4 animate-in fade-in">
            <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-emerald-400 flex-shrink-0" />
              <div>
                <div className="font-bold text-sm">Schedule Optimized Successfully!</div>
                <div className="text-xs text-emerald-400/80 mt-0.5">
                  Scheduled {result.summary?.totalEventsScheduled || 0} sessions ({result.summary?.totalMinutesScheduled || 0} minutes).
                </div>
              </div>
            </div>

            {result.unscheduledTasks?.length > 0 && (
              <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30 text-xs space-y-2">
                <div className="flex items-center gap-2 text-amber-300 font-semibold">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  {result.unscheduledTasks.length} Unscheduled Task(s) Notice
                </div>
                <div className="space-y-1.5 max-h-32 overflow-y-auto">
                  {result.unscheduledTasks.map((u, i) => (
                    <div key={i} className="p-2 rounded-lg bg-slate-950/60 text-slate-300">
                      <span className="font-semibold">{u.task?.title}</span>: {u.reason}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold shadow-glow"
              >
                View Calendar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
