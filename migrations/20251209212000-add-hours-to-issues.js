'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const tableInfo = await queryInterface.describeTable('issues');

        if (!tableInfo.estimatedHours) {
            await queryInterface.addColumn('issues', 'estimatedHours', {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: true,
                field: 'estimated_hours'
            });
        }

        if (!tableInfo.actualHours) {
            await queryInterface.addColumn('issues', 'actualHours', {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: true,
                defaultValue: 0,
                field: 'actual_hours'
            });
        }
    },

    async down(queryInterface, Sequelize) {
        const tableInfo = await queryInterface.describeTable('issues');

        if (tableInfo.actualHours) {
            await queryInterface.removeColumn('issues', 'actualHours');
        }

        if (tableInfo.estimatedHours) {
            await queryInterface.removeColumn('issues', 'estimatedHours');
        }
    }
};
