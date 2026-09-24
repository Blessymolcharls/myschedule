import { StreakService } from '../services/streakService.js';
import { AdherenceService } from '../services/adherenceService.js';

export const getStreakSummary = async (req, res, next) => {
  try {
    const summary = await StreakService.getStreakSummary(req.user._id);
    res.json({ success: true, summary });
  } catch (err) {
    next(err);
  }
};

export const evaluateDailyStreak = async (req, res, next) => {
  try {
    const { dateString } = req.body;
    const targetDate = dateString || new Date().toISOString().split('T')[0];
    const result = await StreakService.processDayStreak(req.user._id, targetDate);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

export const applyStreakFreeze = async (req, res, next) => {
  try {
    const { dateString } = req.body;
    const targetDate = dateString || new Date().toISOString().split('T')[0];
    const result = await StreakService.applyStreakProtection(req.user._id, targetDate);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

export const recoverStreak = async (req, res, next) => {
  try {
    const result = await StreakService.attemptStreakRecovery(req.user._id);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

export const getAdherenceHistory = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const now = new Date();
    const defaultStart = new Date(now.setDate(now.getDate() - 30)).toISOString().split('T')[0];
    const defaultEnd = new Date().toISOString().split('T')[0];

    const history = await AdherenceService.getAdherenceHistory(
      req.user._id,
      startDate || defaultStart,
      endDate || defaultEnd
    );

    res.json({ success: true, history });
  } catch (err) {
    next(err);
  }
};
