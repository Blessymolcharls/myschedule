import { Router } from 'express';
import {
  getCommitments,
  createCommitment,
  updateCommitment,
  deleteCommitment,
} from '../controllers/commitmentController.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { commitmentCreateSchema } from '../validators/schemas.js';

const router = Router();
router.use(requireAuth);

router.get('/', getCommitments);
router.post('/', validate(commitmentCreateSchema), createCommitment);
router.put('/:id', updateCommitment);
router.delete('/:id', deleteCommitment);

export default router;
