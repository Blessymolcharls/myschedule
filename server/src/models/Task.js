import mongoose from 'mongoose';

const subtaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  completed: { type: Boolean, default: false },
});

const taskSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
      index: true,
    },
    deadline: {
      type: Date,
      default: null,
      index: true,
    },
    estimatedDuration: {
      type: Number, // in minutes
      required: [true, 'Estimated duration is required'],
      min: 5,
    },
    completedDuration: {
      type: Number, // in minutes tracked so far
      default: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'scheduled', 'in_progress', 'completed', 'postponed', 'missed', 'cancelled'],
      default: 'pending',
      index: true,
    },
    preferredTimeOfDay: {
      type: String,
      enum: ['any', 'morning', 'afternoon', 'evening'],
      default: 'any',
    },
    recurrence: {
      isRecurring: { type: Boolean, default: false },
      pattern: { type: String, enum: ['none', 'daily', 'weekly', 'monthly'], default: 'none' },
      daysOfWeek: { type: [Number], default: [] }, // 0 (Sun) - 6 (Sat)
      until: { type: Date, default: null },
    },
    subtasks: [subtaskSchema],
    completedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export const Task = mongoose.model('Task', taskSchema);
