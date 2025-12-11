import sequelize from '../src/config/database';


async function migrate() {
    try {
        await sequelize.authenticate();
        console.log('✅ Connected to database');

        // 1. Add fix_version if not exists
        try {
            await sequelize.query('ALTER TABLE issues ADD COLUMN IF NOT EXISTS "fix_version" VARCHAR(255);');
            console.log('✅ Added fix_version column');
        } catch (e: any) {
            console.log('⚠️ fix_version error:', e.message);
        }

        // 2. Fix client_approval_status
        try {
            // Drop column to reset state (DEV ONLY SAFE - Assuming no critical data in this column yet)
            await sequelize.query('ALTER TABLE issues DROP COLUMN IF EXISTS "client_approval_status";');

            // Ensure ENUM type exists
            await sequelize.query(`
            DO $$ BEGIN
                CREATE TYPE "enum_issues_client_approval_status" AS ENUM ('PENDING', 'APPROVED', 'CHANGES_REQUESTED', 'REJECTED');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `);

            // Add column back with correct type
            await sequelize.query(`
            ALTER TABLE issues 
            ADD COLUMN "client_approval_status" "enum_issues_client_approval_status" DEFAULT NULL;
        `);
            console.log('✅ Fixed client_approval_status column');

        } catch (e: any) {
            console.log('⚠️ client_approval_status error:', e.message);
        }

        process.exit(0);
    } catch (err) {
        console.error('❌ Migration failed:', err);
        process.exit(1);
    }
}

migrate();
