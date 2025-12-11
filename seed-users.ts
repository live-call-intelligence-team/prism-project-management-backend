import { User, Organization } from './src/models';
import { UserRole } from './src/types/enums';
import bcrypt from 'bcryptjs';

async function seedTestUsers() {
    try {
        console.log('🌱 Seeding test users...');

        // Find or create organization
        let org = await Organization.findOne();
        if (!org) {
            org = await Organization.create({
                name: 'Demo Organization',
                subscriptionPlan: 'ENTERPRISE',
                maxUsers: 100,
                ssoEnabled: false,
                settings: {},
            });
            console.log('✅ Created demo organization');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash('password123', 10);

        // Create test users
        const users = [
            {
                email: 'admin@projecthub.com',
                passwordHash: hashedPassword,
                firstName: 'Admin',
                lastName: 'User',
                role: UserRole.ADMIN,
                orgId: org.id,
                isActive: true,
                mfaEnabled: false,
                profileData: {},
            },
            {
                email: 'scrum@projecthub.com',
                passwordHash: hashedPassword,
                firstName: 'Scrum',
                lastName: 'Master',
                role: UserRole.SCRUM_MASTER,
                orgId: org.id,
                isActive: true,
                mfaEnabled: false,
                profileData: {},
            },
            {
                email: 'employee@projecthub.com',
                passwordHash: hashedPassword,
                firstName: 'John',
                lastName: 'Employee',
                role: UserRole.EMPLOYEE,
                orgId: org.id,
                isActive: true,
                mfaEnabled: false,
                profileData: {},
            },
            {
                email: 'client@projecthub.com',
                passwordHash: hashedPassword,
                firstName: 'Client',
                lastName: 'User',
                role: UserRole.CLIENT,
                orgId: org.id,
                isActive: true,
                mfaEnabled: false,
                profileData: {},
            },
        ];

        for (const userData of users) {
            const existing = await User.findOne({ where: { email: userData.email } });
            if (!existing) {
                await User.create(userData);
                console.log(`✅ Created user: ${userData.email}`);
            } else {
                console.log(`⏭️  User already exists: ${userData.email}`);
            }
        }

        console.log('\n🎉 Test users seeded successfully!');
        console.log('\n📧 Login credentials:');
        console.log('   Admin:        admin@projecthub.com / password123');
        console.log('   Scrum Master: scrum@projecthub.com / password123');
        console.log('   Employee:     employee@projecthub.com / password123');
        console.log('   Client:       client@projecthub.com / password123\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding users:', error);
        process.exit(1);
    }
}

seedTestUsers();
