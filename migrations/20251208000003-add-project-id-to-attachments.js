'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Add projectId column
        await queryInterface.addColumn('attachments', 'project_id', {
            type: Sequelize.UUID,
            allowNull: true,
            references: {
                model: 'projects',
                key: 'id',
            },
            onDelete: 'CASCADE',
        });

        // Make issueId nullable
        await queryInterface.changeColumn('attachments', 'issue_id', {
            type: Sequelize.UUID,
            allowNull: true,
            references: {
                model: 'issues',
                key: 'id',
            },
            onDelete: 'CASCADE',
        });

        // Add index for projectId
        await queryInterface.addIndex('attachments', ['project_id']);
    },

    async down(queryInterface, Sequelize) {
        // Remove index
        await queryInterface.removeIndex('attachments', ['project_id']);

        // Remove projectId column
        await queryInterface.removeColumn('attachments', 'project_id');

        // Make issueId not null (Warning: this might fail if there are nulls)
        // For rollback safety we usually skip reverting allowNullable unless strictly needed
        await queryInterface.changeColumn('attachments', 'issue_id', {
            type: Sequelize.UUID,
            allowNull: false,
            references: {
                model: 'issues',
                key: 'id',
            },
            onDelete: 'CASCADE',
        });
    }
};
