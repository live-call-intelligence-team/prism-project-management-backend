module.exports = {
    up: async (queryInterface, Sequelize) => {
        const { v4: uuidv4 } = require('uuid');

        // Get admin user for createdBy
        const [users] = await queryInterface.sequelize.query(
            "SELECT id FROM users WHERE email = 'admin@demo.com' LIMIT 1"
        );
        const adminId = users[0]?.id;

        if (!adminId) {
            console.log('Admin user not found. Please run user seeder first.');
            return;
        }

        const projects = [
            {
                id: uuidv4(),
                key: 'ECOM',
                name: 'E-Commerce Platform Redesign',
                description: 'Complete redesign of the e-commerce platform with modern UI/UX',
                status: 'active',
                createdBy: adminId,
                createdAt: new Date('2024-09-01'),
                updatedAt: new Date(),
            },
            {
                id: uuidv4(),
                key: 'MOBILE',
                name: 'Mobile App Development',
                description: 'Native mobile app for iOS and Android',
                status: 'active',
                createdBy: adminId,
                createdAt: new Date('2024-10-01'),
                updatedAt: new Date(),
            },
            {
                id: uuidv4(),
                key: 'API',
                name: 'API Integration',
                description: 'Integration with third-party payment and shipping APIs',
                status: 'completed',
                createdBy: adminId,
                createdAt: new Date('2024-08-01'),
                updatedAt: new Date(),
            },
        ];

        await queryInterface.bulkInsert('projects', projects);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.bulkDelete('projects', {
            key: {
                [Sequelize.Op.in]: ['ECOM', 'MOBILE', 'API'],
            },
        });
    },
};
