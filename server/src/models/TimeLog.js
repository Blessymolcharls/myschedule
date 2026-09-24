import mongoose from 'mongoose';

const timeLogSchema = new mongoose.Schema(
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
      required: true,
      index: true,
    },
    scheduleEventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ScheduleEvent',
      default: null,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      default: null, // null when actively tracking
    },
    durationMinutes: {
      type: Number,
      default: 0,
    },
    isLiveSession: {
      type: Boolean,
      default: false,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

export const TimeLog = mongoose.model('TimeLog', timeLogSchema);
