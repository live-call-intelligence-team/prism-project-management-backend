
import { Issue, User } from './src/models';
import sequelize from './src/config/database';

async function debugData() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        const users = await User.findAll({ attributes: ['id', 'email', 'firstName'] });
        console.log('--- USERS ---');
        users.forEach(u => console.log(`${u.id}: ${u.email} (${u.firstName})`));

        const issues = await Issue.findAll({
            attributes: ['id', 'key', 'title', 'status', 'assigneeId'],
            include: [{ model: User, as: 'assignee', attributes: ['email'] }]
        });
        console.log('--- ISSUES ---');
        issues.forEach(i => {
            console.log(`${i.key} [${i.status}]: ${i.title} (Assignee: ${i.assigneeId || 'Unassigned'})`);
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

debugData();
