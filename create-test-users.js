const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

const testUsers = [
    {
        email: 'admin@projecthub.com',
        password: 'password123',
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
        orgName: 'Demo Organization'
    },
    {
        email: 'scrum@projecthub.com',
        password: 'password123',
        firstName: 'Scrum',
        lastName: 'Master',
        role: 'SCRUM_MASTER',
        orgName: 'Demo Organization'
    },
    {
        email: 'employee@projecthub.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Employee',
        role: 'EMPLOYEE',
        orgName: 'Demo Organization'
    },
    {
        email: 'client@projecthub.com',
        password: 'password123',
        firstName: 'Client',
        lastName: 'User',
        role: 'CLIENT',
        orgName: 'Demo Organization'
    }
];

async function createTestUsers() {
    console.log('🌱 Creating test users via API...\n');

    for (const user of testUsers) {
        try {
            const response = await axios.post(`${API_URL}/auth/register`, user);
            console.log(`✅ Created: ${user.email} (${user.role})`);
        } catch (error) {
            if (error.response?.data?.error?.includes('already exists')) {
                console.log(`⏭️  Already exists: ${user.email}`);
            } else {
                console.error(`❌ Failed to create ${user.email}:`, error.response?.data?.error || error.message);
            }
        }
    }

    console.log('\n🎉 Test users creation completed!');
    console.log('\n📧 Login credentials:');
    console.log('   Admin:        admin@projecthub.com / password123');
    console.log('   Scrum Master: scrum@projecthub.com / password123');
    console.log('   Employee:     employee@projecthub.com / password123');
    console.log('   Client:       client@projecthub.com / password123\n');
}

createTestUsers();
