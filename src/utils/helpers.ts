// Generate pagination metadata
export const getPaginationMeta = (
    page: number,
    limit: number,
    total: number
) => {
    return {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
    };
};

// Calculate offset for database queries
export const getOffset = (page: number, limit: number): number => {
    return (page - 1) * limit;
};

// Generate random string
export const generateRandomString = (length: number = 32): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

// Format date to ISO string
export const formatDate = (date: Date): string => {
    return date.toISOString();
};

// Check if date is in the past
export const isPastDate = (date: Date): boolean => {
    return date < new Date();
};

// Check if date is in the future
export const isFutureDate = (date: Date): boolean => {
    return date > new Date();
};

// Calculate days between two dates
export const daysBetween = (date1: Date, date2: Date): number => {
    const oneDay = 24 * 60 * 60 * 1000;
    return Math.round(Math.abs((date1.getTime() - date2.getTime()) / oneDay));
};

// Sanitize object by removing null/undefined values
export const sanitizeObject = (obj: any): any => {
    const sanitized: any = {};
    Object.keys(obj).forEach((key) => {
        if (obj[key] !== null && obj[key] !== undefined) {
            sanitized[key] = obj[key];
        }
    });
    return sanitized;
};

// Deep clone object
export const deepClone = <T>(obj: T): T => {
    return JSON.parse(JSON.stringify(obj));
};

// Generate issue key (e.g., PROJ-123)
export const generateIssueKey = (projectKey: string, issueNumber: number): string => {
    return `${projectKey}-${issueNumber}`;
};

// Extract mentions from text (@username)
export const extractMentions = (text: string): string[] => {
    const mentionRegex = /@(\w+)/g;
    const mentions: string[] = [];
    let match;

    while ((match = mentionRegex.exec(text)) !== null) {
        if (match[1]) {
            mentions.push(match[1]);
        }
    }

    return mentions;
};

// Slugify string
export const slugify = (text: string): string => {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
};

// Truncate string
export const truncate = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
};
