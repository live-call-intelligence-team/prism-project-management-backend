'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Create Projects table
        await queryInterface.createTable('Projects', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true,
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            key: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true,
            },
            description: {
                type: Sequelize.TEXT,
            },
            orgId: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'Organizations',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            leadId: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'Users',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'RESTRICT',
            },
            settings: {
                type: Sequelize.JSONB,
                defaultValue: {},
            },
            status: {
                type: Sequelize.STRING,
                allowNull: false,
                defaultValue: 'ACTIVE',
            },
            visibility: {
                type: Sequelize.STRING,
                defaultValue: 'PRIVATE',
            },
            startDate: {
                type: Sequelize.DATE,
            },
            endDate: {
                type: Sequelize.DATE,
            },
            budget: {
                type: Sequelize.DECIMAL(12, 2),
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

        // Create ProjectMembers table
        await queryInterface.createTable('ProjectMembers', {
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
            userId: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'Users',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            role: {
                type: Sequelize.STRING,
                defaultValue: 'MEMBER',
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
        await queryInterface.addIndex('Projects', ['key']);
        await queryInterface.addIndex('Projects', ['orgId']);
        await queryInterface.addIndex('Projects', ['status']);
        await queryInterface.addIndex('ProjectMembers', ['projectId', 'userId'], {
            unique: true,
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('ProjectMembers');
        await queryInterface.dropTable('Projects');
    }
};
