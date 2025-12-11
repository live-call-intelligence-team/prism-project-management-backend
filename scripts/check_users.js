const { Sequelize, DataTypes } = require('sequelize');
const config = require('../src/config/config.js');

const sequelize = new Sequelize(config.development.database, config.development.username, config.development.password, {
    host: config.development.host,
    dialect: config.development.dialect,
    logging: false
});

async function listUsers() {
    try {
        await sequelize.authenticate();
        console.log('DB Connected.');
        // Check columns in 'projects'
        try {
            const columns = await sequelize.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'projects'", { type: Sequelize.QueryTypes.SELECT });
            console.log('Columns in "projects":', columns.map(c => c.column_name));
        } catch (e) { console.log('Could not check projects cols', e.message); }
        // Check tables
        const tables = await sequelize.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'", { type: Sequelize.QueryTypes.SELECT });
        console.log('First table obj:', tables[0]);
        console.log('Tables:', tables.map(t => t.table_name || t.TABLE_NAME));

        const users = await sequelize.query("SELECT id, email, role, username FROM users", { type: Sequelize.QueryTypes.SELECT });
        console.log('Users in "users" table:', users.length);
        users.forEach(u => console.log(`${u.role}: ${u.email} (username: ${u.username})`));

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

listUsers();
