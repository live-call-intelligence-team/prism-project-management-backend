module.exports = {
    up: async (queryInterface, Sequelize) => {
        const bcrypt = require('bcrypt');
        const { v4: uuidv4 } = require('uuid');

        // Hash password for demo accounts
        const hashedPassword = await bcrypt.hash('demo123', 10);

        const users = [
            {
                id: uuidv4(),
                name: 'Admin Demo',
                email: 'admin@demo.com',
                password: hashedPassword,
                role: 'admin',
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: uuidv4(),
                name: 'Sarah Johnson',
                email: 'scrum@demo.com',
                password: hashedPassword,
                role: 'scrum_master',
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: uuidv4(),
                name: 'John Developer',
                email: 'employee1@demo.com',
                password: hashedPassword,
                role: 'employee',
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: uuidv4(),
                name: 'Emily Chen',
                email: 'employee2@demo.com',
                password: hashedPassword,
                role: 'employee',
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: uuidv4(),
                name: 'Michael Brown',
                email: 'employee3@demo.com',
                password: hashedPassword,
                role: 'employee',
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: uuidv4(),
                name: 'Client Demo',
                email: 'client@demo.com',
                password: hashedPassword,
                role: 'client',
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ];

        await queryInterface.bulkInsert('users', users);
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
