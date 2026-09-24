import { DailyProgress } from '../models/DailyProgress.js';
import { ScheduleEvent } from '../models/ScheduleEvent.js';
import { TimeLog } from '../models/TimeLog.js';
import { UserPreference } from '../models/UserPreference.js';

export class AdherenceService {
  /**
   * Calculates adherence for a given user and date ('YYYY-MM-DD').
   */
  static async calculateDailyAdherence(userId, dateString) {
    const preferences = (await UserPreference.findOne({ userId })) || {
      minAdherencePercentForStreak: 70,
      weeklyRestDays: [0],
    };

    const targetDate = new Date(`${dateString}T00:00:00.000Z`);
    const nextDate = new Date(targetDate);
    nextDate.setDate(nextDate.getDate() + 1);

    const dayOfWeek = new Date(dateString).getDay();
    const isRestDay = (preferences.weeklyRestDays || [0]).includes(dayOfWeek);

    // 1. Get planned minutes from scheduled events for this day
    const scheduledEvents = await ScheduleEvent.find({
      userId,
      startTime: { $gte: targetDate, $lt: nextDate },
      eventType: 'task',
    });

    const plannedMinutes = scheduledEvents.reduce((acc, ev) => acc + (ev.allocatedMinutes || 0), 0);

    // 2. Get actual completed minutes from TimeLogs
    const timeLogs = await TimeLog.find({
      userId,
      startTime: { $gte: targetDate, $lt: nextDate },
    });

    const completedMinutes = timeLogs.reduce((acc, log) => acc + (log.durationMinutes || 0), 0);

    // 3. Compute Adherence
    let adherencePercentage = 0;
    if (plannedMinutes > 0) {
      adherencePercentage = Math.min(100, Math.round((completedMinutes / plannedMinutes) * 100));
    } else if (completedMinutes > 0) {
      adherencePercentage = 100; // Worked without strict prior plan
    } else if (isRestDay) {
      adherencePercentage = 100; // Rest day counts as 100% compliant
    }

    // 4. Determine Daily Status & Streak Eligibility
    let status = 'missed';
    let qualifiesForStreak = false;

    if (isRestDay) {
      status = 'rest';
      qualifiesForStreak = true;
    } else if (adherencePercentage >= (preferences.minAdherencePercentForStreak || 70)) {
      status = 'completed';
      qualifiesForStreak = true;
    } else if (completedMinutes > 0) {
      status = 'partial';
      qualifiesForStreak = false;
    } else {
      status = 'missed';
      qualifiesForStreak = false;
    }

    const tasksCompletedCount = scheduledEvents.filter((ev) => ev.status === 'completed').length;

    // 5. Upsert DailyProgress record
    const dailyProgress = await DailyProgress.findOneAndUpdate(
      { userId, dateString },
      {
        userId,
        dateString,
        plannedMinutes,
        completedMinutes,
        adherencePercentage,
        status,
        qualifiesForStreak,
        tasksCompletedCount,
        tasksPlannedCount: scheduledEvents.length,
      },
      { upsert: true, new: true }
    );

    return dailyProgress;
  }

  /**
   * Retrieves adherence progress history across a date range.
   */
  static async getAdherenceHistory(userId, startDateStr, endDateStr) {
    return DailyProgress.find({
      userId,
      dateString: { $gte: startDateStr, $lte: endDateStr },
    }).sort({ dateString: 1 });
  }
}
