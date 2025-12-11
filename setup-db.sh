#!/bin/bash

# Project Management System - Database Setup Script
# This script sets up the database, runs migrations, and optionally seeds demo data

set -e  # Exit on error

echo "🚀 Project Management System - Database Setup"
echo "=============================================="
echo ""

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
else
    echo "❌ Error: .env file not found!"
    echo "Please copy .env.example to .env and configure your database settings."
    exit 1
fi

# Check if PostgreSQL is running
echo "📡 Checking PostgreSQL connection..."
if ! pg_isready -h $DB_HOST -p $DB_PORT > /dev/null 2>&1; then
    echo "❌ Error: Cannot connect to PostgreSQL at $DB_HOST:$DB_PORT"
    echo "Please make sure PostgreSQL is running."
    exit 1
fi

echo "✅ PostgreSQL is running"
echo ""

# Create database if it doesn't exist
echo "🗄️  Creating database '$DB_NAME' if it doesn't exist..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -tc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" | grep -q 1 || \
    psql -h $DB_HOST -p $DB_PORT -U $DB_USER -c "CREATE DATABASE $DB_NAME"

echo "✅ Database ready"
echo ""

# Run migrations
echo "🔄 Running database migrations..."
npm run db:migrate

if [ $? -eq 0 ]; then
    echo "✅ Migrations completed successfully"
else
    echo "❌ Migration failed"
    exit 1
fi

echo ""

# Ask if user wants to seed demo data
read -p "Would you like to seed demo data? (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🌱 Seeding demo data..."
    npm run db:seed
    
    if [ $? -eq 0 ]; then
        echo "✅ Demo data seeded successfully"
        echo ""
        echo "📝 Demo Accounts Created:"
        echo "  Admin:        admin@demo.com / password123"
        echo "  Scrum Master: scrummaster@demo.com / password123"
        echo "  Developer 1:  developer1@demo.com / password123"
        echo "  Developer 2:  developer2@demo.com / password123"
        echo "  Client:       client@demo.com / password123"
    else
        echo "❌ Seeding failed"
        exit 1
    fi
fi

echo ""
echo "🎉 Database setup complete!"
echo ""
echo "Next steps:"
echo "  1. Start the development server: npm run dev"
echo "  2. API will be available at: http://localhost:$PORT/api/$API_VERSION"
echo "  3. Test authentication: POST /api/$API_VERSION/auth/login"
echo ""
