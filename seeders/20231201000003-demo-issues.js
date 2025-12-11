'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const projectId = '660e8400-e29b-41d4-a716-446655440001'; // E-Commerce Platform
        const dev1Id = '550e8400-e29b-41d4-a716-446655440003';
        const dev2Id = '550e8400-e29b-41d4-a716-446655440004';
        const scrumMasterId = '550e8400-e29b-41d4-a716-446655440002';

        // Create a sprint
        const sprintId = '880e8400-e29b-41d4-a716-446655440001';
        await queryInterface.bulkInsert('Sprints', [{
            id: sprintId,
            projectId,
            name: 'Sprint 1 - Foundation',
            goal: 'Set up project foundation and implement core features',
            startDate: new Date('2024-01-15'),
            endDate: new Date('2024-01-29'),
            status: 'ACTIVE',
            capacity: 80,
            velocity: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        }], { ignoreDuplicates: true });

        // Create demo issues
        const issues = [
            {
                id: '990e8400-e29b-41d4-a716-446655440001',
                projectId,
                issueNumber: 1,
                key: 'ECOM-1',
                type: 'EPIC',
                status: 'IN_PROGRESS',
                priority: 'HIGH',
                title: 'User Authentication System',
                description: 'Implement complete user authentication with JWT, registration, login, and password reset',
                assigneeId: dev1Id,
                reporterId: scrumMasterId,
                sprintId,
                parentId: null,
                storyPoints: 13,
                estimatedHours: 40,
                actualHours: 25,
                dueDate: new Date('2024-01-28'),
                labels: ['authentication', 'security'],
                customFields: JSON.stringify({}),
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: '990e8400-e29b-41d4-a716-446655440002',
                projectId,
                issueNumber: 2,
                key: 'ECOM-2',
                type: 'STORY',
                status: 'DONE',
                priority: 'HIGH',
                title: 'User Registration API',
                description: 'Create API endpoint for user registration with email verification',
                assigneeId: dev1Id,
                reporterId: scrumMasterId,
                sprintId,
                parentId: '990e8400-e29b-41d4-a716-446655440001',
                storyPoints: 5,
                estimatedHours: 8,
                actualHours: 10,
                dueDate: new Date('2024-01-20'),
                labels: ['api', 'backend'],
                customFields: JSON.stringify({}),
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: '990e8400-e29b-41d4-a716-446655440003',
                projectId,
                issueNumber: 3,
                key: 'ECOM-3',
                type: 'STORY',
                status: 'IN_PROGRESS',
                priority: 'HIGH',
                title: 'Login API with JWT',
                description: 'Implement login endpoint with JWT token generation',
                assigneeId: dev1Id,
                reporterId: scrumMasterId,
                sprintId,
                parentId: '990e8400-e29b-41d4-a716-446655440001',
                storyPoints: 5,
                estimatedHours: 8,
                actualHours: 6,
                dueDate: new Date('2024-01-22'),
                labels: ['api', 'backend'],
                customFields: JSON.stringify({}),
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: '990e8400-e29b-41d4-a716-446655440004',
                projectId,
                issueNumber: 4,
                key: 'ECOM-4',
                type: 'TASK',
                status: 'TODO',
                priority: 'MEDIUM',
                title: 'Set up Product Database Schema',
                description: 'Design and implement database schema for products, categories, and inventory',
                assigneeId: dev2Id,
                reporterId: scrumMasterId,
                sprintId,
                parentId: null,
                storyPoints: 8,
                estimatedHours: 16,
                actualHours: 0,
                dueDate: new Date('2024-01-26'),
                labels: ['database', 'backend'],
                customFields: JSON.stringify({}),
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: '990e8400-e29b-41d4-a716-446655440005',
                projectId,
                issueNumber: 5,
                key: 'ECOM-5',
                type: 'BUG',
                status: 'TODO',
                priority: 'CRITICAL',
                title: 'Fix Password Reset Email Not Sending',
                description: 'Password reset emails are not being sent to users. Need to debug SMTP configuration',
                assigneeId: dev1Id,
                reporterId: dev2Id,
                sprintId: null, // Backlog
                parentId: null,
                storyPoints: 2,
                estimatedHours: 4,
                actualHours: 0,
                dueDate: new Date('2024-01-18'),
                labels: ['bug', 'email'],
                customFields: JSON.stringify({}),
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ];

        await queryInterface.bulkInsert('Issues', issues, { ignoreDuplicates: true });

        // Add some comments
        const comments = [
            {
                id: 'aa0e8400-e29b-41d4-a716-446655440001',
                issueId: '990e8400-e29b-41d4-a716-446655440002',
                userId: dev1Id,
                content: 'Completed the registration endpoint. Added email validation and password strength checks.',
                mentions: Sequelize.literal('ARRAY[]::uuid[]'),
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: 'aa0e8400-e29b-41d4-a716-446655440002',
                issueId: '990e8400-e29b-41d4-a716-446655440003',
                userId: scrumMasterId,
                content: '@alice Please make sure to add rate limiting to the login endpoint to prevent brute force attacks.',
                mentions: Sequelize.literal(`ARRAY['${dev1Id}']::uuid[]`),
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ];

        await queryInterface.bulkInsert('Comments', comments, { ignoreDuplicates: true });

        // Add work logs
        const workLogs = [
            {
                id: 'bb0e8400-e29b-41d4-a716-446655440001',
                issueId: '990e8400-e29b-41d4-a716-446655440002',
                userId: dev1Id,
                timeSpent: 10,
                date: new Date('2024-01-18'),
                description: 'Implemented user registration API with validation',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: 'bb0e8400-e29b-41d4-a716-446655440002',
                issueId: '990e8400-e29b-41d4-a716-446655440003',
                userId: dev1Id,
                timeSpent: 6,
                date: new Date('2024-01-19'),
                description: 'Working on JWT token generation and validation',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ];

        await queryInterface.bulkInsert('WorkLogs', workLogs, { ignoreDuplicates: true });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('WorkLogs', null, {});
        await queryInterface.bulkDelete('Comments', null, {});
        await queryInterface.bulkDelete('Issues', null, {});
        await queryInterface.bulkDelete('Sprints', null, {});
    }
};
