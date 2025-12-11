import { Response } from 'express';
import { AuthRequest } from '../types/interfaces';
import { Sprint, Issue, Project, SprintMember, User } from '../models';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { SprintStatus, IssueStatus } from '../types/enums';
import { Op } from 'sequelize';

export class SprintController {
    // Create a new sprint
    static createSprint = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
        const {
            projectId,
            name,
            startDate,
            endDate,
            goal,
            key,
            notes,
            plannedPoints,
            burnDownConfig,
            teamMembers,        // Array of user IDs
            status              // Optional initial status
        } = req.body;

        const project = await Project.findByPk(projectId);
        if (!project) {
            throw new AppError('Project not found', 404);
        }

        // Auto-generate key if not provided
        let sprintKey = key;
        if (!sprintKey) {
            const projectData = await Project.findByPk(projectId);
            if (projectData) {
                // Let's stick to "SPRINT-X" pattern as requested, or "PROJ-Sprint-X". User example: "Sprint ID: SPRINT-404"

                // Find latest sprint for this project to get the number
                const lastSprint = await Sprint.findOne({
                    where: { projectId },
                    order: [['createdAt', 'DESC']],
                    attributes: ['key']
                });

                let nextNum = 1;
                if (lastSprint && lastSprint.key) {
                    const match = lastSprint.key.match(/SPRINT-(\d+)/);
                    if (match && match[1]) {
                        nextNum = parseInt(match[1]) + 1;
                    }
                }
                sprintKey = `SPRINT-${nextNum}`;
            }
        }

        const newSprint = await Sprint.create({
            projectId,
            name,
            startDate,
            endDate,
            goal,
            key: sprintKey,
            notes,
            plannedPoints,
            burnDownConfig,
            status: status || SprintStatus.PLANNED
        });

        // Add Team Members
        if (teamMembers && Array.isArray(teamMembers) && teamMembers.length > 0) {
            const memberData = teamMembers.map((userId: string) => ({
                sprintId: newSprint.id,
                userId,
                capacityHours: 0
            }));
            await SprintMember.bulkCreate(memberData);
        }

        // Fetch complete sprint with members
        const sprint = await Sprint.findByPk(newSprint.id, {
            include: ['members']
        });

        res.status(201).json({
            success: true,
            data: { sprint }
        });
    });

    // Get all sprints (filtered by org via project)
    static getAllSprints = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
        const { orgId } = req.user!;
        const { limit } = req.query;

        const sprints = await Sprint.findAll({
            include: [{
                model: Project,
                as: 'project',
                where: { orgId },
                attributes: ['id', 'name', 'key']
            }, {
                model: Issue,
                as: 'issues',
                attributes: ['id', 'status', 'storyPoints']
            }, {
                model: SprintMember,
                as: 'sprintMembers',
                include: [{
                    model: User,
                    as: 'user',
                    attributes: ['id', 'firstName', 'lastName', 'email']
                }]
            }],
            limit: limit ? parseInt(limit as string) : undefined,
            order: [['startDate', 'DESC']]
        });

        res.json({
            success: true,
            data: { sprints }
        });
    });

    // Get all sprints for a project
    static getProjectSprints = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
        const { projectId } = req.params;
        const { status } = req.query;

        const where: any = { projectId };
        if (status) {
            where.status = status;
        }

        const sprints = await Sprint.findAll({
            where,
            include: [{
                model: Issue,
                as: 'issues',
                attributes: ['id', 'key', 'title', 'status', 'storyPoints', 'assigneeId', 'priority', 'type']
            }, {
                model: SprintMember,
                as: 'sprintMembers',
                include: [{
                    model: User,
                    as: 'user',
                    attributes: ['id', 'firstName', 'lastName', 'email']
                }]
            }],
            order: [['startDate', 'ASC']]
        });

        res.json({
            success: true,
            data: { sprints }
        });
    });

    // Start a sprint
    static startSprint = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
        const { id } = req.params;

        const sprint = await Sprint.findByPk(id);
        if (!sprint) {
            throw new AppError('Sprint not found', 404);
        }

        if (sprint.status !== SprintStatus.PLANNED) {
            throw new AppError('Only planned sprints can be started', 400);
        }

        // Check if there are any other active sprints for this project
        const activeSprint = await Sprint.findOne({
            where: {
                projectId: sprint.projectId,
                status: SprintStatus.ACTIVE,
                id: { [Op.ne]: id }
            }
        });

        if (activeSprint) {
            throw new AppError('Project already has an active sprint', 400);
        }

        sprint.status = SprintStatus.ACTIVE;
        await sprint.save();

        res.json({
            success: true,
            data: { sprint }
        });
    });

    // Complete a sprint
    static completeSprint = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
        const { id } = req.params;
        const { moveIssuesToSprintId } = req.body; // Optional: ID of next sprint to move incomplete issues to

        const sprint = await Sprint.findByPk(id, {
            include: [{ model: Issue, as: 'issues' }]
        });

        if (!sprint) {
            throw new AppError('Sprint not found', 404);
        }

        if (sprint.status !== SprintStatus.ACTIVE) {
            throw new AppError('Only active sprints can be completed', 400);
        }

        // Find incomplete issues
        const incompleteIssues = sprint.issues?.filter(
            issue => issue.status !== IssueStatus.DONE
        ) || [];

        // Transactional update would be better here, but keeping it simple for now
        if (incompleteIssues.length > 0) {
            if (moveIssuesToSprintId) {
                // Move to specified next sprint
                const nextSprint = await Sprint.findByPk(moveIssuesToSprintId);
                if (!nextSprint) {
                    throw new AppError('Target sprint not found', 404);
                }

                await Issue.update(
                    { sprintId: moveIssuesToSprintId },
                    {
                        where: {
                            id: { [Op.in]: incompleteIssues.map(i => i.id) }
                        }
                    }
                );
            } else {
                // Move to backlog (sprintId = null)
                await Issue.update(
                    { sprintId: null },
                    {
                        where: {
                            id: { [Op.in]: incompleteIssues.map(i => i.id) }
                        }
                    }
                );
            }
        }

        sprint.status = SprintStatus.COMPLETED;
        await sprint.save();

        res.json({
            success: true,
            data: { sprint }
        });
    });


    // Get Sprint Statistics (Burn-down)
    static getSprintStatistics = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
        const { id } = req.params;

        const sprint = await Sprint.findByPk(id, {
            include: [{ model: Issue, as: 'issues' }]
        });

        if (!sprint) {
            throw new AppError('Sprint not found', 404);
        }

        const issues = sprint.issues || [];
        const totalPoints = issues.reduce((sum, issue) => sum + (issue.storyPoints || 0), 0);
        const completedPoints = issues
            .filter(i => i.status === IssueStatus.DONE)
            .reduce((sum, issue) => sum + (issue.storyPoints || 0), 0);

        // Burn-down Data Generation
        const burnDownNodes: { date: string; ideal: number; actual: number }[] = [];

        if (sprint.startDate && sprint.endDate) {
            const start = new Date(sprint.startDate);
            const end = new Date(sprint.endDate);
            const now = new Date();
            const todayStr = now.toISOString().split('T')[0]!;

            // Normalize dates to midnight
            start.setHours(0, 0, 0, 0);
            end.setHours(0, 0, 0, 0);

            const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
            const pointsPerDay = totalDays > 0 ? totalPoints / totalDays : 0;

            let currentDate = new Date(start);
            let dayIndex = 0;

            // Generate points for each day of the sprint
            while (currentDate <= end) {
                const dateStr = currentDate.toISOString().split('T')[0]!;

                // Ideal line: specific depletion per day
                const ideal = Math.max(0, totalPoints - (pointsPerDay * dayIndex));

                // Actual line
                // Sum of points of issues that were DONE on or before this date
                // We use updatedAt as proxy for completedAt.
                // NOTE: This assumes issues don't get updated after being marked DONE.
                let completedOnDate = 0;

                // Only calculate actual if date is in past or today
                if (dateStr <= todayStr!) {
                    completedOnDate = issues
                        .filter(i => {
                            if (i.status !== IssueStatus.DONE) return false;
                            const updated = new Date(i.updatedAt!);
                            const updatedStr = updated.toISOString().split('T')[0]!;
                            return updatedStr <= dateStr;
                        })
                        .reduce((sum, i) => sum + (i.storyPoints || 0), 0);
                }

                burnDownNodes.push({
                    date: dateStr,
                    ideal: Math.round(ideal * 10) / 10,
                    actual: dateStr <= todayStr! ? totalPoints - completedOnDate : (null as any) // null for future actuals
                });

                // Next day
                currentDate.setDate(currentDate.getDate() + 1);
                dayIndex++;
            }
        }

        res.json({
            success: true,
            data: {
                totalPoints,
                completedPoints,
                burnDown: burnDownNodes
            }
        });
    });

    // Update Sprint
    public static updateSprint = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
        const { id } = req.params;
        const { name, startDate, endDate, goal, status, notes, capacity, plannedPoints } = req.body;

        const sprint = await Sprint.findByPk(id);
        if (!sprint) {
            throw new AppError('Sprint not found', 404);
        }

        await sprint.update({
            name,
            startDate,
            endDate,
            goal,
            status,
            notes,
            capacity,
            plannedPoints
        });

        res.json({
            success: true,
            data: { sprint }
        });
    });

    // Delete Sprint
    public static deleteSprint = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
        const { id } = req.params;

        const sprint = await Sprint.findByPk(id);
        if (!sprint) {
            throw new AppError('Sprint not found', 404);
        }

        // Move issues to backlog
        await Issue.update(
            { sprintId: null },
            { where: { sprintId: id } }
        );

        // Delete sprint members
        await SprintMember.destroy({
            where: { sprintId: id }
        });

        // Delete sprint
        await sprint.destroy();

        res.json({
            success: true,
            message: 'Sprint deleted successfully'
        });
    });
}
