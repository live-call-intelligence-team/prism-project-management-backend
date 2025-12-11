'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Check if column exists first or just try to add
        // We'll try to add 'is_client_visible' (snake_case)
        await queryInterface.addColumn('issues', 'is_client_visible', {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
            allowNull: false,
        });
        // Also add client_approval_status if missing (based on Model)
        await queryInterface.addColumn('issues', 'client_approval_status', {
            type: Sequelize.STRING, // Enum in model
            allowNull: true,
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('issues', 'is_client_visible');
        await queryInterface.removeColumn('issues', 'client_approval_status');
    }
};
