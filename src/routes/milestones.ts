import { Router } from 'express';
import { MilestoneController } from '../controllers/milestoneController';
import { authenticate } from '../middleware/auth';
import { isAdmin, isAdminOrScrumMaster } from '../middleware/rbac';
import { runValidation } from '../middleware/validation';
import { uuidParamValidation } from '../validators';
import { body } from 'express-validator';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get milestones for a project
router.get(
    '/projects/:projectId/milestones',
    runValidation(uuidParamValidation),
    MilestoneController.getProjectMilestones
);

// Create milestone (admin/scrum only)
router.post(
    '/projects/:projectId/milestones',
    isAdminOrScrumMaster,
    runValidation([
        ...uuidParamValidation,
        body('name').isString().notEmpty().withMessage('Milestone name is required'),
        body('description').optional().isString(),
        body('dueDate').optional().isISO8601().withMessage('Valid date is required'),
        body('tasksTotal').optional().isInt({ min: 0 }),
    ]),
    MilestoneController.createMilestone
);

// Update milestone (admin/scrum only)
router.patch(
    '/milestones/:id',
    isAdminOrScrumMaster,
    runValidation([
        ...uuidParamValidation,
        body('name').optional().isString().notEmpty(),
        body('description').optional().isString(),
        body('dueDate').optional().isISO8601(),
        body('status').optional().isIn(['UPCOMING', 'IN_PROGRESS', 'COMPLETED', 'DELAYED']),
        body('tasksTotal').optional().isInt({ min: 0 }),
        body('tasksCompleted').optional().isInt({ min: 0 }),
    ]),
    MilestoneController.updateMilestone
);

// Delete milestone (admin only)
router.delete(
    '/milestones/:id',
    isAdmin,
    runValidation(uuidParamValidation),
    MilestoneController.deleteMilestone
);

export default router;
