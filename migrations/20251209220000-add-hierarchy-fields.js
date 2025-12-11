'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        // Add usesEpics to Projects
        await queryInterface.addColumn('Projects', 'uses_epics', {
            type: Sequelize.BOOLEAN,
            defaultValue: true,
            allowNull: false
        });

        // Add tags to Epics
        await queryInterface.addColumn('Epics', 'tags', {
            type: Sequelize.ARRAY(Sequelize.STRING),
            defaultValue: [],
            allowNull: false
        });

        // Add tags to Features
        await queryInterface.addColumn('Features', 'tags', {
            type: Sequelize.ARRAY(Sequelize.STRING),
            defaultValue: [],
            allowNull: false
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('Projects', 'uses_epics');
        await queryInterface.removeColumn('Epics', 'tags');
        await queryInterface.removeColumn('Features', 'tags');
    }
};
