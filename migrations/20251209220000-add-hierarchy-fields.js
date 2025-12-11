'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        // Add usesEpics to Projects
        await queryInterface.addColumn('projects', 'uses_epics', {
            type: Sequelize.BOOLEAN,
            defaultValue: true,
            allowNull: false
        });

        // Add tags to Epics
        await queryInterface.addColumn('epics', 'tags', {
            type: Sequelize.ARRAY(Sequelize.STRING),
            defaultValue: [],
            allowNull: false
        });

        // Add tags to Features
        await queryInterface.addColumn('features', 'tags', {
            type: Sequelize.ARRAY(Sequelize.STRING),
            defaultValue: [],
            allowNull: false
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('projects', 'uses_epics');
        await queryInterface.removeColumn('epics', 'tags');
        await queryInterface.removeColumn('features', 'tags');
    }
};
