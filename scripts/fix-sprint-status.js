const { Sequelize } = require('sequelize');
const config = require('../src/config/config');

const dbConfig = config.development;

const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: 'postgres',
    logging: console.log,
});

async function fixSprintStatuses() {
    try {
        console.log('🔧 Checking for incorrectly started sprints...');

        // Find all sprints with ACTIVE status
        const [activeSprints] = await sequelize.query(`
            SELECT id, name, project_id, status, start_date, end_date
            FROM sprints
            WHERE status = 'ACTIVE'
            ORDER BY created_at DESC;
        `);

        console.log(`\nFound ${activeSprints.length} ACTIVE sprint(s):`);
        activeSprints.forEach((sprint, index) => {
            console.log(`  ${index + 1}. ${sprint.name} (${sprint.id}) - Project: ${sprint.project_id}`);
        });

        if (activeSprints.length === 0) {
            console.log('\n✅ No active sprints found. Database is clean!');
            process.exit(0);
            return;
        }

        // Group by project_id to find projects with multiple active sprints
        const projectGroups = {};
        activeSprints.forEach(sprint => {
            if (!projectGroups[sprint.project_id]) {
                projectGroups[sprint.project_id] = [];
            }
            projectGroups[sprint.project_id].push(sprint);
        });

        console.log('\n📊 Sprints grouped by project:');
        Object.keys(projectGroups).forEach(projectId => {
            const sprints = projectGroups[projectId];
            console.log(`\n  Project ${projectId}: ${sprints.length} active sprint(s)`);
            if (sprints.length > 1) {
                console.log('    ⚠️  WARNING: Multiple active sprints in one project!');
            }
        });

        // Ask user what to do
        console.log('\n\n🤔 What would you like to do?');
        console.log('  1. Set ALL active sprints to PLANNED (recommended - you can start them properly later)');
        console.log('  2. Set ALL active sprints to COMPLETED');
        console.log('  3. Exit without changes');

        // For automation, let's just reset to PLANNED
        console.log('\n🔄 Auto-selecting option 1: Resetting all to PLANNED...\n');

        const [result] = await sequelize.query(`
            UPDATE sprints
            SET status = 'PLANNED'
            WHERE status = 'ACTIVE'
            RETURNING id, name, project_id;
        `);

        console.log(`✅ Successfully reset ${result.length} sprint(s) to PLANNED:`);
        result.forEach((sprint, index) => {
            console.log(`  ${index + 1}. ${sprint.name} (${sprint.id})`);
        });

        console.log('\n✨ Done! You can now use the "Start Sprint" button to properly activate sprints.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error fixing sprint statuses:', error);
        process.exit(1);
    }
}

fixSprintStatuses();
