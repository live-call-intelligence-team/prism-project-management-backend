import { Router } from 'express';
import { AuditLogController } from '../controllers/auditLogController';
import { authenticate } from '../middleware/auth';
import { isAdmin } from '../middleware/rbac';
import { runValidation } from '../middleware/validation';
import { query } from 'express-validator';

const router = Router();

// Protect all routes
router.use(authenticate, isAdmin);

// Get audit logs
router.get(
    '/',
    runValidation([
        query('page').optional().isInt({ min: 1 }),
        query('limit').optional().isInt({ min: 1, max: 100 }),
        query('startDate').optional().isISO8601(),
        query('endDate').optional().isISO8601(),
    ]),
    AuditLogController.getLogs
);

// Get statistics
router.get('/stats', AuditLogController.getStats);

export default router;
