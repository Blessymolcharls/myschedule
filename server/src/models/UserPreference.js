import mongoose from 'mongoose';

const userPreferenceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    // Working hours (e.g. 09:00 to 18:00)
    workingHoursStart: {
      type: String,
      default: '09:00', // HH:mm format
    },
    workingHoursEnd: {
      type: String,
      default: '18:00',
    },
    // Sleep period (e.g. 23:00 to 07:00)
    sleepStart: {
      type: String,
      default: '23:00',
    },
    sleepEnd: {
      type: String,
      default: '07:00',
    },
    // Break preferences
    breakDurationMinutes: {
      type: Number,
      default: 15,
    },
    workIntervalMinutes: {
      type: Number,
      default: 90, // Break after every 90 mins of work
    },
    bufferMinutesBetweenTasks: {
      type: Number,
      default: 10,
    },
    maxTaskChunkMinutes: {
      type: Number,
      default: 120, // Split tasks into max 2h chunks if longer
    },
    // Streak & adherence
    minAdherencePercentForStreak: {
      type: Number,
      default: 70, // 70% of planned work completed to count as streak day
    },
    availableStreakProtections: {
      type: Number,
      default: 2, // 2 freezes allowed per month
    },
    weeklyRestDays: {
      type: [Number], // 0 = Sun, 6 = Sat
      default: [0], // Sunday as default rest day
    },
  },
  { timestamps: true }
);

export const UserPreference = mongoose.model('UserPreference', userPreferenceSchema);
