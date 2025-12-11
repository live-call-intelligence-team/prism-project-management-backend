'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('milestones', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true,
                allowNull: false
            },
            project_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'projects',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            name: {
                type: Sequelize.STRING(255),
                allowNull: false
            },
            description: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            due_date: {
                type: Sequelize.DATE,
                allowNull: true
            },
            status: {
                type: Sequelize.STRING(50),
                defaultValue: 'UPCOMING',
                allowNull: false
            },
            tasks_total: {
                type: Sequelize.INTEGER,
                defaultValue: 0,
                allowNull: false
            },
            tasks_completed: {
                type: Sequelize.INTEGER,
                defaultValue: 0,
                allowNull: false
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            }
        });

        // Add index on project_id for faster queries
        await queryInterface.addIndex('milestones', ['project_id']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('milestones');
    }
};
