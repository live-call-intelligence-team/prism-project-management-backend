import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import http from 'http';
import path from 'path';

// Import configuration
import sequelize, { testConnection } from './config/database';
import { appConfig } from './config/app';
import { setupSwagger } from './config/swagger';

// Import middleware
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { apiLimiter } from './middleware/rateLimiter';

// Import routes
import routes from './routes';

// Import models to initialize relationships
import './models';

// Import logger
import logger from './utils/logger';

// Load environment variables
dotenv.config();

// Create Express app
const app: Application = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
    cors: {
        origin: appConfig.corsOrigin,
        methods: ['GET', 'POST'],
        credentials: true
    },
});

// Middleware
app.set('trust proxy', 1); // Trust first proxy (Render/Nginx)
app.use(helmet()); // Security headers
app.use(cors({
    origin: appConfig.corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
})); // CORS
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(morgan('combined')); // HTTP request logging

// Serve static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Apply rate limiting to all routes
app.use(apiLimiter);

// Setup Swagger documentation
setupSwagger(app);

// Health check endpoint
app.get('/health', (_req, res) => {
    res.json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(),
    });
});

// API routes
app.use(`/api/${appConfig.apiVersion}`, routes);

// Socket.io connection handling
io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id}`);

    // Join room for user-specific notifications
    socket.on('join', (userId: string) => {
        socket.join(`user:${userId}`);
        logger.info(`User ${userId} joined their room`);
    });

    // Join room for project-specific updates
    socket.on('joinProject', (projectId: string) => {
        socket.join(`project:${projectId}`);
        logger.info(`Socket ${socket.id} joined project ${projectId}`);
    });

    // Leave project room
    socket.on('leaveProject', (projectId: string) => {
        socket.leave(`project:${projectId}`);
        logger.info(`Socket ${socket.id} left project ${projectId}`);
    });

    socket.on('disconnect', () => {
        logger.info(`Socket disconnected: ${socket.id}`);
    });
});

// Make io accessible to routes
app.set('io', io);

// 404 handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

// Database connection and server start
const startServer = async (): Promise<void> => {
    try {
        // Test database connection
        await testConnection();

        // Sync database (in development only)
        if (appConfig.env === 'development') {
            await sequelize.sync();
            logger.info('✅ Database synchronized');
        }

        // Start server
        server.listen(appConfig.port, () => {
            logger.info(`🚀 Server running on port ${appConfig.port}`);
            logger.info(`📝 Environment: ${appConfig.env}`);
            logger.info(`🔗 API: http://localhost:${appConfig.port}/api/${appConfig.apiVersion}`);
        });
    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: Error) => {
    logger.error('Unhandled Rejection:', reason);
    process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
    logger.error('Uncaught Exception:', error);
    process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM received, closing server gracefully');
    server.close(() => {
        logger.info('Server closed');
        sequelize.close();
        process.exit(0);
    });
});

// Start the server
startServer();

export { io };
export default app;
