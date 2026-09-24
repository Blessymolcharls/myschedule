import { SchedulingEngine } from '../src/services/schedulingEngine.js';

describe('SchedulingEngine', () => {
  test('should calculate higher priority scores for urgent tasks with impending deadlines', () => {
    const now = new Date('2026-09-25T09:00:00Z');

    const lowTask = {
      title: 'Read Article',
      priority: 'low',
      estimatedDuration: 60,
      deadline: null,
    };

    const urgentTask = {
      title: 'Submit Assignment',
      priority: 'urgent',
      estimatedDuration: 90,
      deadline: new Date('2026-09-25T17:00:00Z'), // 8 hours away
    };

    const scoreLow = SchedulingEngine.calculateTaskScore(lowTask, now);
    const scoreUrgent = SchedulingEngine.calculateTaskScore(urgentTask, now);

    expect(scoreUrgent).toBeGreaterThan(scoreLow);
  });

  test('should allocate tasks without overlapping and respect working hours', () => {
    const baseDate = new Date('2026-09-25T00:00:00Z'); // Friday
    const tasks = [
      { id: 't1', title: 'Data Structures Practice', priority: 'high', estimatedDuration: 120, status: 'pending' },
      { id: 't2', title: 'Fix Auth Bug', priority: 'urgent', estimatedDuration: 60, status: 'pending' },
    ];

    const fixedCommitments = [
      {
        id: 'c1',
        title: 'Daily Standup',
        startTime: new Date('2026-09-25T10:00:00Z'),
        endTime: new Date('2026-09-25T10:30:00Z'),
        isRecurring: false,
      },
    ];

    const preferences = {
      workingHoursStart: '09:00',
      workingHoursEnd: '18:00',
      weeklyRestDays: [0], // Sunday
      bufferMinutesBetweenTasks: 10,
      maxTaskChunkMinutes: 120,
    };

    const result = SchedulingEngine.generateSchedule({
      tasks,
      fixedCommitments,
      lockedEvents: [],
      preferences,
      startDate: baseDate,
      daysAhead: 3,
    });

    expect(result.success).toBe(true);
    expect(result.scheduleEvents.length).toBeGreaterThanOrEqual(2);
    expect(result.integrityCheck.isValid).toBe(true);

    // Urgent task should be scheduled before or with higher priority
    const scheduledTaskIds = result.scheduleEvents.map((e) => e.taskId);
    expect(scheduledTaskIds).toContain('t2');
  });
});
