'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('features', 'acceptance_criteria', {
            type: Sequelize.TEXT,
            allowNull: true,
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('features', 'acceptance_criteria');
    }
};
