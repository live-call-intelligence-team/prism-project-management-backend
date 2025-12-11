'use strict';
const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Create sample organization
        const orgId = '550e8400-e29b-41d4-a716-446655440000';
        await queryInterface.bulkInsert('Organizations', [{
            id: orgId,
            name: 'Demo Organization',
            subscriptionPlan: 'PREMIUM',
            subscriptionExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
            maxUsers: 50,
            ssoEnabled: false,
            settings: JSON.stringify({
                timezone: 'UTC',
                dateFormat: 'YYYY-MM-DD',
                workingDays: [1, 2, 3, 4, 5],
            }),
            createdAt: new Date(),
            updatedAt: new Date(),
        }], { ignoreDuplicates: true });

        // Hash password for demo users
        const passwordHash = await bcrypt.hash('password123', 10);

        // Create demo users
        const users = [
            {
                id: '550e8400-e29b-41d4-a716-446655440001',
                email: 'admin@demo.com',
                passwordHash,
                firstName: 'Admin',
                lastName: 'User',
                role: 'ADMIN',
                orgId,
                profileData: JSON.stringify({ bio: 'System Administrator' }),
                mfaEnabled: false,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: '550e8400-e29b-41d4-a716-446655440002',
                email: 'scrummaster@demo.com',
                passwordHash,
                firstName: 'John',
                lastName: 'Scrum',
                role: 'SCRUM_MASTER',
                orgId,
                profileData: JSON.stringify({ bio: 'Scrum Master' }),
                mfaEnabled: false,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: '550e8400-e29b-41d4-a716-446655440003',
                email: 'developer1@demo.com',
                passwordHash,
                firstName: 'Alice',
                lastName: 'Developer',
                role: 'EMPLOYEE',
                orgId,
                profileData: JSON.stringify({ bio: 'Senior Developer' }),
                mfaEnabled: false,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: '550e8400-e29b-41d4-a716-446655440004',
                email: 'developer2@demo.com',
                passwordHash,
                firstName: 'Bob',
                lastName: 'Engineer',
                role: 'EMPLOYEE',
                orgId,
                profileData: JSON.stringify({ bio: 'Full Stack Developer' }),
                mfaEnabled: false,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: '550e8400-e29b-41d4-a716-446655440005',
                email: 'client@demo.com',
                passwordHash,
                firstName: 'Client',
                lastName: 'User',
                role: 'CLIENT',
                orgId,
                profileData: JSON.stringify({ bio: 'External Client' }),
                mfaEnabled: false,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ];

        await queryInterface.bulkInsert('Users', users, { ignoreDuplicates: true });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('Users', null, {});
        await queryInterface.bulkDelete('Organizations', null, {});
    }
};
