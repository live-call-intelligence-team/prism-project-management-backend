require('dotenv').config();

module.exports = {
    development: {
        username: process.env.DB_USER || 'murari',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'project_management',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        dialect: 'postgres',
        logging: false
    },
    test: {
        username: process.env.DB_USER || 'murari',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME_TEST || 'project_management_test',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        dialect: 'postgres',
        logging: false
    },
    production: {
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '5432'),
        dialect: 'postgres',
        logging: false
    }
};
