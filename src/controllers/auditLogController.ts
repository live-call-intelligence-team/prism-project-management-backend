import { Response } from 'express';
import { AuthRequest } from '../types/interfaces';
import { AuditLog, User } from '../models';
import { asyncHandler } from '../middleware/errorHandler';
import { Op } from 'sequelize';

export class AuditLogController {
    // Get all audit logs with filters and pagination
    static getLogs = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const offset = (page - 1) * limit;

        const { userId, action, resource, startDate, endDate, search } = req.query;

        const where: any = {};

        if (userId) where.userId = userId;
        if (action) where.action = action;
        if (resource) where.resource = resource;

        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) where.createdAt[Op.gte] = new Date(startDate as string);
            if (endDate) where.createdAt[Op.lte] = new Date(endDate as string);
        }

        if (search) {
            where[Op.or] = [
                { resource: { [Op.iLike]: `%${search}%` } },
                { ipAddress: { [Op.iLike]: `%${search}%` } },
            ];
        }

        const { count, rows } = await AuditLog.findAndCountAll({
            where,
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'firstName', 'lastName', 'email', 'role'],
                },
            ],
            order: [['createdAt', 'DESC']],
            limit,
            offset,
        });

        res.json({
            success: true,
            data: {
                logs: rows,
                pagination: {
                    total: count,
                    page,
                    pages: Math.ceil(count / limit),
                },
            },
        });
    });

    // Get audit log statistics
    static getStats = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
        const { days } = req.query;
        const limitDays = parseInt(days as string) || 7;
        const dateLimit = new Date();
        dateLimit.setDate(dateLimit.getDate() - limitDays);

        const where = {
            createdAt: { [Op.gte]: dateLimit },
        };

        const [totalActions, actionsByType, activeUsers] = await Promise.all([
            AuditLog.count({ where }),
            AuditLog.findAll({
                where,
                attributes: ['action', [AuditLog.sequelize!.fn('count', '*'), 'count']],
                group: ['action'],
                raw: true,
            }),
            AuditLog.count({
                where,
                distinct: true,
                col: 'userId',
            }),
        ]);

        res.json({
            success: true,
            data: {
                period: `${limitDays} days`,
                totalActions,
                uniqueUsers: activeUsers,
                breakdown: actionsByType,
            },
        });
    });
}
