import { Router } from 'express';
import { ClientController } from '../controllers/clientController';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { UserRole } from '../types/enums';
import { runValidation } from '../middleware/validation';
import { uuidParamValidation, paginationValidation } from '../validators';

const router = Router();

// All routes require authentication and CLIENT role
router.use(authenticate);
router.use(requireRole(UserRole.CLIENT));

// Global search
router.get(
    '/search',
    ClientController.globalSearch
);

// Get all client's projects
router.get(
    '/projects',
    runValidation(paginationValidation),
    ClientController.getClientProjects
);

// Get detailed project view
router.get(
    '/projects/:id',
    runValidation(uuidParamValidation),
    ClientController.getProjectDetail
);

// Get project tasks (client-visible only)
router.get(
    '/projects/:id/tasks',
    runValidation([...uuidParamValidation, ...paginationValidation]),
    ClientController.getProjectTasks
);

// Get project milestones
router.get(
    '/projects/:id/milestones',
    runValidation(uuidParamValidation),
    ClientController.getProjectMilestones
);

// Get project activity feed
router.get(
    '/projects/:id/activity',
    runValidation(uuidParamValidation),
    ClientController.getProjectActivity
);

// Get project timeline
router.get(
    '/projects/:id/timeline',
    runValidation(uuidParamValidation),
    ClientController.getProjectTimeline
);

// Get pending actions (across all projects)
router.get(
    '/pending-actions',
    runValidation(paginationValidation),
    ClientController.getPendingActions
);

export default router;
