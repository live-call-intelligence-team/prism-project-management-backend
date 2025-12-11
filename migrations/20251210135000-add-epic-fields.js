'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('epics', 'business_value', {
            type: Sequelize.ENUM('LOW', 'MEDIUM', 'HIGH'),
            allowNull: true,
        });
        await queryInterface.addColumn('epics', 'is_visible_to_client', {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
            allowNull: false,
        });
        await queryInterface.addColumn('epics', 'completed_at', {
            type: Sequelize.DATE,
            allowNull: true,
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('epics', 'business_value');
        await queryInterface.removeColumn('epics', 'is_visible_to_client');
        await queryInterface.removeColumn('epics', 'completed_at');
        // Note: Removing ENUM type might require raw query in some dialects, but standard removeColumn usually suffices for columns.
        // If strict cleanup is needed: 
        // await queryInterface.sequelize.query('DROP TYPE "enum_epics_business_value";');
    }
};
