import request from 'supertest';
import app from '../../src/server';
import { Project, User, Organization } from '../../src/models';
import sequelize from '../../src/config/database';

describe('Project API', () => {
    let accessToken: string;
    let userId: string;
    let orgId: string;

    beforeAll(async () => {
        await sequelize.sync({ force: true });

        // Create organization
        const org = await Organization.create({
            name: 'Test Org',
            subscriptionPlan: 'PREMIUM',
            maxUsers: 50,
        });
        orgId = org.id;

        // Create user
        const user = await User.create({
            email: 'admin@test.com',
            passwordHash: '$2a$10$abcdefghijklmnopqrstuv', // hashed 'password123'
            firstName: 'Admin',
            lastName: 'User',
            role: 'ADMIN',
            orgId: org.id,
        });
        userId = user.id;

        // Login to get token
        const response = await request(app)
            .post('/api/v1/auth/login')
            .send({
                email: 'admin@test.com',
                password: 'password123',
            });

        accessToken = response.body.data.accessToken;
    });

    afterAll(async () => {
        await sequelize.close();
    });

    describe('POST /api/v1/projects', () => {
        it('should create a new project', async () => {
            const response = await request(app)
                .post('/api/v1/projects')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    name: 'Test Project',
                    key: 'TEST',
                    description: 'A test project',
                    leadId: userId,
                });

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data.project.name).toBe('Test Project');
            expect(response.body.data.project.key).toBe('TEST');
        });

        it('should fail with duplicate project key', async () => {
            const response = await request(app)
                .post('/api/v1/projects')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    name: 'Another Project',
                    key: 'TEST',
                    description: 'Duplicate key',
                    leadId: userId,
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });
    });

    describe('GET /api/v1/projects', () => {
        it('should list all projects', async () => {
            const response = await request(app)
                .get('/api/v1/projects')
                .set('Authorization', `Bearer ${accessToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data.projects)).toBe(true);
        });

        it('should support pagination', async () => {
            const response = await request(app)
                .get('/api/v1/projects?page=1&limit=5')
                .set('Authorization', `Bearer ${accessToken}`);

            expect(response.status).toBe(200);
            expect(response.body.data.pagination).toBeDefined();
            expect(response.body.data.pagination.page).toBe(1);
            expect(response.body.data.pagination.limit).toBe(5);
        });
    });
});
