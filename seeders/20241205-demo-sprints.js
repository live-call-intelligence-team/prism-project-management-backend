module.exports = {
    up: async (queryInterface, Sequelize) => {
        const { v4: uuidv4 } = require('uuid');

        // Get project
        const [projects] = await queryInterface.sequelize.query(
            "SELECT id FROM \"Projects\" WHERE key = 'ECOM' LIMIT 1"
        );
        const projectId = projects[0]?.id;

        if (!projectId) {
            console.log('Project not found. Please run project seeder first.');
            return;
        }

        const sprints = [
            {
                id: uuidv4(),
                projectId,
                name: 'Sprint 10',
                goal: 'Complete user authentication and profile management',
                startDate: new Date('2024-08-15'),
                endDate: new Date('2024-08-29'),
                status: 'completed',
                createdAt: new Date('2024-08-15'),
                updatedAt: new Date('2024-08-29'),
            },
            {
                id: uuidv4(),
                projectId,
                name: 'Sprint 11',
                goal: 'Implement product catalog and search',
                startDate: new Date('2024-09-01'),
                endDate: new Date('2024-09-15'),
                status: 'completed',
                createdAt: new Date('2024-09-01'),
                updatedAt: new Date('2024-09-15'),
            },
            {
                id: uuidv4(),
                projectId,
                name: 'Sprint 12',
                goal: 'Build shopping cart and checkout flow',
                startDate: new Date('2024-09-16'),
                endDate: new Date('2024-09-30'),
                status: 'active',
                createdAt: new Date('2024-09-16'),
                updatedAt: new Date(),
            },
            {
                id: uuidv4(),
                projectId,
                name: 'Sprint 13',
                goal: 'Payment integration and order management',
                startDate: new Date('2024-10-01'),
                endDate: new Date('2024-10-15'),
                status: 'planning',
                createdAt: new Date('2024-10-01'),
                updatedAt: new Date(),
            },
        ];

        await queryInterface.bulkInsert('Sprints', sprints, { ignoreDuplicates: true });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.bulkDelete('sprints', {
            name: {
                [Sequelize.Op.in]: ['Sprint 10', 'Sprint 11', 'Sprint 12', 'Sprint 13'],
            },
        });
    },
};
