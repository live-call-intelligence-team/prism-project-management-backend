'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Create Comments table
        await queryInterface.createTable('Comments', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true,
            },
            issueId: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'Issues',
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
            content: {
                type: Sequelize.TEXT,
                allowNull: false,
            },
            mentions: {
                type: Sequelize.ARRAY(Sequelize.UUID),
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

        // Create Attachments table
        await queryInterface.createTable('Attachments', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true,
            },
            issueId: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'Issues',
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
            filename: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            originalName: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            mimeType: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            size: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            path: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            url: {
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

        // Create WorkLogs table
        await queryInterface.createTable('WorkLogs', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true,
            },
            issueId: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'Issues',
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
            timeSpent: {
                type: Sequelize.DECIMAL(8, 2),
                allowNull: false,
            },
            date: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            description: {
                type: Sequelize.TEXT,
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
        await queryInterface.addIndex('Comments', ['issueId']);
        await queryInterface.addIndex('Attachments', ['issueId']);
        await queryInterface.addIndex('WorkLogs', ['issueId']);
        await queryInterface.addIndex('WorkLogs', ['userId']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('WorkLogs');
        await queryInterface.dropTable('Attachments');
        await queryInterface.dropTable('Comments');
    }
};
