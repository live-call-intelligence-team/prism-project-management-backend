const { Sequelize } = require('sequelize');
const config = require('../src/config/config');

const dbConfig = config.development;

const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: 'postgres',
    logging: console.log,
});

async function addClientFeedbackColumn() {
    try {
        console.log('🔧 Adding client_feedback column to issues table...');

        await sequelize.query(`
            ALTER TABLE issues 
            ADD COLUMN IF NOT EXISTS client_feedback TEXT;
        `);

        console.log('✅ Successfully added client_feedback column!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error adding column:', error);
        process.exit(1);
    }
}

addClientFeedbackColumn();
