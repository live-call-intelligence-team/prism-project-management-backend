import { Response } from 'express';
import { AuthRequest } from '../types/interfaces';
import { Project, User, Organization, ProjectMember, Issue, AuditLog } from '../models';
import sequelize from '../config/database';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { AuditAction, UserRole } from '../types/enums';
import { getOffset, getPaginationMeta } from '../utils/helpers';
import { Op } from 'sequelize';

export class ProjectController {
    // Get all projects
    static getAllProjects = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = req.query.search as string;
        const status = req.query.status as string;

        const where: any = {};

        // Filter by role
        if (req.user?.role === UserRole.CLIENT) {
            // Clients see projects assigned to them specifically
            where.clientId = req.user.id;
        } else if (req.user?.role === UserRole.PROJECT_MANAGER) {
            // Project Managers see projects they manage
            where.projectManagerId = req.user.id;
        } else if (req.user?.role === UserRole.SCRUM_MASTER) {
            // Scrum Masters see only projects they are members of
            // We need to fetch project IDs first or use a subquery/include with where
            // For simplicity, let's fetch IDs from ProjectMember
            const memberProjects = await ProjectMember.findAll({
                where: { userId: req.user.id },
                attributes: ['projectId']
            });
            const projectIds = memberProjects.map(mp => mp.projectId);

            // Also include projects where they are Lead (though lead should be a member)
            where[Op.or] = [
                { id: { [Op.in]: projectIds } },
                { leadId: req.user.id }
            ];
            where.orgId = req.user.orgId;
        } else if (req.user?.role !== UserRole.ADMIN) {
            // Employees see organization projects (or just their own? The requirement says Admin sees ALL, Scrum Master sees Assigned. 
            // Default rule for Employee might be "All Org" or "Assigned". 
            // Existing code said "Employees see organization projects". keeping that for generic EMPLOYEE role unless specified otherwise.)
            where.orgId = req.user?.orgId;
        }

        // Search filter
        if (search) {
            where[Op.or] = [
                { name: { [Op.iLike]: `%${search}%` } },
                { key: { [Op.iLike]: `%${search}%` } },
                { description: { [Op.iLike]: `%${search}%` } },
            ];
        }

        // Status filter
        if (status) {
            where.status = status;
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
                    model: Organization,
                    as: 'organization',
                    attributes: ['id', 'name'],
                },
            ],
        });

        res.json({
            success: true,
            data: {
                projects: rows,
                pagination: getPaginationMeta(page, limit, count),
            },
        });
    });

    // Get project by ID
    static getProjectById = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
        const { id } = req.params;

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
                    model: User,
                    as: 'members',
                    attributes: ['id', 'firstName', 'lastName', 'email', 'role'],
                    through: { attributes: ['role'] },
                },
            ],
        });

        if (!project) {
            throw new AppError('Project not found', 404);
        }

        // Check access
        if (req.user?.role === UserRole.CLIENT) {
            if (project.clientId !== req.user.id) {
                throw new AppError('Access denied', 403);
            }
        } else if (req.user?.role !== UserRole.ADMIN && project.orgId !== req.user?.orgId) {
            throw new AppError('Access denied', 403);
        }

        // Calculate stats
        const totalIssues = await Issue.count({ where: { projectId: id } });
        const openIssues = await Issue.count({ where: { projectId: id, status: { [Op.notIn]: ['DONE', 'CANCELLED'] } } });
        const inProgressIssues = await Issue.count({ where: { projectId: id, status: 'IN_PROGRESS' } });
        const completedIssues = await Issue.count({ where: { projectId: id, status: 'DONE' } });
        // Assuming we have Sprint model linked
        // const activeSprints = await Sprint.count({ where: { projectId: id, status: 'ACTIVE' } });
        // For now, placeholder or fetch if relation exists
        const activeSprints = 0; // TODO: Link Sprint model

        // Fetch recent activity (Last 5 issues created/updated)
        // We can check both createdAt and updatedAt. simplifying to just latest issues by updatedAt
        const recentIssues = await Issue.findAll({
            where: { projectId: id },
            order: [['updatedAt', 'DESC']],
            limit: 5,
            include: [
                { model: User, as: 'reporter', attributes: ['id', 'firstName', 'lastName'] },
                { model: User, as: 'assignee', attributes: ['id', 'firstName', 'lastName'] }
            ]
        });

        const recentActivity = recentIssues.map((issue: any) => {
            const isCreation = issue.createdAt.getTime() === issue.updatedAt.getTime();
            const action = isCreation ? 'created issue' : 'updated issue';
            return {
                id: issue.id,
                user: issue.reporter?.firstName + ' ' + issue.reporter?.lastName,
                action,
                target: issue.key,
                time: issue.updatedAt
            };
        });

        // Priority Breakdown
        const priorityStats = await Issue.findAll({
            where: { projectId: id },
            attributes: ['priority', [sequelize.fn('COUNT', sequelize.col('priority')), 'count']],
            group: ['priority'],
            raw: true
        });

        const priorityBreakdown = {
            CRITICAL: 0,
            HIGH: 0,
            MEDIUM: 0,
            LOW: 0,
            ...Object.fromEntries(priorityStats.map((s: any) => [s.priority, parseInt(s.count)]))
        };

        const projectData = {
            ...project.toJSON(),
            stats: {
                totalIssues,
                openIssues,
                inProgressIssues,
                completedIssues,
                activeSprints,
                priorityBreakdown
            },
            recentActivity
        };

        res.json({
            success: true,
            data: { project: projectData },
        });
    });

    // Create project
    static createProject = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
        const { name, key, description, leadId, clientId, projectManagerId, scrumMasterId, visibility, startDate, endDate, budget, clientConfig, addClient, clientDetails, type, usesEpics, usesSprints, memberIds } = req.body;

        // Check if project key already exists
        const existingProject = await Project.findOne({ where: { key: key.toUpperCase() } });
        if (existingProject) {
            throw new AppError('Project key already exists', 400);
        }

        // Verify PM exists if provided
        if (projectManagerId) {
            const pm = await User.findByPk(projectManagerId);
            if (!pm) throw new AppError('Project Manager not found', 404);
            // Optional: Check role
            // if (pm.role !== UserRole.PROJECT_MANAGER) throw new AppError('User is not a Project Manager', 400);
        }

        // Verify SM exists if provided
        if (scrumMasterId) {
            const sm = await User.findByPk(scrumMasterId);
            if (!sm) throw new AppError('Scrum Master not found', 404);
            // Optional: Check role
        }

        // Verify lead exists
        const leadIdToCheck = leadId || req.user!.id;
        const lead = await User.findByPk(leadIdToCheck);
        if (!lead) {
            console.error(`Project creation failed: Lead not found. ID: ${leadIdToCheck}, Req User ID: ${req.user!.id} `);
            throw new AppError('Project lead not found', 404);
        }

        let createdClientId = clientId;

        // Handle Client Creation if requested
        if (addClient && clientDetails) {
            const { name: cName, email: cEmail, phone: cPhone, username: cUsername, password: cPassword } = clientDetails;

            // Check if user exists
            let clientUser = await User.findOne({
                where: {
                    [Op.or]: [{ email: cEmail }, { username: cUsername }]
                }
            });

            if (!clientUser) {
                // Create new Client User
                const bcrypt = require('bcryptjs'); // Lazy load or move to imports
                const salt = await bcrypt.genSalt(10);
                const passwordHash = await bcrypt.hash(cPassword, salt);

                // Split name
                const nameParts = cName.split(' ');
                const firstName = nameParts[0];
                const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

                clientUser = await User.create({
                    firstName,
                    lastName: lastName || 'Client',
                    email: cEmail,
                    username: cUsername,
                    phone: cPhone,
                    passwordHash,
                    role: UserRole.CLIENT,
                    orgId: req.user!.orgId, // Add to same org
                    forcePasswordChange: true,
                    isActive: true, // Auto-activate or require email verify? Spec implies immediate use
                    createdBy: req.user!.id,
                    profileData: {},
                    mfaEnabled: false
                });
            }
            createdClientId = clientUser.id;
        }

        // Create project
        const project = await Project.create({
            name,
            key: key.toUpperCase(),
            description,
            orgId: req.user!.orgId,
            leadId: leadId || req.user!.id,
            clientId: createdClientId || null,
            projectManagerId: projectManagerId || null,
            scrumMasterId: scrumMasterId || null,
            settings: {},
            clientConfig: clientConfig || { showBudget: false, allowTaskCreation: false },
            status: 'ACTIVE' as any,
            visibility: visibility || 'PRIVATE',
            startDate,
            endDate,
            budget,
            type: type || 'SCRUM',
            usesEpics: usesEpics !== undefined ? usesEpics : true,
            usesSprints: usesSprints !== undefined ? usesSprints : false,
        });

        // Add lead as project member
        await ProjectMember.create({
            projectId: project.id,
            userId: leadId || req.user!.id,
            role: 'LEAD',
            accessLevel: 'APPROVER' // Leads have full access
        });

        // If client was created/assigned, add them as member too
        if (createdClientId) {
            // Check if not already added (if lead is client? unlikely)
            if (createdClientId !== (leadId || req.user!.id)) {
                await ProjectMember.create({
                    projectId: project.id,
                    userId: createdClientId,
                    role: 'CLIENT',
                    accessLevel: clientDetails?.accessLevel || 'VIEW_ONLY'
                });
            }
        }

        // Add Project Manager as member
        if (projectManagerId) {
            if (projectManagerId !== (leadId || req.user!.id)) {
                await ProjectMember.create({
                    projectId: project.id,
                    userId: projectManagerId,
                    role: 'PROJECT_MANAGER',
                    accessLevel: 'APPROVER'
                });
            }
        }

        // Add Scrum Master as member
        if (scrumMasterId) {
            if (scrumMasterId !== (leadId || req.user!.id)) {
                await ProjectMember.create({
                    projectId: project.id,
                    userId: scrumMasterId,
                    role: 'SCRUM_MASTER',
                    accessLevel: 'APPROVER'
                });
            }
        }

        // Add team members if provided
        if (memberIds && Array.isArray(memberIds) && memberIds.length > 0) {
            const membersToAdd = memberIds.filter((id: string) =>
                id !== (leadId || req.user!.id) && id !== createdClientId
            );

            if (membersToAdd.length > 0) {
                const projectMembers = membersToAdd.map((userId: string) => ({
                    projectId: project.id,
                    userId,
                    role: 'MEMBER',
                    accessLevel: 'COMMENTER' as any // Default access for team members
                }));
                await ProjectMember.bulkCreate(projectMembers);
            }
        }

        // Audit log
        await AuditLog.create({
            userId: req.user!.id,
            action: AuditAction.CREATE,
            resource: 'project',
            resourceId: project.id,
            details: { name: project.name, key: project.key, createdClient: !!addClient },
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
        });

        res.status(201).json({
            success: true,
            message: 'Project created successfully',
            data: { project },
        });
    });

    // Update project
    static updateProject = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
        const { id } = req.params;
        const { name, description, leadId, clientId, status, visibility, startDate, endDate, budget, settings, clientConfig } = req.body;

        const project = await Project.findByPk(id);
        if (!project) {
            throw new AppError('Project not found', 404);
        }

        // Check access
        if (req.user?.role !== UserRole.ADMIN && project.orgId !== req.user?.orgId) {
            throw new AppError('Access denied', 403);
        }

        // Update fields
        if (name) project.name = name;
        if (description !== undefined) project.description = description;
        if (leadId) {
            const lead = await User.findByPk(leadId);
            if (!lead) {
                throw new AppError('Project lead not found', 404);
            }
            project.leadId = leadId;
        }
        // Handle Project Manager Update
        const { projectManagerId, scrumMasterId } = req.body;
        if (projectManagerId !== undefined) {
            // Basic validation could be added here
            project.projectManagerId = projectManagerId;
            // Ensure they are added as a member?
            if (projectManagerId) {
                const existingMember = await ProjectMember.findOne({ where: { projectId: project.id, userId: projectManagerId } });
                if (!existingMember) {
                    await ProjectMember.create({
                        projectId: project.id,
                        userId: projectManagerId,
                        role: 'PROJECT_MANAGER',
                        accessLevel: 'APPROVER'
                    });
                }
            }
        }
        // Handle Scrum Master Update
        if (scrumMasterId !== undefined) {
            project.scrumMasterId = scrumMasterId;
            // Ensure they are added as a member?
            if (scrumMasterId) {
                const existingMember = await ProjectMember.findOne({ where: { projectId: project.id, userId: scrumMasterId } });
                if (!existingMember) {
                    await ProjectMember.create({
                        projectId: project.id,
                        userId: scrumMasterId,
                        role: 'SCRUM_MASTER',
                        accessLevel: 'APPROVER'
                    });
                }
            }
        }
        if (clientId !== undefined) project.clientId = clientId;
        if (status) project.status = status;
        if (visibility) project.visibility = visibility;
        if (startDate) project.startDate = startDate;
        if (endDate) project.endDate = endDate;
        if (budget !== undefined) project.budget = budget;
        if (budget !== undefined) project.budget = budget;
        if (settings) project.settings = { ...project.settings, ...settings };
        if (clientConfig) project.clientConfig = { ...project.clientConfig, ...clientConfig };

        await project.save();

        // Audit log
        await AuditLog.create({
            userId: req.user!.id,
            action: AuditAction.UPDATE,
            resource: 'project',
            resourceId: project.id,
            details: { changes: req.body },
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
        });

        res.json({
            success: true,
            message: 'Project updated successfully',
            data: { project },
        });
    });

    // Delete project
    static deleteProject = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
        const { id } = req.params;

        const project = await Project.findByPk(id);
        if (!project) {
            throw new AppError('Project not found', 404);
        }

        // Only admins can delete projects
        if (req.user?.role !== UserRole.ADMIN) {
            throw new AppError('Only admins can delete projects', 403);
        }

        // Audit log before deletion
        await AuditLog.create({
            userId: req.user!.id,
            action: AuditAction.DELETE,
            resource: 'project',
            resourceId: project.id,
            details: { name: project.name, key: project.key },
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
        });

        await project.destroy();

        res.json({
            success: true,
            message: 'Project deleted successfully',
        });
    });

    // Get project members
    static getProjectMembers = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
        const { id } = req.params;

        const project = await Project.findByPk(id);
        if (!project) {
            throw new AppError('Project not found', 404);
        }

        const members = await ProjectMember.findAll({
            where: { projectId: id },
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'firstName', 'lastName', 'email', 'role'],
                },
            ],
        });

        res.json({
            success: true,
            data: { members },
        });
    });

    // Add project member
    static addProjectMember = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
        const { id } = req.params;
        const { userId, role } = req.body;

        const project = await Project.findByPk(id);
        if (!project) {
            throw new AppError('Project not found', 404);
        }

        // Check if user exists
        const user = await User.findByPk(userId);
        if (!user) {
            throw new AppError('User not found', 404);
        }

        // Check if already a member
        const existingMember = await ProjectMember.findOne({
            where: { projectId: id, userId },
        });
        if (existingMember) {
            throw new AppError('User is already a project member', 400);
        }

        // Add member
        const member = await ProjectMember.create({
            projectId: id!,
            userId,
            role: role || 'MEMBER',
        });

        // Audit log
        await AuditLog.create({
            userId: req.user!.id,
            action: AuditAction.CREATE,
            resource: 'project_member',
            resourceId: member.id,
            details: { projectId: id, userId, role: member.role },
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
        });

        res.status(201).json({
            success: true,
            message: 'Member added to project',
            data: { member },
        });
    });

    // Remove project member
    static removeProjectMember = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
        const { id, userId } = req.params;

        const member = await ProjectMember.findOne({
            where: { projectId: id, userId },
        });

        if (!member) {
            throw new AppError('Member not found in project', 404);
        }

        // Audit log
        await AuditLog.create({
            userId: req.user!.id,
            action: AuditAction.DELETE,
            resource: 'project_member',
            resourceId: member.id,
            details: { projectId: id, userId },
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
        });

        await member.destroy();

        res.json({
            success: true,
            message: 'Member removed from project',
        });
    });

    // Get project issues
    static getProjectIssues = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
        const { id } = req.params;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;

        const project = await Project.findByPk(id);
        if (!project) {
            throw new AppError('Project not found', 404);
        }

        const { count, rows } = await Issue.findAndCountAll({
            where: { projectId: id },
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
    // Get projects for client (based on orgId)
    static getClientProjects = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
        const { orgId } = req.user!;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = req.query.search as string;

        const where: any = { orgId };

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
            ],
            attributes: ['id', 'name', 'key', 'description', 'status', 'startDate', 'endDate', 'budget'],
        });

        // Calculate progress for each project (simplified)
        // In a real app, you might want to fetch this via a separate query or aggregation for performance
        const projectsWithProgress = await Promise.all(rows.map(async (project) => {
            const completedIssues = await Issue.count({
                where: { projectId: project.id, status: 'DONE' }
            });
            const totalIssues = await Issue.count({
                where: { projectId: project.id }
            });

            return {
                ...project.toJSON(),
                progress: totalIssues > 0 ? Math.round((completedIssues / totalIssues) * 100) : 0,
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
}
