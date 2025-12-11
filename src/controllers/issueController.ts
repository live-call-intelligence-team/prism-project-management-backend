import { Response } from 'express';
import { AuthRequest } from '../types/interfaces';
import { Issue, User, Project, Sprint, Comment, Attachment, WorkLog, AuditLog, Epic, Feature } from '../models';
import IssueLink, { LinkType } from '../models/IssueLink';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { AuditAction, UserRole, IssueType, IssueStatus } from '../types/enums';
import { getOffset, getPaginationMeta, generateIssueKey, extractMentions } from '../utils/helpers';
import { NotificationService } from '../services/notificationService';
import { EmailService } from '../services/emailService';
import { Op } from 'sequelize';
import { io } from '../server';

export class IssueController {
    // Get all issues (with filters)
    static getAllIssues = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const projectId = req.query.projectId as string;
        const sprintId = req.query.sprintId as string;
        const assigneeId = req.query.assigneeId as string;
        const status = req.query.status as string;
        const priority = req.query.priority as string;
        const type = req.query.type as string;
        const sortBy = req.query.sortBy as string || 'createdAt';
        const sortOrder = (req.query.sortOrder as string || 'DESC').toUpperCase();
        const search = req.query.search as string;
        const clientApprovalStatus = req.query.clientApprovalStatus as string;

        const where: any = {};

        if (projectId) where.projectId = projectId;
        if (sprintId) where.sprintId = sprintId;
        if (assigneeId) where.assigneeId = assigneeId;
        if (status) where.status = status;
        if (priority) where.priority = priority;
        if (type) where.type = type;
        if (clientApprovalStatus) where.clientApprovalStatus = clientApprovalStatus;

        if (search) {
            where[Op.or] = [
                { title: { [Op.iLike]: `% ${search}% ` } },
                { key: { [Op.iLike]: `% ${search}% ` } }
            ];
        }

        // Client Visibility Filter
        if (req.user?.role === UserRole.CLIENT) {
            where.isClientVisible = true;
        }

        const order: any[][] = [];
        if (sortBy === 'dueDate') {
            // For due date, we might want nulls last
            order.push([sortBy, sortOrder]);
        } else {
            order.push([sortBy, sortOrder]);
        }


        const { count, rows } = await Issue.findAndCountAll({
            where,
            limit,
            offset: getOffset(page, limit),
            order: order as any,
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
                    model: Project,
                    as: 'project',
                    attributes: ['id', 'name', 'key'],
                },
                {
                    model: Sprint,
                    as: 'sprint',
                    attributes: ['id', 'name', 'status'],
                },
                {
                    model: Epic,
                    as: 'epic',
                    attributes: ['id', 'name', 'key'],
                },
                {
                    model: Feature,
                    as: 'feature',
                    attributes: ['id', 'name', 'key'],
                },
            ],
        });

        res.json({
            success: true,
            data: {
                issues: rows,
                pagination: getPaginationMeta(page, limit, count),
            },
        });
    });

    // Get issue by ID
    static getIssueById = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
        const { id } = req.params;

        const issue = await Issue.findByPk(id, {
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
                    model: Project,
                    as: 'project',
                    attributes: ['id', 'name', 'key'],
                },
                {
                    model: Sprint,
                    as: 'sprint',
                    attributes: ['id', 'name', 'status', 'startDate', 'endDate'],
                },
                {
                    model: Issue,
                    as: 'subtasks',
                    attributes: ['id', 'key', 'title', 'status', 'assigneeId'],
                },
                {
                    model: Comment,
                    as: 'comments',
                    required: false,
                    where: req.user && req.user.role === UserRole.CLIENT ? { isClientVisible: true } : undefined,
                    include: [
                        {
                            model: User,
                            as: 'user',
                            attributes: ['id', 'firstName', 'lastName', 'email', 'role'],
                        },
                    ],
                },
                {
                    model: Attachment,
                    as: 'attachments',
                },
                {
                    model: IssueLink,
                    as: 'links',
                    include: [
                        {
                            model: Issue,
                            as: 'relatedIssue',
                            attributes: ['id', 'key', 'title', 'status'],
                        }
                    ]
                },
                {
                    model: WorkLog,
                    as: 'workLogs',
                    include: [
                        {
                            model: User,
                            as: 'user',
                            attributes: ['id', 'firstName', 'lastName'],
                        },
                    ],
                },
                {
                    model: Epic,
                    as: 'epic',
                    attributes: ['id', 'name', 'key'],
                },
                {
                    model: Feature,
                    as: 'feature',
                    attributes: ['id', 'name', 'key'],
                },
            ],
        });

        if (!issue) {
            throw new AppError('Issue not found', 404);
        }

        res.json({
            success: true,
            data: { issue },
        });
    });

    // Create issue
    static createIssue = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
        console.log('CREATE ISSUE REQ BODY:', JSON.stringify(req.body, null, 2));
        const {
            projectId,
            title,
            description,
            type,
            priority,
            assigneeId,
            sprintId,
            parentId,
            storyPoints,
            estimatedHours,
            dueDate,
            labels,
            customFields,
            isClientVisible,
            epicId,
            featureId,
            fixVersion,
        } = req.body;

        // Verify project exists
        const project = await Project.findByPk(projectId);
        if (!project) {
            throw new AppError('Project not found', 404);
        }

        // If user is a CLIENT, verify they own this project
        if (req.user?.role === UserRole.CLIENT) {
            if (project.clientId !== req.user.id) {
                throw new AppError('Clients can only create issues in their own projects', 403);
            }
        }

        // --- HIERARCHY & SPRINT VALIDATION ---
        // 1. Sprint Rules
        if (sprintId && type === IssueType.EPIC) {
            throw new AppError('Epics cannot be assigned to a sprint', 400);
        }

        // 2. Hierarchy Rules
        let finalEpicId = epicId;
        let finalSprintId = sprintId;

        if (type === IssueType.EPIC) {
            if (parentId || epicId) {
                throw new AppError('Epics cannot have a parent or belong to another Epic', 400);
            }
        } else if (type === IssueType.STORY) {
            if (parentId) {
                const parent = await Issue.findByPk(parentId);
                if (parent && parent.type === IssueType.EPIC) {
                    finalEpicId = parent.id;
                } else if (parent) {
                    throw new AppError('Story parent must be an Epic', 400);
                }
            }
        } else if (type === IssueType.SUBTASK) {
            if (!parentId) {
                throw new AppError('Sub-tasks must have a parent Story', 400);
            }
            const parent = await Issue.findByPk(parentId);
            if (!parent || parent.type !== IssueType.STORY) {
                throw new AppError('Sub-task parent must be a Story', 400);
            }
            finalEpicId = parent.epicId; // Inherit Epic
            finalSprintId = parent.sprintId; // Inherit Sprint
        }
        // -------------------------------------

        // Get next issue number for project
        const lastIssue = await Issue.findOne({
            where: { projectId },
            order: [['issueNumber', 'DESC']],
        });
        const issueNumber = (lastIssue?.issueNumber || 0) + 1;
        const key = generateIssueKey(project.key, issueNumber);

        // Create issue
        const issue = await Issue.create({
            projectId,
            issueNumber,
            key,
            type,
            status: 'TODO' as any,
            priority: priority || 'MEDIUM',
            title,
            description,
            assigneeId,
            reporterId: req.user!.id,
            sprintId: finalSprintId,
            parentId,
            storyPoints,
            estimatedHours,
            actualHours: 0,
            dueDate,
            orderIndex: 0, // Default to 0, or logic to put at end
            labels: labels || [],
            customFields: customFields || {},
            isClientVisible: req.user?.role === UserRole.CLIENT ? true : (isClientVisible || false),
            epicId: finalEpicId || null,
            featureId: featureId || null,
            fixVersion: fixVersion || null,
        });

        // Update Sprint Progress
        if (finalSprintId) {
            await IssueController.recalculateSprintProgress(finalSprintId);
        }

        // Notify assignee
        if (assigneeId && assigneeId !== req.user!.id) {
            const assignee = await User.findByPk(assigneeId);
            if (assignee) {
                await NotificationService.notifyIssueAssignment(
                    assigneeId,
                    issue.key,
                    issue.title,
                    req.user!.id
                );

                try {
                    await EmailService.sendIssueAssignmentEmail(
                        assignee.email,
                        assignee.fullName,
                        issue.key,
                        issue.title,
                        req.user!.email || 'Team Member'
                    );
                } catch (error) {
                    // Email failure shouldn't stop issue creation
                }
            }
        }

        // Emit real-time event
        io.to(`project:${projectId} `).emit('issue:created', issue);

        // Audit log
        await AuditLog.create({
            userId: req.user!.id,
            action: AuditAction.CREATE,
            resource: 'issue',
            resourceId: issue.id,
            details: { key: issue.key, title: issue.title },
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
        });

        res.status(201).json({
            success: true,
            message: 'Issue created successfully',
            data: { issue },
        });
    });

    // Update issue
    static updateIssue = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
        const { id } = req.params;
        const {
            title,
            description,
            type,
            status,
            priority,
            assigneeId,
            sprintId,
            storyPoints,
            estimatedHours,
            dueDate,
            labels,
            customFields,
            isClientVisible,
            clientApprovalStatus,
            epicId,
            featureId,
            fixVersion,
        } = req.body;

        const issue = await Issue.findByPk(id);
        if (!issue) {
            throw new AppError('Issue not found', 404);
        }

        const oldAssigneeId = issue.assigneeId;
        const oldStatus = issue.status;

        // Update fields
        if (title) issue.title = title;
        if (description !== undefined) issue.description = description;
        if (type) issue.type = type;
        if (status) issue.status = status;
        if (priority) issue.priority = priority;
        if (assigneeId !== undefined) issue.assigneeId = assigneeId;
        if (sprintId !== undefined) issue.sprintId = sprintId;
        if (storyPoints !== undefined) issue.storyPoints = storyPoints;
        if (estimatedHours !== undefined) issue.estimatedHours = estimatedHours;
        if (dueDate !== undefined) issue.dueDate = dueDate;
        if (labels) issue.labels = labels;
        if (labels) issue.labels = labels;
        if (customFields) issue.customFields = { ...issue.customFields, ...customFields };
        if (isClientVisible !== undefined) issue.isClientVisible = isClientVisible;
        if (epicId !== undefined) issue.epicId = epicId;
        if (featureId !== undefined) issue.featureId = featureId;
        if (fixVersion !== undefined) issue.fixVersion = fixVersion;

        // Client Approval Logic
        if (clientApprovalStatus) {
            // Only allow Clients to set 'APPROVED' | 'CHANGES_REQUESTED' | 'REJECTED'
            // Only allow Admin/Team to set 'PENDING'
            // For simplicity in MVP: Allow update if role authorized
            issue.clientApprovalStatus = clientApprovalStatus;
        }

        await issue.save();

        // Recalculate sprint progress if status or story points changed
        if ((status && status !== oldStatus) || storyPoints !== undefined) {
            if (issue.sprintId) {
                await IssueController.recalculateSprintProgress(issue.sprintId);
            }
        }

        // Notify on assignee change
        if (assigneeId && assigneeId !== oldAssigneeId) {
            await NotificationService.notifyIssueAssignment(
                assigneeId,
                issue.key,
                issue.title,
                req.user!.id
            );
        }

        // Notify on status change
        if (status && status !== oldStatus && issue.assigneeId) {
            await NotificationService.notifyIssueUpdate(
                issue.assigneeId,
                issue.key,
                `Status changed to ${status} `
            );
        }

        // Emit real-time event
        io.to(`project:${issue.projectId} `).emit('issue:updated', issue);

        // Audit log
        await AuditLog.create({
            userId: req.user!.id,
            action: AuditAction.UPDATE,
            resource: 'issue',
            resourceId: issue.id,
            details: { key: issue.key, changes: req.body },
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
        });

        res.json({
            success: true,
            message: 'Issue updated successfully',
            data: { issue },
        });
    });

    // Delete issue
    static deleteIssue = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
        const { id } = req.params;

        const issue = await Issue.findByPk(id);
        if (!issue) {
            throw new AppError('Issue not found', 404);
        }

        // Audit log
        await AuditLog.create({
            userId: req.user!.id,
            action: AuditAction.DELETE,
            resource: 'issue',
            resourceId: issue.id,
            details: { key: issue.key, title: issue.title },
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
        });

        const projectId = issue.projectId;
        await issue.destroy();

        // Emit real-time event
        io.to(`project:${projectId} `).emit('issue:deleted', { id });

        res.json({
            success: true,
            message: 'Issue deleted successfully',
        });
    });

    // Get comments for an issue
    static getComments = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
        const { issueId } = req.params;

        const issue = await Issue.findByPk(issueId);
        if (!issue) {
            throw new AppError('Issue not found', 404);
        }

        // Build query - clients can only see client-visible comments
        const where: any = { issueId };
        if (req.user?.role === UserRole.CLIENT) {
            where.isClientVisible = true;
        }

        const comments = await Comment.findAll({
            where,
            include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'firstName', 'lastName', 'email', 'role']
            }],
            order: [['createdAt', 'ASC']]
        });

        res.json({
            success: true,
            data: { comments }
        });
    });

    // Add comment to issue
    static addComment = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
        const { issueId } = req.params;
        const { content, isClientVisible } = req.body;

        const issue = await Issue.findByPk(issueId);
        if (!issue) {
            throw new AppError('Issue not found', 404);
        }

        // Extract mentions
        const mentions = extractMentions(content);
        const mentionedUserIds: string[] = [];

        if (mentions.length > 0) {
            const users = await User.findAll({
                where: {
                    email: { [Op.in]: mentions.map(m => `${m} @example.com`) },
                },
            });
            mentionedUserIds.push(...users.map(u => u.id));
        }

        // Determine comment visibility
        // Default: true for clients, controllable for team members
        let commentVisibility = true;
        if (req.user?.role !== UserRole.CLIENT) {
            // Team members can control visibility
            commentVisibility = isClientVisible !== undefined ? isClientVisible : true;
        }

        // Create comment
        const comment = await Comment.create({
            issueId: issueId!,
            userId: req.user!.id,
            content,
            mentions: mentionedUserIds,
            isClientVisible: commentVisibility,
        });

        // Notify mentioned users
        for (const userId of mentionedUserIds) {
            await NotificationService.notifyMention(userId, issue.key, req.user!.id);
        }

        // Emit real-time event
        io.to(`project:${issue.projectId} `).emit('comment:created', comment);

        res.status(201).json({
            success: true,
            message: 'Comment added successfully',
            data: { comment },
        });
    });

    // Add work log
    static addWorkLog = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
        const { issueId } = req.params;
        const { timeSpent, date, description } = req.body;

        const issue = await Issue.findByPk(issueId);
        if (!issue) {
            throw new AppError('Issue not found', 404);
        }

        const workLog = await WorkLog.create({
            issueId: issueId!,
            userId: req.user!.id,
            timeSpent,
            date,
            description,
        });

        // Update actual hours on issue
        // Update actual hours on issue
        issue.actualHours = (Number(issue.actualHours) || 0) + Number(timeSpent);
        await issue.save();

        res.status(201).json({
            success: true,
            message: 'Work log added successfully',
            data: { workLog },
        });
    });
    // Get backlog issues (issues not assigned to any sprint)
    static getBacklog = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
        const { projectId } = req.params;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 50; // Higher limit for backlog

        const where: any = {
            projectId,
            sprintId: null // Explicitly look for null sprintId
        };

        // Optional filters for backlog
        if (req.query.type) where.type = req.query.type;
        if (req.query.priority) where.priority = req.query.priority;
        if (req.query.search) {
            where[Op.or] = [
                { title: { [Op.iLike]: `% ${req.query.search}% ` } },
                { key: { [Op.iLike]: `% ${req.query.search}% ` } }
            ];
        }

        const { count, rows } = await Issue.findAndCountAll({
            where,
            limit,
            offset: getOffset(page, limit),
            order: [['issueNumber', 'DESC']], // Newest first by default, simplified ranking
            include: [
                {
                    model: User,
                    as: 'assignee',
                    attributes: ['id', 'firstName', 'lastName', 'email'],
                },
                {
                    model: Sprint,
                    as: 'sprint',
                    attributes: ['id', 'name'],
                },
            ],
        });

        res.json({
            success: true,
            data: {
                issues: rows,
                pagination: getPaginationMeta(page, limit, count),
            },
        });
    });

    // Assign multiple issues to a sprint (or move to backlog if sprintId is null)
    static assignSprint = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
        const { sprintId, issueIds } = req.body; // sprintId can be null to move to backlog

        if (!Array.isArray(issueIds) || issueIds.length === 0) {
            throw new AppError('issueIds array is required', 400);
        }

        // Verify sprint exists if not null
        if (sprintId) {
            const sprint = await Sprint.findByPk(sprintId);
            if (!sprint) {
                throw new AppError('Sprint not found', 404);
            }
        }

        // Update issues
        await Issue.update(
            { sprintId },
            {
                where: {
                    id: { [Op.in]: issueIds }
                }
            }
        );

        res.json({
            success: true,
            message: `Updated ${issueIds.length} issues`,
        });
    });

    // Update issue status (Drag-and-Drop)
    static updateStatus = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
        const { id } = req.params;
        const { status } = req.body;

        const issue = await Issue.findByPk(id);
        if (!issue) {
            throw new AppError('Issue not found', 404);
        }

        const oldStatus = issue.status;
        issue.status = status;
        await issue.save();

        if (oldStatus !== status && issue.assigneeId) {
            await NotificationService.notifyIssueUpdate(
                issue.assigneeId,
                issue.key,
                `Status changed to ${status} `
            );
        }

        // Audit log (simplified)
        await AuditLog.create({
            userId: req.user!.id,
            action: AuditAction.STATUS_CHANGE,
            resource: 'issue',
            resourceId: issue.id,
            details: { from: oldStatus, to: status },
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
        });

        res.json({
            success: true,
            data: { issue }
        });
    });
    // Get issues assigned to the current user
    static getMyIssues = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const status = req.query.status as string; // Optional filter
        const role = req.query.role as string || 'assignee'; // 'assignee' or 'reporter'
        const priority = req.query.priority as string;
        const type = req.query.type as string;
        const projectId = req.query.projectId as string;
        const search = req.query.search as string;

        const where: any = {};

        if (role === 'reporter') {
            where.reporterId = req.user!.id;
        } else {
            where.assigneeId = req.user!.id;
        }

        if (status) {
            where.status = status;
        }
        // If no status provided, we usually show active issues, BUT for "All" tab in frontend we might pass nothing.
        // Let's assume if status is undefined, we return everything (or frontend passes specific statuses).
        // The previous logic was: where.status = { [Op.notIn]: ['DONE', 'CANCELLED'] };
        // I will change it to: if explicitly "ALL" or undefined, return all?
        // Actually adhering to Jira, "My Requests" usually defaults to Open.
        // Let's keep the filter optional but if not provided, don't filter by status (return all).

        if (priority) where.priority = priority;
        if (type) where.type = type;
        if (projectId) where.projectId = projectId;

        if (search) {
            where[Op.or] = [
                { title: { [Op.iLike]: `% ${search}% ` } },
                { key: { [Op.iLike]: `% ${search}% ` } }
            ];
        }

        const { count, rows } = await Issue.findAndCountAll({
            where,
            limit,
            offset: getOffset(page, limit),
            order: [
                ['updatedAt', 'DESC'], // Recently updated first
            ],
            include: [
                {
                    model: Project,
                    as: 'project',
                    attributes: ['id', 'name', 'key'],
                },
                {
                    model: Sprint,
                    as: 'sprint',
                    attributes: ['id', 'name', 'endDate'],
                },
            ],
        });

        res.json({
            success: true,
            data: {
                issues: rows,
                pagination: getPaginationMeta(page, limit, count),
            },
        });
    });

    // Client approval endpoint (for clients to approve/reject tasks)
    static clientApproval = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
        const { id } = req.params;
        const { status, feedback } = req.body;

        // Only clients can use this endpoint
        if (req.user?.role !== UserRole.CLIENT) {
            throw new AppError('Only clients can approve tasks', 403);
        }

        const issue = await Issue.findByPk(id, {
            include: [{
                model: Project,
                as: 'project',
            }]
        });

        if (!issue) {
            throw new AppError('Issue not found', 404);
        }

        // Verify client has access to this project
        const project = issue.get('project') as any;
        if (project.clientId !== req.user.id) {
            throw new AppError('Access denied', 403);
        }

        // Verify issue is client-visible
        if (!issue.isClientVisible) {
            throw new AppError('This task is not available for client review', 403);
        }

        // Update approval status
        issue.clientApprovalStatus = status;
        if (feedback) {
            issue.clientFeedback = feedback;
        }
        await issue.save();

        // Notify project lead or assignee
        const notifyUserId = issue.assigneeId || project.leadId;
        if (notifyUserId) {
            await NotificationService.notifyIssueUpdate(
                notifyUserId,
                issue.key,
                `Client ${status === 'APPROVED' ? 'approved' : status === 'CHANGES_REQUESTED' ? 'requested changes for' : 'rejected'} this task`
            );
        }

        // Emit real-time event
        io.to(`project:${issue.projectId} `).emit('issue:client-approval', {
            issueId: issue.id,
            status,
            feedback,
        });

        // Audit log
        await AuditLog.create({
            userId: req.user!.id,
            action: AuditAction.UPDATE,
            resource: 'issue',
            resourceId: issue.id,
            details: { action: 'client_approval', status, feedback },
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
        });

        res.json({
            success: true,
            message: 'Approval status updated successfully',
            data: { issue },
        });
    });

    // --- JIRA-LIKE HIERARCHY METHODS ---

    // Get Hierarchy (Epics -> Stories -> Subtasks)
    static getHierarchy = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
        const { projectId } = req.params;

        // Fetch Epics with children
        const epics = await Issue.findAll({
            where: { projectId, type: IssueType.EPIC },
            include: [{
                model: Issue,
                as: 'childIssues', // Stories
                required: false,
                include: [{
                    model: Issue,
                    as: 'subtasks', // Subtasks
                    required: false
                }]
            }],
            order: [['orderIndex', 'ASC']]
        });

        // Fetch Unassigned Stories (No Epic)
        const unassignedStories = await Issue.findAll({
            where: {
                projectId,
                type: { [Op.in]: [IssueType.STORY, IssueType.TASK, IssueType.BUG] },
                epicId: null,
                sprintId: null
            },
            include: [{
                model: Issue,
                as: 'subtasks',
                required: false
            }],
            order: [['orderIndex', 'ASC']]
        });

        res.json({
            success: true,
            data: {
                epics,
                unassigned: unassignedStories
            }
        });
    });

    // Get Children
    static getChildren = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
        const { id } = req.params;
        const parent = await Issue.findByPk(id);
        if (!parent) throw new AppError('Issue not found', 404);

        let children: Issue[] = [];
        if (parent.type === IssueType.EPIC) {
            children = await Issue.findAll({ where: { epicId: id } });
        } else if (parent.type === IssueType.STORY) {
            children = await Issue.findAll({ where: { parentId: id } });
        }

        res.json({ success: true, data: { children } });
    });

    // Create Story specifically
    static createStory = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
        const { title, description, epicId, assigneeId, storyPoints, priority, projectId } = req.body;

        if (!epicId) throw new AppError('Epic ID is required for a Story', 400);
        const epic = await Issue.findByPk(epicId);
        if (!epic || epic.type !== IssueType.EPIC) throw new AppError('Invalid Epic ID', 400);

        const lastIssue = await Issue.findOne({ where: { projectId }, order: [['issueNumber', 'DESC']] });
        const issueNumber = (lastIssue?.issueNumber || 0) + 1;
        const project = await Project.findByPk(projectId);
        if (!project) throw new AppError('Project not found', 404);
        const key = generateIssueKey(project.key, issueNumber);

        const story = await Issue.create({
            projectId, issueNumber, key,
            title, description,
            type: IssueType.STORY,
            epicId, assigneeId, storyPoints,
            priority: priority || 'MEDIUM',
            reporterId: req.user!.id,
            status: IssueStatus.TODO as any,
            orderIndex: 0, labels: [],
            customFields: {},
            isClientVisible: false
        });

        res.status(201).json({ success: true, data: { issue: story } });
    });

    // Create Subtask specifically
    static createSubtask = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
        const { title, description, parentId, assigneeId, priority } = req.body;

        if (!parentId) throw new AppError('Parent Story ID is required', 400);
        const parent = await Issue.findByPk(parentId);
        if (!parent || ![IssueType.STORY, IssueType.TASK, IssueType.BUG].includes(parent.type)) throw new AppError('Parent must be a Story, Task, or Bug', 400);

        const lastIssue = await Issue.findOne({ where: { projectId: parent.projectId }, order: [['issueNumber', 'DESC']] });
        const issueNumber = (lastIssue?.issueNumber || 0) + 1;
        const project = await Project.findByPk(parent.projectId);
        const key = generateIssueKey(project!.key, issueNumber);

        const subtask = await Issue.create({
            projectId: parent.projectId, issueNumber, key,
            title, description,
            type: IssueType.SUBTASK,
            parentId, epicId: parent.epicId, sprintId: parent.sprintId,
            assigneeId: assigneeId || parent.assigneeId,
            priority: priority || parent.priority,
            reporterId: req.user!.id,
            status: IssueStatus.TODO as any,
            orderIndex: 0, labels: [],
            customFields: {},
            isClientVisible: false
        });

        res.status(201).json({ success: true, data: { issue: subtask } });
    });

    // Move logic (renamed from moveToSprint in plan to match controller style)
    static moveIssueToSprint = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
        const { id } = req.params;
        const { sprintId } = req.body;

        const issue = await Issue.findByPk(id, { include: ['subtasks'] });
        if (!issue) throw new AppError('Issue not found', 404);

        if (issue.type === IssueType.EPIC) throw new AppError('Cannot move Epic to sprint', 400);

        // Update sprint
        issue.sprintId = sprintId || null;
        await issue.save();

        // Update subtasks
        if ((issue as any).subtasks && (issue as any).subtasks.length > 0) {
            await Issue.update({ sprintId: sprintId || null }, { where: { parentId: id } });
        }

        res.json({ success: true, message: 'Issue and subtasks moved' });
    });

    // Close Epic
    static closeEpic = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
        const { epicId } = req.params;
        const { force } = req.body; // Add force option

        const epic = await Issue.findByPk(epicId);
        if (!epic || epic.type !== IssueType.EPIC) throw new AppError('Epic not found', 404);

        if (!force) {
            const children = await Issue.findAll({ where: { epicId } });
            const openChildren = children.filter(c => c.status !== IssueStatus.DONE && c.status !== IssueStatus.CANCELLED);
            if (openChildren.length > 0) throw new AppError(`Cannot close Epic.${openChildren.length} stories are still open.`, 400);
        }

        epic.status = IssueStatus.DONE as any;
        await epic.save();

        res.json({ success: true, message: 'Epic closed successfully' });
    });

    // Helper: Recalculate sprint progress with weighted completion
    private static async recalculateSprintProgress(sprintId: string | null): Promise<void> {
        if (!sprintId) return;

        const sprint = await Sprint.findByPk(sprintId);
        if (!sprint) return;

        // Get all issues in this sprint
        const issues = await Issue.findAll({
            where: { sprintId },
            attributes: ['id', 'status', 'storyPoints']
        });

        if (issues.length === 0) {
            sprint.completedPoints = 0;
            await sprint.save();
            return;
        }

        // Calculate weighted completion
        // TODO = 0%, IN_PROGRESS = 50%, IN_REVIEW = 75%, DONE = 100%
        const statusWeights: Record<string, number> = {
            'TODO': 0,
            'IN_PROGRESS': 0.5,
            'IN_REVIEW': 0.75,
            'DONE': 1.0,
            'BLOCKED': 0,
            'CANCELLED': 0
        };

        let weightedPoints = 0;
        let totalPoints = 0;

        issues.forEach(issue => {
            const points = issue.storyPoints || 0;
            const weight = statusWeights[issue.status] || 0;

            weightedPoints += points * weight;
            totalPoints += points;
        });

        // Update sprint with calculated values
        sprint.totalPoints = totalPoints;
        sprint.completedPoints = Math.round(weightedPoints * 10) / 10; // Round to 1 decimal
        await sprint.save();
    }

    // --- ISSUE LINKING ---

    // Add Link
    static addLink = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
        const { id } = req.params;
        const { targetIssueId, type } = req.body;

        const sourceIssue = await Issue.findByPk(id);
        const targetIssue = await Issue.findByPk(targetIssueId);

        if (!sourceIssue || !targetIssue) throw new AppError('Issue not found', 404);
        if (id === targetIssueId) throw new AppError('Cannot link issue to itself', 400);

        // Check if link exists
        const existingLink = await IssueLink.findOne({
            where: {
                sourceIssueId: id,
                targetIssueId,
                type: type as LinkType
            }
        });

        if (existingLink) throw new AppError('Link already exists', 400);

        const link = await IssueLink.create({
            sourceIssueId: id || '',
            targetIssueId,
            type: type as LinkType
        });

        // Reciprocal link logic placeholder removed for now to fix build errors
        // TODO: Implement reciprocal linking (e.g. A blocks B -> B is blocked by A)

        // Audit Log
        await AuditLog.create({
            userId: req.user!.id,
            action: AuditAction.UPDATE,
            resource: 'issue',
            resourceId: id,
            details: { action: 'add_link', targetIssueId, type },
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
        });

        res.status(201).json({ success: true, data: { link } });
    });

    // Remove Link
    static removeLink = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
        const { id, linkId } = req.params;

        const link = await IssueLink.findOne({ where: { id: linkId, sourceIssueId: id } });
        if (!link) throw new AppError('Link not found', 404);

        await link.destroy();

        res.json({ success: true, message: 'Link removed' });
    });
    // Get Issue History (Audit Logs)
    static getHistory = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
        const { id } = req.params;

        const logs = await AuditLog.findAll({
            where: {
                resource: 'issue',
                resourceId: id,
            },
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'firstName', 'lastName', 'email', 'role'], // Avatar?
                },
            ],
            order: [['createdAt', 'DESC']],
        });

        res.json({
            success: true,
            data: {
                history: logs,
            },
        });
    });
}
