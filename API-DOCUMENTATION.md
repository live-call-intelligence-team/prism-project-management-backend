# API Documentation

## Overview
The Project Management System API is a RESTful API built with Node.js, Express, and TypeScript. It provides comprehensive endpoints for managing projects, issues, sprints, and team collaboration.

## Base URL
- **Development**: `http://localhost:5000/api/v1`
- **Production**: `https://api.projectmanagement.com/api/v1`

## Interactive Documentation
Visit `/api-docs` for interactive Swagger UI documentation where you can test all endpoints.

## Authentication
All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### Getting a Token
1. Register or login to get access and refresh tokens
2. Use the access token for API requests
3. Refresh the token when it expires using the refresh endpoint

## Quick Start

### 1. Register a New User
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe",
    "orgName": "My Company"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### 3. Create a Project
```bash
curl -X POST http://localhost:5000/api/v1/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "My Project",
    "key": "MYPROJ",
    "description": "Project description",
    "leadId": "user-uuid"
  }'
```

### 4. Create an Issue
```bash
curl -X POST http://localhost:5000/api/v1/issues \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "projectId": "project-uuid",
    "title": "Implement login feature",
    "type": "TASK",
    "priority": "HIGH",
    "assigneeId": "user-uuid"
  }'
```

## API Endpoints Summary

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/logout` - Logout user
- `POST /auth/refresh-token` - Refresh access token
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password
- `GET /auth/me` - Get current user

### Users
- `GET /users` - List all users (with pagination)
- `GET /users/:id` - Get user by ID
- `POST /users` - Create user (Admin/Scrum Master)
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user (Admin only)
- `GET /users/:id/activity` - Get user activity logs
- `POST /users/:id/change-password` - Change password

### Projects
- `GET /projects` - List all projects
- `GET /projects/:id` - Get project details
- `POST /projects` - Create project
- `PUT /projects/:id` - Update project
- `DELETE /projects/:id` - Delete project
- `GET /projects/:id/members` - Get project members
- `POST /projects/:id/members` - Add team member
- `DELETE /projects/:id/members/:userId` - Remove member
- `GET /projects/:id/issues` - Get project issues

### Issues
- `GET /issues` - List issues (with filters)
- `GET /issues/:id` - Get issue details
- `POST /issues` - Create issue
- `PUT /issues/:id` - Update issue
- `DELETE /issues/:id` - Delete issue
- `POST /issues/:issueId/comments` - Add comment
- `POST /issues/:issueId/worklog` - Log work time

### Sprints
- `GET /sprints` - List sprints
- `GET /sprints/:id` - Get sprint details
- `POST /sprints` - Create sprint
- `PUT /sprints/:id` - Update sprint
- `DELETE /sprints/:id` - Delete sprint
- `POST /sprints/:id/start` - Start sprint
- `POST /sprints/:id/complete` - Complete sprint
- `GET /sprints/:id/report` - Get sprint report

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

### Paginated Response
```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalPages": 5,
      "totalItems": 50,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

## Query Parameters

### Pagination
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)

### Filtering
- `search` - Search term
- `status` - Filter by status
- `priority` - Filter by priority
- `assigneeId` - Filter by assignee
- `projectId` - Filter by project
- `sprintId` - Filter by sprint

### Example
```
GET /api/v1/issues?page=1&limit=20&status=IN_PROGRESS&priority=HIGH
```

## Rate Limiting
- **General API**: 100 requests per 15 minutes
- **Authentication**: 5 requests per 15 minutes
- **File Upload**: 10 requests per 15 minutes

## Error Codes
- `400` - Bad Request (validation error)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

## WebSocket Events
Real-time updates are available via Socket.io:

### Events
- `issue:created` - New issue created
- `issue:updated` - Issue updated
- `issue:deleted` - Issue deleted
- `comment:created` - New comment added
- `sprint:started` - Sprint started
- `sprint:completed` - Sprint completed

### Connection
```javascript
const socket = io('http://localhost:5000');

// Join project room
socket.emit('joinProject', projectId);

// Listen for updates
socket.on('issue:created', (issue) => {
  console.log('New issue:', issue);
});
```

## Demo Accounts
Use these accounts for testing (password: `password123`):

- **Admin**: admin@demo.com
- **Scrum Master**: scrummaster@demo.com
- **Developer**: developer1@demo.com
- **Client**: client@demo.com

## Support
For API support, contact: support@projectmanagement.com
