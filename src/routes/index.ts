import { Router } from 'express';
import authRoutes from './auth';
import userRoutes from './users';
import projectRoutes from './projects';
import issueRoutes from './issues';
import sprintRoutes from './sprints';
import analyticsRoutes from './analytics';
import timeTrackingRoutes from './timeTracking';
import clientRoutes from './client';
import milestoneRoutes from './milestones';

import auditLogRoutes from './auditLogs';
import notificationRoutes from './notifications';
import settingsRoutes from './settings';
import epicRoutes from './epics';
import featureRoutes from './features';

const router = Router();

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/projects', projectRoutes);
router.use('/issues', issueRoutes);
router.use('/sprints', sprintRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/time', timeTrackingRoutes);
router.use('/client', clientRoutes);
router.use('/milestones', milestoneRoutes);
router.use('/audit-logs', auditLogRoutes);
router.use('/notifications', notificationRoutes);
router.use('/settings', settingsRoutes);
router.use('/epics', epicRoutes);
router.use('/features', featureRoutes);

// API info endpoint
router.get('/', (_req, res) => {
    res.json({
        success: true,
        message: 'Project Management API',
        version: '1.0.0',
        endpoints: {
            auth: '/auth',
            users: '/users',
            projects: '/projects',
            issues: '/issues',
            sprints: '/sprints',
            reports: '/reports',
        },
    });
});

export default router;
