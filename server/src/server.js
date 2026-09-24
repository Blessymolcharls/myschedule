import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { ENV } from './config/env.js';
import { connectDB } from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import commitmentRoutes from './routes/commitmentRoutes.js';
import scheduleRoutes from './routes/scheduleRoutes.js';
import timeLogRoutes from './routes/timeLogRoutes.js';
import streakRoutes from './routes/streakRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import reminderRoutes from './routes/reminderRoutes.js';

const app = express();

// Middlewares
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());
if (ENV.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'MySchedule Intelligent Engine',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/commitments', commitmentRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use('/api/time-logs', timeLogRoutes);
app.use('/api/streaks', streakRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/reminders', reminderRoutes);

// Global Error Handler
app.use(errorHandler);

export { app };

// Start Server if not in test
if (process.env.NODE_ENV !== 'test') {
  connectDB().then(() => {
    app.listen(ENV.PORT, () => {
      console.log(`[MySchedule API] Server running on port ${ENV.PORT} (${ENV.NODE_ENV})`);
    });
  });
}
