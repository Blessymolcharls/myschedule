import React, { useState, useEffect } from 'react';
import { X, Lock, Clock, Calendar, Repeat } from 'lucide-react';

export const CommitmentModal = ({ isOpen, onClose, onSave, commitment = null }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrencePattern, setRecurrencePattern] = useState('weekly');
  const [daysOfWeek, setDaysOfWeek] = useState([]);
  const [color, setColor] = useState('#ef4444');

  const DAYS = [
    { label: 'Sun', value: 0 },
    { label: 'Mon', value: 1 },
    { label: 'Tue', value: 2 },
    { label: 'Wed', value: 3 },
    { label: 'Thu', value: 4 },
    { label: 'Fri', value: 5 },
    { label: 'Sat', value: 6 },
  ];

  useEffect(() => {
    if (isOpen) {
      if (commitment) {
        setTitle(commitment.title || '');
        setDescription(commitment.description || '');
        setStartTime(commitment.startTime ? new Date(commitment.startTime).toISOString().slice(0, 16) : '');
        setEndTime(commitment.endTime ? new Date(commitment.endTime).toISOString().slice(0, 16) : '');
        setIsRecurring(commitment.isRecurring || false);
        setRecurrencePattern(commitment.recurrencePattern || 'weekly');
        setDaysOfWeek(commitment.daysOfWeek || []);
        setColor(commitment.color || '#ef4444');
      } else {
        const now = new Date();
        now.setMinutes(0, 0, 0);
        const nextHour = new Date(now.getTime() + 60 * 60 * 1000);
        setTitle('');
        setDescription('');
        setStartTime(now.toISOString().slice(0, 16));
        setEndTime(nextHour.toISOString().slice(0, 16));
        setIsRecurring(false);
        setRecurrencePattern('weekly');
        setDaysOfWeek([1, 2, 3, 4, 5]); // Mon-Fri default
        setColor('#ef4444');
      }
    }
  }, [isOpen, commitment]);

  if (!isOpen) return null;

  const toggleDay = (dayVal) => {
    if (daysOfWeek.includes(dayVal)) {
      setDaysOfWeek(daysOfWeek.filter((d) => d !== dayVal));
    } else {
      setDaysOfWeek([...daysOfWeek, dayVal]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      title,
      description,
      startTime: new Date(startTime).toISOString(),
      endTime: new Date(endTime).toISOString(),
      isRecurring,
      recurrencePattern: isRecurring ? recurrencePattern : 'none',
      daysOfWeek: isRecurring ? daysOfWeek : [],
      color,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-7 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">
                {commitment ? 'Edit Fixed Commitment' : 'Add Fixed Commitment'}
              </h2>
              <p className="text-xs text-slate-400">
                Immovable blocks (classes, shifts, meetings) that auto-scheduling avoids.
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

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Commitment Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Operating Systems Lecture / Team Sync"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-rose-500 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Start Time *</label>
              <input
                type="datetime-local"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-rose-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">End Time *</label>
              <input
                type="datetime-local"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-rose-500 text-sm"
              />
            </div>
          </div>

          {/* Recurrence Toggle */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Repeat className="w-4 h-4 text-brand-400" />
                <span className="text-xs font-semibold text-slate-200">Recurring Schedule</span>
              </div>
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="h-4 w-4 rounded bg-slate-900 border-slate-700 text-brand-500 focus:ring-brand-500"
              />
            </div>

            {isRecurring && (
              <div className="space-y-3 pt-2 border-t border-slate-850 animate-in fade-in">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Repeat Pattern</label>
                  <select
                    value={recurrencePattern}
                    onChange={(e) => setRecurrencePattern(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200"
                  >
                    <option value="daily">Every Day</option>
                    <option value="weekdays">Every Weekday (Mon-Fri)</option>
                    <option value="weekly">Specific Days of Week</option>
                  </select>
                </div>

                {recurrencePattern === 'weekly' && (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Repeat On</label>
                    <div className="flex gap-1.5 justify-between">
                      {DAYS.map((d) => (
                        <button
                          type="button"
                          key={d.value}
                          onClick={() => toggleDay(d.value)}
                          className={`flex-1 py-1.5 text-xs rounded-lg font-medium border transition-all ${
                            daysOfWeek.includes(d.value)
                              ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                              : 'bg-slate-900 border-slate-800 text-slate-400'
                          }`}
                        >
                          {d.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-sm font-semibold shadow-glow transition-all"
            >
              {commitment ? 'Update Commitment' : 'Lock Commitment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
