import { SchedulingEngine } from './schedulingEngine.js';
import { ScheduleEvent } from '../models/ScheduleEvent.js';
import { Task } from '../models/Task.js';
import { FixedCommitment } from '../models/FixedCommitment.js';
import { UserPreference } from '../models/UserPreference.js';

export class DynamicReschedulingService {
  /**
   * Recalculates and updates the schedule for a user from the current moment forward.
   * Preserves completed and locked events. Removes future unlocked pending schedule events and re-runs the scheduling engine.
   */
  static async rescheduleUserSchedule(userId, startDate = new Date(), daysAhead = 7) {
    const preferences = (await UserPreference.findOne({ userId })) || {};
    const fixedCommitments = await FixedCommitment.find({ userId });
    
    // Retrieve pending tasks that still have unfinished duration
    const pendingTasks = await Task.find({
      userId,
      status: { $in: ['pending', 'scheduled', 'in_progress', 'postponed'] },
    });

    // Find existing schedule events
    const startWindow = new Date(startDate);
    const endWindow = new Date(startWindow);
    endWindow.setDate(endWindow.getDate() + daysAhead);

    // Keep events that are locked, completed, or in past
    const lockedOrHistoricalEvents = await ScheduleEvent.find({
      userId,
      $or: [
        { isLocked: true },
        { status: 'completed' },
        { endTime: { $lte: startWindow } },
      ],
    });

    // Remove future unlocked scheduled events to allow re-optimization
    await ScheduleEvent.deleteMany({
      userId,
      isLocked: false,
      status: { $in: ['scheduled', 'in_progress'] },
      startTime: { $gte: startWindow },
    });

    // Run the scheduling engine
    const scheduleResult = SchedulingEngine.generateSchedule({
      tasks: pendingTasks,
      fixedCommitments,
      lockedEvents: lockedOrHistoricalEvents,
      preferences,
      startDate: startWindow,
      daysAhead,
    });

    // Persist new schedule events
    const createdEvents = [];
    if (scheduleResult.scheduleEvents && scheduleResult.scheduleEvents.length > 0) {
      const docsToInsert = scheduleResult.scheduleEvents.map((ev) => ({
        ...ev,
        userId,
      }));
      const inserted = await ScheduleEvent.insertMany(docsToInsert);
      createdEvents.push(...inserted);
    }

    // Update task statuses
    for (const task of pendingTasks) {
      const hasScheduledEvents = createdEvents.some((ev) => ev.taskId?.toString() === task._id.toString());
      if (hasScheduledEvents && task.status === 'pending') {
        task.status = 'scheduled';
        await task.save();
      }
    }

    return {
      success: true,
      newEventsCount: createdEvents.length,
      unscheduledTasks: scheduleResult.unscheduledTasks,
      summary: scheduleResult.summary,
    };
  }

  /**
   * Handles task completion: closes out associated future schedule events and triggers rescheduling.
   */
  static async handleTaskCompleted(userId, taskId) {
    const task = await Task.findOne({ _id: taskId, userId });
    if (!task) throw new Error('Task not found');

    task.status = 'completed';
    task.completedAt = new Date();
    task.completedDuration = task.estimatedDuration;
    await task.save();

    // Mark current active event as completed, remove future events for this task
    const now = new Date();
    await ScheduleEvent.updateMany(
      { userId, taskId, startTime: { $lte: now }, endTime: { $gte: now } },
      { status: 'completed' }
    );
    await ScheduleEvent.deleteMany({
      userId,
      taskId,
      startTime: { $gt: now },
      isLocked: false,
    });

    // Re-optimize remaining schedule
    return this.rescheduleUserSchedule(userId, now);
  }
}
