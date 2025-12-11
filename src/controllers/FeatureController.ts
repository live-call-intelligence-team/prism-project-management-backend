import { Response } from 'express';
import { Epic, Feature, Issue, User, Project } from '../models';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../types/interfaces';
import { UserRole } from '../types/enums';

export class FeatureController {
    static createFeature = asyncHandler(async (req: AuthRequest, res: Response) => {
        const { epicId, projectId, name, description, priority, startDate, endDate, storyPoints, color, ownerId, tags, acceptanceCriteria } = req.body;

        if (req.user?.role !== UserRole.ADMIN &&
            req.user?.role !== UserRole.PROJECT_MANAGER &&
            req.user?.role !== UserRole.SCRUM_MASTER) {
            throw new AppError('Only Admins, Project Managers, and Scrum Masters can create features', 403);
        }

        const project = await Project.findByPk(projectId);
        if (!project) {
            res.status(404).json({ message: 'Project not found' });
            return;
        }

        // Generate Key: PROJ-FEAT-{Count+1}
        const count = await Feature.count({ where: { projectId } });
        const key = `${project.key}-FEAT-${count + 1}`;

        const feature = await Feature.create({
            epicId,
            projectId, // Required
            name,
            description,
            priority,
            startDate,
            endDate,
            storyPoints, // Optional, can be auto-calced from tasks later if needed
            color,
            ownerId,
            key,
            status: 'TO_DO',
            tags: tags || [],
            acceptanceCriteria
        });

        res.status(201).json({
            message: 'Feature created successfully',
            data: feature
        });
    });

    static getFeatures = asyncHandler(async (req: AuthRequest, res: Response) => {
        const { projectId, epicId, status } = req.query;
        const where: any = {};

        if (projectId) where.projectId = projectId;
        if (epicId) where.epicId = epicId;
        if (status) where.status = status;

        const features = await Feature.findAll({
            where,
            include: [
                { model: User, as: 'owner', attributes: ['id', 'firstName', 'lastName', 'email'] },
                { model: Epic, as: 'epic', attributes: ['id', 'name', 'key', 'color'] },
                {
                    model: Issue,
                    as: 'issues',
                    attributes: ['id', 'status', 'storyPoints', 'type']
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        const data = features.map(feature => {
            const issues = (feature as any).issues || [];
            const total = issues.length;
            const completed = issues.filter((i: any) => i.status === 'DONE').length;

            return {
                ...feature.toJSON(),
                stats: {
                    totalIssues: total,
                    completedIssues: completed,
                    progress: total > 0 ? Math.round((completed / total) * 100) : 0
                }
            };
        });

        res.status(200).json({
            data
        });
    });

    static getFeatureById = asyncHandler(async (req: AuthRequest, res: Response) => {
        const { id } = req.params;

        const feature = await Feature.findByPk(id, {
            include: [
                { model: User, as: 'owner', attributes: ['id', 'firstName', 'lastName', 'email'] },
                { model: Epic, as: 'epic', attributes: ['id', 'name', 'key', 'color'] },
                {
                    model: Issue,
                    as: 'issues',
                    include: [
                        { model: User, as: 'assignee', attributes: ['id', 'firstName', 'lastName'] }
                    ]
                }
            ]
        });

        if (!feature) {
            res.status(404).json({ message: 'Feature not found' });
            return;
        }

        const issues = (feature as any).issues || [];
        const total = issues.length;
        const completed = issues.filter((i: any) => i.status === 'DONE').length;

        const featureData = {
            ...feature.toJSON(),
            stats: {
                totalIssues: total,
                completedIssues: completed,
                progress: total > 0 ? Math.round((completed / total) * 100) : 0
            }
        };

        res.status(200).json({
            data: featureData
        });
    });

    static updateFeature = asyncHandler(async (req: AuthRequest, res: Response) => {
        const { id } = req.params;
        const { name, description, status, priority, startDate, endDate, storyPoints, color, ownerId, epicId, acceptanceCriteria } = req.body;

        if (req.user?.role !== UserRole.ADMIN &&
            req.user?.role !== UserRole.PROJECT_MANAGER &&
            req.user?.role !== UserRole.SCRUM_MASTER) {
            throw new AppError('Only Admins, Project Managers, and Scrum Masters can update features', 403);
        }

        const feature = await Feature.findByPk(id);
        if (!feature) {
            res.status(404).json({ message: 'Feature not found' });
            return;
        }

        await feature.update({
            name,
            description,
            status,
            priority,
            startDate,
            endDate,
            storyPoints,
            color,
            ownerId,
            epicId,
            acceptanceCriteria
        });

        res.status(200).json({
            message: 'Feature updated successfully',
            data: feature
        });
    });

    static deleteFeature = asyncHandler(async (req: AuthRequest, res: Response) => {
        const { id } = req.params;

        // Allow SM to delete features too, common workflow
        if (req.user?.role !== UserRole.ADMIN &&
            req.user?.role !== UserRole.PROJECT_MANAGER &&
            req.user?.role !== UserRole.SCRUM_MASTER) {
            throw new AppError('Only Admins, Project Managers, and Scrum Masters can delete features', 403);
        }

        const feature = await Feature.findByPk(id);
        if (!feature) {
            res.status(404).json({ message: 'Feature not found' });
            return;
        }

        await feature.destroy();

        res.status(200).json({
            message: 'Feature deleted successfully'
        });
    });
}
