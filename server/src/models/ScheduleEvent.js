import mongoose from 'mongoose';

const scheduleEventSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      default: null,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
      index: true,
    },
    endTime: {
      type: Date,
      required: true,
      index: true,
    },
    eventType: {
      type: String,
      enum: ['task', 'break', 'fixed_commitment', 'buffer'],
      default: 'task',
    },
    status: {
      type: String,
      enum: ['scheduled', 'in_progress', 'completed', 'missed', 'rescheduled', 'cancelled'],
      default: 'scheduled',
      index: true,
    },
    isLocked: {
      type: Boolean,
      default: false, // If locked, auto-scheduler won't move it
    },
    allocatedMinutes: {
      type: Number,
      required: true,
    },
    completedMinutes: {
      type: Number,
      default: 0,
    },
    chunkIndex: {
      type: Number,
      default: 1, // If task is split into multiple sessions
    },
    totalChunks: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true }
);

export const ScheduleEvent = mongoose.model('ScheduleEvent', scheduleEventSchema);
