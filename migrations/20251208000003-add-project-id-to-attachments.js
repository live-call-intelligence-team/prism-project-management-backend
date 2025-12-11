'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Add projectId column
        await queryInterface.addColumn('Attachments', 'projectId', {
            type: Sequelize.UUID,
            allowNull: true,
            references: {
                model: 'Projects',
                key: 'id',
            },
            onDelete: 'CASCADE',
        });

        // Make issueId nullable
        await queryInterface.changeColumn('Attachments', 'issueId', {
            type: Sequelize.UUID,
            allowNull: true,
            references: {
                model: 'Issues',
                key: 'id',
            },
            onDelete: 'CASCADE',
        });

        // Add index for projectId
        await queryInterface.addIndex('Attachments', ['projectId']);
    },

    async down(queryInterface, Sequelize) {
        // Remove index
        await queryInterface.removeIndex('Attachments', ['projectId']);

        // Remove projectId column
        await queryInterface.removeColumn('Attachments', 'projectId');

        // Make issueId not null (Warning: this might fail if there are nulls)
        // For rollback safety we usually skip reverting allowNullable unless strictly needed
        await queryInterface.changeColumn('Attachments', 'issueId', {
            type: Sequelize.UUID,
            allowNull: false,
            references: {
                model: 'Issues',
                key: 'id',
            },
            onDelete: 'CASCADE',
        });
    }
};
