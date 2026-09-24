/**
 * ConflictDetectionService
 * Pure, deterministic logic for detecting time overlaps and conflicts.
 * Independently testable without DB dependencies.
 */

export class ConflictDetectionService {
  /**
   * Check if two time intervals [startA, endA] and [startB, endB] overlap.
   * Standard interval overlap condition: startA < endB && endA > startB.
   */
  static doIntervalsOverlap(startA, endA, startB, endB) {
    const sA = new Date(startA).getTime();
    const eA = new Date(endA).getTime();
    const sB = new Date(startB).getTime();
    const eB = new Date(endB).getTime();

    return sA < eB && eA > sB;
  }

  /**
   * Calculates the overlap duration in minutes between two intervals.
   */
  static getOverlapMinutes(startA, endA, startB, endB) {
    const sA = new Date(startA).getTime();
    const eA = new Date(endA).getTime();
    const sB = new Date(startB).getTime();
    const eB = new Date(endB).getTime();

    const overlapStart = Math.max(sA, sB);
    const overlapEnd = Math.min(eA, eB);

    if (overlapStart < overlapEnd) {
      return Math.round((overlapEnd - overlapStart) / (1000 * 60));
    }
    return 0;
  }

  /**
   * Detects all conflicts for a candidate interval against a list of existing events.
   * @param {Object} candidate - { startTime: Date|string, endTime: Date|string, id?: string }
   * @param {Array<Object>} existingEvents - Array of events with { id, title, startTime, endTime, eventType }
   * @returns {Array<Object>} list of conflicting events with overlap details
   */
  static findConflicts(candidate, existingEvents = []) {
    const conflicts = [];
    const candidateStart = new Date(candidate.startTime);
    const candidateEnd = new Date(candidate.endTime);

    for (const event of existingEvents) {
      // Don't compare event against itself
      if (candidate.id && (event.id === candidate.id || event._id?.toString() === candidate.id?.toString())) {
        continue;
      }

      if (this.doIntervalsOverlap(candidateStart, candidateEnd, event.startTime, event.endTime)) {
        const overlapMinutes = this.getOverlapMinutes(candidateStart, candidateEnd, event.startTime, event.endTime);
        conflicts.push({
          conflictingEvent: event,
          overlapMinutes,
          message: `Conflicts with "${event.title}" by ${overlapMinutes} minutes (${new Date(event.startTime).toLocaleTimeString()} - ${new Date(event.endTime).toLocaleTimeString()})`,
        });
      }
    }

    return conflicts;
  }

  /**
   * Validates a full schedule list for any internal overlaps.
   */
  static validateScheduleIntegrity(events = []) {
    const conflicts = [];
    for (let i = 0; i < events.length; i++) {
      for (let j = i + 1; j < events.length; j++) {
        const evA = events[i];
        const evB = events[j];
        if (this.doIntervalsOverlap(evA.startTime, evA.endTime, evB.startTime, evB.endTime)) {
          conflicts.push({
            eventA: evA,
            eventB: evB,
            overlapMinutes: this.getOverlapMinutes(evA.startTime, evA.endTime, evB.startTime, evB.endTime),
          });
        }
      }
    }
    return {
      isValid: conflicts.length === 0,
      conflicts,
    };
  }
}
