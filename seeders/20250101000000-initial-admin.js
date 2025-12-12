'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
    async up(queryInterface, Sequelize) {
        // Check if Admin already exists
        const adminEmail = 'admin@projecthub.com';
        const existingUsers = await queryInterface.sequelize.query(
            `SELECT id FROM "Users" WHERE email = '${adminEmail}'`,
            { type: queryInterface.sequelize.QueryTypes.SELECT }
        );

        if (existingUsers.length > 0) {
            console.log('✅ Admin user already exists. Skipping seed.');
            return;
        }

        console.log('🌱 Seeding Initial Admin User...');

        // Hash password
        const passwordHash = await bcrypt.hash('password123', 10);

        // Get or Create Organization
        let orgId;
        const [organizations] = await queryInterface.sequelize.query(
            `SELECT id FROM "Organizations" LIMIT 1;`
        );

        if (organizations.length > 0) {
            orgId = organizations[0].id;
        } else {
            const [newOrg] = await queryInterface.sequelize.query(
                `INSERT INTO "Organizations" (id, name, "subscriptionPlan", "maxUsers", "ssoEnabled", settings, "createdAt", "updatedAt")
                 VALUES (gen_random_uuid(), 'Primary Organization', 'ENTERPRISE', 100, false, '{}', NOW(), NOW())
                 RETURNING id;`
            );
            orgId = newOrg[0].id;
        }

        // Create Admin
        await queryInterface.bulkInsert('Users', [{
            id: Sequelize.literal('gen_random_uuid()'),
            email: adminEmail,
            passwordHash: passwordHash,
            firstName: 'System',
            lastName: 'Admin',
            role: 'ADMIN',
            orgId: orgId,
            isActive: true,
            mfaEnabled: false,
            profileData: JSON.stringify({}),
            createdAt: new Date(),
            updatedAt: new Date(),
        }]);

        console.log('✅ Admin user created: admin@projecthub.com / password123');
    },

    async down(queryInterface, Sequelize) {
        // No down action for initial seed protection
    }
};
