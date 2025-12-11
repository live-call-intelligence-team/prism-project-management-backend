import { Response } from 'express';
import { AuthRequest } from '../types/interfaces';
import { User, Organization } from '../models';
import { AuthService } from '../services/authService';
import { EmailService } from '../services/emailService';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { AuditLog } from '../models';
import { AuditAction } from '../types/enums';
import logger from '../utils/logger';

export class AuthController {
    // Register new user
    static register = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
        const { email, password, firstName, lastName, orgName, role } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            throw new AppError('User with this email already exists', 400);
        }

        // Create organization if orgName provided (for first user/admin)
        let orgId = req.body.orgId;
        if (orgName && !orgId) {
            const org = await Organization.create({
                name: orgName,
                subscriptionPlan: 'FREE',
                ssoEnabled: false,
                maxUsers: 10,
                settings: {},
            });
            orgId = org.id;
        }

        if (!orgId) {
            throw new AppError('Organization ID is required', 400);
        }

        // Create user
        const user = await User.create({
            email,
            passwordHash: '', // Will be set by setPassword
            firstName,
            lastName,
            role: role || 'EMPLOYEE',
            orgId,
            profileData: {},
            mfaEnabled: false,
            isActive: true,
        });

        // Set password
        await user.setPassword(password);
        await user.save();

        // Generate tokens
        const accessToken = AuthService.generateAccessToken(user.id, user.email, user.role, user.orgId);
        const refreshToken = AuthService.generateRefreshToken(user.id);

        // Save refresh token
        user.refreshToken = refreshToken;
        await user.save();

        // Send welcome email
        try {
            await EmailService.sendWelcomeEmail(user.email, user.fullName);
        } catch (error) {
            logger.error('Failed to send welcome email:', error);
        }

        // Create audit log
        await AuditLog.create({
            userId: user.id,
            action: AuditAction.CREATE,
            resource: 'user',
            resourceId: user.id,
            details: { email: user.email },
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
        });

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user: user.toJSON(),
                accessToken,
                refreshToken,
            },
        });
    });

    // Login
    static login = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
        const { email, username, password, mfaToken } = req.body;

        if (!email && !username) {
            throw new AppError('Email or Username is required', 400);
        }

        // Find user by email or username
        const where: any = {};
        if (email) where.email = email;
        else if (username) where.username = username;

        const user = await User.findOne({ where });
        if (!user) {
            throw new AppError('Invalid credentials', 401);
        }

        // Check if user is active
        if (!user.isActive) {
            throw new AppError('Account is inactive', 401);
        }

        // Verify password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            throw new AppError('Invalid credentials', 401);
        }

        // Check MFA if enabled
        if (user.mfaEnabled) {
            if (!mfaToken) {
                res.status(200).json({
                    success: true,
                    message: 'MFA token required',
                    data: { mfaRequired: true },
                });
                return;
            }

            // Verify MFA token
            try {
                AuthService.verifyMFAToken(mfaToken);
            } catch (error) {
                throw new AppError('Invalid MFA token', 401);
            }
        }

        // Generate tokens
        const accessToken = AuthService.generateAccessToken(user.id, user.email, user.role, user.orgId);
        const refreshToken = AuthService.generateRefreshToken(user.id);

        // Update user
        user.refreshToken = refreshToken;
        user.lastLogin = new Date();
        await user.save();

        // Create audit log
        await AuditLog.create({
            userId: user.id,
            action: AuditAction.LOGIN,
            resource: 'auth',
            details: { method: email ? 'email' : 'username' },
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
        });

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: user.toJSON(),
                accessToken,
                refreshToken,
                forcePasswordChange: user.forcePasswordChange,
            },
        });
    });

    // Change Password (Authenticated)
    static changePassword = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
        const { oldPassword, newPassword } = req.body;
        const userId = req.user!.id;

        const user = await User.findByPk(userId);
        if (!user) {
            throw new AppError('User not found', 404);
        }

        // Verify old password (unless forcibly skipped, but best practice is to require it unless it's a reset flow)
        // For "Force Password Change" on first login, they know the temp password (they used it to login).
        // So requiring oldPassword is good.
        const isPasswordValid = await user.comparePassword(oldPassword);
        if (!isPasswordValid) {
            throw new AppError('Invalid old password', 401);
        }

        // Set new password
        await user.setPassword(newPassword);
        user.forcePasswordChange = false; // Reset flag
        user.refreshToken = undefined; // Optional: invalidate other sessions? Keep current one.
        await user.save();

        // Create audit log
        await AuditLog.create({
            userId: user.id,
            action: AuditAction.UPDATE,
            resource: 'auth',
            details: { action: 'change_password' },
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
        });

        res.json({
            success: true,
            message: 'Password changed successfully',
        });
    });

    // Refresh token
    static refreshToken = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            throw new AppError('Refresh token is required', 400);
        }

        // Verify refresh token
        const decoded = AuthService.verifyRefreshToken(refreshToken);

        // Find user
        const user = await User.findByPk(decoded.userId);
        if (!user || user.refreshToken !== refreshToken) {
            throw new AppError('Invalid refresh token', 401);
        }

        // Generate new tokens
        const newAccessToken = AuthService.generateAccessToken(user.id, user.email, user.role, user.orgId);
        const newRefreshToken = AuthService.generateRefreshToken(user.id);

        // Update refresh token
        user.refreshToken = newRefreshToken;
        await user.save();

        res.json({
            success: true,
            message: 'Token refreshed successfully',
            data: {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
            },
        });
    });

    // Logout
    static logout = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
        if (!req.user) {
            throw new AppError('Not authenticated', 401);
        }

        // Clear refresh token
        await User.update(
            { refreshToken: undefined },
            { where: { id: req.user.id } }
        );

        // Create audit log
        await AuditLog.create({
            userId: req.user.id,
            action: AuditAction.LOGOUT,
            resource: 'auth',
            details: {},
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
        });

        res.json({
            success: true,
            message: 'Logout successful',
        });
    });

    // Forgot password
    static forgotPassword = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
        const { email } = req.body;

        const user = await User.findOne({ where: { email } });
        if (!user) {
            // Don't reveal if user exists
            res.json({
                success: true,
                message: 'If the email exists, a password reset link has been sent',
            });
            return;
        }

        // Generate reset token
        const resetToken = AuthService.generatePasswordResetToken();
        const hashedToken = resetToken; // Use token directly

        // Save hashed token and expiry
        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
        await user.save();

        // Send reset email
        try {
            await EmailService.sendPasswordResetEmail(user.email, resetToken);
        } catch (error) {
            logger.error('Failed to send password reset email:', error);
            throw new AppError('Failed to send password reset email', 500);
        }

        res.json({
            success: true,
            message: 'If the email exists, a password reset link has been sent',
        });
    });

    // Reset password
    static resetPassword = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
        const { token, newPassword } = req.body;

        const hashedToken = token; // Use token directly

        const user = await User.findOne({
            where: {
                resetPasswordToken: hashedToken,
            },
        });

        if (!user || !user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
            throw new AppError('Invalid or expired reset token', 400);
        }

        // Set new password
        await user.setPassword(newPassword);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        user.refreshToken = undefined; // Invalidate all sessions
        await user.save();

        res.json({
            success: true,
            message: 'Password reset successful',
        });
    });

    // Get current user
    static getCurrentUser = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
        if (!req.user) {
            throw new AppError('Not authenticated', 401);
        }

        const user = await User.findByPk(req.user.id, {
            include: [
                {
                    model: Organization,
                    as: 'organization',
                },
            ],
        });

        if (!user) {
            throw new AppError('User not found', 404);
        }

        res.json({
            success: true,
            data: { user: user.toJSON() },
        });
    });
}
