'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Create Sprints table
        await queryInterface.createTable('Sprints', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true,
            },
            projectId: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'Projects',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            goal: {
                type: Sequelize.TEXT,
            },
            startDate: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            endDate: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            status: {
                type: Sequelize.STRING,
                allowNull: false,
                defaultValue: 'PLANNED',
            },
            capacity: {
                type: Sequelize.INTEGER,
            },
            velocity: {
                type: Sequelize.INTEGER,
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false,
            },
        });

        // Create Issues table
        await queryInterface.createTable('Issues', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true,
            },
            projectId: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'Projects',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            issueNumber: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            key: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true,
            },
            type: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            status: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            priority: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            title: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            description: {
                type: Sequelize.TEXT,
            },
            assigneeId: {
                type: Sequelize.UUID,
                references: {
                    model: 'Users',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL',
            },
            reporterId: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'Users',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'RESTRICT',
            },
            sprintId: {
                type: Sequelize.UUID,
                references: {
                    model: 'Sprints',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL',
            },
            parentId: {
                type: Sequelize.UUID,
                references: {
                    model: 'Issues',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            storyPoints: {
                type: Sequelize.INTEGER,
            },
            estimatedHours: {
                type: Sequelize.DECIMAL(8, 2),
            },
            actualHours: {
                type: Sequelize.DECIMAL(8, 2),
                defaultValue: 0,
            },
            dueDate: {
                type: Sequelize.DATE,
            },
            labels: {
                type: Sequelize.ARRAY(Sequelize.STRING),
                defaultValue: [],
            },
            customFields: {
                type: Sequelize.JSONB,
                defaultValue: {},
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false,
            },
        });

        // Add indexes
        await queryInterface.addIndex('Sprints', ['projectId']);
        await queryInterface.addIndex('Sprints', ['status']);
        await queryInterface.addIndex('Issues', ['key']);
        await queryInterface.addIndex('Issues', ['projectId']);
        await queryInterface.addIndex('Issues', ['status']);
        await queryInterface.addIndex('Issues', ['assigneeId']);
        await queryInterface.addIndex('Issues', ['sprintId']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('Issues');
        await queryInterface.dropTable('Sprints');
    }
};
