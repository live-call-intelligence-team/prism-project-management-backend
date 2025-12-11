import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';

// Middleware to handle validation errors
export const validate = (req: Request, res: Response, next: NextFunction): void => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        console.error('Validation Error:', JSON.stringify(errors.array(), null, 2));
        res.status(400).json({
            success: false,
            error: 'Validation failed',
            details: errors.array(),
        });
        return;
    }

    next();
};

// Wrapper to run validation chains
export const runValidation = (validations: ValidationChain[]) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        await Promise.all(validations.map((validation) => validation.run(req)));
        validate(req, res, next);
    };
};
