import { Router } from 'express';
import { ProjectController } from '../controllers/projectController';
import { AttachmentController } from '../controllers/attachmentController';
import { FileController } from '../controllers/fileController';
import { authenticate } from '../middleware/auth';
import upload from '../middleware/upload';
import { isAdmin, isAdminOrScrumMaster } from '../middleware/rbac';
import { createProjectValidation, updateProjectValidation, uuidParamValidation, paginationValidation } from '../validators';
import { runValidation } from '../middleware/validation';
import { body } from 'express-validator';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get all projects
router.get(
    '/',
    runValidation(paginationValidation),
    ProjectController.getAllProjects
);

// Get client specific projects
router.get(
    '/client',
    runValidation(paginationValidation),
    ProjectController.getClientProjects
);

// Get project by ID
router.get(
    '/:id',
    runValidation(uuidParamValidation),
    ProjectController.getProjectById
);

// Create project (admin or scrum master only)
router.post(
    '/',
    isAdminOrScrumMaster,
    runValidation(createProjectValidation),
    ProjectController.createProject
);

// Update project
router.put(
    '/:id',
    isAdminOrScrumMaster,
    runValidation([...uuidParamValidation, ...updateProjectValidation]),
    ProjectController.updateProject
);

// Delete project (admin only)
router.delete(
    '/:id',
    isAdmin,
    runValidation(uuidParamValidation),
    ProjectController.deleteProject
);

// Get project members
router.get(
    '/:id/members',
    runValidation(uuidParamValidation),
    ProjectController.getProjectMembers
);

// Add project member
router.post(
    '/:id/members',
    isAdminOrScrumMaster,
    runValidation([
        ...uuidParamValidation,
        body('userId').isUUID().withMessage('Valid user ID is required'),
        body('role').optional().isString(),
    ]),
    ProjectController.addProjectMember
);

// Remove project member
router.delete(
    '/:id/members/:userId',
    isAdminOrScrumMaster,
    runValidation([
        ...uuidParamValidation,
        body('userId').isUUID().withMessage('Valid user ID is required'),
    ]),
    ProjectController.removeProjectMember
);

// Get project issues
router.get(
    '/:id/issues',
    runValidation([...uuidParamValidation, ...paginationValidation]),
    ProjectController.getProjectIssues
);

// Upload attachment to project
router.post(
    '/:id/attachments',
    runValidation(uuidParamValidation),
    (req, _res, next) => {
        // Inject params into body for controller
        req.body.projectId = req.params.id;
        next();
    },
    upload.single('file'),
    AttachmentController.uploadAttachment
);

// File Management Routes (Project-level files)
// Get all files for a project
router.get(
    '/:projectId/files',
    runValidation([...uuidParamValidation, ...paginationValidation]),
    FileController.getProjectFiles
);

// Upload file to project (clients can upload)
router.post(
    '/:projectId/files',
    runValidation(uuidParamValidation),
    upload.single('file'),
    FileController.uploadProjectFile
);

// Download file
router.get(
    '/:projectId/files/:fileId/download',
    runValidation(uuidParamValidation),
    FileController.downloadFile
);

// Delete file
router.delete(
    '/:projectId/files/:fileId',
    runValidation(uuidParamValidation),
    FileController.deleteProjectFile
);

export default router;
