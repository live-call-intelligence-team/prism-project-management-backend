'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // 1. Add PROJECT_MANAGER to enum_users_role
        // Postgres doesn't support ALTER TYPE ADD VALUE inside a transaction block in some versions, 
        // but usually safer to use SQL.
        // However, Sequelize might not handle enum updates gracefully.
        // Pure SQL approach for Postgres:
        await queryInterface.sequelize.query(`ALTER TYPE "enum_users_role" ADD VALUE IF NOT EXISTS 'PROJECT_MANAGER';`);

        // 2. Add columns to Projects table
        await queryInterface.addColumn('Projects', 'project_manager_id', {
            type: Sequelize.UUID,
            allowNull: true,
            references: {
                model: 'Users',
                key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
        });

        await queryInterface.addColumn('Projects', 'scrum_master_id', {
            type: Sequelize.UUID,
            allowNull: true,
            references: {
                model: 'Users',
                key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
        });
    },

    down: async (queryInterface, Sequelize) => {
        // Reverting enum values is tricky in Postgres (requires creating new type, migrating data, dropping old).
        // For now we will just remove columns.
        await queryInterface.removeColumn('Projects', 'scrum_master_id');
        await queryInterface.removeColumn('Projects', 'project_manager_id');
    }
};
