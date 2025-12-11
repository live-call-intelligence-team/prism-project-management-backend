import { Router } from 'express';
import { AnalyticsController } from '../controllers/analyticsController';
import { authenticate } from '../middleware/auth';
import { projectIdParamValidation, sprintIdParamValidation } from '../validators';
import { runValidation } from '../middleware/validation';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /analytics/dashboard:
 *   get:
 *     summary: Get dashboard overview
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data retrieved successfully
 */
router.get('/dashboard', AnalyticsController.getDashboard);

/**
 * @swagger
 * /analytics/personal-stats:
 *   get:
 *     summary: Get personal statistics for current user
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Personal stats retrieved successfully
 */
router.get('/personal-stats', AnalyticsController.getPersonalStats);

/**
 * @swagger
 * /analytics/client-stats:
 *   get:
 *     summary: Get client dashboard statistics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Client stats retrieved successfully
 */
router.get('/client-stats', AnalyticsController.getClientStats);

/**
 * @swagger
 * /analytics/velocity:
 *   get:
 *     summary: Get velocity chart data
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: projectId
 *         schema:
 *           type: string
 *         description: Filter by project ID
 *     responses:
 *       200:
 *         description: Velocity data retrieved successfully
 */
router.get('/velocity', AnalyticsController.getVelocityChart);

/**
 * @swagger
 * /analytics/burndown/{sprintId}:
 *   get:
 *     summary: Get burndown chart data for a sprint
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sprintId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Burndown data retrieved successfully
 */
router.get(
    '/burndown/:sprintId',
    runValidation(sprintIdParamValidation),
    AnalyticsController.getBurndownChart
);

/**
 * @swagger
 * /analytics/team-performance:
 *   get:
 *     summary: Get team performance metrics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: projectId
 *         schema:
 *           type: string
 *         description: Filter by project ID
 *     responses:
 *       200:
 *         description: Team performance data retrieved successfully
 */
router.get('/team-performance', AnalyticsController.getTeamPerformance);

/**
 * @swagger
 * /analytics/project-health/{projectId}:
 *   get:
 *     summary: Get project health metrics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Project health data retrieved successfully
 */
router.get(
    '/project-health/:projectId',
    runValidation(projectIdParamValidation),
    AnalyticsController.getProjectHealth
);

/**
 * @swagger
 * /analytics/system:
 *   get:
 *     summary: Get system health metrics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System metrics retrieved
 */
router.get('/system', AnalyticsController.getSystemHealth);

/**
 * @swagger
 * /analytics/db:
 *   get:
 *     summary: Get database statistics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: DB stats retrieved
 */
router.get('/db', AnalyticsController.getDatabaseStats);

/**
 * @swagger
 * /analytics/growth:
 *   get:
 *     summary: Get growth statistics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Growth stats retrieved
 */
router.get('/growth', AnalyticsController.getGrowthStats);

/**
 * @swagger
 * /analytics/resolution:
 *   get:
 *     summary: Get resolution rate statistics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Resolution stats retrieved
 */
router.get('/resolution', AnalyticsController.getResolutionRate);

/**
 * @swagger
 * /analytics/export:
 *   get:
 *     summary: Export data report
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [issues, users, audit]
 *         description: Type of report to export
 *     responses:
 *       200:
 *         description: CSV file download
 */
router.get('/export', AnalyticsController.exportReport);

export default router;
