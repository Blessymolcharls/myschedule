import { Router } from 'express';
import {
  getScheduleEvents,
  runAutoSchedule,
  updateScheduleEvent,
  checkConflict,
  deleteScheduleEvent,
} from '../controllers/scheduleController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

router.get('/events', getScheduleEvents);
router.post('/auto-generate', runAutoSchedule);
router.post('/check-conflict', checkConflict);
router.put('/events/:id', updateScheduleEvent);
router.delete('/events/:id', deleteScheduleEvent);

export default router;
