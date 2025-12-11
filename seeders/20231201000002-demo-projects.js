'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const orgId = '550e8400-e29b-41d4-a716-446655440000';
        const adminId = '550e8400-e29b-41d4-a716-446655440001';
        const scrumMasterId = '550e8400-e29b-41d4-a716-446655440002';
        const dev1Id = '550e8400-e29b-41d4-a716-446655440003';
        const dev2Id = '550e8400-e29b-41d4-a716-446655440004';

        // Create demo projects
        const projects = [
            {
                id: '660e8400-e29b-41d4-a716-446655440001',
                name: 'E-Commerce Platform',
                key: 'ECOM',
                description: 'Building a modern e-commerce platform with React and Node.js',
                orgId,
                leadId: scrumMasterId,
                settings: JSON.stringify({
                    issueTypes: ['TASK', 'BUG', 'STORY', 'EPIC'],
                    defaultAssignee: null,
                }),
                status: 'ACTIVE',
                visibility: 'PRIVATE',
                startDate: new Date('2024-01-01'),
                endDate: new Date('2024-12-31'),
                budget: 150000.00,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: '660e8400-e29b-41d4-a716-446655440002',
                name: 'Mobile App Development',
                key: 'MOBILE',
                description: 'Cross-platform mobile application using React Native',
                orgId,
                leadId: scrumMasterId,
                settings: JSON.stringify({
                    issueTypes: ['TASK', 'BUG', 'STORY'],
                    defaultAssignee: null,
                }),
                status: 'ACTIVE',
                visibility: 'PRIVATE',
                startDate: new Date('2024-02-01'),
                endDate: new Date('2024-08-31'),
                budget: 80000.00,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ];

        await queryInterface.bulkInsert('Projects', projects);

        // Add project members
        const projectMembers = [
            // E-Commerce Platform members
            {
                id: '770e8400-e29b-41d4-a716-446655440001',
                projectId: '660e8400-e29b-41d4-a716-446655440001',
                userId: scrumMasterId,
                role: 'LEAD',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: '770e8400-e29b-41d4-a716-446655440002',
                projectId: '660e8400-e29b-41d4-a716-446655440001',
                userId: dev1Id,
                role: 'DEVELOPER',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: '770e8400-e29b-41d4-a716-446655440003',
                projectId: '660e8400-e29b-41d4-a716-446655440001',
                userId: dev2Id,
                role: 'DEVELOPER',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            // Mobile App members
            {
                id: '770e8400-e29b-41d4-a716-446655440004',
                projectId: '660e8400-e29b-41d4-a716-446655440002',
                userId: scrumMasterId,
                role: 'LEAD',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: '770e8400-e29b-41d4-a716-446655440005',
                projectId: '660e8400-e29b-41d4-a716-446655440002',
                userId: dev1Id,
                role: 'DEVELOPER',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ];

        await queryInterface.bulkInsert('ProjectMembers', projectMembers);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('ProjectMembers', null, {});
        await queryInterface.bulkDelete('Projects', null, {});
    }
};
