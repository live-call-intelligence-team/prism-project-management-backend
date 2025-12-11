import { Request, Response } from 'express';
import { Organization } from '../models';
import { AuthRequest } from '../types/interfaces';

interface PortalSettings {
    clientPortalEnabled: boolean;
    defaultTaskVisibility: boolean;
    allowClientFileUpload: boolean;
    maxFileUploadSizeMB: number;
    emailNotificationsEnabled: boolean;
    requireApprovalForTasks: boolean;
}

export class PortalSettingsController {
    /**
     * Get portal settings for organization
     */
    async getSettings(req: Request, res: Response): Promise<void> {
        const authReq = req as AuthRequest;
        try {
            const organizationId = authReq.user!.orgId;

            const organization = await Organization.findByPk(organizationId);

            if (!organization) {
                res.status(404).json({
                    success: false,
                    message: 'Organization not found',
                });
                return;
            }

            // Get settings from organization metadata or use defaults
            const orgSettings = organization.settings as any;
            const settings: PortalSettings = {
                clientPortalEnabled: orgSettings?.clientPortalEnabled ?? true,
                defaultTaskVisibility: orgSettings?.defaultTaskVisibility ?? false,
                allowClientFileUpload: orgSettings?.allowClientFileUpload ?? true,
                maxFileUploadSizeMB: orgSettings?.maxFileUploadSizeMB ?? 10,
                emailNotificationsEnabled: orgSettings?.emailNotificationsEnabled ?? true,
                requireApprovalForTasks: orgSettings?.requireApprovalForTasks ?? false,
            };

            res.json({
                success: true,
                data: {
                    settings,
                },
            });
        } catch (error: any) {
            console.error('Get portal settings error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch portal settings',
                error: error.message,
            });
        }
    }

    /**
     * Update portal settings
     */
    async updateSettings(req: Request, res: Response): Promise<void> {
        const authReq = req as AuthRequest;
        try {
            const organizationId = authReq.user!.orgId;
            const {
                clientPortalEnabled,
                defaultTaskVisibility,
                allowClientFileUpload,
                maxFileUploadSizeMB,
                emailNotificationsEnabled,
                requireApprovalForTasks,
            } = req.body as PortalSettings;

            const organization = await Organization.findByPk(organizationId);

            if (!organization) {
                res.status(404).json({
                    success: false,
                    message: 'Organization not found',
                });
                return;
            }

            // Update settings
            const updatedSettings = {
                ...(organization.settings as any),
                clientPortalEnabled,
                defaultTaskVisibility,
                allowClientFileUpload,
                maxFileUploadSizeMB: Number(maxFileUploadSizeMB),
                emailNotificationsEnabled,
                requireApprovalForTasks,
            };

            await organization.update({
                settings: updatedSettings,
            });

            res.json({
                success: true,
                message: 'Portal settings updated successfully',
                data: {
                    settings: updatedSettings,
                },
            });
        } catch (error: any) {
            console.error('Update portal settings error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update portal settings',
                error: error.message,
            });
        }
    }
}

export const portalSettingsController = new PortalSettingsController();
