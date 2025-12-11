import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/jwt';
import { AuthRequest, JwtPayload } from '../types/interfaces';
import { User } from '../models';

export const authenticate = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({
                success: false,
                error: 'No token provided',
            });
            return;
        }

        const token = authHeader.substring(7);

        try {
            const decoded = jwt.verify(token, jwtConfig.accessSecret) as JwtPayload;

            // Verify user still exists and is active
            const user = await User.findByPk(decoded.userId);
            if (!user || !user.isActive) {
                res.status(401).json({
                    success: false,
                    error: 'User not found or inactive',
                });
                return;
            }

            req.user = {
                id: decoded.userId,
                email: decoded.email,
                role: decoded.role,
                orgId: decoded.orgId,
            };

            next();
        } catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                res.status(401).json({
                    success: false,
                    error: 'Token expired',
                });
                return;
            }

            res.status(401).json({
                success: false,
                error: 'Invalid token',
            });
            return;
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Authentication error',
        });
    }
};

export const optionalAuth = async (
    req: AuthRequest,
    _res: Response,
    next: NextFunction
): Promise<void> => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        next();
        return;
    }

    try {
        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, jwtConfig.accessSecret) as JwtPayload;

        req.user = {
            id: decoded.userId,
            email: decoded.email,
            role: decoded.role,
            orgId: decoded.orgId,
        };
    } catch (error) {
        // Ignore errors for optional auth
    }

    next();
};

export const isAdmin = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): void => {
    if (req.user && req.user.role === 'ADMIN') {
        next();
    } else {
        res.status(403).json({
            success: false,
            error: 'Access denied. Admin role required.',
        });
    }
};

export const isScrumMaster = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): void => {
    if (req.user && (req.user.role === 'SCRUM_MASTER' || req.user.role === 'ADMIN')) {
        next();
    } else {
        res.status(403).json({
            success: false,
            error: 'Access denied. Scrum Master role required.',
        });
    }
};

export const isAdminOrScrumMaster = isScrumMaster;
