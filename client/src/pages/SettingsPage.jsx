import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Settings as SettingsIcon,
  Clock,
  Moon,
  Coffee,
  Flame,
  Save,
  User,
  Shield,
  CheckCircle,
} from 'lucide-react';
import { userApi } from '../services/api';

export const SettingsPage = () => {
  const { user, preferences, updatePreferencesState } = useAuth();

  const [workingHoursStart, setWorkingHoursStart] = useState('09:00');
  const [workingHoursEnd, setWorkingHoursEnd] = useState('18:00');
  const [sleepStart, setSleepStart] = useState('23:00');
  const [sleepEnd, setSleepEnd] = useState('07:00');
  const [workIntervalMinutes, setWorkIntervalMinutes] = useState(90);
  const [breakDurationMinutes, setBreakDurationMinutes] = useState(15);
  const [bufferMinutesBetweenTasks, setBufferMinutesBetweenTasks] = useState(10);
  const [maxTaskChunkMinutes, setMaxTaskChunkMinutes] = useState(120);
  const [minAdherencePercentForStreak, setMinAdherencePercentForStreak] = useState(70);
  const [weeklyRestDays, setWeeklyRestDays] = useState([0]);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (preferences) {
      setWorkingHoursStart(preferences.workingHoursStart || '09:00');
      setWorkingHoursEnd(preferences.workingHoursEnd || '18:00');
      setSleepStart(preferences.sleepStart || '23:00');
      setSleepEnd(preferences.sleepEnd || '07:00');
      setWorkIntervalMinutes(preferences.workIntervalMinutes || 90);
      setBreakDurationMinutes(preferences.breakDurationMinutes || 15);
      setBufferMinutesBetweenTasks(preferences.bufferMinutesBetweenTasks || 10);
      setMaxTaskChunkMinutes(preferences.maxTaskChunkMinutes || 120);
      setMinAdherencePercentForStreak(preferences.minAdherencePercentForStreak || 70);
      setWeeklyRestDays(preferences.weeklyRestDays || [0]);
    }
  }, [preferences]);

  const DAYS = [
    { label: 'Sunday', val: 0 },
    { label: 'Monday', val: 1 },
    { label: 'Tuesday', val: 2 },
    { label: 'Wednesday', val: 3 },
    { label: 'Thursday', val: 4 },
    { label: 'Friday', val: 5 },
    { label: 'Saturday', val: 6 },
  ];

  const toggleRestDay = (val) => {
    if (weeklyRestDays.includes(val)) {
      setWeeklyRestDays(weeklyRestDays.filter((d) => d !== val));
    } else {
      setWeeklyRestDays([...weeklyRestDays, val]);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await updatePreferencesState({
        workingHoursStart,
        workingHoursEnd,
        sleepStart,
        sleepEnd,
        workIntervalMinutes: Number(workIntervalMinutes),
        breakDurationMinutes: Number(breakDurationMinutes),
        bufferMinutesBetweenTasks: Number(bufferMinutesBetweenTasks),
        maxTaskChunkMinutes: Number(maxTaskChunkMinutes),
        minAdherencePercentForStreak: Number(minAdherencePercentForStreak),
        weeklyRestDays,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Failed to save preferences:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2.5">
          <SettingsIcon className="w-6 h-6 text-brand-400" />
          Scheduling Engine & User Preferences
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Customize working hours, break schedules, and systematic streak adherence criteria.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Working Hours & Availability */}
        <div className="glass-panel p-5 sm:p-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Clock className="w-4 h-4 text-brand-400" />
            Working Hours & Daily Availability
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Work Start Time (HH:mm)
              </label>
              <input
                type="text"
                required
                value={workingHoursStart}
                onChange={(e) => setWorkingHoursStart(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Work End Time (HH:mm)
              </label>
              <input
                type="text"
                required
                value={workingHoursEnd}
                onChange={(e) => setWorkingHoursEnd(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100"
              />
            </div>
          </div>
        </div>

        {/* Break Preferences & Buffer Settings */}
        <div className="glass-panel p-5 sm:p-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Coffee className="w-4 h-4 text-brand-400" />
            Focus Intervals, Breaks & Task Chunking
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Work Interval Before Break (mins)
              </label>
              <input
                type="number"
                min="15"
                max="240"
                value={workIntervalMinutes}
                onChange={(e) => setWorkIntervalMinutes(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Break Duration (mins)
              </label>
              <input
                type="number"
                min="5"
                max="60"
                value={breakDurationMinutes}
                onChange={(e) => setBreakDurationMinutes(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Buffer Time Between Tasks (mins)
              </label>
              <input
                type="number"
                min="0"
                max="30"
                value={bufferMinutesBetweenTasks}
                onChange={(e) => setBufferMinutesBetweenTasks(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Max Task Session Chunk (mins)
              </label>
              <input
                type="number"
                min="30"
                max="300"
                value={maxTaskChunkMinutes}
                onChange={(e) => setMaxTaskChunkMinutes(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100"
              />
            </div>
          </div>
        </div>

        {/* Systematic Streak Thresholds & Rest Days */}
        <div className="glass-panel p-5 sm:p-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-400" />
            Systematic Streak & Consistency Rules
          </h2>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Minimum Daily Adherence to Qualify for Streak: {minAdherencePercentForStreak}%
            </label>
            <input
              type="range"
              min="30"
              max="95"
              step="5"
              value={minAdherencePercentForStreak}
              onChange={(e) => setMinAdherencePercentForStreak(e.target.value)}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Designated Weekly Rest Days (Streak is protected on rest days)
            </label>
            <div className="flex flex-wrap gap-2">
              {DAYS.map((d) => (
                <button
                  type="button"
                  key={d.val}
                  onClick={() => toggleRestDay(d.val)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                    weeklyRestDays.includes(d.val)
                      ? 'bg-blue-600/30 border-blue-500 text-blue-200 font-semibold'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Save button */}
        <div className="flex items-center justify-between pt-2">
          {saved ? (
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
              <CheckCircle className="w-4 h-4" /> Preferences Saved!
            </div>
          ) : (
            <span />
          )}

          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs shadow-glow transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Preferences'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
