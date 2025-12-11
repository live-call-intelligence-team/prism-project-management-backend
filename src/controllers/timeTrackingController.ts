import { Response } from 'express';
import { AuthRequest } from '../types/interfaces';
import { WorkLog, Issue, User, AuditLog } from '../models';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { AuditAction, UserRole } from '../types/enums';
import { getOffset, getPaginationMeta } from '../utils/helpers';
import { Op } from 'sequelize';

class TimeTrackingController {
    // Create time entry
    static createTimeEntry = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
        const { issueId, timeSpent, date, description } = req.body;
        const userId = req.user!.id;

        // Verify issue exists
        const issue = await Issue.findByPk(issueId);
        if (!issue) {
            throw new AppError('Issue not found', 404);
        }

        const timeEntry = await WorkLog.create({
            issueId,
            userId,
            timeSpent,
            date: date || new Date(),
            description,
        });

        // Audit log
        await AuditLog.create({
            userId,
            action: AuditAction.CREATE,
            resource: 'WorkLog',
            resourceId: timeEntry.id,
            details: { timeSpent, issueId },
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
        });

        res.status(201).json({
            success: true,
            data: timeEntry,
        });
    });

    // Get time entries with filters
    static getTimeEntries = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const offset = getOffset(page, limit);
        const userId = req.query.userId as string;
        const issueId = req.query.issueId as string;
        const startDate = req.query.startDate as string;
        const endDate = req.query.endDate as string;

        const where: any = {};

        // Filter by user (employees can only see their own)
        if (req.user!.role === UserRole.EMPLOYEE) {
            where.userId = req.user!.id;
        } else if (userId) {
            where.userId = userId;
        }

        if (issueId) where.issueId = issueId;

        if (startDate || endDate) {
            where.date = {};
            if (startDate) where.date[Op.gte] = new Date(startDate);
            if (endDate) where.date[Op.lte] = new Date(endDate);
        }

        const { count, rows } = await WorkLog.findAndCountAll({
            where,
            limit,
            offset,
            order: [['date', 'DESC']],
            include: [
                {
                    model: Issue,
                    as: 'issue',
                    attributes: ['id', 'title', 'key'],
                },
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'name', 'email'],
                },
            ],
        });

        res.json({
            success: true,
            data: rows,
            pagination: getPaginationMeta(count, page, limit),
        });
    });

    // Get time entry by ID
    static getTimeEntry = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
        const { id } = req.params;

        const timeEntry = await WorkLog.findByPk(id, {
            include: [
                {
                    model: Issue,
                    as: 'issue',
                    attributes: ['id', 'title', 'key'],
                },
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'name', 'email'],
                },
            ],
        });

        if (!timeEntry) {
            throw new AppError('Time entry not found', 404);
        }

        // Check permission
        if (req.user!.role === UserRole.EMPLOYEE && timeEntry.userId !== req.user!.id) {
            throw new AppError('Access denied', 403);
        }

        res.json({
            success: true,
            data: timeEntry,
        });
    });

    // Update time entry
    static updateTimeEntry = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
        const { id } = req.params;
        const { timeSpent, date, description } = req.body;

        const timeEntry = await WorkLog.findByPk(id);
        if (!timeEntry) {
            throw new AppError('Time entry not found', 404);
        }

        // Check permission
        if (req.user!.role === UserRole.EMPLOYEE && timeEntry.userId !== req.user!.id) {
            throw new AppError('Access denied', 403);
        }

        const oldData = { ...timeEntry.toJSON() };

        await timeEntry.update({
            timeSpent: timeSpent ?? timeEntry.timeSpent,
            date: date ?? timeEntry.date,
            description: description ?? timeEntry.description,
        });

        // Audit log
        await AuditLog.create({
            userId: req.user!.id,
            action: AuditAction.UPDATE,
            resource: 'WorkLog',
            resourceId: timeEntry.id,
            details: { before: oldData, after: timeEntry.toJSON() },
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
        });

        res.json({
            success: true,
            data: timeEntry,
        });
    });

    // Delete time entry
    static deleteTimeEntry = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
        const { id } = req.params;

        const timeEntry = await WorkLog.findByPk(id);
        if (!timeEntry) {
            throw new AppError('Time entry not found', 404);
        }

        // Check permission
        if (req.user!.role === UserRole.EMPLOYEE && timeEntry.userId !== req.user!.id) {
            throw new AppError('Access denied', 403);
        }

        await timeEntry.destroy();

        // Audit log
        await AuditLog.create({
            userId: req.user!.id,
            action: AuditAction.DELETE,
            resource: 'WorkLog',
            resourceId: id!,
            details: { deleted: timeEntry.toJSON() },
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
        });

        res.json({
            success: true,
            message: 'Time entry deleted successfully',
        });
    });

    // Get time summary
    static getTimeSummary = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
        const { period, userId } = req.query;
        const targetUserId = (req.user!.role === UserRole.EMPLOYEE ? req.user!.id : userId) as string;

        const now = new Date();
        let startDate: Date;

        switch (period) {
            case 'daily':
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                break;
            case 'weekly':
                const dayOfWeek = now.getDay();
                startDate = new Date(now.getTime() - dayOfWeek * 24 * 60 * 60 * 1000);
                startDate.setHours(0, 0, 0, 0);
                break;
            case 'monthly':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            default:
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        }

        const timeEntries = await WorkLog.findAll({
            where: {
                userId: targetUserId,
                date: {
                    [Op.gte]: startDate,
                },
            },
            include: [
                {
                    model: Issue,
                    as: 'issue',
                    attributes: ['id', 'title', 'key'],
                },
            ],
        });

        const totalHours = timeEntries.reduce((sum, entry) => sum + parseFloat(entry.timeSpent.toString()), 0);

        res.json({
            success: true,
            data: {
                period,
                startDate,
                endDate: now,
                totalHours: totalHours.toFixed(2),
                entries: timeEntries.length,
                timeEntries,
            },
        });
    });
}

export default TimeTrackingController;
