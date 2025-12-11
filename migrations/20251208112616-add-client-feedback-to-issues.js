'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Column already exists, skipping
    // await queryInterface.addColumn('issues', 'client_feedback', ...);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Issues', 'client_feedback');
  },
};
