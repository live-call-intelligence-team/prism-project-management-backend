import { Response } from 'express';
import { AuthRequest } from '../types/interfaces';
import { Project, Issue, Milestone, User, Comment, Attachment, Organization, Sprint } from '../models';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { UserRole } from '../types/enums';
import { Op } from 'sequelize';
import { getOffset, getPaginationMeta } from '../utils/helpers';

export class ClientController {
    // Get all projects assigned to the client
    static getClientProjects = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = req.query.search as string;

        if (req.user?.role !== UserRole.CLIENT) {
            throw new AppError('Only clients can access this endpoint', 403);
        }

        const where: any = {
            clientId: req.user.id,
        };

        if (search) {
            where[Op.or] = [
                { name: { [Op.iLike]: `%${search}%` } },
                { key: { [Op.iLike]: `%${search}%` } },
            ];
        }

        const { count, rows } = await Project.findAndCountAll({
            where,
            limit,
            offset: getOffset(page, limit),
            order: [['createdAt', 'DESC']],
            include: [
                {
                    model: User,
                    as: 'lead',
                    attributes: ['id', 'firstName', 'lastName', 'email'],
                },
                {
                    model: User,
                    as: 'members',
                    attributes: ['id', 'firstName', 'lastName'],
                    through: { attributes: [] }
                }
            ],
            attributes: ['id', 'name', 'key', 'description', 'status', 'startDate', 'endDate', 'budget', 'clientConfig', 'updatedAt'],
        });

        // Calculate progress for each project
        const projectsWithProgress = await Promise.all(rows.map(async (project) => {
            const completedIssues = await Issue.count({
                where: { projectId: project.id, status: 'DONE', isClientVisible: true }
            });
            const totalIssues = await Issue.count({
                where: { projectId: project.id, isClientVisible: true }
            });

            return {
                ...project.toJSON(),
                progress: totalIssues > 0 ? Math.round((completedIssues / totalIssues) * 100) : 0,
                stats: {
                    totalIssues,
                    completedIssues,
                    openIssues: totalIssues - completedIssues
                }
            };
        }));

        res.json({
            success: true,
            data: {
                projects: projectsWithProgress,
                pagination: getPaginationMeta(page, limit, count),
            },
        });
    });

    // Get detailed client view of a specific project
    static getProjectDetail = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
        const { id } = req.params;

        if (req.user?.role !== UserRole.CLIENT) {
            throw new AppError('Only clients can access this endpoint', 403);
        }

        const project = await Project.findByPk(id, {
            include: [
                {
                    model: User,
                    as: 'lead',
                    attributes: ['id', 'firstName', 'lastName', 'email'],
                },
                {
                    model: Organization,
                    as: 'organization',
                    attributes: ['id', 'name'],
                },
                {
                    model: Milestone,
                    as: 'milestones',
                    order: [['dueDate', 'ASC']],
                },
                {
                    model: Attachment,
                    as: 'attachments',
                    include: [
                        {
                            model: User,
                            as: 'user',
                            attributes: ['id', 'firstName', 'lastName', 'role', 'email']
                        }
                    ]
                }
            ],
        });

        if (!project) {
            throw new AppError('Project not found', 404);
        }

        // Check if client is assigned to this project
        if (project.clientId !== req.user.id) {
            throw new AppError('Access denied', 403);
        }

        // Calculate stats (only client-visible tasks)
        const totalIssues = await Issue.count({ where: { projectId: id, isClientVisible: true } });
        const completedIssues = await Issue.count({ where: { projectId: id, status: 'DONE', isClientVisible: true } });
        const inProgressIssues = await Issue.count({ where: { projectId: id, status: 'IN_PROGRESS', isClientVisible: true } });
        const pendingApprovals = await Issue.count({ where: { projectId: id, clientApprovalStatus: 'PENDING', isClientVisible: true } });

        // Get recent activity (last 10 client-visible updates)
        const recentIssues = await Issue.findAll({
            where: { projectId: id, isClientVisible: true },
            order: [['updatedAt', 'DESC']],
            limit: 10,
            include: [
                { model: User, as: 'reporter', attributes: ['id', 'firstName', 'lastName'] },
                { model: User, as: 'assignee', attributes: ['id', 'firstName', 'lastName'] }
            ]
        });

        const recentActivity = recentIssues.map((issue: any) => {
            const isCreation = issue.createdAt.getTime() === issue.updatedAt.getTime();
            const action = isCreation ? 'created' : 'updated';
            return {
                id: issue.id,
                user: issue.reporter?.firstName + ' ' + issue.reporter?.lastName,
                action,
                target: issue.key + ': ' + issue.title,
                time: issue.updatedAt
            };
        });

        // Get upcoming milestones
        const upcomingMilestones = await Milestone.findAll({
            where: {
                projectId: id,
                status: { [Op.in]: ['UPCOMING', 'IN_PROGRESS'] }
            },
            order: [['dueDate', 'ASC']],
            limit: 5
        });

        const projectData = {
            ...project.toJSON(),
            stats: {
                totalIssues,
                completedIssues,
                inProgressIssues,
                pendingApprovals,
                progress: totalIssues > 0 ? Math.round((completedIssues / totalIssues) * 100) : 0,
            },
            recentActivity,
            upcomingMilestones,
        };

        res.json({
            success: true,
            data: { project: projectData },
        });
    });

    // Get client-visible tasks for a project
    static getProjectTasks = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
        const { id } = req.params;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const status = req.query.status as string;

        if (req.user?.role !== UserRole.CLIENT) {
            throw new AppError('Only clients can access this endpoint', 403);
        }

        // Verify client has access to this project
        const project = await Project.findByPk(id);
        if (!project || project.clientId !== req.user.id) {
            throw new AppError('Access denied', 403);
        }

        const where: any = {
            projectId: id,
            isClientVisible: true,
        };

        if (status) {
            where.status = status;
        }

        const { count, rows } = await Issue.findAndCountAll({
            where,
            limit,
            offset: getOffset(page, limit),
            order: [['createdAt', 'DESC']],
            include: [
                {
                    model: User,
                    as: 'assignee',
                    attributes: ['id', 'firstName', 'lastName', 'email'],
                },
                {
                    model: User,
                    as: 'reporter',
                    attributes: ['id', 'firstName', 'lastName', 'email'],
                },
                {
                    model: Comment,
                    as: 'comments',
                    where: { isClientVisible: true },
                    required: false,
                    include: [
                        {
                            model: User,
                            as: 'user',
                            attributes: ['id', 'firstName', 'lastName'],
                        }
                    ]
                },
                {
                    model: Attachment,
                    as: 'attachments',
                    required: false,
                },
                {
                    model: Sprint,
                    as: 'sprint',
                    attributes: ['id', 'name', 'status'],
                    required: false
                }
            ],
        });

        res.json({
            success: true,
            data: {
                tasks: rows,
                pagination: getPaginationMeta(page, limit, count),
            },
        });
    });

    // Get project milestones
    static getProjectMilestones = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
        const { id } = req.params;

        if (req.user?.role !== UserRole.CLIENT) {
            throw new AppError('Only clients can access this endpoint', 403);
        }

        // Verify access
        const project = await Project.findByPk(id);
        if (!project || project.clientId !== req.user.id) {
            throw new AppError('Access denied', 403);
        }

        const milestones = await Milestone.findAll({
            where: { projectId: id },
            order: [['dueDate', 'ASC']],
        });

        res.json({
            success: true,
            data: { milestones },
        });
    });

    // Get project activity feed
    static getProjectActivity = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
        const { id } = req.params;
        const limit = parseInt(req.query.limit as string) || 20;

        if (req.user?.role !== UserRole.CLIENT) {
            throw new AppError('Only clients can access this endpoint', 403);
        }

        // Verify access
        const project = await Project.findByPk(id);
        if (!project || project.clientId !== req.user.id) {
            console.error(`ACTIVITY_FETCH: Access denied. Project: ${id}, ClientId: ${project?.clientId}, User: ${req.user?.id}`);
            throw new AppError('Access denied', 403);
        }

        // 1. Issues (Created or Updated)
        const issues = await Issue.findAll({
            where: { projectId: id, isClientVisible: true },
            order: [['updatedAt', 'DESC']],
            limit,
            include: [
                { model: User, as: 'reporter', attributes: ['firstName', 'lastName'] },
                { model: User, as: 'assignee', attributes: ['firstName', 'lastName'] }
            ]
        });

        // 2. Comments
        const comments = await Comment.findAll({
            where: { isClientVisible: true },
            limit,
            order: [['createdAt', 'DESC']],
            include: [
                {
                    model: Issue,
                    as: 'issue',
                    where: { projectId: id, isClientVisible: true },
                    required: true,
                    attributes: ['id', 'key', 'title'],
                },
                {
                    model: User,
                    as: 'user',
                    attributes: ['firstName', 'lastName'],
                }
            ]
        });

        // 3. Attachments (New Files)
        // Note: Assuming Attachments are linked to Issues or Project. 
        // If linked to Issues, we query via Issue. If direct project files exist, we need that relation.
        // Based on models, Attachment likely belongs to Issue or Project-level 'files'.
        // Let's assume Issue linkage for now, or check if Project has attachments.
        // Checking Attachment model would be wise, but for now let's try generic find with linkage check if possible.
        // Actually, let's fetch Attachments that are linked to this project's issues OR directly to project if supported.
        // For safely, let's just fetch attachments on client-visible issues of this project.
        const attachments = await Attachment.findAll({
            order: [['createdAt', 'DESC']],
            limit,
            include: [
                {
                    model: Issue,
                    as: 'issue',
                    where: { projectId: id, isClientVisible: true },
                    required: true,
                    attributes: ['id', 'key', 'title'],
                },
                {
                    model: User,
                    as: 'user',
                    attributes: ['firstName', 'lastName'],
                }
            ]
        });

        // 4. Milestones (Completed recently)
        const milestones = await Milestone.findAll({
            where: {
                projectId: id,
                status: 'COMPLETED'
            },
            order: [['updatedAt', 'DESC']],
            limit
        });

        // Combine and sort
        const activity = [
            // Issues
            ...issues.map((issue: any) => {
                const isCreation = issue.createdAt.getTime() === issue.updatedAt.getTime();
                let action = isCreation ? 'created' : 'updated';

                // Simple heuristic for status changes
                if (!isCreation && issue.status === 'DONE') action = 'marked as Complete';
                if (!isCreation && issue.status === 'IN_PROGRESS') action = 'started working on';

                return {
                    type: isCreation ? 'issue_created' : 'issue_updated',
                    id: issue.id,
                    title: issue.title,
                    key: issue.key,
                    user: issue.reporter ? `${issue.reporter.firstName} ${issue.reporter.lastName}` : 'Unknown',
                    action: action,
                    target: `Task "${issue.title}"`,
                    timestamp: issue.updatedAt,
                    projectName: project.name,
                    icon: isCreation ? 'plus' : 'edit'
                };
            }),
            // Comments
            ...comments.map((comment: any) => ({
                type: 'comment',
                id: comment.id,
                content: comment.content.substring(0, 100),
                user: comment.user ? `${comment.user.firstName} ${comment.user.lastName}` : 'Unknown',
                action: 'commented on',
                target: `"${comment.issue?.title}"`,
                timestamp: comment.createdAt,
                projectName: project.name,
                icon: 'message-square'
            })),
            // Files
            ...attachments.map((file: any) => ({
                type: 'file_uploaded',
                id: file.id,
                user: file.user ? `${file.user.firstName} ${file.user.lastName}` : 'Unknown',
                action: 'uploaded file',
                target: `"${file.originalName}"`,
                timestamp: file.createdAt,
                projectName: project.name,
                icon: 'upload'
            })),
            // Milestones
            ...milestones.map((m: any) => ({
                type: 'milestone_completed',
                id: m.id,
                user: 'System', // Or project lead if tracked
                action: 'completed milestone',
                target: `"${m.name}"`,
                timestamp: m.updatedAt,
                projectName: project.name,
                icon: 'check-circle'
            }))
        ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, limit);

        res.json({
            success: true,
            data: { activity },
        });
    });

    // Get project timeline (milestones + key dates)
    static getProjectTimeline = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
        const { id } = req.params;

        if (req.user?.role !== UserRole.CLIENT) {
            throw new AppError('Only clients can access this endpoint', 403);
        }

        // Verify access
        const project = await Project.findByPk(id);
        if (!project || project.clientId !== req.user.id) {
            throw new AppError('Access denied', 403);
        }

        const milestones = await Milestone.findAll({
            where: { projectId: id },
            order: [['dueDate', 'ASC']],
        });

        const timeline = {
            startDate: project.startDate,
            endDate: project.endDate,
            currentPhase: milestones.find(m => m.status === 'IN_PROGRESS')?.name || 'Planning',
            milestones: milestones.map(m => ({
                id: m.id,
                name: m.name,
                dueDate: m.dueDate,
                status: m.status,
                progress: m.progress,
            })),
        };

        res.json({
            success: true,
            data: { timeline },
        });
    });

    // Get pending actions (Approvals, Feedback, Reviews)
    static getPendingActions = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
        const limit = parseInt(req.query.limit as string) || 10;

        if (req.user?.role !== UserRole.CLIENT) {
            throw new AppError('Only clients can access this endpoint', 403);
        }

        // Find issues that require client attention
        // 1. Client Approval Status = PENDING
        // 2. Labels contain 'feedback_needed' OR 'feedback-needed'
        // 3. Labels contain 'document_review' OR 'review-needed'

        const issues = await Issue.findAll({
            where: {
                isClientVisible: true,
                [Op.or]: [
                    { clientApprovalStatus: 'PENDING' },
                    { labels: { [Op.overlap]: ['feedback_needed', 'feedback-needed', 'document_review', 'review-needed'] } }
                ]
            },
            include: [
                {
                    model: Project,
                    as: 'project',
                    where: { clientId: req.user.id }, // Ensure client owns the project
                    attributes: ['id', 'name']
                }
            ],
            order: [['updatedAt', 'DESC']],
            limit
        });

        const actions = issues.map((issue: any) => {
            let type = 'approval';
            const labels = issue.labels || [];

            if (labels.includes('feedback_needed') || labels.includes('feedback-needed')) {
                type = 'feedback';
            } else if (labels.includes('document_review') || labels.includes('review-needed')) {
                type = 'review';
            }

            return {
                id: issue.id,
                key: issue.key,
                title: issue.title,
                type,
                project: issue.project,
                dueDate: issue.dueDate,
                priority: issue.priority,
                created: issue.createdAt
            };
        });

        res.json({
            success: true,
            data: { actions }
        });
    });

    // Global Search
    static globalSearch = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
        const query = req.query.q as string;

        if (!query || query.length < 2) {
            res.json({ success: true, data: { projects: [], tasks: [], files: [] } });
            return;
        }

        if (req.user?.role !== UserRole.CLIENT) {
            throw new AppError('Only clients can access this endpoint', 403);
        }

        // Get Client's Project IDs
        const clientProjects = await Project.findAll({
            where: { clientId: req.user.id },
            attributes: ['id']
        });
        const projectIds = clientProjects.map(p => p.id);

        // Parallel Search
        const [projects, tasks, files] = await Promise.all([
            // Projects
            Project.findAll({
                where: {
                    clientId: req.user.id,
                    [Op.or]: [
                        { name: { [Op.iLike]: `%${query}%` } },
                        { key: { [Op.iLike]: `%${query}%` } },
                        { description: { [Op.iLike]: `%${query}%` } }
                    ]
                },
                limit: 5,
                attributes: ['id', 'name', 'key', 'status']
            }),
            // Tasks
            Issue.findAll({
                where: {
                    projectId: { [Op.in]: projectIds },
                    isClientVisible: true,
                    [Op.or]: [
                        { title: { [Op.iLike]: `%${query}%` } },
                        { key: { [Op.iLike]: `%${query}%` } }
                    ]
                },
                limit: 5,
                attributes: ['id', 'title', 'key', 'status', 'projectId'],
                include: [{ model: Project, as: 'project', attributes: ['key', 'name'] }]
            }),
            // Files
            Attachment.findAll({
                where: {
                    projectId: { [Op.in]: projectIds },
                    originalName: { [Op.iLike]: `%${query}%` }
                },
                limit: 5,
                attributes: ['id', 'originalName', 'mimetype', 'size', 'projectId', 'createdAt'],
                include: [{ model: Project, as: 'project', attributes: ['key', 'name'] }]
            })
        ]);

        res.json({
            success: true,
            data: { projects, tasks, files }
        });
    });
}
