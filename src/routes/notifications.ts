import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { NotificationController } from '../controllers/notificationController';
import { paginationValidation } from '../validators';
import { runValidation } from '../middleware/validation';

const router = Router();

router.use(authenticate);

// Get my notifications
router.get(
    '/',
    paginationValidation,
    runValidation,
    NotificationController.getMyNotifications
);

// Mark as read (specific ID or 'all')
router.put(
    '/:id/read',
    NotificationController.markAsRead
);

export default router;
