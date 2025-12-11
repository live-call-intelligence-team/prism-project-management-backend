module.exports = {
    up: async (queryInterface, Sequelize) => {
        const bcrypt = require('bcryptjs');
        const { v4: uuidv4 } = require('uuid');

        // Get organization
        const [orgs] = await queryInterface.sequelize.query(
            "SELECT id FROM \"Organizations\" LIMIT 1"
        );
        const orgId = orgs[0]?.id;

        if (!orgId) {
            console.log('Organization not found. Please run organization seeder first.');
            return;
        }

        // Hash password for demo accounts
        const passwordHash = await bcrypt.hash('demo123', 10);

        const users = [
            {
                id: uuidv4(),
                firstName: 'Admin',
                lastName: 'Demo',
                email: 'admin@demo.com',
                passwordHash: passwordHash,
                role: 'ADMIN',
                orgId: orgId,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: uuidv4(),
                firstName: 'Sarah',
                lastName: 'Johnson',
                email: 'scrum@demo.com',
                passwordHash: passwordHash,
                role: 'SCRUM_MASTER',
                orgId: orgId,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: uuidv4(),
                firstName: 'John',
                lastName: 'Developer',
                email: 'employee1@demo.com',
                passwordHash: passwordHash,
                role: 'EMPLOYEE',
                orgId: orgId,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: uuidv4(),
                firstName: 'Emily',
                lastName: 'Chen',
                email: 'employee2@demo.com',
                passwordHash: passwordHash,
                role: 'EMPLOYEE',
                orgId: orgId,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: uuidv4(),
                firstName: 'Michael',
                lastName: 'Brown',
                email: 'employee3@demo.com',
                passwordHash: passwordHash,
                role: 'EMPLOYEE',
                orgId: orgId,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: uuidv4(),
                firstName: 'Client',
                lastName: 'Demo',
                email: 'client@demo.com',
                passwordHash: passwordHash,
                role: 'CLIENT',
                orgId: orgId,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ];

        await queryInterface.bulkInsert('Users', users, { ignoreDuplicates: true });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.bulkDelete('users', {
            email: {
                [Sequelize.Op.in]: [
                    'admin@demo.com',
                    'scrum@demo.com',
                    'employee1@demo.com',
                    'employee2@demo.com',
                    'employee3@demo.com',
                    'client@demo.com',
                ],
            },
        });
    },
};
