import React, { useState, useEffect } from 'react';
import { X, Lock, Repeat } from 'lucide-react';

export const CommitmentModal = ({ isOpen, onClose, onSave, commitment = null }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrencePattern, setRecurrencePattern] = useState('weekly');
  const [daysOfWeek, setDaysOfWeek] = useState([]);
  const [color, setColor] = useState('#E99A9A');

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
        setColor(commitment.color || '#E99A9A');
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
        setDaysOfWeek([1, 2, 3, 4, 5]);
        setColor('#E99A9A');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#26324A]/25 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-lg rounded-3xl bg-[#FFFFFF] border border-[#E2DCF7] shadow-popover p-6 sm:p-7 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-[#F0EDF9]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#FDECEC] text-[#9E3B3B] border border-[#F7C8C8]">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#26324A]">
                {commitment ? 'Edit Fixed Commitment' : 'Add Fixed Commitment'}
              </h2>
              <p className="text-xs text-[#718096]">
                Immovable blocks (classes, shifts, meetings) that auto-scheduling avoids.
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

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#26324A] mb-1.5">Commitment Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Operating Systems Lecture / Team Sync"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF9FD] border border-[#E5E2F0] text-[#26324A] focus:outline-none focus:border-[#8B7BE8] text-xs font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#26324A] mb-1.5">Start Time *</label>
              <input
                type="datetime-local"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF9FD] border border-[#E5E2F0] text-[#26324A] focus:outline-none focus:border-[#8B7BE8] text-xs font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#26324A] mb-1.5">End Time *</label>
              <input
                type="datetime-local"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF9FD] border border-[#E5E2F0] text-[#26324A] focus:outline-none focus:border-[#8B7BE8] text-xs font-medium"
              />
            </div>
          </div>

          {/* Recurrence Toggle */}
          <div className="p-4 rounded-2xl bg-[#FBFAFF] border border-[#EAE7F5] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Repeat className="w-4 h-4 text-[#8B7BE8]" />
                <span className="text-xs font-bold text-[#26324A]">Recurring Schedule</span>
              </div>
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="h-4 w-4 rounded bg-[#FFFFFF] border-[#D0C6F0] text-[#8B7BE8] focus:ring-[#8B7BE8]"
              />
            </div>

            {isRecurring && (
              <div className="space-y-3 pt-3 border-t border-[#F0EDF9] animate-in fade-in">
                <div>
                  <label className="block text-[11px] font-bold text-[#718096] mb-1">Repeat Pattern</label>
                  <select
                    value={recurrencePattern}
                    onChange={(e) => setRecurrencePattern(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FFFFFF] border border-[#E5E2F0] text-xs font-medium text-[#26324A]"
                  >
                    <option value="daily">Every Day</option>
                    <option value="weekdays">Every Weekday (Mon-Fri)</option>
                    <option value="weekly">Specific Days of Week</option>
                  </select>
                </div>

                {recurrencePattern === 'weekly' && (
                  <div>
                    <label className="block text-[11px] font-bold text-[#718096] mb-1">Repeat On</label>
                    <div className="flex gap-1.5 justify-between">
                      {DAYS.map((d) => (
                        <button
                          type="button"
                          key={d.value}
                          onClick={() => toggleDay(d.value)}
                          className={`flex-1 py-1.5 text-xs rounded-xl font-bold border transition-all ${
                            daysOfWeek.includes(d.value)
                              ? 'bg-[#ECE9FB] border-[#D0C6F0] text-[#6450C7]'
                              : 'bg-[#FFFFFF] border-[#E5E2F0] text-[#718096]'
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

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#F0EDF9]">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary-pastel px-4 py-2.5 text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#E99A9A] hover:bg-[#DE8686] text-[#FFFFFF] font-bold text-xs shadow-sm transition-all"
            >
              {commitment ? 'Update Commitment' : 'Lock Commitment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
