import { Request } from 'express';
import { UserRole } from './enums';

// Extended Request with authenticated user
export interface AuthRequest extends Request {
    user?: {
        id: string;
        email: string;
        role: UserRole;
        orgId: string;
    };
}

// Pagination
export interface PaginationParams {
    page: number;
    limit: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

// API Response
export interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
    error?: string;
}

// Filter Options
export interface FilterOptions {
    search?: string;
    status?: string;
    priority?: string;
    assignee?: string;
    reporter?: string;
    project?: string;
    sprint?: string;
    startDate?: Date;
    endDate?: Date;
}

// JWT Payload
export interface JwtPayload {
    userId: string;
    email: string;
    role: UserRole;
    orgId: string;
}

// Email Options
export interface EmailOptions {
    to: string | string[];
    subject: string;
    html: string;
    text?: string;
}

// File Upload
export interface FileUpload {
    filename: string;
    originalName: string;
    mimetype: string;
    size: number;
    path: string;
    url: string;
}
