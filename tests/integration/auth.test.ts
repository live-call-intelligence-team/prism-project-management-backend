import request from 'supertest';
import app from '../../src/server';
import { User, Organization } from '../../src/models';
import sequelize from '../../src/config/database';

describe('Authentication API', () => {
    beforeAll(async () => {
        // Sync database
        await sequelize.sync({ force: true });
    });

    afterAll(async () => {
        // Clean up
        await sequelize.close();
    });

    describe('POST /api/v1/auth/register', () => {
        it('should register a new user successfully', async () => {
            const response = await request(app)
                .post('/api/v1/auth/register')
                .send({
                    email: 'test@example.com',
                    password: 'password123',
                    firstName: 'Test',
                    lastName: 'User',
                    orgName: 'Test Organization',
                });

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data.user).toHaveProperty('id');
            expect(response.body.data.user.email).toBe('test@example.com');
            expect(response.body.data).toHaveProperty('accessToken');
            expect(response.body.data).toHaveProperty('refreshToken');
        });

        it('should fail with duplicate email', async () => {
            const response = await request(app)
                .post('/api/v1/auth/register')
                .send({
                    email: 'test@example.com',
                    password: 'password123',
                    firstName: 'Test',
                    lastName: 'User',
                    orgName: 'Test Organization',
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('already exists');
        });

        it('should fail with invalid email', async () => {
            const response = await request(app)
                .post('/api/v1/auth/register')
                .send({
                    email: 'invalid-email',
                    password: 'password123',
                    firstName: 'Test',
                    lastName: 'User',
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });

        it('should fail with short password', async () => {
            const response = await request(app)
                .post('/api/v1/auth/register')
                .send({
                    email: 'test2@example.com',
                    password: 'short',
                    firstName: 'Test',
                    lastName: 'User',
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });
    });

    describe('POST /api/v1/auth/login', () => {
        it('should login successfully with valid credentials', async () => {
            const response = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'password123',
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('accessToken');
            expect(response.body.data).toHaveProperty('refreshToken');
            expect(response.body.data.user.email).toBe('test@example.com');
        });

        it('should fail with invalid password', async () => {
            const response = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'wrongpassword',
                });

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('Invalid credentials');
        });

        it('should fail with non-existent user', async () => {
            const response = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: 'nonexistent@example.com',
                    password: 'password123',
                });

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });
    });

    describe('GET /api/v1/auth/me', () => {
        let accessToken: string;

        beforeAll(async () => {
            const response = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'password123',
                });
            accessToken = response.body.data.accessToken;
        });

        it('should get current user with valid token', async () => {
            const response = await request(app)
                .get('/api/v1/auth/me')
                .set('Authorization', `Bearer ${accessToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.user.email).toBe('test@example.com');
        });

        it('should fail without token', async () => {
            const response = await request(app)
                .get('/api/v1/auth/me');

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });

        it('should fail with invalid token', async () => {
            const response = await request(app)
                .get('/api/v1/auth/me')
                .set('Authorization', 'Bearer invalid-token');

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });
    });

    describe('POST /api/v1/auth/logout', () => {
        let accessToken: string;

        beforeAll(async () => {
            const response = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'password123',
                });
            accessToken = response.body.data.accessToken;
        });

        it('should logout successfully', async () => {
            const response = await request(app)
                .post('/api/v1/auth/logout')
                .set('Authorization', `Bearer ${accessToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toContain('Logout successful');
        });
    });
});
