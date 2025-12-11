import { Router } from 'express';
import { EpicController } from '../controllers/EpicController';
import { authenticate, isAdminOrScrumMaster } from '../middleware/auth';


const router = Router();

router.use(authenticate);

router.post(
    '/',
    isAdminOrScrumMaster,
    EpicController.createEpic
);

router.get('/', EpicController.getEpics);

router.get('/:id', EpicController.getEpicById);

router.put(
    '/:id',
    isAdminOrScrumMaster,
    EpicController.updateEpic
);

router.delete(
    '/:id',
    isAdminOrScrumMaster,
    EpicController.deleteEpic
);

// Close epic
router.post('/:id/close', EpicController.closeEpic);

export default router;
