import { Router } from 'express';
import {
  getTasks,
  createTask,
  getTaskById,
  updateTask,
  completeTask,
  deleteTask,
} from '../controllers/taskController.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { taskCreateSchema } from '../validators/schemas.js';

const router = Router();
router.use(requireAuth);

router.get('/', getTasks);
router.post('/', validate(taskCreateSchema), createTask);
router.get('/:id', getTaskById);
router.put('/:id', updateTask);
router.patch('/:id/complete', completeTask);
router.delete('/:id', deleteTask);

export default router;
