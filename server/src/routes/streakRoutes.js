import { Router } from 'express';
import {
  getStreakSummary,
  evaluateDailyStreak,
  applyStreakFreeze,
  recoverStreak,
  getAdherenceHistory,
} from '../controllers/streakController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

router.get('/summary', getStreakSummary);
router.get('/adherence-history', getAdherenceHistory);
router.post('/evaluate-day', evaluateDailyStreak);
router.post('/freeze', applyStreakFreeze);
router.post('/recover', recoverStreak);

export default router;
