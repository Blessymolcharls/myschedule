import { Router } from 'express';
import { updateProfile, getPreferences, updatePreferences } from '../controllers/userController.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { userPreferencesSchema } from '../validators/schemas.js';

const router = Router();
router.use(requireAuth);

router.put('/profile', updateProfile);
router.get('/preferences', getPreferences);
router.put('/preferences', validate(userPreferencesSchema), updatePreferences);

export default router;
