import mongoose from 'mongoose';
import { ENV } from './env.js';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(ENV.MONGODB_URI);
    console.log(`[Database] Connected to MongoDB at: ${conn.connection.host || ENV.MONGODB_URI}`);
  } catch (err) {
    console.error(`[Database] MongoDB connection failed (${err.message}).`);
    process.exit(1);
  }
};

export const closeDB = async () => {
  await mongoose.connection.close();
};
