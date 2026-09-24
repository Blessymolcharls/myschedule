import React, { useState } from 'react';
import { X, Sparkles, CheckCircle, AlertTriangle, Layers } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#26324A]/25 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-lg rounded-3xl bg-[#FFFFFF] border border-[#E2DCF7] shadow-popover p-6 sm:p-7 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-[#F0EDF9]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#ECE9FB] text-[#7A68DE]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#26324A]">
                Intelligent Auto-Scheduler
              </h2>
              <p className="text-xs text-[#718096]">
                Calculates deadline urgency, priority score & fits tasks into free windows.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#718096] hover:text-[#26324A] hover:bg-[#F2EFFB] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!result ? (
          <div className="mt-5 space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#26324A] mb-1.5">
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
                    className={`py-3 px-2 rounded-2xl border text-xs font-bold transition-all ${
                      daysAhead === item.days
                        ? 'bg-[#ECE9FB] border-[#D0C6F0] text-[#6450C7] shadow-xs'
                        : 'bg-[#FAF9FD] border-[#E5E2F0] text-[#718096] hover:border-[#D6D0EB]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#FBFAFF] border border-[#EAE7F5] space-y-2 text-xs text-[#718096]">
              <div className="font-bold text-[#26324A] flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#8B7BE8]" />
                Scheduling Engine Rules Applied:
              </div>
              <ul className="list-disc list-inside space-y-1 pl-1 text-[11px] leading-relaxed">
                <li>Strict adherence to configured Working Hours and Sleep Cycles</li>
                <li>Fixed commitments are 100% protected and unmoveable</li>
                <li>Impending deadlines receive elevated priority weighting</li>
                <li>Long sessions are cleanly chunked with buffer intervals</li>
              </ul>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#F0EDF9]">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary-pastel px-4 py-2.5 text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleRun}
                className="btn-primary-pastel flex items-center gap-2 px-5 py-2.5 text-xs font-bold shadow-button disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>{loading ? 'Optimizing Schedule...' : 'Generate Optimized Schedule'}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-5 space-y-4 animate-in fade-in">
            <div className="p-4 rounded-2xl bg-[#E4F7F0] border border-[#BCECD9] text-[#1E7B58] flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-[#1E7B58] flex-shrink-0" />
              <div>
                <div className="font-bold text-sm">Schedule Optimized Successfully!</div>
                <div className="text-xs text-[#207856] mt-0.5">
                  Scheduled {result.summary?.totalEventsScheduled || 0} sessions ({result.summary?.totalMinutesScheduled || 0} minutes).
                </div>
              </div>
            </div>

            {result.unscheduledTasks?.length > 0 && (
              <div className="p-4 rounded-2xl bg-[#FEF8E3] border border-[#F7E5A0] text-xs space-y-2">
                <div className="flex items-center gap-2 text-[#8E6814] font-bold">
                  <AlertTriangle className="w-4 h-4" />
                  {result.unscheduledTasks.length} Unscheduled Task(s) Notice
                </div>
                <div className="space-y-1.5 max-h-32 overflow-y-auto">
                  {result.unscheduledTasks.map((u, i) => (
                    <div key={i} className="p-2 rounded-xl bg-[#FFFFFF] border border-[#F7E5A0] text-[#718096]">
                      <span className="font-bold text-[#26324A]">{u.task?.title}</span>: {u.reason}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-3">
              <button
                type="button"
                onClick={onClose}
                className="btn-primary-pastel px-5 py-2.5 text-xs font-bold"
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
