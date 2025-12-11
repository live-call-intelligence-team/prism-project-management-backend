import { Router } from 'express';
import { FeatureController } from '../controllers/FeatureController';
import { authenticate, isAdminOrScrumMaster } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post(
    '/',
    isAdminOrScrumMaster,
    FeatureController.createFeature
);

router.get('/', FeatureController.getFeatures);

router.get('/:id', FeatureController.getFeatureById);

router.put(
    '/:id',
    isAdminOrScrumMaster,
    FeatureController.updateFeature
);

router.delete(
    '/:id',
    isAdminOrScrumMaster,
    FeatureController.deleteFeature
);

export default router;
