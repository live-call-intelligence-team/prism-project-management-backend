'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('issues', 'epic_id', {
            type: Sequelize.UUID,
            allowNull: true,
            references: {
                model: 'epics',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL'
        });

        await queryInterface.addColumn('issues', 'feature_id', {
            type: Sequelize.UUID,
            allowNull: true,
            references: {
                model: 'features',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL'
        });

        await queryInterface.addIndex('issues', ['epic_id']);
        await queryInterface.addIndex('issues', ['feature_id']);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('issues', 'epic_id');
        await queryInterface.removeColumn('issues', 'feature_id');
    }
};
