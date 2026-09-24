import { Router } from 'express';
import { getReminders, markReminderRead, dismissReminder } from '../controllers/reminderController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

router.get('/', getReminders);
router.patch('/:id/read', markReminderRead);
router.patch('/:id/dismiss', dismissReminder);

export default router;
