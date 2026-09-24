import { Router } from 'express';
import {
  startTimer,
  stopTimer,
  getActiveTimer,
  logManualTime,
  getTimeLogs,
} from '../controllers/timeLogController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

router.get('/', getTimeLogs);
router.get('/active', getActiveTimer);
router.post('/start', startTimer);
router.post('/stop/:id', stopTimer);
router.post('/manual', logManualTime);

export default router;
