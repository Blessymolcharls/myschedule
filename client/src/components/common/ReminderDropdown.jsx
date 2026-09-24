import React, { useState, useEffect } from 'react';
import { Bell, Check, Clock, AlertTriangle, X } from 'lucide-react';
import { reminderApi } from '../../services/api';

export const ReminderDropdown = () => {
  const [open, setOpen] = useState(false);
  const [reminders, setReminders] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchReminders = async () => {
    try {
      const res = await reminderApi.getReminders();
      if (res.data.success) {
        setReminders(res.data.reminders);
        setUnreadCount(res.data.reminders.filter((r) => !r.isRead).length);
      }
    } catch (err) {
      console.error('Failed to fetch reminders:', err);
    }
  };

  useEffect(() => {
    fetchReminders();
    const interval = setInterval(fetchReminders, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const handleMarkRead = async (id) => {
    await reminderApi.markRead(id);
    fetchReminders();
  };

  const handleDismiss = async (id) => {
    await reminderApi.dismiss(id);
    fetchReminders();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white transition-all"
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-500 text-[10px] font-bold text-white shadow-glow">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-brand-400" />
                <span className="font-semibold text-sm text-slate-100">Smart Alerts & Reminders</span>
              </div>
              <span className="text-xs text-slate-400">{reminders.length} total</span>
            </div>

            <div className="mt-3 max-h-72 overflow-y-auto space-y-2">
              {reminders.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-xs">
                  No upcoming notifications. You are all set!
                </div>
              ) : (
                reminders.map((r) => (
                  <div
                    key={r._id}
                    className={`p-3 rounded-xl border transition-all ${
                      r.isRead
                        ? 'bg-slate-950/40 border-slate-800/40 opacity-70'
                        : 'bg-slate-800/50 border-brand-500/30'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5">
                          {r.type === 'deadline_approaching' ? (
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                          ) : (
                            <Clock className="w-3.5 h-3.5 text-brand-400" />
                          )}
                          <span className="text-xs font-semibold text-slate-200">{r.title}</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">{r.message}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        {!r.isRead && (
                          <button
                            onClick={() => handleMarkRead(r._id)}
                            title="Mark Read"
                            className="p-1 rounded-md hover:bg-slate-700 text-slate-400 hover:text-slate-200"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDismiss(r._id)}
                          title="Dismiss"
                          className="p-1 rounded-md hover:bg-slate-700 text-slate-400 hover:text-slate-200"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
