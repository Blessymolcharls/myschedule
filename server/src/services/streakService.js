import { StreakRecord } from '../models/StreakRecord.js';
import { DailyProgress } from '../models/DailyProgress.js';
import { UserPreference } from '../models/UserPreference.js';
import { AdherenceService } from './adherenceService.js';

export class StreakService {
  /**
   * Get or create a streak record for a user.
   */
  static async getOrCreateStreakRecord(userId) {
    let record = await StreakRecord.findOne({ userId });
    if (!record) {
      record = await StreakRecord.create({
        userId,
        currentStreak: 0,
        longestStreak: 0,
        streakHistory: [],
      });
    }
    return record;
  }

  /**
   * Updates streak calculation after calculating daily adherence.
   */
  static async processDayStreak(userId, dateString) {
    const dailyProgress = await AdherenceService.calculateDailyAdherence(userId, dateString);
    const streakRecord = await this.getOrCreateStreakRecord(userId);

    // Don't re-process if already processed today unless recalculating
    const isQualifying = dailyProgress.qualifiesForStreak;

    if (isQualifying) {
      if (dailyProgress.status === 'rest') {
        streakRecord.totalRestDays += 1;
        streakRecord.streakHistory.push({
          dateString,
          action: 'rest',
          streakCount: streakRecord.currentStreak,
          adherencePercentage: dailyProgress.adherencePercentage,
          note: 'Scheduled rest day - streak preserved',
        });
      } else {
        streakRecord.currentStreak += 1;
        streakRecord.totalSuccessfulDays += 1;
        if (streakRecord.currentStreak > streakRecord.longestStreak) {
          streakRecord.longestStreak = streakRecord.currentStreak;
        }
        streakRecord.streakHistory.push({
          dateString,
          action: 'increment',
          streakCount: streakRecord.currentStreak,
          adherencePercentage: dailyProgress.adherencePercentage,
          note: `Achieved ${dailyProgress.adherencePercentage}% adherence`,
        });
      }
    } else {
      // Missed or low adherence day
      // Check if streak was active and now breaks
      if (streakRecord.currentStreak > 0) {
        streakRecord.streakHistory.push({
          dateString,
          action: 'reset',
          streakCount: 0,
          adherencePercentage: dailyProgress.adherencePercentage,
          note: `Streak broken. Adherence was ${dailyProgress.adherencePercentage}%`,
        });
        streakRecord.currentStreak = 0;
      }
    }

    streakRecord.lastCalculatedDate = dateString;
    await streakRecord.save();

    return {
      streakRecord,
      dailyProgress,
    };
  }

  /**
   * Applies streak protection (freeze) to preserve a missed day.
   */
  static async applyStreakProtection(userId, dateString) {
    const preferences = await UserPreference.findOne({ userId });
    if (!preferences || preferences.availableStreakProtections <= 0) {
      throw new Error('No streak protections available');
    }

    const progress = await DailyProgress.findOne({ userId, dateString });
    if (!progress) throw new Error('No progress record found for this date');

    if (progress.status === 'completed' || progress.status === 'rest') {
      throw new Error('Day already qualifies for streak; protection not needed');
    }

    // Deduct one protection
    preferences.availableStreakProtections -= 1;
    await preferences.save();

    // Mark daily progress as protected
    progress.status = 'protected';
    progress.qualifiesForStreak = true;
    await progress.save();

    const streakRecord = await this.getOrCreateStreakRecord(userId);
    streakRecord.totalProtectedDays += 1;
    streakRecord.currentStreak = Math.max(1, streakRecord.currentStreak + 1);
    if (streakRecord.currentStreak > streakRecord.longestStreak) {
      streakRecord.longestStreak = streakRecord.currentStreak;
    }
    streakRecord.streakHistory.push({
      dateString,
      action: 'freeze',
      streakCount: streakRecord.currentStreak,
      adherencePercentage: progress.adherencePercentage,
      note: 'Streak protection shield used',
    });
    await streakRecord.save();

    return {
      success: true,
      remainingProtections: preferences.availableStreakProtections,
      streakRecord,
      dailyProgress: progress,
    };
  }

  /**
   * Attempt streak recovery: if user completed 2 consecutive high-performance days (>=85% adherence),
   * recovers prior broken streak.
   */
  static async attemptStreakRecovery(userId) {
    const streakRecord = await this.getOrCreateStreakRecord(userId);
    const recentProgress = await DailyProgress.find({ userId })
      .sort({ dateString: -1 })
      .limit(3);

    if (recentProgress.length < 2) {
      return { eligible: false, message: 'Need at least 2 consecutive completed days for recovery evaluation' };
    }

    const last2Days = recentProgress.slice(0, 2);
    const bothHighAdherence = last2Days.every((d) => d.adherencePercentage >= 85);

    if (bothHighAdherence && streakRecord.currentStreak < streakRecord.longestStreak) {
      const recoveredStreak = Math.max(streakRecord.currentStreak + 2, Math.floor(streakRecord.longestStreak * 0.8));
      streakRecord.currentStreak = recoveredStreak;
      streakRecord.streakHistory.push({
        dateString: new Date().toISOString().split('T')[0],
        action: 'recover',
        streakCount: recoveredStreak,
        adherencePercentage: 85,
        note: 'Streak recovery achieved through high consistency comeback',
      });
      await streakRecord.save();

      return {
        eligible: true,
        recovered: true,
        currentStreak: streakRecord.currentStreak,
        message: `Streak recovered to ${recoveredStreak} days!`,
      };
    }

    return {
      eligible: false,
      message: 'Recovery requires 2 consecutive days with >= 85% adherence',
    };
  }

  /**
   * Comprehensive streak & consistency summary.
   */
  static async getStreakSummary(userId) {
    const streakRecord = await this.getOrCreateStreakRecord(userId);
    const preferences = (await UserPreference.findOne({ userId })) || { availableStreakProtections: 2 };

    const last30Days = await DailyProgress.find({ userId })
      .sort({ dateString: -1 })
      .limit(30);

    const qualifyingCount = last30Days.filter((d) => d.qualifiesForStreak).length;
    const monthlyConsistencyPercent = last30Days.length > 0 ? Math.round((qualifyingCount / last30Days.length) * 100) : 0;

    const last7Days = last30Days.slice(0, 7);
    const weeklyQualifyingCount = last7Days.filter((d) => d.qualifiesForStreak).length;
    const weeklyConsistencyPercent = last7Days.length > 0 ? Math.round((weeklyQualifyingCount / last7Days.length) * 100) : 0;

    return {
      currentStreak: streakRecord.currentStreak,
      longestStreak: streakRecord.longestStreak,
      totalSuccessfulDays: streakRecord.totalSuccessfulDays,
      totalRestDays: streakRecord.totalRestDays,
      totalProtectedDays: streakRecord.totalProtectedDays,
      availableStreakProtections: preferences.availableStreakProtections,
      weeklyConsistencyPercent,
      monthlyConsistencyPercent,
      recentHistory: last30Days,
    };
  }
}
