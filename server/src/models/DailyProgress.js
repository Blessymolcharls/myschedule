import mongoose from 'mongoose';

const dailyProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    dateString: {
      type: String, // 'YYYY-MM-DD' formatted for clean indexing & timezone independence
      required: true,
      index: true,
    },
    plannedMinutes: {
      type: Number,
      default: 0,
    },
    completedMinutes: {
      type: Number,
      default: 0,
    },
    adherencePercentage: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['completed', 'partial', 'missed', 'rest', 'protected'],
      default: 'missed',
    },
    qualifiesForStreak: {
      type: Boolean,
      default: false,
    },
    tasksCompletedCount: {
      type: Number,
      default: 0,
    },
    tasksPlannedCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

dailyProgressSchema.index({ userId: 1, dateString: 1 }, { unique: true });

export const DailyProgress = mongoose.model('DailyProgress', dailyProgressSchema);
