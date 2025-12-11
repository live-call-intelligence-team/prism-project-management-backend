import { sequelize } from '../models';
import IssueLink from '../models/IssueLink';

async function verify() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        // Check if table exists by counting
        const count = await IssueLink.count();
        console.log('IssueLink table count:', count);

        // Check table description (to see columns)
        const desc = await sequelize.getQueryInterface().describeTable('issue_links');
        console.log('Table description:', Object.keys(desc));

    } catch (error) {
        console.error('Verification failed:', error);
    } finally {
        await sequelize.close();
    }
}

verify();
