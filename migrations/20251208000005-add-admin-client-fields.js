'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Add columns to 'Users' table
        await queryInterface.addColumn('Users', 'username', {
            type: Sequelize.STRING(50),
            allowNull: true, // Allow null initially for existing records, or handle migration strategy
            unique: true,
        });

        await queryInterface.addColumn('Users', 'phone', {
            type: Sequelize.STRING(20),
            allowNull: true,
        });

        await queryInterface.addColumn('Users', 'force_password_change', {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
        });

        await queryInterface.addColumn('Users', 'created_by', {
            type: Sequelize.UUID,
            allowNull: true,
            references: {
                model: 'Users',
                key: 'id',
            },
            onDelete: 'SET NULL',
        });

        // Add columns to 'ProjectMembers' table
        await queryInterface.addColumn('ProjectMembers', 'access_level', {
            type: Sequelize.STRING(20), // 'VIEW_ONLY', 'COMMENTER', 'APPROVER'
            defaultValue: 'VIEW_ONLY',
        });
    },

    down: async (queryInterface, Sequelize) => {
        // Remove columns from 'Users' table
        await queryInterface.removeColumn('Users', 'username');
        await queryInterface.removeColumn('Users', 'phone');
        await queryInterface.removeColumn('Users', 'force_password_change');
        await queryInterface.removeColumn('Users', 'created_by');

        // Remove columns from 'ProjectMembers' table
        await queryInterface.removeColumn('ProjectMembers', 'access_level');
    },
};
