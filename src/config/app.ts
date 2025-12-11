import dotenv from 'dotenv';

dotenv.config();

export const appConfig = {
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '5000'),
    apiVersion: process.env.API_VERSION || 'v1',
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
};

export const securityConfig = {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '10'),
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
    rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
};

export const uploadConfig = {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB
    uploadDir: process.env.UPLOAD_DIR || './uploads',
    allowedFileTypes: (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/gif,application/pdf').split(','),
};

export const mfaConfig = {
    appName: process.env.MFA_APP_NAME || 'ProjectManagement',
    issuer: process.env.MFA_ISSUER || 'ProjectManagement',
};
