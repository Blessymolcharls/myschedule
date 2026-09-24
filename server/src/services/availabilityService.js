import { ConflictDetectionService } from './conflictDetectionService.js';

export class AvailabilityService {
  /**
   * Helper to parse "HH:mm" time string onto a specific Date object.
   */
  static parseTimeToDate(baseDate, timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const d = new Date(baseDate);
    d.setHours(hours, minutes, 0, 0);
    return d;
  }

  /**
   * Expands recurring fixed commitments onto a specific date.
   */
  static expandCommitmentsForDate(commitments = [], targetDate) {
    const d = new Date(targetDate);
    const dayOfWeek = d.getDay(); // 0 = Sun, 6 = Sat
    const expanded = [];

    for (const item of commitments) {
      if (!item.isRecurring) {
        // One-off commitment: check if same calendar day
        const itemStart = new Date(item.startTime);
        if (
          itemStart.getFullYear() === d.getFullYear() &&
          itemStart.getMonth() === d.getMonth() &&
          itemStart.getDate() === d.getDate()
        ) {
          expanded.push({
            id: item._id?.toString() || item.id,
            title: item.title,
            startTime: new Date(item.startTime),
            endTime: new Date(item.endTime),
            eventType: 'fixed_commitment',
          });
        }
      } else {
        // Recurring commitment
        let applies = false;
        if (item.recurrencePattern === 'daily') {
          applies = true;
        } else if (item.recurrencePattern === 'weekdays' && dayOfWeek >= 1 && dayOfWeek <= 5) {
          applies = true;
        } else if (item.recurrencePattern === 'weekly' && item.daysOfWeek?.includes(dayOfWeek)) {
          applies = true;
        }

        if (applies) {
          const itemStart = new Date(item.startTime);
          const itemEnd = new Date(item.endTime);
          const startHours = itemStart.getHours();
          const startMins = itemStart.getMinutes();
          const endHours = itemEnd.getHours();
          const endMins = itemEnd.getMinutes();

          const mappedStart = new Date(d);
          mappedStart.setHours(startHours, startMins, 0, 0);

          const mappedEnd = new Date(d);
          mappedEnd.setHours(endHours, endMins, 0, 0);

          expanded.push({
            id: item._id?.toString() || item.id,
            title: item.title,
            startTime: mappedStart,
            endTime: mappedEnd,
            eventType: 'fixed_commitment',
          });
        }
      }
    }

    return expanded;
  }

  /**
   * Calculate available free time slots for a specific day.
   * @param {Date|string} date - Target date
   * @param {Object} preferences - User preferences (workingHoursStart, workingHoursEnd, sleepStart, etc.)
   * @param {Array<Object>} fixedCommitments - Array of fixed commitments
   * @param {Array<Object>} existingEvents - Array of already locked or scheduled events
   * @returns {Array<Object>} available slots: [{ start: Date, end: Date, durationMinutes: number }]
   */
  static getAvailableSlotsForDate(date, preferences = {}, fixedCommitments = [], existingEvents = []) {
    const targetDate = new Date(date);
    const dayOfWeek = targetDate.getDay();

    // Check if it's a configured rest day
    const weeklyRestDays = preferences.weeklyRestDays || [0];
    if (weeklyRestDays.includes(dayOfWeek)) {
      return []; // No regular work slots on designated rest days unless overridden
    }

    // Default working hours: 09:00 to 18:00
    const startStr = preferences.workingHoursStart || '09:00';
    const endStr = preferences.workingHoursEnd || '18:00';

    const dayWorkStart = this.parseTimeToDate(targetDate, startStr);
    const dayWorkEnd = this.parseTimeToDate(targetDate, endStr);

    if (dayWorkStart >= dayWorkEnd) {
      return [];
    }

    // Gather all busy blocks for this day
    const expandedCommitments = this.expandCommitmentsForDate(fixedCommitments, targetDate);
    
    // Filter existing events to this day
    const dayEvents = existingEvents.filter((ev) => {
      const s = new Date(ev.startTime);
      return (
        s.getFullYear() === targetDate.getFullYear() &&
        s.getMonth() === targetDate.getMonth() &&
        s.getDate() === targetDate.getDate()
      );
    });

    const busyIntervals = [...expandedCommitments, ...dayEvents]
      .map((item) => ({
        start: new Date(item.startTime).getTime(),
        end: new Date(item.endTime).getTime(),
      }))
      .filter((interval) => interval.end > dayWorkStart.getTime() && interval.start < dayWorkEnd.getTime())
      .sort((a, b) => a.start - b.start);

    // Merge overlapping busy intervals
    const mergedBusy = [];
    for (const b of busyIntervals) {
      if (mergedBusy.length === 0) {
        mergedBusy.push({
          start: Math.max(b.start, dayWorkStart.getTime()),
          end: Math.min(b.end, dayWorkEnd.getTime()),
        });
      } else {
        const prev = mergedBusy[mergedBusy.length - 1];
        if (b.start <= prev.end) {
          prev.end = Math.max(prev.end, Math.min(b.end, dayWorkEnd.getTime()));
        } else {
          mergedBusy.push({
            start: Math.max(b.start, dayWorkStart.getTime()),
            end: Math.min(b.end, dayWorkEnd.getTime()),
          });
        }
      }
    }

    // Extract free windows between merged busy intervals
    const freeSlots = [];
    let currentCursor = dayWorkStart.getTime();

    for (const busy of mergedBusy) {
      if (busy.start > currentCursor) {
        const slotStart = new Date(currentCursor);
        const slotEnd = new Date(busy.start);
        const durationMinutes = Math.round((slotEnd.getTime() - slotStart.getTime()) / (1000 * 60));

        if (durationMinutes >= 15) { // Minimum 15 min usable block
          freeSlots.push({
            start: slotStart,
            end: slotEnd,
            durationMinutes,
          });
        }
      }
      currentCursor = Math.max(currentCursor, busy.end);
    }

    // Check tail window until dayWorkEnd
    if (currentCursor < dayWorkEnd.getTime()) {
      const slotStart = new Date(currentCursor);
      const slotEnd = new Date(dayWorkEnd.getTime());
      const durationMinutes = Math.round((slotEnd.getTime() - slotStart.getTime()) / (1000 * 60));

      if (durationMinutes >= 15) {
        freeSlots.push({
          start: slotStart,
          end: slotEnd,
          durationMinutes,
        });
      }
    }

    return freeSlots;
  }
}
