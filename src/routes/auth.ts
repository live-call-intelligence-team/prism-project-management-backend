import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimiter';
import { loginValidation } from '../validators';
import { runValidation } from '../middleware/validation';
import { body } from 'express-validator';

const router = Router();

// Public routes with rate limiting
// router.post(
//     '/register',
//     authLimiter,
//     runValidation(registerValidation),
//     AuthController.register
// );

router.post(
    '/login',
    authLimiter,
    runValidation(loginValidation),
    AuthController.login
);

router.post(
    '/refresh-token',
    runValidation([
        body('refreshToken').notEmpty().withMessage('Refresh token is required'),
    ]),
    AuthController.refreshToken
);

router.post(
    '/forgot-password',
    authLimiter,
    runValidation([
        body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    ]),
    AuthController.forgotPassword
);

router.post(
    '/reset-password',
    authLimiter,
    runValidation([
        body('token').notEmpty().withMessage('Reset token is required'),
        body('newPassword').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    ]),
    AuthController.resetPassword
);

// Protected routes
router.post('/logout', authenticate, AuthController.logout);
router.get('/me', authenticate, AuthController.getCurrentUser);
router.post(
    '/change-password',
    authenticate,
    runValidation([
        body('oldPassword').notEmpty().withMessage('Old password is required'),
        body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters'),
    ]),
    AuthController.changePassword
);

export default router;
