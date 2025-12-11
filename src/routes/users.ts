import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { authenticate } from '../middleware/auth';
import { isAdmin, isAdminOrScrumMaster } from '../middleware/rbac';
import { updateUserValidation, uuidParamValidation, paginationValidation } from '../validators';
import { runValidation } from '../middleware/validation';
import { body } from 'express-validator';
import { UserRole } from '../types/enums';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Export users (admin only)
router.get(
    '/export',
    isAdmin,
    UserController.exportUsers
);

// Get all users (with pagination and filters)
router.get(
    '/',
    runValidation(paginationValidation),
    UserController.getAllUsers
);

// Get user by ID
router.get(
    '/:id',
    runValidation(uuidParamValidation),
    UserController.getUserById
);

// Bulk create users (admin only)
router.post(
    '/bulk',
    isAdmin,
    runValidation([
        body('users').isArray().withMessage('Users array is required'),
        body('users.*.email').isEmail().withMessage('Valid email is required'),
        body('users.*.firstName').notEmpty(),
        body('users.*.lastName').notEmpty(),
    ]),
    UserController.bulkCreate
);

// Bulk action (admin only)
router.post(
    '/bulk-action',
    isAdmin,
    runValidation([
        body('userIds').isArray().withMessage('User IDs array is required'),
        body('action').isIn(['ACTIVATE', 'DEACTIVATE', 'DELETE']),
    ]),
    UserController.bulkAction
);

// Create user (admin or scrum master only)
router.post(
    '/',
    isAdminOrScrumMaster,
    runValidation([
        body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
        body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
        body('firstName').trim().notEmpty().withMessage('First name is required'),
        body('lastName').trim().notEmpty().withMessage('Last name is required'),
        body('role').optional().isIn(Object.values(UserRole)),
        body('orgId').optional().isUUID(),
    ]),
    UserController.createUser
);

// Update user
router.put(
    '/:id',
    runValidation([...uuidParamValidation, ...updateUserValidation]),
    UserController.updateUser
);

// Delete user (admin only)
router.delete(
    '/:id',
    isAdmin,
    runValidation(uuidParamValidation),
    UserController.deleteUser
);

// Get user activity logs
router.get(
    '/:id/activity',
    runValidation([...uuidParamValidation, ...paginationValidation]),
    UserController.getUserActivity
);

// Change password
router.post(
    '/:id/change-password',
    runValidation([
        ...uuidParamValidation,
        body('currentPassword').optional().notEmpty(),
        body('newPassword').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    ]),
    UserController.changePassword
);

export default router;
