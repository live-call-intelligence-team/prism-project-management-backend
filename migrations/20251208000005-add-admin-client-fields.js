'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Add columns to 'users' table
        await queryInterface.addColumn('users', 'username', {
            type: Sequelize.STRING(50),
            allowNull: true, // Allow null initially for existing records, or handle migration strategy
            unique: true,
        });

        await queryInterface.addColumn('users', 'phone', {
            type: Sequelize.STRING(20),
            allowNull: true,
        });

        await queryInterface.addColumn('users', 'force_password_change', {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
        });

        await queryInterface.addColumn('users', 'created_by', {
            type: Sequelize.UUID,
            allowNull: true,
            references: {
                model: 'users',
                key: 'id',
            },
            onDelete: 'SET NULL',
        });

        // Add columns to 'project_members' table
        await queryInterface.addColumn('project_members', 'access_level', {
            type: Sequelize.STRING(20), // 'VIEW_ONLY', 'COMMENTER', 'APPROVER'
            defaultValue: 'VIEW_ONLY',
        });
    },

    down: async (queryInterface, Sequelize) => {
        // Remove columns from 'users' table
        await queryInterface.removeColumn('users', 'username');
        await queryInterface.removeColumn('users', 'phone');
        await queryInterface.removeColumn('users', 'force_password_change');
        await queryInterface.removeColumn('users', 'created_by');

        // Remove columns from 'project_members' table
        await queryInterface.removeColumn('project_members', 'access_level');
    },
};
