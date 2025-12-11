'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Columns already exist
        /*
        await queryInterface.addColumn('sprints', 'total_points', {
            type: Sequelize.FLOAT,
            allowNull: true,
            defaultValue: 0
        });

        await queryInterface.addColumn('sprints', 'completed_points', {
            type: Sequelize.FLOAT,
            allowNull: true,
            defaultValue: 0
        });
        */
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('Sprints', 'total_points');
        await queryInterface.removeColumn('Sprints', 'completed_points');
    }
};
