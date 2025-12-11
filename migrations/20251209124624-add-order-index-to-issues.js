'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('issues', 'order_index', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });
    // Add index for performance on ordering
    await queryInterface.addIndex('issues', ['order_index']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('issues', ['order_index']);
    await queryInterface.removeColumn('issues', 'order_index');
  }
};
