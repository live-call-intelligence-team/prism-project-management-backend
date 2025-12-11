'use strict';

const bcrypt = require('bcryptjs');

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Hash password for all users
        const hashedPassword = await bcrypt.hash('password123', 10);

        // Get the first organization (or create one if needed)
        const [organizations] = await queryInterface.sequelize.query(
            `SELECT id FROM "Organizations" LIMIT 1;`
        );

        let orgId;
        if (organizations.length > 0) {
            orgId = organizations[0].id;
        } else {
            // Create a default organization
            const [newOrg] = await queryInterface.sequelize.query(
                `INSERT INTO "Organizations" (id, name, "subscriptionPlan", "maxUsers", "ssoEnabled", settings, "createdAt", "updatedAt")
         VALUES (gen_random_uuid(), 'Demo Organization', 'ENTERPRISE', 100, false, '{}', NOW(), NOW())
         RETURNING id;`
            );
            orgId = newOrg[0].id;
        }

        // Create test users
        const users = [
            {
                id: Sequelize.literal('gen_random_uuid()'),
                email: 'admin@projecthub.com',
                passwordHash: hashedPassword,
                firstName: 'Admin',
                lastName: 'User',
                role: 'ADMIN',
                orgId: orgId,
                isActive: true,
                mfaEnabled: false,
                profileData: JSON.stringify({}),
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: Sequelize.literal('gen_random_uuid()'),
                email: 'scrum@projecthub.com',
                passwordHash: hashedPassword,
                firstName: 'Scrum',
                lastName: 'Master',
                role: 'SCRUM_MASTER',
                orgId: orgId,
                isActive: true,
                mfaEnabled: false,
                profileData: JSON.stringify({}),
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: Sequelize.literal('gen_random_uuid()'),
                email: 'employee@projecthub.com',
                passwordHash: hashedPassword,
                firstName: 'John',
                lastName: 'Employee',
                role: 'EMPLOYEE',
                orgId: orgId,
                isActive: true,
                mfaEnabled: false,
                profileData: JSON.stringify({}),
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: Sequelize.literal('gen_random_uuid()'),
                email: 'client@projecthub.com',
                passwordHash: hashedPassword,
                firstName: 'Client',
                lastName: 'User',
                role: 'CLIENT',
                orgId: orgId,
                isActive: true,
                mfaEnabled: false,
                profileData: JSON.stringify({}),
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ];

        await queryInterface.bulkInsert('Users', users, { ignoreDuplicates: true });

        console.log('✅ Test users created successfully!');
        console.log('📧 Login credentials:');
        console.log('   Admin:        admin@projecthub.com / password123');
        console.log('   Scrum Master: scrum@projecthub.com / password123');
        console.log('   Employee:     employee@projecthub.com / password123');
        console.log('   Client:       client@projecthub.com / password123');
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.bulkDelete('Users', {
            email: {
                [Sequelize.Op.in]: [
                    'admin@projecthub.com',
                    'scrum@projecthub.com',
                    'employee@projecthub.com',
                    'client@projecthub.com',
                ],
            },
        });
    },
};
