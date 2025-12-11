
import sequelize from '../src/config/database';

async function fixColumns() {
    try {
        await sequelize.authenticate();
        console.log('Connected to DB.');

        const [results] = await sequelize.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'sprints';
        `);

        const columns = (results as any[]).map(r => r.column_name);
        console.log('Current Columns:', columns);

        // check for plannedPoints or plannedpoints
        if (columns.includes('plannedPoints')) {
            console.log('Renaming "plannedPoints" to "planned_points"...');
            await sequelize.query('ALTER TABLE sprints RENAME COLUMN "plannedPoints" TO planned_points;');
        } else if (columns.includes('plannedpoints')) {
            console.log('Renaming "plannedpoints" to "planned_points"...');
            await sequelize.query('ALTER TABLE sprints RENAME COLUMN plannedpoints TO planned_points;');
        }

        if (columns.includes('burnDownConfig')) {
            console.log('Renaming "burnDownConfig" to "burn_down_config"...');
            await sequelize.query('ALTER TABLE sprints RENAME COLUMN "burnDownConfig" TO burn_down_config;');
        } else if (columns.includes('burndownconfig')) {
            console.log('Renaming "burndownconfig" to "burn_down_config"...');
            await sequelize.query('ALTER TABLE sprints RENAME COLUMN burndownconfig TO burn_down_config;');
        }

        console.log('Done.');
    } catch (err) {
        console.error('Error:', err);
    } finally {
        process.exit();
    }
}

fixColumns();
