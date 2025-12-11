import { Request, Response } from 'express';
import { Organization } from '../models';

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
        try {
            const organizationId = req.user!.organizationId;

            const organization = await Organization.findByPk(organizationId);

            if (!organization) {
                res.status(404).json({
                    success: false,
                    message: 'Organization not found',
                });
                return;
            }

            // Get settings from organization metadata or use defaults
            const settings: PortalSettings = {
                clientPortalEnabled: organization.settings?.clientPortalEnabled ?? true,
                defaultTaskVisibility: organization.settings?.defaultTaskVisibility ?? false,
                allowClientFileUpload: organization.settings?.allowClientFileUpload ?? true,
                maxFileUploadSizeMB: organization.settings?.maxFileUploadSizeMB ?? 10,
                emailNotificationsEnabled: organization.settings?.emailNotificationsEnabled ?? true,
                requireApprovalForTasks: organization.settings?.requireApprovalForTasks ?? false,
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
        try {
            const organizationId = req.user!.organizationId;
            const {
                clientPortalEnabled,
                defaultTaskVisibility,
                allowClientFileUpload,
                maxFileUploadSizeMB,
                emailNotificationsEnabled,
                requireApprovalForTasks,
            } = req.body;

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
                ...organization.settings,
                clientPortalEnabled,
                defaultTaskVisibility,
                allowClientFileUpload,
                maxFileUploadSizeMB: parseInt(maxFileUploadSizeMB),
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
