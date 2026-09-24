import { AvailabilityService } from './availabilityService.js';
import { ConflictDetectionService } from './conflictDetectionService.js';

export class SchedulingEngine {
  /**
   * Calculates a composite urgency and priority score for a task.
   * Higher score = scheduled earlier.
   */
  static calculateTaskScore(task, referenceTime = new Date()) {
    const refMs = new Date(referenceTime).getTime();

    // 1. Base Priority Weight
    const priorityWeights = {
      urgent: 1000,
      high: 600,
      medium: 300,
      low: 100,
    };
    let score = priorityWeights[task.priority] || 300;

    // 2. Deadline Urgency Weight
    if (task.deadline) {
      const deadlineMs = new Date(task.deadline).getTime();
      const hoursRemaining = (deadlineMs - refMs) / (1000 * 60 * 60);

      if (hoursRemaining <= 0) {
        // Overdue! Extremely urgent
        score += 2000;
      } else if (hoursRemaining <= 24) {
        score += 1200 + (24 - hoursRemaining) * 20;
      } else if (hoursRemaining <= 48) {
        score += 600 + (48 - hoursRemaining) * 10;
      } else if (hoursRemaining <= 168) {
        // Within 1 week
        score += Math.max(0, Math.round((168 - hoursRemaining) * 2));
      }
    }

    // 3. Short task boost (quick wins get slight preference when priorities are equal)
    const remainingMinutes = Math.max(0, (task.estimatedDuration || 60) - (task.completedDuration || 0));
    if (remainingMinutes <= 30) {
      score += 50;
    }

    return score;
  }

  /**
   * Sorts a list of tasks in descending order of scheduling priority.
   */
  static rankTasks(tasks = [], referenceTime = new Date()) {
    return [...tasks].sort((a, b) => {
      const scoreA = this.calculateTaskScore(a, referenceTime);
      const scoreB = this.calculateTaskScore(b, referenceTime);
      return scoreB - scoreA;
    });
  }

  /**
   * Generates an automated optimized schedule across a planning horizon.
   *
   * @param {Object} params
   * @param {Array<Object>} params.tasks - List of uncompleted tasks
   * @param {Array<Object>} params.fixedCommitments - List of fixed commitments
   * @param {Array<Object>} params.lockedEvents - Existing locked schedule events
   * @param {Object} params.preferences - User preferences
   * @param {Date|string} params.startDate - Planning start date
   * @param {number} params.daysAhead - Planning window (default: 7 days)
   * @returns {Object} { scheduleEvents: Array, unscheduledTasks: Array, summary: Object }
   */
  static generateSchedule({
    tasks = [],
    fixedCommitments = [],
    lockedEvents = [],
    preferences = {},
    startDate = new Date(),
    daysAhead = 7,
  }) {
    const referenceStart = new Date(startDate);
    const rankedTasks = this.rankTasks(
      tasks.filter((t) => t.status !== 'completed' && t.status !== 'cancelled'),
      referenceStart
    );

    const maxChunkMinutes = preferences.maxTaskChunkMinutes || 120;
    const bufferMinutes = preferences.bufferMinutesBetweenTasks || 10;
    const breakDuration = preferences.breakDurationMinutes || 15;
    const workInterval = preferences.workIntervalMinutes || 90;

    const newScheduleEvents = [];
    const unscheduledTasks = [];

    // Working copy of locked events
    const currentOccupiedEvents = [...lockedEvents];

    // Build timeline of free slots day-by-day
    const dailyFreeSlotsMap = new Map();
    for (let dayOffset = 0; dayOffset < daysAhead; dayOffset++) {
      const targetDate = new Date(referenceStart);
      targetDate.setDate(targetDate.getDate() + dayOffset);

      // If scheduling today, adjust start time to not schedule in the past
      const slots = AvailabilityService.getAvailableSlotsForDate(
        targetDate,
        preferences,
        fixedCommitments,
        currentOccupiedEvents
      );

      // If day is today, filter out slots already passed
      const isToday = dayOffset === 0;
      const nowMs = Date.now();

      const validSlots = slots
        .map((slot) => {
          if (isToday && slot.start.getTime() < nowMs) {
            if (slot.end.getTime() <= nowMs) return null;
            const adjustedStart = new Date(Math.ceil(nowMs / (5 * 60 * 1000)) * (5 * 60 * 1000)); // Round to next 5 min
            const duration = Math.round((slot.end.getTime() - adjustedStart.getTime()) / (1000 * 60));
            return duration >= 15 ? { start: adjustedStart, end: slot.end, durationMinutes: duration } : null;
          }
          return slot;
        })
        .filter(Boolean);

      dailyFreeSlotsMap.set(dayOffset, validSlots);
    }

    // Schedule each ranked task
    for (const task of rankedTasks) {
      let remainingToSchedule = Math.max(0, (task.estimatedDuration || 60) - (task.completedDuration || 0));
      if (remainingToSchedule <= 0) continue;

      const taskChunksNeeded = Math.ceil(remainingToSchedule / maxChunkMinutes);
      let currentChunkIndex = 1;
      let isTaskFullyScheduled = false;

      // Iterate through days
      for (let dayOffset = 0; dayOffset < daysAhead && remainingToSchedule > 0; dayOffset++) {
        const slotsForDay = dailyFreeSlotsMap.get(dayOffset) || [];
        const taskDeadline = task.deadline ? new Date(task.deadline).getTime() : Infinity;

        let slotIdx = 0;
        while (slotIdx < slotsForDay.length && remainingToSchedule > 0) {
          const currentSlot = slotsForDay[slotIdx];

          // Check if slot exceeds deadline
          if (currentSlot.start.getTime() >= taskDeadline) {
            break; // Cannot schedule past deadline
          }

          const chunkMinutes = Math.min(remainingToSchedule, maxChunkMinutes, currentSlot.durationMinutes);

          if (chunkMinutes >= 15) {
            const eventStart = new Date(currentSlot.start);
            const eventEnd = new Date(eventStart.getTime() + chunkMinutes * 60 * 1000);

            // Create scheduled event
            const eventRecord = {
              taskId: task._id?.toString() || task.id,
              title: task.title,
              startTime: eventStart,
              endTime: eventEnd,
              eventType: 'task',
              status: 'scheduled',
              allocatedMinutes: chunkMinutes,
              completedMinutes: 0,
              chunkIndex: currentChunkIndex,
              totalChunks: taskChunksNeeded,
              isLocked: false,
            };

            newScheduleEvents.push(eventRecord);
            currentOccupiedEvents.push(eventRecord);

            remainingToSchedule -= chunkMinutes;
            currentChunkIndex++;

            // Shrink or adjust currentSlot by chunkMinutes + buffer
            const consumedMinutes = chunkMinutes + bufferMinutes;
            const updatedSlotStart = new Date(eventStart.getTime() + consumedMinutes * 60 * 1000);

            if (updatedSlotStart.getTime() < currentSlot.end.getTime()) {
              currentSlot.start = updatedSlotStart;
              currentSlot.durationMinutes = Math.round((currentSlot.end.getTime() - updatedSlotStart.getTime()) / (1000 * 60));
            } else {
              slotsForDay.splice(slotIdx, 1);
              continue; // Don't increment slotIdx since array shrank
            }
          }

          slotIdx++;
        }

        if (remainingToSchedule === 0) {
          isTaskFullyScheduled = true;
          break;
        }
      }

      if (remainingToSchedule > 0) {
        unscheduledTasks.push({
          task,
          unallocatedMinutes: remainingToSchedule,
          reason: task.deadline && new Date(task.deadline).getTime() < referenceStart.getTime() + daysAhead * 86400000
            ? 'Insufficient available working hours before task deadline'
            : 'Working capacity exceeded within the planning window',
        });
      }
    }

    // Verify schedule integrity
    const integrityCheck = ConflictDetectionService.validateScheduleIntegrity([
      ...currentOccupiedEvents,
    ]);

    return {
      success: true,
      scheduleEvents: newScheduleEvents,
      unscheduledTasks,
      integrityCheck,
      summary: {
        totalTasksConsidered: rankedTasks.length,
        totalEventsScheduled: newScheduleEvents.length,
        totalMinutesScheduled: newScheduleEvents.reduce((acc, ev) => acc + ev.allocatedMinutes, 0),
        unscheduledCount: unscheduledTasks.length,
      },
    };
  }
}
