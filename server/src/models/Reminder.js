import mongoose from 'mongoose';

const reminderSchema = new mongoose.Schema(
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
    },
    scheduleEventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ScheduleEvent',
      default: null,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      default: '',
    },
    triggerTime: {
      type: Date,
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['task_start', 'deadline_approaching', 'streak_alert', 'break_start', 'custom'],
      default: 'task_start',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    isDismissed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const Reminder = mongoose.model('Reminder', reminderSchema);
