'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        // 1. Add columns to 'Sprints' table
        await queryInterface.addColumn('Sprints', 'key', {
            type: Sequelize.STRING,
            allowNull: true // We'll populate this later or leave null for old sprints
        });

        await queryInterface.addColumn('Sprints', 'notes', {
            type: Sequelize.TEXT,
            allowNull: true
        });

        await queryInterface.addColumn('Sprints', 'plannedPoints', {
            type: Sequelize.INTEGER,
            allowNull: true
        });

        await queryInterface.addColumn('Sprints', 'burnDownConfig', {
            type: Sequelize.JSON,
            allowNull: true
        });

        // 2. Create 'SprintMembers' table (Updated to PascalCase for consistency)
        await queryInterface.createTable('SprintMembers', {
            id: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4
            },
            sprintId: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'Sprints',
                    key: 'id'
                },
                onDelete: 'CASCADE'
            },
            userId: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'Users',
                    key: 'id'
                },
                onDelete: 'CASCADE'
            },
            capacityHours: {
                type: Sequelize.INTEGER,
                allowNull: true,
                defaultValue: 0
            },
            role: {
                type: Sequelize.STRING,
                allowNull: true
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });

        // Add unique constraint for sprintId + userId
        await queryInterface.addConstraint('SprintMembers', {
            fields: ['sprintId', 'userId'],
            type: 'unique',
            name: 'unique_sprint_member'
        });
    },

    async down(queryInterface, Sequelize) {
        // Remove columns
        await queryInterface.removeColumn('Sprints', 'key');
        await queryInterface.removeColumn('Sprints', 'notes');
        await queryInterface.removeColumn('Sprints', 'plannedPoints');
        await queryInterface.removeColumn('Sprints', 'burnDownConfig');

        // Drop table
        await queryInterface.dropTable('SprintMembers');
    }
};
