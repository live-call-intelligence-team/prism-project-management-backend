import { Router } from 'express';
import { portalSettingsController } from '../controllers/portalSettingsController';
import { authMiddleware } from '../middleware/auth';
import { roleMiddleware } from '../middleware/roleCheck';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Only admins can manage portal settings
router.use(roleMiddleware(['ADMIN']));

// Get portal settings
router.get('/', portalSettingsController.getSettings.bind(portalSettingsController));

// Update portal settings
router.put('/', portalSettingsController.updateSettings.bind(portalSettingsController));

export default router;
