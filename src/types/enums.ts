// User Roles
export enum UserRole {
    ADMIN = 'ADMIN',
    PROJECT_MANAGER = 'PROJECT_MANAGER',
    SCRUM_MASTER = 'SCRUM_MASTER',
    EMPLOYEE = 'EMPLOYEE',
    CLIENT = 'CLIENT',
}

// Issue Types
export enum IssueType {
    BUG = 'BUG',
    FEATURE = 'FEATURE',
    TASK = 'TASK',
    STORY = 'STORY',
    EPIC = 'EPIC',
    SUBTASK = 'SUBTASK',
    SUPPORT = 'SUPPORT',
}

// Issue Status
export enum IssueStatus {
    TODO = 'TODO',
    IN_PROGRESS = 'IN_PROGRESS',
    IN_REVIEW = 'IN_REVIEW',
    DONE = 'DONE',
    BLOCKED = 'BLOCKED',
    CANCELLED = 'CANCELLED',
}

// Client Approval Status
export enum ClientApprovalStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    CHANGES_REQUESTED = 'CHANGES_REQUESTED',
    REJECTED = 'REJECTED',
}

// Issue Priority
export enum IssuePriority {
    LOWEST = 'LOWEST',
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
    HIGHEST = 'HIGHEST',
    CRITICAL = 'CRITICAL',
}

// Sprint Status
export enum SprintStatus {
    PLANNED = 'PLANNED',
    ACTIVE = 'ACTIVE',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
}

// Project Status
export enum ProjectStatus {
    ACTIVE = 'ACTIVE',
    ARCHIVED = 'ARCHIVED',
    ON_HOLD = 'ON_HOLD',
    COMPLETED = 'COMPLETED',
}

// Notification Types
export enum NotificationType {
    ISSUE_ASSIGNED = 'ISSUE_ASSIGNED',
    ISSUE_UPDATED = 'ISSUE_UPDATED',
    ISSUE_COMMENTED = 'ISSUE_COMMENTED',
    MENTION = 'MENTION',
    SPRINT_STARTED = 'SPRINT_STARTED',
    SPRINT_COMPLETED = 'SPRINT_COMPLETED',
    PROJECT_INVITE = 'PROJECT_INVITE',
    SYSTEM = 'SYSTEM',
    APPROVAL_REQUESTED = 'APPROVAL_REQUESTED',
    APPROVAL_GIVEN = 'APPROVAL_GIVEN',
}

// Custom Field Types
export enum CustomFieldType {
    TEXT = 'TEXT',
    NUMBER = 'NUMBER',
    DATE = 'DATE',
    DROPDOWN = 'DROPDOWN',
    MULTI_SELECT = 'MULTI_SELECT',
    USER_PICKER = 'USER_PICKER',
    CHECKBOX = 'CHECKBOX',
}

// Workflow Transition Types
export enum TransitionType {
    MANUAL = 'MANUAL',
    AUTOMATIC = 'AUTOMATIC',
    CONDITIONAL = 'CONDITIONAL',
}

// Audit Action Types
export enum AuditAction {
    CREATE = 'CREATE',
    UPDATE = 'UPDATE',
    DELETE = 'DELETE',
    LOGIN = 'LOGIN',
    LOGOUT = 'LOGOUT',
    PERMISSION_CHANGE = 'PERMISSION_CHANGE',
    STATUS_CHANGE = 'STATUS_CHANGE',
}
