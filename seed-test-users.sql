-- Create test users for the project management system
-- Password for all users: password123
-- Hashed with bcrypt (10 rounds)

-- First, ensure we have an organization
INSERT INTO "Organizations" (id, name, "subscriptionPlan", "maxUsers", "ssoEnabled", settings, "createdAt", "updatedAt")
VALUES (
    gen_random_uuid(),
    'Demo Organization',
    'ENTERPRISE',
    100,
    false,
    '{}',
    NOW(),
    NOW()
)
ON CONFLICT DO NOTHING;

-- Get the organization ID and create users
DO $$
DECLARE
    org_id UUID;
    hashed_pw TEXT := '$2b$10$T0jqywDvJDeDJdqZm5hEke1xdUUHtsxCjskfyjl4IAKtikpYCK8sq';
BEGIN
    SELECT id INTO org_id FROM "Organizations" LIMIT 1;

    -- Admin User
    INSERT INTO "Users" (id, email, "passwordHash", "firstName", "lastName", role, "orgId", "isActive", "mfaEnabled", "profileData", "createdAt", "updatedAt")
    VALUES (
        gen_random_uuid(),
        'admin@projecthub.com',
        hashed_pw,
        'Admin',
        'User',
        'ADMIN',
        org_id,
        true,
        false,
        '{}',
        NOW(),
        NOW()
    )
    ON CONFLICT (email) DO NOTHING;

    -- Scrum Master
    INSERT INTO "Users" (id, email, "passwordHash", "firstName", "lastName", role, "orgId", "isActive", "mfaEnabled", "profileData", "createdAt", "updatedAt")
    VALUES (
        gen_random_uuid(),
        'scrum@projecthub.com',
        hashed_pw,
        'Scrum',
        'Master',
        'SCRUM_MASTER',
        org_id,
        true,
        false,
        '{}',
        NOW(),
        NOW()
    )
    ON CONFLICT (email) DO NOTHING;

    -- Employee
    INSERT INTO "Users" (id, email, "passwordHash", "firstName", "lastName", role, "orgId", "isActive", "mfaEnabled", "profileData", "createdAt", "updatedAt")
    VALUES (
        gen_random_uuid(),
        'employee@projecthub.com',
        hashed_pw,
        'John',
        'Employee',
        'EMPLOYEE',
        org_id,
        true,
        false,
        '{}',
        NOW(),
        NOW()
    )
    ON CONFLICT (email) DO NOTHING;

    -- Client
    INSERT INTO "Users" (id, email, "passwordHash", "firstName", "lastName", role, "orgId", "isActive", "mfaEnabled", "profileData", "createdAt", "updatedAt")
    VALUES (
        gen_random_uuid(),
        'client@projecthub.com',
        hashed_pw,
        'Client',
        'User',
        'CLIENT',
        org_id,
        true,
        false,
        '{}',
        NOW(),
        NOW()
    )
    ON CONFLICT (email) DO NOTHING;
END $$;

-- Display created users
SELECT email, "firstName", "lastName", role FROM "Users" 
WHERE email IN ('admin@projecthub.com', 'scrum@projecthub.com', 'employee@projecthub.com', 'client@projecthub.com');
