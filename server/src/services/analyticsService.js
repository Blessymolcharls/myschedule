import { Task } from '../models/Task.js';
import { TimeLog } from '../models/TimeLog.js';
import { ScheduleEvent } from '../models/ScheduleEvent.js';
import { DailyProgress } from '../models/DailyProgress.js';
import { Category } from '../models/Category.js';

export class AnalyticsService {
  /**
   * Comprehensive analytics dashboard metrics.
   */
  static async getProductivityAnalytics(userId, days = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    const cutoffStr = cutoffDate.toISOString().split('T')[0];

    // 1. Daily Progress & Adherence Trends
    const progressHistory = await DailyProgress.find({
      userId,
      dateString: { $gte: cutoffStr },
    }).sort({ dateString: 1 });

    const totalPlannedMinutes = progressHistory.reduce((acc, p) => acc + p.plannedMinutes, 0);
    const totalCompletedMinutes = progressHistory.reduce((acc, p) => acc + p.completedMinutes, 0);
    const averageAdherence =
      progressHistory.length > 0
        ? Math.round(progressHistory.reduce((acc, p) => acc + p.adherencePercentage, 0) / progressHistory.length)
        : 0;

    // 2. Task Completion & Planned vs Actual Analysis
    const tasks = await Task.find({
      userId,
      createdAt: { $gte: cutoffDate },
    }).populate('categoryId');

    const completedTasks = tasks.filter((t) => t.status === 'completed');
    const pendingTasks = tasks.filter((t) => t.status !== 'completed' && t.status !== 'cancelled');
    const missedOrOverdueTasks = tasks.filter((t) => {
      if (t.status === 'completed') return false;
      return t.deadline && new Date(t.deadline) < new Date();
    });

    let totalEstimatedForCompleted = 0;
    let totalActualForCompleted = 0;
    const taskEstimationVariances = [];

    for (const t of completedTasks) {
      totalEstimatedForCompleted += t.estimatedDuration || 0;
      totalActualForCompleted += t.completedDuration || 0;
      const diff = (t.completedDuration || 0) - (t.estimatedDuration || 0);
      taskEstimationVariances.push({
        title: t.title,
        estimated: t.estimatedDuration,
        actual: t.completedDuration,
        diffMinutes: diff,
        accuracyPercent: t.estimatedDuration > 0 ? Math.round((t.estimatedDuration / Math.max(t.completedDuration, 1)) * 100) : 100,
      });
    }

    const estimationAccuracy =
      totalEstimatedForCompleted > 0
        ? Math.min(100, Math.round((Math.min(totalEstimatedForCompleted, totalActualForCompleted) / Math.max(totalEstimatedForCompleted, totalActualForCompleted)) * 100))
        : 100;

    // 3. Category Breakdown
    const categories = await Category.find({ userId });
    const categoryMap = new Map();
    categories.forEach((c) => {
      categoryMap.set(c._id.toString(), { name: c.name, color: c.color, totalMinutes: 0, taskCount: 0 });
    });
    categoryMap.set('uncategorized', { name: 'General', color: '#94a3b8', totalMinutes: 0, taskCount: 0 });

    for (const t of tasks) {
      const catKey = t.categoryId ? t.categoryId._id?.toString() || t.categoryId.toString() : 'uncategorized';
      const catObj = categoryMap.get(catKey) || categoryMap.get('uncategorized');
      catObj.totalMinutes += t.completedDuration || 0;
      catObj.taskCount += 1;
    }

    const categoryBreakdown = Array.from(categoryMap.values()).filter((c) => c.taskCount > 0 || c.totalMinutes > 0);

    // 4. Priority Distribution
    const priorityStats = {
      urgent: { total: 0, completed: 0 },
      high: { total: 0, completed: 0 },
      medium: { total: 0, completed: 0 },
      low: { total: 0, completed: 0 },
    };

    tasks.forEach((t) => {
      if (priorityStats[t.priority]) {
        priorityStats[t.priority].total += 1;
        if (t.status === 'completed') {
          priorityStats[t.priority].completed += 1;
        }
      }
    });

    // 5. Adaptive Insights
    const insights = [];
    if (totalActualForCompleted > totalEstimatedForCompleted * 1.2 && totalEstimatedForCompleted > 0) {
      insights.push({
        type: 'warning',
        title: 'Task Duration Underestimation',
        message: `Tasks take ~${Math.round((totalActualForCompleted / totalEstimatedForCompleted - 1) * 100)}% longer than estimated. We recommend adding 15-20 min buffers to future estimations.`,
      });
    } else if (estimationAccuracy >= 85) {
      insights.push({
        type: 'success',
        title: 'High Estimation Accuracy',
        message: 'Your time estimations closely match real execution! The auto-scheduler will achieve peak precision.',
      });
    }

    if (averageAdherence >= 80) {
      insights.push({
        type: 'success',
        title: 'Consistent Execution',
        message: `Your schedule adherence is strong at ${averageAdherence}%. Keep this pace to maintain high consistency streaks.`,
      });
    } else if (averageAdherence < 60 && progressHistory.length > 3) {
      insights.push({
        type: 'info',
        title: 'Workload Adjustment Recommended',
        message: 'Adherence is below 60%. Consider scheduling fewer tasks per day or expanding working hours.',
      });
    }

    return {
      summary: {
        totalTasks: tasks.length,
        completedCount: completedTasks.length,
        pendingCount: pendingTasks.length,
        missedOrOverdueCount: missedOrOverdueTasks.length,
        completionRate: tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0,
        totalPlannedHours: Math.round((totalPlannedMinutes / 60) * 10) / 10,
        totalActualHours: Math.round((totalCompletedMinutes / 60) * 10) / 10,
        averageAdherence,
        estimationAccuracy,
      },
      adherenceTrend: progressHistory.map((p) => ({
        date: p.dateString,
        adherence: p.adherencePercentage,
        planned: Math.round(p.plannedMinutes / 60 * 10) / 10,
        actual: Math.round(p.completedMinutes / 60 * 10) / 10,
        status: p.status,
      })),
      categoryBreakdown,
      priorityStats,
      taskEstimationVariances: taskEstimationVariances.slice(0, 10),
      insights,
    };
  }
}
