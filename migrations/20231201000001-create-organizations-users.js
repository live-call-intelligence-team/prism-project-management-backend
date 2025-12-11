'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Create Organizations table
        await queryInterface.createTable('Organizations', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true,
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            subscriptionPlan: {
                type: Sequelize.STRING,
                allowNull: false,
                defaultValue: 'FREE',
            },
            subscriptionExpiry: {
                type: Sequelize.DATE,
            },
            maxUsers: {
                type: Sequelize.INTEGER,
                defaultValue: 10,
            },
            ssoEnabled: {
                type: Sequelize.BOOLEAN,
                defaultValue: false,
            },
            ssoConfig: {
                type: Sequelize.JSONB,
            },
            customDomain: {
                type: Sequelize.STRING,
            },
            settings: {
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

        // Create Users table
        await queryInterface.createTable('Users', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true,
            },
            email: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true,
            },
            passwordHash: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            firstName: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            lastName: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            role: {
                type: Sequelize.STRING,
                allowNull: false,
                defaultValue: 'EMPLOYEE',
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
            profileData: {
                type: Sequelize.JSONB,
                defaultValue: {},
            },
            mfaEnabled: {
                type: Sequelize.BOOLEAN,
                defaultValue: false,
            },
            mfaSecret: {
                type: Sequelize.STRING,
            },
            refreshToken: {
                type: Sequelize.STRING,
            },
            resetPasswordToken: {
                type: Sequelize.STRING,
            },
            resetPasswordExpires: {
                type: Sequelize.DATE,
            },
            lastLogin: {
                type: Sequelize.DATE,
            },
            isActive: {
                type: Sequelize.BOOLEAN,
                defaultValue: true,
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
        await queryInterface.addIndex('Users', ['email']);
        await queryInterface.addIndex('Users', ['orgId']);
        await queryInterface.addIndex('Users', ['role']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('Users');
        await queryInterface.dropTable('Organizations');
    }
};
