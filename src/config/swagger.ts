import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Application } from 'express';
import { appConfig } from './app';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Project Management System API',
            version: '1.0.0',
            description: 'A comprehensive project management and issue tracking system API with role-based access control',
            contact: {
                name: 'API Support',
                email: 'support@projectmanagement.com',
            },
            license: {
                name: 'ISC',
                url: 'https://opensource.org/licenses/ISC',
            },
        },
        servers: [
            {
                url: `http://localhost:${appConfig.port}/api/${appConfig.apiVersion}`,
                description: 'Development server',
            },
            {
                url: `https://api.projectmanagement.com/api/${appConfig.apiVersion}`,
                description: 'Production server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Enter your JWT token',
                },
            },
            schemas: {
                Error: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: false,
                        },
                        message: {
                            type: 'string',
                            example: 'Error message',
                        },
                        errors: {
                            type: 'array',
                            items: {
                                type: 'object',
                            },
                        },
                    },
                },
                User: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            format: 'uuid',
                        },
                        email: {
                            type: 'string',
                            format: 'email',
                        },
                        firstName: {
                            type: 'string',
                        },
                        lastName: {
                            type: 'string',
                        },
                        role: {
                            type: 'string',
                            enum: ['ADMIN', 'SCRUM_MASTER', 'EMPLOYEE', 'CLIENT'],
                        },
                        orgId: {
                            type: 'string',
                            format: 'uuid',
                        },
                        isActive: {
                            type: 'boolean',
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                        },
                        updatedAt: {
                            type: 'string',
                            format: 'date-time',
                        },
                    },
                },
                Project: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            format: 'uuid',
                        },
                        name: {
                            type: 'string',
                        },
                        key: {
                            type: 'string',
                            example: 'PROJ',
                        },
                        description: {
                            type: 'string',
                        },
                        status: {
                            type: 'string',
                            enum: ['ACTIVE', 'ON_HOLD', 'COMPLETED', 'ARCHIVED'],
                        },
                        visibility: {
                            type: 'string',
                            enum: ['PUBLIC', 'PRIVATE'],
                        },
                        leadId: {
                            type: 'string',
                            format: 'uuid',
                        },
                        budget: {
                            type: 'number',
                            format: 'decimal',
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                        },
                    },
                },
                Issue: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            format: 'uuid',
                        },
                        key: {
                            type: 'string',
                            example: 'PROJ-123',
                        },
                        type: {
                            type: 'string',
                            enum: ['TASK', 'BUG', 'STORY', 'EPIC', 'SUBTASK'],
                        },
                        status: {
                            type: 'string',
                            enum: ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'BLOCKED'],
                        },
                        priority: {
                            type: 'string',
                            enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
                        },
                        title: {
                            type: 'string',
                        },
                        description: {
                            type: 'string',
                        },
                        assigneeId: {
                            type: 'string',
                            format: 'uuid',
                        },
                        reporterId: {
                            type: 'string',
                            format: 'uuid',
                        },
                        storyPoints: {
                            type: 'integer',
                        },
                        estimatedHours: {
                            type: 'number',
                            format: 'decimal',
                        },
                        actualHours: {
                            type: 'number',
                            format: 'decimal',
                        },
                        labels: {
                            type: 'array',
                            items: {
                                type: 'string',
                            },
                        },
                    },
                },
                Sprint: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            format: 'uuid',
                        },
                        name: {
                            type: 'string',
                        },
                        goal: {
                            type: 'string',
                        },
                        startDate: {
                            type: 'string',
                            format: 'date',
                        },
                        endDate: {
                            type: 'string',
                            format: 'date',
                        },
                        status: {
                            type: 'string',
                            enum: ['PLANNED', 'ACTIVE', 'COMPLETED'],
                        },
                        capacity: {
                            type: 'integer',
                        },
                        velocity: {
                            type: 'integer',
                        },
                    },
                },
                Pagination: {
                    type: 'object',
                    properties: {
                        page: {
                            type: 'integer',
                            example: 1,
                        },
                        limit: {
                            type: 'integer',
                            example: 10,
                        },
                        totalPages: {
                            type: 'integer',
                            example: 5,
                        },
                        totalItems: {
                            type: 'integer',
                            example: 50,
                        },
                    },
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
        tags: [
            {
                name: 'Authentication',
                description: 'User authentication and authorization endpoints',
            },
            {
                name: 'Users',
                description: 'User management endpoints',
            },
            {
                name: 'Projects',
                description: 'Project management endpoints',
            },
            {
                name: 'Issues',
                description: 'Issue tracking endpoints',
            },
            {
                name: 'Sprints',
                description: 'Sprint management endpoints',
            },
        ],
    },
    apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

const swaggerSpec = swaggerJsdoc(options);

export const setupSwagger = (app: Application): void => {
    // Swagger UI
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: 'Project Management API Docs',
    }));

    // JSON spec
    app.get('/api-docs.json', (_req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(swaggerSpec);
    });
};

export default swaggerSpec;
