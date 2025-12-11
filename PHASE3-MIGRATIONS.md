# Phase 3: Database Migrations & Seed Data - Complete

## ✅ What Was Created

### Database Migrations (5 files)
All migrations follow Sequelize CLI standards with proper up/down methods:

1. **20231201000001-create-organizations-users.js**
   - Organizations table with subscription management
   - Users table with roles, MFA, authentication tokens
   - Indexes on email, orgId, role

2. **20231201000002-create-projects.js**
   - Projects table with keys, leads, budgets
   - ProjectMembers junction table
   - Unique constraint on project keys
   - Indexes for performance

3. **20231201000003-create-sprints-issues.js**
   - Sprints table with capacity and velocity tracking
   - Issues table with comprehensive fields
   - Parent/child issue relationships
   - Custom fields and labels support
   - Multiple indexes for queries

4. **20231201000004-create-comments-attachments-worklogs.js**
   - Comments with @mention support
   - Attachments with file metadata
   - WorkLogs for time tracking

5. **20231201000005-create-notifications-audit-custom.js**
   - Notifications table
   - AuditLogs for compliance
   - CustomFields for flexibility
   - Workflows for custom processes
   - Permissions for RBAC

### Seed Data (3 files)

1. **20231201000001-demo-users.js**
   - 1 Demo Organization (Premium plan, 50 users)
   - 5 Users with different roles:
     - admin@demo.com (Admin)
     - scrummaster@demo.com (Scrum Master)
     - developer1@demo.com (Employee)
     - developer2@demo.com (Employee)
     - client@demo.com (Client)
   - All passwords: `password123`

2. **20231201000002-demo-projects.js**
   - 2 Active Projects:
     - E-Commerce Platform (ECOM)
     - Mobile App Development (MOBILE)
   - Team members assigned to projects

3. **20231201000003-demo-issues.js**
   - 1 Active Sprint
   - 5 Issues with different types:
     - ECOM-1: Epic (In Progress)
     - ECOM-2: Story (Done)
     - ECOM-3: Story (In Progress)
     - ECOM-4: Task (To Do)
     - ECOM-5: Bug (Critical, To Do)
   - Comments with @mentions
   - Work logs with time tracking

### Setup Script
- **setup-db.sh**: Automated database setup
  - Checks PostgreSQL connection
  - Creates database if needed
  - Runs migrations
  - Optionally seeds demo data
  - Provides demo account credentials

## 🚀 How to Use

### 1. Setup Database (First Time)
```bash
# Make script executable (already done)
chmod +x setup-db.sh

# Run setup
./setup-db.sh
```

The script will:
- Verify PostgreSQL connection
- Create database
- Run all migrations
- Ask if you want demo data
- Show demo account credentials

### 2. Manual Migration Commands
```bash
# Run migrations
npm run db:migrate

# Undo last migration
npm run db:migrate:undo

# Undo all migrations
npm run db:migrate:undo:all

# Seed demo data
npm run db:seed

# Undo all seeds
npm run db:seed:undo:all
```

### 3. Create New Migration
```bash
npx sequelize-cli migration:generate --name migration-name
```

## 📊 Database Schema Overview

**14 Tables Total:**
- Organizations
- Users
- Projects
- ProjectMembers
- Sprints
- Issues
- Comments
- Attachments
- WorkLogs
- Notifications
- AuditLogs
- CustomFields
- Workflows
- Permissions

**Key Relationships:**
- Organization → Users (1:many)
- Organization → Projects (1:many)
- Project → Issues (1:many)
- Project → Sprints (1:many)
- Sprint → Issues (1:many)
- Issue → Comments (1:many)
- Issue → Attachments (1:many)
- Issue → WorkLogs (1:many)
- User → Issues (assignee/reporter)
- Issue → Issue (parent/child)

## ✅ Phase 3 Complete

All database migrations and seed data are ready. The system can now be fully tested with realistic demo data!
