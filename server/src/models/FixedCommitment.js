import mongoose from 'mongoose';

const fixedCommitmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Commitment title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurrencePattern: {
      type: String,
      enum: ['none', 'daily', 'weekly', 'weekdays', 'monthly'],
      default: 'none',
    },
    daysOfWeek: {
      type: [Number], // 0-6
      default: [],
    },
    color: {
      type: String,
      default: '#ef4444', // Red default for immovable fixed commitments
    },
    location: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

export const FixedCommitment = mongoose.model('FixedCommitment', fixedCommitmentSchema);
