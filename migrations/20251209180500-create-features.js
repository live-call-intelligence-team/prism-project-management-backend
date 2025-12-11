'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('Features', {
            id: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4
            },
            epic_id: {
                type: Sequelize.UUID,
                allowNull: true,
                references: {
                    model: 'Epics',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            },
            project_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'Projects',
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
                type: Sequelize.ENUM('TO_DO', 'IN_PROGRESS', 'IN_REVIEW', 'CLOSED'),
                defaultValue: 'TO_DO'
            },
            priority: {
                type: Sequelize.ENUM('CRITICAL', 'HIGH', 'MEDIUM', 'LOW'),
                defaultValue: 'MEDIUM'
            },
            owner_id: {
                type: Sequelize.UUID,
                allowNull: true,
                references: {
                    model: 'Users',
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
            story_points: {
                type: Sequelize.INTEGER,
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
        await queryInterface.addIndex('Features', ['epic_id']);
        await queryInterface.addIndex('Features', ['project_id']);
        await queryInterface.addIndex('Features', ['owner_id']);
        await queryInterface.addIndex('Features', ['status']);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('Features');
    }
};
