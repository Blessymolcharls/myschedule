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
    const interval = setInterval(fetchReminders, 60000);
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
        className="relative p-2 rounded-xl bg-[#FFFFFF] hover:bg-[#FAF9FD] border border-[#E5E2F0] text-[#718096] hover:text-[#26324A] hover:border-[#D6D0EB] transition-all shadow-xs"
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#8B7BE8] text-[10px] font-bold text-white shadow-sm">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-[#FFFFFF] border border-[#E2DCF7] shadow-popover p-4 z-50 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0EDF9]">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-lg bg-[#ECE9FB] text-[#8B7BE8]">
                  <Bell className="w-3.5 h-3.5" />
                </div>
                <span className="font-bold text-xs text-[#26324A]">Smart Alerts & Reminders</span>
              </div>
              <span className="text-[11px] text-[#9AA5B8]">{reminders.length} total</span>
            </div>

            <div className="mt-3 max-h-72 overflow-y-auto space-y-2">
              {reminders.length === 0 ? (
                <div className="text-center py-6 text-[#9AA5B8] text-xs">
                  No upcoming notifications. You are all set!
                </div>
              ) : (
                reminders.map((r) => (
                  <div
                    key={r._id}
                    className={`p-3 rounded-xl border transition-all ${
                      r.isRead
                        ? 'bg-[#FAF9FD] border-[#EAE7F5] opacity-75'
                        : 'bg-[#FDFCFE] border-[#E2DCF7] shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          {r.type === 'deadline_approaching' ? (
                            <span className="p-1 rounded-md bg-[#FEF8E3] text-[#8E6814]">
                              <AlertTriangle className="w-3 h-3" />
                            </span>
                          ) : (
                            <span className="p-1 rounded-md bg-[#ECE9FB] text-[#8B7BE8]">
                              <Clock className="w-3 h-3" />
                            </span>
                          )}
                          <span className="text-xs font-bold text-[#26324A] truncate">{r.title}</span>
                        </div>
                        <p className="text-[11px] text-[#718096] mt-1 leading-relaxed">{r.message}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        {!r.isRead && (
                          <button
                            onClick={() => handleMarkRead(r._id)}
                            title="Mark Read"
                            className="p-1 rounded-md hover:bg-[#EFECFA] text-[#718096] hover:text-[#26324A]"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDismiss(r._id)}
                          title="Dismiss"
                          className="p-1 rounded-md hover:bg-[#FDECEC] text-[#718096] hover:text-[#9E3B3B]"
                        >
                          <X className="w-3.5 h-3.5" />
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
