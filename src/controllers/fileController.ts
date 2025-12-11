import { Response } from 'express';
import { AuthRequest } from '../types/interfaces';
import { Attachment, Project, User } from '../models';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { UserRole } from '../types/enums';
import { FileService } from '../services/fileService';
import { getOffset, getPaginationMeta } from '../utils/helpers';

export class FileController {
    // Get all files for a project
    static getProjectFiles = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
        const { projectId } = req.params;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 50;

        const project = await Project.findByPk(projectId);
        if (!project) {
            throw new AppError('Project not found', 404);
        }

        // Check access
        if (req.user?.role === UserRole.CLIENT) {
            if (project.clientId !== req.user.id) {
                throw new AppError('Access denied', 403);
            }
        } else if (req.user?.role !== UserRole.ADMIN && project.orgId !== req.user?.orgId) {
            throw new AppError('Access denied', 403);
        }

        const { count, rows } = await Attachment.findAndCountAll({
            where: {
                projectId,
                issueId: null, // Project-level files only
            },
            limit,
            offset: getOffset(page, limit),
            order: [['createdAt', 'DESC']],
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'firstName', 'lastName', 'email'],
                }
            ],
        });

        res.json({
            success: true,
            data: {
                files: rows,
                pagination: getPaginationMeta(page, limit, count),
            },
        });
    });

    // Upload file to project
    static uploadProjectFile = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
        const { projectId } = req.params;
        const file = req.file;

        if (!file) {
            throw new AppError('No file provided', 400);
        }

        const project = await Project.findByPk(projectId);
        if (!project) {
            throw new AppError('Project not found', 404);
        }

        // Check access - clients can upload to their projects
        if (req.user?.role === UserRole.CLIENT) {
            if (project.clientId !== req.user.id) {
                throw new AppError('Access denied', 403);
            }
        } else if (req.user?.role !== UserRole.ADMIN && project.orgId !== req.user?.orgId) {
            throw new AppError('Access denied', 403);
        }

        // Process and save file
        const fileData = FileService.processUploadedFile(file);

        const attachment = await Attachment.create({
            projectId,
            issueId: null, // Project-level file
            userId: req.user!.id,
            filename: fileData.filename,
            originalName: fileData.originalName,
            mimetype: fileData.mimetype,
            size: fileData.size,
            fileUrl: fileData.url,
        });

        // Load user info
        const attachmentWithUser = await Attachment.findByPk(attachment.id, {
            include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'firstName', 'lastName'],
            }]
        });

        res.status(201).json({
            success: true,
            message: 'File uploaded successfully',
            data: { file: attachmentWithUser },
        });
    });

    // Delete file from project
    static deleteProjectFile = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
        const { projectId, fileId } = req.params;

        const attachment = await Attachment.findOne({
            where: {
                id: fileId,
                projectId,
                issueId: null,
            },
            include: [{
                model: Project,
                as: 'project',
            }]
        });

        if (!attachment) {
            throw new AppError('File not found', 404);
        }

        const project = attachment.get('project') as any;

        // Check permissions
        // Clients can only delete their own uploads
        // Team members can delete any project file (if admin or in org)
        if (req.user?.role === UserRole.CLIENT) {
            if (project.clientId !== req.user.id) {
                throw new AppError('Access denied', 403);
            }
            if (attachment.userId !== req.user.id) {
                throw new AppError('You can only delete your own uploads', 403);
            }
        } else if (req.user?.role !== UserRole.ADMIN && project.orgId !== req.user?.orgId) {
            throw new AppError('Access denied', 403);
        }

        // Delete physical file
        try {
            FileService.deleteFile(attachment.filename);
        } catch (error) {
            // File might not exist, but we still delete the record
            console.error('Error deleting physical file:', error);
        }

        await attachment.destroy();

        res.json({
            success: true,
            message: 'File deleted successfully',
        });
    });

    // Download file
    static downloadFile = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
        const { projectId, fileId } = req.params;

        const attachment = await Attachment.findOne({
            where: {
                id: fileId,
                projectId,
            },
            include: [{
                model: Project,
                as: 'project',
            }]
        });

        if (!attachment) {
            throw new AppError('File not found', 404);
        }

        const project = attachment.get('project') as any;

        // Check access
        if (req.user?.role === UserRole.CLIENT) {
            if (project.clientId !== req.user.id) {
                throw new AppError('Access denied', 403);
            }
        } else if (req.user?.role !== UserRole.ADMIN && project.orgId !== req.user?.orgId) {
            throw new AppError('Access denied', 403);
        }

        // Check if file exists
        if (!FileService.fileExists(attachment.filename)) {
            throw new AppError('File not found on server', 404);
        }

        const filePath = FileService.getFilePath(attachment.filename);
        res.download(filePath, attachment.originalName);
    });
}
