'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('issue_links', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      source_issue_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'issues',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      target_issue_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'issues',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      type: {
        type: Sequelize.ENUM('BLOCKS', 'IS_BLOCKED_BY', 'RELATES_TO', 'DUPLICATES', 'CLONED_FROM', 'CLONED_TO'),
        allowNull: false,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    // Add indexes for performance
    await queryInterface.addIndex('issue_links', ['source_issue_id']);
    await queryInterface.addIndex('issue_links', ['target_issue_id']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('issue_links');
  },
};
