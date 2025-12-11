import { UserRole } from '../types/enums';

/**
 * Permission matrix defining what each role can do with each resource
 */

export const PERMISSIONS: Record<string, Record<UserRole, string[]>> = {
    // User Management
    users: {
        [UserRole.ADMIN]: ['create', 'read', 'update', 'delete'],
        [UserRole.PROJECT_MANAGER]: ['create', 'read', 'update', 'delete'],
        [UserRole.SCRUM_MASTER]: ['read'],
        [UserRole.EMPLOYEE]: ['read_self'],
        [UserRole.CLIENT]: [],
    },

    // Project Management
    projects: {
        [UserRole.ADMIN]: ['create', 'read', 'update', 'delete'],
        [UserRole.PROJECT_MANAGER]: ['create', 'read', 'update', 'delete'],
        [UserRole.SCRUM_MASTER]: ['read', 'update'],
        [UserRole.EMPLOYEE]: ['read'],
        [UserRole.CLIENT]: ['read_assigned'],
    },

    // Sprint Management
    sprints: {
        [UserRole.ADMIN]: ['create', 'read', 'update', 'delete', 'start', 'complete'],
        [UserRole.PROJECT_MANAGER]: ['create', 'read', 'update', 'delete', 'start', 'complete'],
        [UserRole.SCRUM_MASTER]: ['create', 'read', 'update', 'delete', 'start', 'complete'],
        [UserRole.EMPLOYEE]: ['read'],
        [UserRole.CLIENT]: ['read'],
    },

    // Issue/Story Management
    issues: {
        [UserRole.ADMIN]: ['create', 'read', 'update', 'delete'],
        [UserRole.PROJECT_MANAGER]: ['create', 'read', 'update', 'delete'],
        [UserRole.SCRUM_MASTER]: ['create', 'read', 'update', 'delete'],
        [UserRole.EMPLOYEE]: ['create', 'read', 'update_assigned', 'delete_own'],
        [UserRole.CLIENT]: ['create', 'read', 'update_own'], // Added create and update_own
    },

    // Comments
    comments: {
        [UserRole.ADMIN]: ['create', 'read', 'update', 'delete'],
        [UserRole.PROJECT_MANAGER]: ['create', 'read', 'update', 'delete'],
        [UserRole.SCRUM_MASTER]: ['create', 'read', 'update', 'delete'],
        [UserRole.EMPLOYEE]: ['create', 'read', 'update_own', 'delete_own'],
        [UserRole.CLIENT]: ['create', 'read'],
    },

    // Time Tracking
    time_entries: {
        [UserRole.ADMIN]: ['create', 'read', 'update', 'delete'],
        [UserRole.PROJECT_MANAGER]: ['read_team'],
        [UserRole.SCRUM_MASTER]: ['read_team'],
        [UserRole.EMPLOYEE]: ['create', 'read_own', 'update_own', 'delete_own'],
        [UserRole.CLIENT]: [],
    },

    // Reports
    reports: {
        [UserRole.ADMIN]: ['read_all'],
        [UserRole.PROJECT_MANAGER]: ['read_all'],
        [UserRole.SCRUM_MASTER]: ['read_team'],
        [UserRole.EMPLOYEE]: ['read_own'],
        [UserRole.CLIENT]: ['read_project'],
    },

    // Settings
    settings: {
        [UserRole.ADMIN]: ['read', 'update'],
        [UserRole.PROJECT_MANAGER]: ['read', 'update'],
        [UserRole.SCRUM_MASTER]: [],
        [UserRole.EMPLOYEE]: [],
        [UserRole.CLIENT]: [],
    },
};

/**
 * Check if a role has permission for a specific action on a resource
 */
export function hasPermission(role: UserRole, resource: string, action: string): boolean {
    const resourcePermissions = PERMISSIONS[resource as keyof typeof PERMISSIONS];
    if (!resourcePermissions) return false;

    const rolePermissions = resourcePermissions[role];
    if (!rolePermissions) return false;

    return rolePermissions.includes(action);
}

/**
 * Check if user can access a specific resource instance
 */
export function canAccessResource(
    role: UserRole,
    resource: string,
    action: string,
    userId: string,
    resourceOwnerId?: string,
    resourceAssigneeId?: string
): boolean {
    // Admin has access to everything
    if (role === UserRole.ADMIN) return true;

    // Check basic permission first
    if (!hasPermission(role, resource, action)) return false;

    // For actions with _self or _own suffix, check ownership
    if (action.endsWith('_self') || action.endsWith('_own')) {
        return userId === resourceOwnerId;
    }

    // For actions with _assigned suffix, check if user is assigned
    if (action.endsWith('_assigned')) {
        return userId === resourceAssigneeId;
    }

    return true;
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: UserRole): Record<string, string[]> {
    const permissions: Record<string, string[]> = {};

    for (const [resource, rolePerms] of Object.entries(PERMISSIONS)) {
        permissions[resource] = rolePerms[role] || [];
    }

    return permissions;
}
