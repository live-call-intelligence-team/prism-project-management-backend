'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        // Logging helper
        const log = (msg) => console.log(`[CleanupMigration] ${msg}`);

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

        log('Starting cleanup...');

        // 1. Find User IDs
        const users = await queryInterface.sequelize.query(
            `SELECT id, email FROM "Users" WHERE email IN (:emails)`,
            {
                replacements: { emails: demoEmails },
                type: queryInterface.sequelize.QueryTypes.SELECT
            }
        );

        if (users.length === 0) {
            log('No demo users found. Skipping.');
            return;
        }

        const userIds = users.map(u => u.id);
        log(`Found ${users.length} users: ${users.map(u => u.email).join(', ')}`);

        // Helper to run delete safely
        const safeDelete = async (table, condition, replacements) => {
            log(`Deleting from ${table}...`);
            try {
                await queryInterface.sequelize.query(
                    `DELETE FROM "${table}" WHERE ${condition}`,
                    { replacements }
                );
                log(`Deleted from ${table}.`);
            } catch (err) {
                log(`Error deleting from ${table}: ${err.message}`);
                // Don't throw, try to continue cleaning other tables
            }
        };

        // 2. Delete Dependent Data (Project Dependencies)
        // Project Members (usually cascades from Project or User, but let's be safe)
        // Check if ProjectMembers table exists (it should)
        await safeDelete('ProjectMembers', `"userId" IN (:userIds)`, { userIds });

        // 3. Delete Issues (Reporter or Assignee)
        // Issues.reporterId (camelCase)
        // Issues.assigneeId (camelCase)
        await safeDelete('Issues', `"reporterId" IN (:userIds) OR "assigneeId" IN (:userIds)`, { userIds });

        // 4. Delete Projects (Lead or Key Roles)
        // Projects.leadId (camelCase)
        // Projects.client_id (snake_case)
        // Projects.project_manager_id (snake_case)
        // Projects.scrum_master_id (snake_case)
        // We delete the PROJECT if the user is a key role, because RESTRICT prevents user deletion.
        await safeDelete('Projects',
            `"leadId" IN (:userIds) OR "client_id" IN (:userIds) OR "project_manager_id" IN (:userIds) OR "scrum_master_id" IN (:userIds)`,
            { userIds }
        );

        // 5. Delete User Content
        // WorkLogs.userId
        await safeDelete('WorkLogs', `"userId" IN (:userIds)`, { userIds });

        // Comments.userId
        await safeDelete('Comments', `"userId" IN (:userIds)`, { userIds });

        // Attachments.uploadedBy
        await safeDelete('Attachments', `"uploadedBy" IN (:userIds)`, { userIds });

        // 6. Delete Users
        log('Deleting Users...');
        await safeDelete('Users', `id IN (:userIds)`, { userIds });

        log('Cleanup completed successfully.');
    },

    async down(queryInterface, Sequelize) {
        // No down migration
    }
};
