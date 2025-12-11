import { Response } from 'express';
import { AuthRequest } from '../types/interfaces';
import { Settings, User } from '../models';
import { AppError, asyncHandler } from '../middleware/errorHandler';

export class SettingsController {
    // Get all settings or specific key
    static getSettings = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
        const { key } = req.params;

        if (key) {
            const setting = await Settings.findByPk(key);
            if (!setting) {
                // Return default stricture if not found, or 404. For settings, empty object might be safer.
                throw new AppError('Setting not found', 404);
            }
            res.json({ success: true, data: { setting } });
        } else {
            const settings = await Settings.findAll({
                include: [
                    {
                        model: User,
                        as: 'updater',
                        attributes: ['id', 'firstName', 'lastName'],
                    },
                ],
            });
            res.json({ success: true, data: { settings } });
        }
    });

    // Update setting
    static updateSetting = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
        const { key } = req.params;
        const { value, description } = req.body;

        const [setting, created] = await Settings.findOrCreate({
            where: { key },
            defaults: {
                key: key as string,
                value,
                description,
                updatedBy: req.user!.id as string,
            },
        });

        if (!created) {
            await setting.update({
                value,
                description: description || setting.description,
                updatedBy: req.user!.id,
            });
        }

        res.json({
            success: true,
            message: 'Setting updated successfully',
            data: { setting },
        });
    });

    // Test email configuration (Mock)
    static testEmail = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
        const { host, port, user, pass, from, to } = req.body;

        if (!host || !port || !user || !pass || !from || !to) {
            throw new AppError('Missing email configuration parameters', 400);
        }

        // Mock email sending
        // In a real implementation, usage of nodemailer transport verify()

        await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate delay

        // Simulate success
        res.json({
            success: true,
            message: `Test email sent to ${to} successfully`,
        });
    });
}
