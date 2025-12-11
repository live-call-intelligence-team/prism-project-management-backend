import { Response } from 'express';
import { AuthRequest } from '../types/interfaces';
import { Milestone, Project } from '../models';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { UserRole } from '../types/enums';
import { AuditLog } from '../models';
import { AuditAction } from '../types/enums';

export class MilestoneController {
    // Get all milestones for a project
    static getProjectMilestones = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
        const { projectId } = req.params;

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

        const milestones = await Milestone.findAll({
            where: { projectId },
            order: [['dueDate', 'ASC']],
        });

        res.json({
            success: true,
            data: { milestones },
        });
    });

    // Create a new milestone (Admin/Scrum only)
    static createMilestone = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
        const { projectId } = req.params;
        const { name, description, dueDate, tasksTotal } = req.body;

        if (req.user?.role !== UserRole.ADMIN && req.user?.role !== UserRole.SCRUM_MASTER) {
            throw new AppError('Only admins and scrum masters can create milestones', 403);
        }

        const project = await Project.findByPk(projectId);
        if (!project) {
            throw new AppError('Project not found', 404);
        }

        // Check org access
        if (req.user?.role !== UserRole.ADMIN && project.orgId !== req.user?.orgId) {
            throw new AppError('Access denied', 403);
        }

        const milestone = await Milestone.create({
            projectId: projectId as string,
            name,
            description,
            dueDate,
            tasksTotal: tasksTotal || 0,
            tasksCompleted: 0,
            status: 'UPCOMING',
        });

        // Audit log
        await AuditLog.create({
            userId: req.user!.id,
            action: AuditAction.CREATE,
            resource: 'milestone',
            resourceId: milestone.id,
            details: { name: milestone.name, projectId },
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
        });

        res.status(201).json({
            success: true,
            message: 'Milestone created successfully',
            data: { milestone },
        });
    });

    // Update a milestone
    static updateMilestone = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
        const { id } = req.params;
        const { name, description, dueDate, status, tasksTotal, tasksCompleted } = req.body;

        if (req.user?.role !== UserRole.ADMIN && req.user?.role !== UserRole.SCRUM_MASTER) {
            throw new AppError('Only admins and scrum masters can update milestones', 403);
        }

        const milestone = await Milestone.findByPk(id, {
            include: [{
                model: Project,
                as: 'project',
            }]
        });

        if (!milestone) {
            throw new AppError('Milestone not found', 404);
        }

        // Check org access
        const project = milestone.get('project') as any;
        if (req.user?.role !== UserRole.ADMIN && project.orgId !== req.user?.orgId) {
            throw new AppError('Access denied', 403);
        }

        // Update fields
        if (name) milestone.name = name;
        if (description !== undefined) milestone.description = description;
        if (dueDate) milestone.dueDate = dueDate;
        if (status) milestone.status = status as any;
        if (tasksTotal !== undefined) milestone.tasksTotal = tasksTotal;
        if (tasksCompleted !== undefined) milestone.tasksCompleted = tasksCompleted;

        await milestone.save();

        // Audit log
        await AuditLog.create({
            userId: req.user!.id,
            action: AuditAction.UPDATE,
            resource: 'milestone',
            resourceId: milestone.id,
            details: { changes: req.body },
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
        });

        res.json({
            success: true,
            message: 'Milestone updated successfully',
            data: { milestone },
        });
    });

    // Delete a milestone
    static deleteMilestone = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
        const { id } = req.params;

        if (req.user?.role !== UserRole.ADMIN) {
            throw new AppError('Only admins can delete milestones', 403);
        }

        const milestone = await Milestone.findByPk(id, {
            include: [{
                model: Project,
                as: 'project',
            }]
        });

        if (!milestone) {
            throw new AppError('Milestone not found', 404);
        }

        // Audit log before deletion
        await AuditLog.create({
            userId: req.user!.id,
            action: AuditAction.DELETE,
            resource: 'milestone',
            resourceId: milestone.id,
            details: { name: milestone.name },
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
        });

        await milestone.destroy();

        res.json({
            success: true,
            message: 'Milestone deleted successfully',
        });
    });
}
