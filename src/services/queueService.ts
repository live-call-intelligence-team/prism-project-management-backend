import Queue from 'bull';
import { EmailService } from './emailService';
import logger from '../utils/logger';

// Email queue configuration
const emailQueue = new Queue('email', {
    redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
    },
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 2000,
        },
        removeOnComplete: true,
        removeOnFail: false,
    },
});

// Job processors
emailQueue.process('welcome', async (job) => {
    const { email, name } = job.data;
    logger.info(`Processing welcome email for ${email}`);

    try {
        await EmailService.sendWelcomeEmail(email, name);
        logger.info(`Welcome email sent to ${email}`);
    } catch (error) {
        logger.error(`Failed to send welcome email to ${email}:`, error);
        throw error;
    }
});

emailQueue.process('password-reset', async (job) => {
    const { email, token } = job.data;
    logger.info(`Processing password reset email for ${email}`);

    try {
        await EmailService.sendPasswordResetEmail(email, token);
        logger.info(`Password reset email sent to ${email}`);
    } catch (error) {
        logger.error(`Failed to send password reset email to ${email}:`, error);
        throw error;
    }
});

emailQueue.process('issue-assignment', async (job) => {
    const { email, name, issueKey, issueTitle, assignedBy } = job.data;
    logger.info(`Processing issue assignment email for ${email}`);

    try {
        await EmailService.sendIssueAssignmentEmail(email, name, issueKey, issueTitle, assignedBy);
        logger.info(`Issue assignment email sent to ${email}`);
    } catch (error) {
        logger.error(`Failed to send issue assignment email to ${email}:`, error);
        throw error;
    }
});

emailQueue.process('mention', async (job) => {
    const { email, name, issueKey, mentionedBy } = job.data;
    logger.info(`Processing mention email for ${email}`);

    try {
        await EmailService.sendMentionEmail(email, name, issueKey, mentionedBy);
        logger.info(`Mention email sent to ${email}`);
    } catch (error) {
        logger.error(`Failed to send mention email to ${email}:`, error);
        throw error;
    }
});

// Event listeners
emailQueue.on('completed', (job) => {
    logger.info(`Email job ${job.id} completed`);
});

emailQueue.on('failed', (job, err) => {
    logger.error(`Email job ${job?.id} failed:`, err);
});

emailQueue.on('stalled', (job) => {
    logger.warn(`Email job ${job.id} stalled`);
});

// Queue management functions
export class QueueService {
    // Add welcome email to queue
    static async queueWelcomeEmail(email: string, name: string): Promise<void> {
        await emailQueue.add('welcome', { email, name }, {
            priority: 1,
        });
    }

    // Add password reset email to queue
    static async queuePasswordResetEmail(email: string, token: string): Promise<void> {
        await emailQueue.add('password-reset', { email, token }, {
            priority: 2, // Higher priority
        });
    }

    // Add issue assignment email to queue
    static async queueIssueAssignmentEmail(
        email: string,
        name: string,
        issueKey: string,
        issueTitle: string,
        assignedBy: string
    ): Promise<void> {
        await emailQueue.add('issue-assignment', { email, name, issueKey, issueTitle, assignedBy }, {
            priority: 3,
        });
    }

    // Add mention email to queue
    static async queueMentionEmail(
        email: string,
        name: string,
        issueKey: string,
        mentionedBy: string
    ): Promise<void> {
        await emailQueue.add('mention', { email, name, issueKey, mentionedBy }, {
            priority: 3,
        });
    }

    // Get queue stats
    static async getQueueStats() {
        const [waiting, active, completed, failed, delayed] = await Promise.all([
            emailQueue.getWaitingCount(),
            emailQueue.getActiveCount(),
            emailQueue.getCompletedCount(),
            emailQueue.getFailedCount(),
            emailQueue.getDelayedCount(),
        ]);

        return {
            waiting,
            active,
            completed,
            failed,
            delayed,
            total: waiting + active + completed + failed + delayed,
        };
    }

    // Clean old jobs
    static async cleanQueue(): Promise<void> {
        await emailQueue.clean(24 * 60 * 60 * 1000); // Clean jobs older than 24 hours
        logger.info('Email queue cleaned');
    }

    // Pause queue
    static async pauseQueue(): Promise<void> {
        await emailQueue.pause();
        logger.info('Email queue paused');
    }

    // Resume queue
    static async resumeQueue(): Promise<void> {
        await emailQueue.resume();
        logger.info('Email queue resumed');
    }

    // Close queue (for graceful shutdown)
    static async closeQueue(): Promise<void> {
        await emailQueue.close();
        logger.info('Email queue closed');
    }
}

export default emailQueue;
