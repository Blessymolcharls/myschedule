import { ConflictDetectionService } from '../src/services/conflictDetectionService.js';

describe('ConflictDetectionService', () => {
  test('should detect overlapping time intervals correctly', () => {
    const startA = new Date('2026-09-25T10:00:00Z');
    const endA = new Date('2026-09-25T11:30:00Z');

    const startB = new Date('2026-09-25T11:00:00Z');
    const endB = new Date('2026-09-25T12:00:00Z');

    const overlaps = ConflictDetectionService.doIntervalsOverlap(startA, endA, startB, endB);
    expect(overlaps).toBe(true);

    const overlapMinutes = ConflictDetectionService.getOverlapMinutes(startA, endA, startB, endB);
    expect(overlapMinutes).toBe(30);
  });

  test('should return false for non-overlapping adjacent intervals', () => {
    const startA = new Date('2026-09-25T10:00:00Z');
    const endA = new Date('2026-09-25T11:00:00Z');

    const startB = new Date('2026-09-25T11:00:00Z');
    const endB = new Date('2026-09-25T12:00:00Z');

    const overlaps = ConflictDetectionService.doIntervalsOverlap(startA, endA, startB, endB);
    expect(overlaps).toBe(false);
  });

  test('should identify specific conflicting events from a list', () => {
    const candidate = {
      startTime: new Date('2026-09-25T14:00:00Z'),
      endTime: new Date('2026-09-25T15:30:00Z'),
    };

    const existingEvents = [
      { id: '1', title: 'Team Meeting', startTime: new Date('2026-09-25T13:00:00Z'), endTime: new Date('2026-09-25T14:30:00Z') },
      { id: '2', title: 'Focus Code', startTime: new Date('2026-09-25T16:00:00Z'), endTime: new Date('2026-09-25T17:00:00Z') },
    ];

    const conflicts = ConflictDetectionService.findConflicts(candidate, existingEvents);
    expect(conflicts.length).toBe(1);
    expect(conflicts[0].conflictingEvent.title).toBe('Team Meeting');
    expect(conflicts[0].overlapMinutes).toBe(30);
  });
});
