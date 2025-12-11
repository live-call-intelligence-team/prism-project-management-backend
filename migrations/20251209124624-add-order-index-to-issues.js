'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Issues', 'order_index', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });
    // Add index for performance on ordering
    await queryInterface.addIndex('Issues', ['order_index']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('Issues', ['order_index']);
    await queryInterface.removeColumn('Issues', 'order_index');
  }
};
