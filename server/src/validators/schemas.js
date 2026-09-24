import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must have at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    timezone: z.string().optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const taskCreateSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Task title is required'),
    description: z.string().optional(),
    categoryId: z.string().optional().nullable(),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
    deadline: z.string().datetime().optional().nullable().or(z.date().optional()),
    estimatedDuration: z.number().min(5, 'Estimated duration must be at least 5 minutes'),
    preferredTimeOfDay: z.enum(['any', 'morning', 'afternoon', 'evening']).optional(),
    recurrence: z
      .object({
        isRecurring: z.boolean().optional(),
        pattern: z.enum(['none', 'daily', 'weekly', 'monthly']).optional(),
        daysOfWeek: z.array(z.number()).optional(),
        until: z.string().optional().nullable(),
      })
      .optional(),
  }),
});

export const commitmentCreateSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    startTime: z.string().datetime().or(z.date()),
    endTime: z.string().datetime().or(z.date()),
    isRecurring: z.boolean().optional(),
    recurrencePattern: z.enum(['none', 'daily', 'weekly', 'weekdays', 'monthly']).optional(),
    daysOfWeek: z.array(z.number()).optional(),
    color: z.string().optional(),
  }),
});

export const userPreferencesSchema = z.object({
  body: z.object({
    workingHoursStart: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:mm)').optional(),
    workingHoursEnd: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:mm)').optional(),
    sleepStart: z.string().optional(),
    sleepEnd: z.string().optional(),
    breakDurationMinutes: z.number().min(0).max(120).optional(),
    workIntervalMinutes: z.number().min(15).max(300).optional(),
    bufferMinutesBetweenTasks: z.number().min(0).max(60).optional(),
    maxTaskChunkMinutes: z.number().min(30).max(480).optional(),
    minAdherencePercentForStreak: z.number().min(10).max(100).optional(),
    weeklyRestDays: z.array(z.number()).optional(),
  }),
});
