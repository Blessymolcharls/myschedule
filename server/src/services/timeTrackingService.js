import { TimeLog } from '../models/TimeLog.js';
import { Task } from '../models/Task.js';
import { ScheduleEvent } from '../models/ScheduleEvent.js';
import { AdherenceService } from './adherenceService.js';

export class TimeTrackingService {
  /**
   * Start a live session on a task.
   */
  static async startSession(userId, { taskId, scheduleEventId = null, notes = '' }) {
    // Check if there is already an active running session, auto-stop it
    const activeSession = await TimeLog.findOne({ userId, endTime: null });
    if (activeSession) {
      await this.stopSession(userId, activeSession._id);
    }

    const task = await Task.findOne({ _id: taskId, userId });
    if (!task) throw new Error('Task not found');

    if (task.status === 'pending' || task.status === 'scheduled') {
      task.status = 'in_progress';
      await task.save();
    }

    if (scheduleEventId) {
      await ScheduleEvent.findOneAndUpdate(
        { _id: scheduleEventId, userId },
        { status: 'in_progress' }
      );
    }

    const timeLog = await TimeLog.create({
      userId,
      taskId,
      scheduleEventId,
      startTime: new Date(),
      isLiveSession: true,
      notes,
    });

    return timeLog;
  }

  /**
   * Stop an active timer session.
   */
  static async stopSession(userId, timeLogId, markTaskCompleted = false) {
    const timeLog = await TimeLog.findOne({ _id: timeLogId, userId });
    if (!timeLog) throw new Error('Time log session not found');

    const endTime = new Date();
    const durationMs = endTime.getTime() - new Date(timeLog.startTime).getTime();
    const durationMinutes = Math.max(1, Math.round(durationMs / (1000 * 60)));

    timeLog.endTime = endTime;
    timeLog.durationMinutes = durationMinutes;
    timeLog.isLiveSession = false;
    await timeLog.save();

    // Update task completed duration
    const task = await Task.findOne({ _id: timeLog.taskId, userId });
    if (task) {
      task.completedDuration = (task.completedDuration || 0) + durationMinutes;
      if (markTaskCompleted || task.completedDuration >= task.estimatedDuration) {
        task.status = 'completed';
        task.completedAt = new Date();
      }
      await task.save();
    }

    // Update schedule event if associated
    if (timeLog.scheduleEventId) {
      const ev = await ScheduleEvent.findOne({ _id: timeLog.scheduleEventId, userId });
      if (ev) {
        ev.completedMinutes = (ev.completedMinutes || 0) + durationMinutes;
        if (markTaskCompleted || ev.completedMinutes >= ev.allocatedMinutes) {
          ev.status = 'completed';
        }
        await ev.save();
      }
    }

    // Update today's adherence
    const todayStr = endTime.toISOString().split('T')[0];
    await AdherenceService.calculateDailyAdherence(userId, todayStr);

    return {
      timeLog,
      task,
      sessionDurationMinutes: durationMinutes,
    };
  }

  /**
   * Get currently running timer session.
   */
  static async getActiveSession(userId) {
    const active = await TimeLog.findOne({ userId, endTime: null }).populate('taskId');
    return active;
  }

  /**
   * Log manual time entry.
   */
  static async logManualTime(userId, { taskId, scheduleEventId = null, startTime, endTime, durationMinutes, notes = '' }) {
    const sTime = new Date(startTime);
    const eTime = endTime ? new Date(endTime) : new Date(sTime.getTime() + durationMinutes * 60 * 1000);
    const calculatedMins = durationMinutes || Math.round((eTime.getTime() - sTime.getTime()) / (1000 * 60));

    const timeLog = await TimeLog.create({
      userId,
      taskId,
      scheduleEventId,
      startTime: sTime,
      endTime: eTime,
      durationMinutes: calculatedMins,
      isLiveSession: false,
      notes,
    });

    const task = await Task.findOne({ _id: taskId, userId });
    if (task) {
      task.completedDuration = (task.completedDuration || 0) + calculatedMins;
      if (task.completedDuration >= task.estimatedDuration) {
        task.status = 'completed';
        task.completedAt = new Date();
      }
      await task.save();
    }

    const dayStr = sTime.toISOString().split('T')[0];
    await AdherenceService.calculateDailyAdherence(userId, dayStr);

    return timeLog;
  }
}
