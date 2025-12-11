'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('comments', 'is_client_visible', {
            type: Sequelize.BOOLEAN,
            defaultValue: true,
            allowNull: false
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('comments', 'is_client_visible');
    }
};
