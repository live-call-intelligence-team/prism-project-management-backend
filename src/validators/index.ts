import { body, param, query } from 'express-validator';
import { UserRole, IssueType, IssueStatus, IssuePriority, SprintStatus } from '../types/enums';

// User validation
export const registerValidation = [
    body('email').trim().isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('firstName').trim().notEmpty().withMessage('First name is required'),
    body('lastName').trim().notEmpty().withMessage('Last name is required'),
    body('orgId').optional().isUUID().withMessage('Invalid organization ID'),
];

export const loginValidation = [
    // Email is technically optional if username is provided, but we'll let controller handle "one of" requirement
    body('email').optional().trim().isEmail().normalizeEmail(),
    body('username').optional().trim(),
    body('password').notEmpty().withMessage('Password is required'),
];

export const updateUserValidation = [
    body('firstName').optional().trim().notEmpty(),
    body('lastName').optional().trim().notEmpty(),
    body('role').optional().isIn(Object.values(UserRole)),
    body('isActive').optional().isBoolean(),
];

// Project validation
export const createProjectValidation = [
    body('name').trim().notEmpty().withMessage('Project name is required'),
    body('key')
        .trim()
        .notEmpty()
        .isLength({ min: 2, max: 10 })
        .isUppercase()
        .withMessage('Project key must be 2-10 uppercase characters'),
    body('description').optional().trim(),
    body('leadId').optional().isUUID().withMessage('Valid lead ID is required'),
    body('visibility').optional().isIn(['PUBLIC', 'PRIVATE', 'RESTRICTED']),
];

export const updateProjectValidation = [
    body('name').optional().trim().notEmpty(),
    body('description').optional().trim(),
    body('leadId').optional().isUUID(),
    body('status').optional().isIn(['ACTIVE', 'ARCHIVED', 'ON_HOLD', 'COMPLETED']),
    body('visibility').optional().isIn(['PUBLIC', 'PRIVATE', 'RESTRICTED']),
];

// Issue validation
export const createIssueValidation = [
    body('projectId').isUUID().withMessage('Valid project ID is required'),
    body('title').trim().notEmpty().withMessage('Issue title is required'),
    body('description').optional().trim(),
    body('type').isIn(Object.values(IssueType)).withMessage('Invalid issue type'),
    body('priority').optional().isIn(Object.values(IssuePriority)),
    body('assigneeId').optional().isUUID(),
    body('sprintId').optional().isUUID(),
    body('storyPoints').optional().isInt({ min: 0 }),
    body('estimatedHours').optional().isFloat({ min: 0 }),
    body('fixVersion').optional().trim(),
];

export const updateIssueValidation = [
    body('title').optional().trim().notEmpty(),
    body('description').optional().trim(),
    body('type').optional().isIn(Object.values(IssueType)),
    body('status').optional().isIn(Object.values(IssueStatus)),
    body('priority').optional().isIn(Object.values(IssuePriority)),
    body('assigneeId').optional().isUUID(),
    body('sprintId').optional().isUUID(),
    body('storyPoints').optional().isInt({ min: 0 }),
    body('estimatedHours').optional().isFloat({ min: 0 }),
    body('fixVersion').optional().trim(),
];

// Sprint validation
export const createSprintValidation = [
    body('projectId').isUUID().withMessage('Valid project ID is required'),
    body('name').trim().notEmpty().withMessage('Sprint name is required'),
    body('goal').optional().trim(),
    body('startDate').isISO8601().withMessage('Valid start date is required'),
    body('endDate').isISO8601().withMessage('Valid end date is required'),
    body('capacity').optional().isInt({ min: 0 }),
];

export const updateSprintValidation = [
    body('name').optional().trim().notEmpty(),
    body('goal').optional().trim(),
    body('startDate').optional().isISO8601(),
    body('endDate').optional().isISO8601(),
    body('status').optional().isIn(Object.values(SprintStatus)),
    body('capacity').optional().isInt({ min: 0 }),
];

// Comment validation
export const createCommentValidation = [
    param('issueId').isUUID().withMessage('Valid issue ID is required'),
    body('content').trim().notEmpty().withMessage('Comment content is required'),
    body('isClientVisible').optional().isBoolean(),
];

// WorkLog validation
export const createWorkLogValidation = [
    param('issueId').isUUID().withMessage('Valid issue ID is required'),
    body('timeSpent').isFloat({ min: 0 }).withMessage('Valid time spent is required'),
    body('date').isISO8601().withMessage('Valid date is required'),
    body('description').optional().trim(),
];

// Pagination validation
export const paginationValidation = [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('sortBy').optional().trim(),
    query('sortOrder').optional().isIn(['ASC', 'DESC']),
];

// UUID param validation
export const uuidParamValidation = [
    param('id').isUUID().withMessage('Invalid ID format'),
];

export const projectIdParamValidation = [
    param('projectId').isUUID().withMessage('Invalid Project ID format'),
];

export const sprintIdParamValidation = [
    param('sprintId').isUUID().withMessage('Invalid Sprint ID format'),
];

export const issueIdParamValidation = [
    param('issueId').isUUID().withMessage('Invalid Issue ID format'),
];
