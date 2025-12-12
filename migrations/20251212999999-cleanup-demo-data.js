'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        const demoEmails = [
            'admin@projecthub.com',
            'scrum@projecthub.com',
            'employee@projecthub.com',
            'client@projecthub.com',
            'admin@demo.com',
            'scrummaster@demo.com',
            'developer1@demo.com',
            'developer2@demo.com',
            'client@demo.com'
        ];

        // 1. Find User IDs
        const users = await queryInterface.sequelize.query(
            `SELECT id FROM "Users" WHERE email IN (:emails)`,
            {
                replacements: { emails: demoEmails },
                type: queryInterface.sequelize.QueryTypes.SELECT
            }
        );

        const userIds = users.map(u => u.id);

        if (userIds.length > 0) {
            console.log(`Found ${userIds.length} demo users to cleanup.`);

            // 2. Delete Issues (Reporter or Assignee)
            // Due to RESTRICT, we must delete issues explicitly
            await queryInterface.sequelize.query(
                `DELETE FROM "Issues" WHERE "reporterId" IN (:userIds) OR "assigneeId" IN (:userIds)`,
                { replacements: { userIds } }
            );

            // 3. Delete Projects (Lead)
            // Due to RESTRICT on Lead, we must delete projects
            await queryInterface.sequelize.query(
                `DELETE FROM "Projects" WHERE "leadId" IN (:userIds) OR "clientId" IN (:userIds) OR "projectManagerId" IN (:userIds) OR "scrumMasterId" IN (:userIds)`,
                { replacements: { userIds } }
            );

            // 4. Delete associated WorkLogs, Comments, Attachments (Usually cascade, but safe to be sure if owned by user)
            // WorkLogs
            await queryInterface.sequelize.query(
                `DELETE FROM "WorkLogs" WHERE "userId" IN (:userIds)`,
                { replacements: { userIds } }
            );
            // Comments
            await queryInterface.sequelize.query(
                `DELETE FROM "Comments" WHERE "userId" IN (:userIds)`,
                { replacements: { userIds } }
            );
            // Attachments
            await queryInterface.sequelize.query(
                `DELETE FROM "Attachments" WHERE "uploadedBy" IN (:userIds)`,
                { replacements: { userIds } }
            );

            // 5. Delete Users
            await queryInterface.sequelize.query(
                `DELETE FROM "Users" WHERE id IN (:userIds)`,
                { replacements: { userIds } }
            );

            console.log('✅ Demo users and data cleaned up successfully.');
        } else {
            console.log('ℹ️ No demo users found to cleanup.');
        }
    },

    async down(queryInterface, Sequelize) {
        // No down migration possible as data is deleted
    }
};
