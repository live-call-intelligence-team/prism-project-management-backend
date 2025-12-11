
// @ts-nocheck
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const SprintStatus = {
    PLANNED: 'PLANNED',
    ACTIVE: 'ACTIVE',
    COMPLETED: 'COMPLETED'
};

const IssueStatus = {
    TODO: 'TO DO',
    IN_PROGRESS: 'IN PROGRESS',
    DONE: 'DONE'
};

async function run() {
    console.log('Connecting to database...');
    // Use defaults from database.ts if env not set
    const sequelize = new Sequelize({
        database: process.env.DB_NAME || 'project_management',
        username: process.env.DB_USER || 'murari',
        password: process.env.DB_PASSWORD || '',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        dialect: 'postgres',
        logging: false
    });

    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        // 1. Create a dummy project
        const [users] = await sequelize.query("SELECT id FROM users LIMIT 1");
        const userId = users[0]?.id;

        if (!userId) {
            console.error('No users found. Cannot run test.');
            process.exit(1);
        }

        const [orgs] = await sequelize.query("SELECT id FROM organizations LIMIT 1");
        const orgId = orgs[0]?.id;

        if (!orgId) {
            console.error('No orgs found. Cannot run test.');
            process.exit(1);
        }

        const timestamp = Date.now();
        const projectKey = `TSP-${timestamp}`; // Test Sprint Project

        // Create Project
        const [projects] = await sequelize.query(`
            INSERT INTO projects (id, name, key, description, owner_id, org_id, status, visibility, created_at, updated_at)
            VALUES (gen_random_uuid(), 'Test Sprint Project ${timestamp}', '${projectKey}', 'Testing Sprints', '${userId}', '${orgId}', 'ACTIVE', 'PRIVATE', NOW(), NOW())
            RETURNING id;
        `);
        const projectId = projects[0].id;
        console.log(`Created Project: ${projectId}`);

        // 2. Create Sprint A (PLANNED)
        const [sprints] = await sequelize.query(`
            INSERT INTO sprints (id, project_id, name, start_date, end_date, status, key, created_at, updated_at)
            VALUES (gen_random_uuid(), '${projectId}', 'Sprint A', NOW(), NOW() + INTERVAL '14 days', '${SprintStatus.PLANNED}', '${projectKey}-S1', NOW(), NOW())
            RETURNING id;
        `);
        const sprintId = sprints[0].id;
        console.log(`Created Sprint A: ${sprintId}`);

        // 3. Create Issue 1 (TO DO) assigned to Sprint A
        const [issues] = await sequelize.query(`
            INSERT INTO issues (id, project_id, title, type, status, priority, sprint_id, story_points, reporter_id, created_at, updated_at)
            VALUES (gen_random_uuid(), '${projectId}', 'Incomplete Issue', 'STORY', '${IssueStatus.TODO}', 'MEDIUM', '${sprintId}', 5, '${userId}', NOW(), NOW())
            RETURNING id;
        `);
        const issueId = issues[0].id;
        console.log(`Created Issue 1: ${issueId} in Sprint A`);

        // 4. Start Sprint A
        console.log('Simulating Sprint Start...');
        await sequelize.query(`
            UPDATE sprints SET status = '${SprintStatus.ACTIVE}' WHERE id = '${sprintId}'
        `);

        // Verify Status
        const [sprintActive] = await sequelize.query(`SELECT status FROM sprints WHERE id = '${sprintId}'`);
        if (sprintActive[0].status !== SprintStatus.ACTIVE) throw new Error('Sprint failed to start');
        console.log('Sprint A is now ACTIVE.');

        // 5. Complete Sprint
        console.log('Simulating Sprint Completion...');

        // Logic: Move incomplete issues (Issue 1) to backlog (sprint_id = NULL)
        await sequelize.query(`
            UPDATE issues SET sprint_id = NULL WHERE id = '${issueId}'
        `);

        // Update Sprint Status
        await sequelize.query(`
            UPDATE sprints SET status = '${SprintStatus.COMPLETED}' WHERE id = '${sprintId}'
        `);

        // 6. Verify
        const [issueCheck] = await sequelize.query(`SELECT sprint_id FROM issues WHERE id = '${issueId}'`);
        if (issueCheck[0].sprint_id !== null) throw new Error('Issue was not moved to backlog');

        const [sprintCheck] = await sequelize.query(`SELECT status FROM sprints WHERE id = '${sprintId}'`);
        if (sprintCheck[0].status !== SprintStatus.COMPLETED) throw new Error('Sprint not completed');

        console.log('SUCCESS: Sprint lifecycle verification passed!');

    } catch (error) {
        console.error('Test Failed:', error);
        process.exit(1);
    } finally {
        await sequelize.close();
    }
}

run();
