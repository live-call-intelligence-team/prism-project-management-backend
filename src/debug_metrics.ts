
import { User, Sprint, Project, Issue } from './models';
import sequelize from './config/database';

async function run() {
    try {
        await sequelize.authenticate();
        console.log('DB Connected');

        // Check Users
        const users = await User.findAll();
        console.log('Total Users:', users.length);
        users.forEach(u => console.log(`User: ${u.email}, Org: ${u.orgId}, Active: ${u.isActive}`));

        // Check Sprints
        const sprints = await Sprint.findAll();
        console.log('Total Sprints:', sprints.length);
        sprints.forEach(s => console.log(`Sprint: ${s.name}, Status: ${s.status}, Project: ${s.projectId}`));

        // Check Active Sprints Query
        const activeSprints = await Sprint.count({ where: { status: 'ACTIVE' } });
        console.log('Active Sprints Count:', activeSprints);

        // Check Projects
        const projects = await Project.findAll();
        console.log('Total Projects:', projects.length);

        // Check Issues
        const issues = await Issue.findAll();
        console.log('Total Issues:', issues.length);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

run();
