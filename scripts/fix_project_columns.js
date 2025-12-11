const { Sequelize } = require('sequelize');
const config = require('../src/config/config.js');

const sequelize = new Sequelize(config.development.database, config.development.username, config.development.password, {
    host: config.development.host,
    dialect: config.development.dialect,
    logging: false
});

async function fixColumns() {
    try {
        await sequelize.authenticate();
        console.log('DB Connected.');

        await sequelize.query('ALTER TABLE projects RENAME COLUMN "clientConfig" TO client_config');
        console.log('Renamed clientConfig to client_config');

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        // Maybe it's already renamed?
        if (error.original && error.original.code === '42703') { // Undefined column
            console.log('Column might already be renamed or missing.');
        }
        process.exit(1);
    }
}

fixColumns();
