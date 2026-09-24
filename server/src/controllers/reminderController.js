import { ReminderService } from '../services/reminderService.js';

export const getReminders = async (req, res, next) => {
  try {
    const reminders = await ReminderService.syncReminders(req.user._id);
    res.json({ success: true, reminders });
  } catch (err) {
    next(err);
  }
};

export const markReminderRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const reminder = await ReminderService.markAsRead(req.user._id, id);
    res.json({ success: true, reminder });
  } catch (err) {
    next(err);
  }
};

export const dismissReminder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const reminder = await ReminderService.dismissReminder(req.user._id, id);
    res.json({ success: true, reminder });
  } catch (err) {
    next(err);
  }
};
