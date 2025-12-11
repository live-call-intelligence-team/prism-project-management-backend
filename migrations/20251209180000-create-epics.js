'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('epics', {
            id: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4
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
                type: Sequelize.STRING,
                allowNull: false
            },
            description: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            key: {
                type: Sequelize.STRING,
                allowNull: true
            },
            status: {
                type: Sequelize.ENUM('OPEN', 'CLOSED', 'ON_HOLD'),
                defaultValue: 'OPEN'
            },
            priority: {
                type: Sequelize.ENUM('CRITICAL', 'HIGH', 'MEDIUM', 'LOW'),
                defaultValue: 'MEDIUM'
            },
            owner_id: {
                type: Sequelize.UUID,
                allowNull: true,
                references: {
                    model: 'users',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            },
            start_date: {
                type: Sequelize.DATE,
                allowNull: true
            },
            end_date: {
                type: Sequelize.DATE,
                allowNull: true
            },
            color: {
                type: Sequelize.STRING,
                allowNull: true
            },
            created_at: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updated_at: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });

        // Indexes
        await queryInterface.addIndex('epics', ['project_id']);
        await queryInterface.addIndex('epics', ['owner_id']);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('epics');
    }
};
