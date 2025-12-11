'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Create Notifications table
        await queryInterface.createTable('Notifications', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true,
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
            type: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            title: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            message: {
                type: Sequelize.TEXT,
                allowNull: false,
            },
            data: {
                type: Sequelize.JSONB,
                defaultValue: {},
            },
            isRead: {
                type: Sequelize.BOOLEAN,
                defaultValue: false,
            },
            readAt: {
                type: Sequelize.DATE,
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

        // Create AuditLogs table
        await queryInterface.createTable('AuditLogs', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true,
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
            action: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            resource: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            resourceId: {
                type: Sequelize.UUID,
            },
            details: {
                type: Sequelize.JSONB,
                defaultValue: {},
            },
            ipAddress: {
                type: Sequelize.STRING,
            },
            userAgent: {
                type: Sequelize.STRING,
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

        // Create CustomFields table
        await queryInterface.createTable('CustomFields', {
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
            key: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            type: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            description: {
                type: Sequelize.TEXT,
            },
            options: {
                type: Sequelize.JSONB,
                defaultValue: {},
            },
            isRequired: {
                type: Sequelize.BOOLEAN,
                defaultValue: false,
            },
            applicableIssueTypes: {
                type: Sequelize.ARRAY(Sequelize.STRING),
                defaultValue: [],
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

        // Create Workflows table
        await queryInterface.createTable('Workflows', {
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
            description: {
                type: Sequelize.TEXT,
            },
            issueType: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            statuses: {
                type: Sequelize.ARRAY(Sequelize.STRING),
                allowNull: false,
            },
            transitions: {
                type: Sequelize.JSONB,
                defaultValue: {},
            },
            automationRules: {
                type: Sequelize.JSONB,
                defaultValue: {},
            },
            isDefault: {
                type: Sequelize.BOOLEAN,
                defaultValue: false,
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

        // Create Permissions table
        await queryInterface.createTable('Permissions', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true,
            },
            role: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            resource: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            action: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            conditions: {
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
        await queryInterface.addIndex('Notifications', ['userId']);
        await queryInterface.addIndex('Notifications', ['isRead']);
        await queryInterface.addIndex('AuditLogs', ['userId']);
        await queryInterface.addIndex('AuditLogs', ['resource', 'resourceId']);
        await queryInterface.addIndex('AuditLogs', ['createdAt']);
        await queryInterface.addIndex('CustomFields', ['projectId']);
        await queryInterface.addIndex('Workflows', ['projectId']);
        await queryInterface.addIndex('Permissions', ['role', 'resource', 'action'], {
            unique: true,
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('Permissions');
        await queryInterface.dropTable('Workflows');
        await queryInterface.dropTable('CustomFields');
        await queryInterface.dropTable('AuditLogs');
        await queryInterface.dropTable('Notifications');
    }
};
