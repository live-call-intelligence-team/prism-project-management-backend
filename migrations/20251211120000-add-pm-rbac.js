'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // 1. Add PROJECT_MANAGER to enum_users_role
        // Postgres doesn't support ALTER TYPE ADD VALUE inside a transaction block in some versions, 
        // but usually safer to use SQL.
        // However, Sequelize might not handle enum updates gracefully.
        // Pure SQL approach for Postgres:
        await queryInterface.sequelize.query(`ALTER TYPE "enum_users_role" ADD VALUE IF NOT EXISTS 'PROJECT_MANAGER';`);

        // 2. Add columns to projects table
        await queryInterface.addColumn('projects', 'project_manager_id', {
            type: Sequelize.UUID,
            allowNull: true,
            references: {
                model: 'users',
                key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
        });

        await queryInterface.addColumn('projects', 'scrum_master_id', {
            type: Sequelize.UUID,
            allowNull: true,
            references: {
                model: 'users',
                key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
        });
    },

    down: async (queryInterface, Sequelize) => {
        // Reverting enum values is tricky in Postgres (requires creating new type, migrating data, dropping old).
        // For now we will just remove columns.
        await queryInterface.removeColumn('projects', 'scrum_master_id');
        await queryInterface.removeColumn('projects', 'project_manager_id');
    }
};
