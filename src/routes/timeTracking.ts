import express from 'express';
import TimeTrackingController from '../controllers/timeTrackingController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Time entry CRUD
router.post('/time-entries', TimeTrackingController.createTimeEntry);
router.get('/time-entries', TimeTrackingController.getTimeEntries);
router.get('/time-entries/:id', TimeTrackingController.getTimeEntry);
router.put('/time-entries/:id', TimeTrackingController.updateTimeEntry);
router.delete('/time-entries/:id', TimeTrackingController.deleteTimeEntry);

// Time summaries
router.get('/time-entries/summary/:period', TimeTrackingController.getTimeSummary);

export default router;
