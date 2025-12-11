'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('Issues', 'epic_id', {
            type: Sequelize.UUID,
            allowNull: true,
            references: {
                model: 'Epics',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL'
        });

        await queryInterface.addColumn('Issues', 'feature_id', {
            type: Sequelize.UUID,
            allowNull: true,
            references: {
                model: 'Features',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL'
        });

        await queryInterface.addIndex('Issues', ['epic_id']);
        await queryInterface.addIndex('Issues', ['feature_id']);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('Issues', 'epic_id');
        await queryInterface.removeColumn('Issues', 'feature_id');
    }
};
