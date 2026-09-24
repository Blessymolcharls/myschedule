import { AnalyticsService } from '../services/analyticsService.js';

export const getAnalytics = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days, 10) || 30;
    const analytics = await AnalyticsService.getProductivityAnalytics(req.user._id, days);
    res.json({ success: true, analytics });
  } catch (err) {
    next(err);
  }
};
