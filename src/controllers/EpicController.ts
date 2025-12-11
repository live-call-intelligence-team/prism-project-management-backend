import { Response } from 'express';
import { Epic, Feature, Issue, User, Project } from '../models';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../types/interfaces';
import { UserRole } from '../types/enums';

export class EpicController {
    static createEpic = asyncHandler(async (req: AuthRequest, res: Response) => {
        const { projectId, name, description, startDate, endDate, status, priority, color, tags, goals, businessValue, isVisibleToClient } = req.body;
        const ownerId = req.user!.id;

        // RBAC: Only Admin or PM can create Epics
        if (req.user?.role !== UserRole.ADMIN && req.user?.role !== UserRole.PROJECT_MANAGER) {
            throw new AppError('Only Project Managers and Admins can create epics', 403);
        }

        // ... (key// Placeholder to ensure logic flow. I will view routes next.brevity as it's unchanged)

        const project = await Project.findByPk(projectId);
        if (!project) {
            res.status(404).json({ message: 'Project not found' });
            return;
        }

        // Simple key gen: ProjectKey-EPIC-{Count+1}
        const count = await Epic.count({ where: { projectId } });
        const key = `${project.key}-EPIC-${count + 1}`;

        const epic = await Epic.create({
            projectId,
            name,
            description,
            priority,
            status,
            startDate,
            endDate,
            color,
            ownerId,
            key,
            tags: tags || [],
            goals,
            businessValue,
            isVisibleToClient: isVisibleToClient || false
        });

        res.status(201).json({
            message: 'Epic created successfully',
            data: epic
        });
    });

    static getEpics = asyncHandler(async (req: AuthRequest, res: Response) => {
        const { projectId, status, search } = req.query;
        const where: any = {};

        if (projectId) where.projectId = projectId;
        if (status) where.status = status;
        if (search) {
            const { Op } = require('sequelize');
            where[Op.or] = [
                { name: { [Op.iLike]: `%${search}%` } },
                { key: { [Op.iLike]: `%${search}%` } }
            ];
        }

        const epics = await Epic.findAll({
            where,
            include: [
                { model: User, as: 'owner', attributes: ['id', 'firstName', 'lastName', 'email'] },
                {
                    model: Feature,
                    as: 'features',
                    attributes: ['id', 'name', 'status']
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        const data = epics.map(epic => {
            const features = (epic as any).features || [];
            const total = features.length;
            const completed = features.filter((f: any) => f.status === 'CLOSED').length;

            return {
                ...epic.toJSON(),
                stats: {
                    totalFeatures: total,
                    completedFeatures: completed,
                    progress: total > 0 ? Math.round((completed / total) * 100) : 0
                }
            };
        });

        res.status(200).json({
            data
        });
    });

    static getEpicById = asyncHandler(async (req: AuthRequest, res: Response) => {
        const { id } = req.params;

        const epic = await Epic.findByPk(id, {
            include: [
                { model: User, as: 'owner', attributes: ['id', 'firstName', 'lastName', 'email'] },
                {
                    model: Feature,
                    as: 'features',
                    include: [
                        { model: Issue, as: 'issues', attributes: ['id', 'status', 'type'] }
                    ]
                }
            ]
        });

        if (!epic) {
            res.status(404).json({ message: 'Epic not found' });
            return;
        }

        const features = (epic as any).features || [];
        const totalFeatures = features.length;
        const completedFeatures = features.filter((f: any) => f.status === 'CLOSED').length;

        const epicData = {
            ...epic.toJSON(),
            stats: {
                totalFeatures,
                completedFeatures,
                progress: totalFeatures > 0 ? Math.round((completedFeatures / totalFeatures) * 100) : 0
            }
        };

        res.status(200).json({
            data: epicData
        });
    });

    static updateEpic = asyncHandler(async (req: AuthRequest, res: Response) => {
        const { id } = req.params;
        const { name, description, status, priority, startDate, endDate, color, ownerId, goals, tags } = req.body;

        if (req.user?.role !== UserRole.ADMIN && req.user?.role !== UserRole.PROJECT_MANAGER) {
            throw new AppError('Only Project Managers and Admins can update epics', 403);
        }

        const epic = await Epic.findByPk(id);
        if (!epic) {
            res.status(404).json({ message: 'Epic not found' });
            return;
        }

        await epic.update({
            name,
            description,
            status,
            priority,
            startDate,
            endDate,
            color,
            ownerId,
            goals,
            tags
        });

        res.status(200).json({
            message: 'Epic updated successfully',
            data: epic
        });
    });

    static deleteEpic = asyncHandler(async (req: AuthRequest, res: Response) => {
        const { id } = req.params;

        if (req.user?.role !== UserRole.ADMIN && req.user?.role !== UserRole.PROJECT_MANAGER) {
            throw new AppError('Only Project Managers and Admins can delete epics', 403);
        }

        const epic = await Epic.findByPk(id);
        if (!epic) {
            res.status(404).json({ message: 'Epic not found' });
            return;
        }

        await epic.destroy();

        res.status(200).json({
            message: 'Epic deleted successfully'
        });
    });

    static closeEpic = asyncHandler(async (req: AuthRequest, res: Response) => {
        const { id } = req.params;
        const { resolution, targetEpicId, notes } = req.body; // resolution: 'KEEP', 'MOVE', 'BACKLOG', 'CANCEL'

        if (req.user?.role !== UserRole.ADMIN && req.user?.role !== UserRole.PROJECT_MANAGER) {
            throw new AppError('Only Project Managers and Admins can close epics', 403);
        }

        const epic = await Epic.findByPk(id);
        if (!epic) {
            res.status(404).json({ message: 'Epic not found' });
            return;
        }

        // Update features based on resolution
        const features = await Feature.findAll({ where: { epicId: id, status: { [require('sequelize').Op.not]: 'CLOSED' } } }); // Find incomplete/active features

        if (features.length > 0) {
            const featureIds = features.map(f => f.id);

            if (resolution === 'MOVE' && targetEpicId) {
                // Move features to another epic
                await Feature.update({ epicId: targetEpicId }, { where: { id: featureIds } });
            } else if (resolution === 'BACKLOG') {
                // Remove epic link (null)
                await Feature.update({ epicId: null }, { where: { id: featureIds } });
            } else if (resolution === 'CANCEL') {
                // Cancel features
                // assuming 'CLOSED' or 'CANCELLED' status exists. Using 'CLOSED' for now based on context.
                await Feature.update({ status: 'CLOSED' }, { where: { id: featureIds } });
            }
            // If 'KEEP', do nothing to features (they stay linked to closed epic)
        }

        // Close the epic
        await epic.update({
            status: 'CLOSED', // EpicStatus.CLOSED
            completedAt: new Date(),
            description: epic.description + (notes ? `\n\n[Completion Notes]: ${notes}` : '')
        });

        res.status(200).json({
            message: 'Epic closed successfully',
            data: epic
        });
    });
}
