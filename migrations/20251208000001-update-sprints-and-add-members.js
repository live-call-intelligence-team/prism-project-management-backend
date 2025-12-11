'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        // 1. Add columns to 'sprints' table
        await queryInterface.addColumn('sprints', 'key', {
            type: Sequelize.STRING,
            allowNull: true // We'll populate this later or leave null for old sprints
        });

        await queryInterface.addColumn('sprints', 'notes', {
            type: Sequelize.TEXT,
            allowNull: true
        });

        await queryInterface.addColumn('sprints', 'plannedPoints', {
            type: Sequelize.INTEGER,
            allowNull: true
        });

        await queryInterface.addColumn('sprints', 'burnDownConfig', {
            type: Sequelize.JSON,
            allowNull: true
        });

        // 2. Create 'sprint_members' table
        await queryInterface.createTable('sprint_members', {
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
                    model: 'sprints',
                    key: 'id'
                },
                onDelete: 'CASCADE'
            },
            userId: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'users',
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
        await queryInterface.addConstraint('sprint_members', {
            fields: ['sprintId', 'userId'],
            type: 'unique',
            name: 'unique_sprint_member'
        });
    },

    async down(queryInterface, Sequelize) {
        // Remove columns
        await queryInterface.removeColumn('sprints', 'key');
        await queryInterface.removeColumn('sprints', 'notes');
        await queryInterface.removeColumn('sprints', 'plannedPoints');
        await queryInterface.removeColumn('sprints', 'burnDownConfig');

        // Drop table
        await queryInterface.dropTable('sprint_members');
    }
};
