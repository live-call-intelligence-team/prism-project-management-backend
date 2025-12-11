import { body } from 'express-validator';

export const createCommentValidation = [
    body('content').trim().notEmpty().withMessage('Content is required'),
    body('isClientVisible').optional().isBoolean().withMessage('Visibility must be a boolean'),
];
