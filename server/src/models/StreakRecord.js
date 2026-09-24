import mongoose from 'mongoose';

const streakRecordSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    currentStreak: {
      type: Number,
      default: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
    },
    lastCalculatedDate: {
      type: String, // 'YYYY-MM-DD'
      default: null,
    },
    totalSuccessfulDays: {
      type: Number,
      default: 0,
    },
    totalRestDays: {
      type: Number,
      default: 0,
    },
    totalProtectedDays: {
      type: Number,
      default: 0,
    },
    streakHistory: [
      {
        dateString: String,
        action: { type: String, enum: ['increment', 'freeze', 'reset', 'rest', 'recover'] },
        streakCount: Number,
        adherencePercentage: Number,
        note: String,
      },
    ],
  },
  { timestamps: true }
);

export const StreakRecord = mongoose.model('StreakRecord', streakRecordSchema);
