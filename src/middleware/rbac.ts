import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/interfaces';
import { UserRole } from '../types/enums';
import { Permission } from '../models';

// Check if user has required role
export const requireRole = (...roles: UserRole[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'Authentication required',
            });
            return;
        }

        if (!roles.includes(req.user.role)) {
            res.status(403).json({
                success: false,
                error: 'Insufficient permissions',
            });
            return;
        }

        next();
    };
};

// Check if user has permission for specific resource and action
export const checkPermission = (resource: string, action: string) => {
    return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'Authentication required',
            });
            return;
        }

        try {
            // Admin has all permissions
            if (req.user.role === UserRole.ADMIN) {
                next();
                return;
            }

            // Check permission in database
            const permission = await Permission.findOne({
                where: {
                    role: req.user.role,
                    resource,
                },
            });

            if (!permission || !permission.actions.includes(action)) {
                res.status(403).json({
                    success: false,
                    error: 'Insufficient permissions for this action',
                });
                return;
            }

            next();
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Permission check failed',
            });
        }
    };
};

// Check if user is admin
export const isAdmin = requireRole(UserRole.ADMIN);

// Check if user is admin or scrum master
export const isAdminOrScrumMaster = requireRole(UserRole.ADMIN, UserRole.SCRUM_MASTER);

// Check if user belongs to the same organization
export const checkOrgAccess = (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
        res.status(401).json({
            success: false,
            error: 'Authentication required',
        });
        return;
    }

    const orgId = req.params.orgId || req.body.orgId;

    if (orgId && orgId !== req.user.orgId && req.user.role !== UserRole.ADMIN) {
        res.status(403).json({
            success: false,
            error: 'Access denied to this organization',
        });
        return;
    }

    next();
};
