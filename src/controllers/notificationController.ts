import { Response } from 'express';
import { AuthRequest } from '../types/interfaces';
import { Notification } from '../models';
import { asyncHandler } from '../middleware/errorHandler';
import { getOffset, getPaginationMeta } from '../utils/helpers';

export class NotificationController {
    // Get my notifications
    static getMyNotifications = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const unreadOnly = req.query.unreadOnly === 'true';

        const where: any = {
            userId: req.user!.id,
        };

        if (unreadOnly) {
            where.isRead = false;
        }

        const { count, rows } = await Notification.findAndCountAll({
            where,
            limit,
            offset: getOffset(page, limit),
            order: [['createdAt', 'DESC']],
        });

        const unreadCount = await Notification.count({
            where: {
                userId: req.user!.id,
                isRead: false,
            },
        });

        res.json({
            success: true,
            data: {
                notifications: rows,
                unreadCount,
                pagination: getPaginationMeta(page, limit, count),
            },
        });
    });

    // Mark as read
    static markAsRead = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
        const { id } = req.params;

        if (id === 'all') {
            await Notification.update(
                { isRead: true },
                {
                    where: {
                        userId: req.user!.id,
                        isRead: false,
                    },
                }
            );
        } else {
            await Notification.update(
                { isRead: true },
                {
                    where: {
                        id,
                        userId: req.user!.id,
                    },
                }
            );
        }

        res.json({
            success: true,
            message: 'Notifications marked as read',
        });
    });
}
