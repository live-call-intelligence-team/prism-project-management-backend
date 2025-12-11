'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('issues', 'isClientVisible', {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
            allowNull: false
        });

        await queryInterface.addColumn('issues', 'clientApprovalStatus', {
            type: Sequelize.ENUM('PENDING', 'APPROVED', 'CHANGES_REQUESTED', 'REJECTED'),
            allowNull: true,
            defaultValue: null
        });

        await queryInterface.addColumn('comments', 'isClientVisible', {
            type: Sequelize.BOOLEAN,
            defaultValue: true, // Default to true for client interactions, logic will toggle
            allowNull: false
        });

        await queryInterface.addColumn('projects', 'clientConfig', {
            type: Sequelize.JSONB,
            defaultValue: { showBudget: false, allowTaskCreation: false },
            allowNull: false
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('issues', 'isClientVisible');
        await queryInterface.removeColumn('issues', 'clientApprovalStatus');
        // Note: Dropping ENUM type is usually required in postgres but sequelize might handle it or we leave it
        await queryInterface.removeColumn('comments', 'isClientVisible');
        await queryInterface.removeColumn('projects', 'clientConfig');
    }
};
