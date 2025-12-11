import { Request, Response, NextFunction } from 'express';

interface ErrorResponse {
    success: boolean;
    error: string;
    details?: any;
    stack?: string;
}

export class AppError extends Error {
    public statusCode: number;
    public isOperational: boolean;

    constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;

        Error.captureStackTrace(this, this.constructor);
    }
}

export const errorHandler = (
    err: Error | AppError,
    _req: Request,
    res: Response,
    _next: NextFunction
): void => {
    let statusCode = 500;
    let message = 'Internal server error';
    let isOperational = false;

    if (err instanceof AppError) {
        statusCode = err.statusCode;
        message = err.message;
        isOperational = err.isOperational;
    }

    const errorResponse: ErrorResponse = {
        success: false,
        error: message,
    };

    // Include stack trace in development
    if (process.env.NODE_ENV === 'development') {
        errorResponse.stack = err.stack;
        errorResponse.details = err;
    }

    // Log error
    console.error('Error:', {
        message: err.message,
        statusCode,
        stack: err.stack,
        isOperational,
    });

    res.status(statusCode).json(errorResponse);
};

// 404 handler
export const notFoundHandler = (req: Request, res: Response): void => {
    res.status(404).json({
        success: false,
        error: `Route ${req.originalUrl} not found`,
    });
};

// Async handler wrapper
export const asyncHandler = (fn: Function) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
