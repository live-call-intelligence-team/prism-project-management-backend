'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Table already exists, skipping creation
        // await queryInterface.createTable('notifications', { ... });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('notifications');
    },
};
