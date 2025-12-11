'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('projects', 'type', {
            type: Sequelize.ENUM('SCRUM', 'KANBAN', 'WATERFALL'),
            defaultValue: 'SCRUM',
            allowNull: false
        });

        await queryInterface.addColumn('projects', 'uses_sprints', {
            type: Sequelize.BOOLEAN,
            defaultValue: true,
            allowNull: false
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('projects', 'type');
        await queryInterface.removeColumn('projects', 'uses_sprints');
        // Note: Removing ENUM type might require raw query in some dialects, but for now standard removeColumn.
        // Ideally we should drop the ENUM type too if Postgres.
        await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_projects_type";');
    }
};
