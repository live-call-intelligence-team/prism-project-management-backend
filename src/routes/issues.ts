import { Router } from 'express';
import { IssueController } from '../controllers/issueController';
import { authenticate } from '../middleware/auth';
import { createIssueValidation, updateIssueValidation, createCommentValidation, createWorkLogValidation, uuidParamValidation, paginationValidation, issueIdParamValidation } from '../validators';
import { runValidation } from '../middleware/validation';
import upload from '../middleware/upload';
import { AttachmentController } from '../controllers/attachmentController';
import { body } from 'express-validator';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get issues assigned to current user
router.get(
    '/my-issues',
    runValidation(paginationValidation),
    IssueController.getMyIssues
);

// Get hierarchy
router.get(
    '/hierarchy/:projectId',
    runValidation(paginationValidation), // Validate project ID?
    IssueController.getHierarchy
);

// Get issue children
router.get(
    '/:id/children',
    runValidation(uuidParamValidation),
    IssueController.getChildren
);

// Create Story
router.post(
    '/create-story',
    IssueController.createStory
);

// Create Subtask
router.post(
    '/create-subtask',
    IssueController.createSubtask
);

// Move issue to sprint
router.put(
    '/:id/move-to-sprint',
    IssueController.moveIssueToSprint
);

// Close Epic
router.put(
    '/:epicId/close',
    IssueController.closeEpic
);

// Get all issues (with filters)
router.get(
    '/',
    runValidation(paginationValidation),
    IssueController.getAllIssues
);

// Get backlog issues for a project
router.get(
    '/project/:projectId/backlog',
    runValidation(paginationValidation),
    IssueController.getBacklog
);

// Get issue by ID
router.get(
    '/:id',
    runValidation(uuidParamValidation),
    IssueController.getIssueById
);

// Create issue
router.post(
    '/',
    runValidation(createIssueValidation),
    IssueController.createIssue
);



// Assign issues to sprint
router.post(
    '/assign-sprint',
    IssueController.assignSprint
);

// Update issue status
router.put(
    '/:id/status',
    IssueController.updateStatus
);

// Client approval endpoint (for clients to approve/reject tasks)
router.patch(
    '/:id/client-approval',
    runValidation([
        ...uuidParamValidation,
        body('status').isIn(['APPROVED', 'CHANGES_REQUESTED', 'REJECTED']).withMessage('Invalid approval status'),
        body('feedback').optional().isString(),
    ]),
    IssueController.clientApproval
);

// Update issue
router.put(
    '/:id',
    runValidation([...uuidParamValidation, ...updateIssueValidation]),
    IssueController.updateIssue
);

// Delete issue
router.delete(
    '/:id',
    runValidation(uuidParamValidation),
    IssueController.deleteIssue
);

// Get comments for issue
router.get(
    '/:issueId/comments',
    runValidation(issueIdParamValidation),
    IssueController.getComments
);

// Add comment to issue
router.post(
    '/:issueId/comments',
    runValidation(createCommentValidation),
    IssueController.addComment
);

// Add work log to issue
router.post(
    '/:issueId/worklog',
    runValidation(createWorkLogValidation),
    IssueController.addWorkLog
);

// Issue Linking
router.post(
    '/:id/links',
    runValidation(uuidParamValidation),
    IssueController.addLink
);

router.delete(
    '/:id/links/:linkId',
    runValidation(uuidParamValidation), // Validate id and linkId
    IssueController.removeLink
);

// Issue History
router.get(
    '/:id/history',
    runValidation(uuidParamValidation),
    IssueController.getHistory
);

// Upload attachment (Using multer middleware)
router.post(
    '/:issueId/attachments',
    upload.single('file'),
    AttachmentController.uploadAttachment
);

router.delete(
    '/attachments/:id',
    AttachmentController.deleteAttachment
);

export default router;
