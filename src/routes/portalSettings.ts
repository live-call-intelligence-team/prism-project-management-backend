import { Router } from 'express';
import { portalSettingsController } from '../controllers/portalSettingsController';
import { authenticate as authMiddleware } from '../middleware/auth';
import { requireRole as roleMiddleware } from '../middleware/rbac';

import { UserRole } from '../types/enums';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Only admins can manage portal settings
router.use(roleMiddleware(UserRole.ADMIN));

// Get portal settings
router.get('/', portalSettingsController.getSettings.bind(portalSettingsController));

// Update portal settings
router.put('/', portalSettingsController.updateSettings.bind(portalSettingsController));

export default router;
