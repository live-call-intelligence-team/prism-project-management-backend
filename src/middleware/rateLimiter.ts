import rateLimit from 'express-rate-limit';

// Note: Using memory store for rate limiting
// For production, configure Redis properly or use a distributed store

// Strict rate limiter for sensitive endpoints
export const strictLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per window
    message: 'Too many requests from this IP, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
});

// Authentication rate limiter
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 2000, // Relaxed for development
    skipSuccessfulRequests: true, // Don't count successful logins
    message: 'Too many authentication attempts, please try again later',
});

// API rate limiter
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5000,
    message: 'Too many requests, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
});

// Upload rate limiter
export const uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10,
    message: 'Too many upload requests, please try again later',
});

// Create custom rate limiter
export const createRateLimiter = (windowMs: number, max: number) => {
    return rateLimit({
        windowMs,
        max,
        standardHeaders: true,
        legacyHeaders: false,
    });
};

