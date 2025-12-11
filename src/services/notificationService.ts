import { Notification } from '../models';
import { NotificationType } from '../types/enums';
import logger from '../utils/logger';

export class NotificationService {
    // Create notification
    static async createNotification(
        userId: string,
        type: NotificationType,
        title: string,
        message: string,
        data: object = {}
    ): Promise<Notification> {
        try {
            const notification = await Notification.create({
                userId,
                type,
                title,
                message,
                data,
                isRead: false,
            });

            logger.info(`Notification created for user ${userId}: ${title}`);
            return notification;
        } catch (error) {
            logger.error('Failed to create notification:', error);
            throw error;
        }
    }

    // Mark notification as read
    static async markAsRead(notificationId: string): Promise<void> {
        await Notification.update(
            { isRead: true },
            { where: { id: notificationId } }
        );
    }

    // Mark all notifications as read for a user
    static async markAllAsRead(userId: string): Promise<void> {
        await Notification.update(
            { isRead: true },
            { where: { userId, isRead: false } }
        );
    }

    // Get unread count for user
    static async getUnreadCount(userId: string): Promise<number> {
        return await Notification.count({
            where: { userId, isRead: false },
        });
    }

    // Delete old notifications (older than 30 days)
    static async deleteOldNotifications(): Promise<void> {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        await Notification.destroy({
            where: {
                createdAt: { $lt: thirtyDaysAgo },
                isRead: true,
            },
        });
    }

    // Notify issue assignment
    static async notifyIssueAssignment(
        userId: string,
        issueKey: string,
        issueTitle: string,
        assignedBy: string
    ): Promise<void> {
        await this.createNotification(
            userId,
            NotificationType.ISSUE_ASSIGNED,
            'Issue Assigned',
            `You have been assigned to ${issueKey}: ${issueTitle}`,
            { issueKey, assignedBy }
        );
    }

    // Notify mention
    static async notifyMention(
        userId: string,
        issueKey: string,
        mentionedBy: string
    ): Promise<void> {
        await this.createNotification(
            userId,
            NotificationType.MENTION,
            'You were mentioned',
            `${mentionedBy} mentioned you in ${issueKey}`,
            { issueKey, mentionedBy }
        );
    }

    // Notify issue update
    static async notifyIssueUpdate(
        userId: string,
        issueKey: string,
        updateType: string
    ): Promise<void> {
        await this.createNotification(
            userId,
            NotificationType.ISSUE_UPDATED,
            'Issue Updated',
            `${issueKey} was updated: ${updateType}`,
            { issueKey, updateType }
        );
    }
}
