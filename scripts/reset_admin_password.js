const { Sequelize } = require('sequelize');
const bcrypt = require('bcryptjs');
const config = require('../src/config/config.js');

const sequelize = new Sequelize(config.development.database, config.development.username, config.development.password, {
    host: config.development.host,
    dialect: config.development.dialect,
    logging: false
});

async function resetPassword() {
    try {
        await sequelize.authenticate();
        console.log('DB Connected.');

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash('password123', salt);

        await sequelize.query(
            "UPDATE users SET password_hash = :hash WHERE email = :email",
            {
                replacements: { hash, email: 'laxmanlaxman1629@gmail.com' },
                type: Sequelize.QueryTypes.UPDATE
            }
        );
        console.log('Password reset for laxmanlaxman1629@gmail.com');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

resetPassword();
