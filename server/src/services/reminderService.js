import { Reminder } from '../models/Reminder.js';
import { ScheduleEvent } from '../models/ScheduleEvent.js';
import { Task } from '../models/Task.js';

export class ReminderService {
  /**
   * Sync and generate upcoming reminders for a user.
   */
  static async syncReminders(userId) {
    const now = new Date();
    const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // 1. Scheduled events in the next 2 hours
    const upcomingEvents = await ScheduleEvent.find({
      userId,
      startTime: { $gte: now, $lte: new Date(now.getTime() + 2 * 60 * 60 * 1000) },
      status: 'scheduled',
    });

    for (const ev of upcomingEvents) {
      const existing = await Reminder.findOne({
        userId,
        scheduleEventId: ev._id,
        type: 'task_start',
      });

      if (!existing) {
        await Reminder.create({
          userId,
          scheduleEventId: ev._id,
          taskId: ev.taskId,
          title: `Upcoming Task: ${ev.title}`,
          message: `Scheduled to begin at ${new Date(ev.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
          triggerTime: new Date(ev.startTime.getTime() - 10 * 60 * 1000), // 10 mins before
          type: 'task_start',
        });
      }
    }

    // 2. Approaching Deadlines in the next 24 hours
    const urgentTasks = await Task.find({
      userId,
      deadline: { $gte: now, $lte: in24Hours },
      status: { $in: ['pending', 'scheduled', 'in_progress'] },
    });

    for (const task of urgentTasks) {
      const existing = await Reminder.findOne({
        userId,
        taskId: task._id,
        type: 'deadline_approaching',
      });

      if (!existing) {
        await Reminder.create({
          userId,
          taskId: task._id,
          title: `Deadline Approaching: ${task.title}`,
          message: `Deadline is due at ${new Date(task.deadline).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}`,
          triggerTime: now,
          type: 'deadline_approaching',
        });
      }
    }

    return Reminder.find({ userId, isDismissed: false }).sort({ triggerTime: 1 });
  }

  static async markAsRead(userId, reminderId) {
    return Reminder.findOneAndUpdate({ _id: reminderId, userId }, { isRead: true }, { new: true });
  }

  static async dismissReminder(userId, reminderId) {
    return Reminder.findOneAndUpdate({ _id: reminderId, userId }, { isDismissed: true }, { new: true });
  }
}
