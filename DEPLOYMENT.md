# Project Management System - Deployment Guide

## 🐳 Docker Deployment

### Prerequisites
- Docker 20.10+
- Docker Compose 2.0+

### Quick Start

1. **Clone and Setup**
```bash
cd backend
cp .env.example .env
# Edit .env with your configuration
```

2. **Build and Run**
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop services
docker-compose down
```

3. **Run Migrations**
```bash
# Run migrations
docker-compose exec backend npm run db:migrate

# Seed demo data
docker-compose exec backend npm run db:seed
```

### Services

- **Backend API**: http://localhost:5000
- **API Documentation**: http://localhost:5000/api-docs
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379
- **PgAdmin** (optional): http://localhost:5050

### Environment Variables

Required variables in `.env`:
```env
# Database
DB_USER=postgres
DB_PASSWORD=your_secure_password
DB_NAME=project_management

# JWT
JWT_SECRET=your_jwt_secret_key_min_32_chars
JWT_REFRESH_SECRET=your_refresh_secret_key_min_32_chars

# CORS
CORS_ORIGIN=http://localhost:3000

# Email (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
```

### Production Deployment

1. **Build Production Image**
```bash
docker build -t pm-backend:latest .
```

2. **Push to Registry**
```bash
docker tag pm-backend:latest your-registry/pm-backend:latest
docker push your-registry/pm-backend:latest
```

3. **Deploy**
```bash
# Using docker-compose
docker-compose -f docker-compose.yml up -d

# Or using Kubernetes
kubectl apply -f k8s/
```

## 🚀 Manual Deployment

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Redis 7+ (optional, for background jobs)

### Setup

1. **Install Dependencies**
```bash
npm install
```

2. **Configure Environment**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Setup Database**
```bash
# Create database
createdb project_management

# Run migrations
npm run db:migrate

# Seed demo data (optional)
npm run db:seed
```

4. **Build Application**
```bash
npm run build
```

5. **Start Application**
```bash
# Production
npm start

# Development
npm run dev
```

## 📊 Monitoring

### Health Check
```bash
curl http://localhost:5000/health
```

### Queue Stats
Monitor background job queue through the API or Redis CLI:
```bash
redis-cli
> KEYS bull:email:*
```

### Logs
Application logs are stored in `logs/` directory:
- `combined.log` - All logs
- `error.log` - Error logs only

## 🔒 Security Checklist

- [ ] Change default JWT secrets
- [ ] Use strong database passwords
- [ ] Configure CORS properly
- [ ] Enable HTTPS in production
- [ ] Set up rate limiting
- [ ] Configure firewall rules
- [ ] Regular security updates
- [ ] Enable audit logging
- [ ] Backup database regularly

## 🔧 Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL is running
docker-compose ps postgres

# View PostgreSQL logs
docker-compose logs postgres
```

### Redis Connection Issues
```bash
# Check Redis is running
docker-compose ps redis

# Test Redis connection
redis-cli ping
```

### Application Errors
```bash
# View application logs
docker-compose logs -f backend

# Check health endpoint
curl http://localhost:5000/health
```

## 📈 Scaling

### Horizontal Scaling
```bash
# Scale backend instances
docker-compose up -d --scale backend=3
```

### Load Balancing
Use nginx or cloud load balancer:
```nginx
upstream backend {
    server backend1:5000;
    server backend2:5000;
    server backend3:5000;
}
```

## 🔄 Updates

### Rolling Update
```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose build backend
docker-compose up -d backend
```

### Database Migrations
```bash
# Create new migration
npm run db:migrate:create -- --name migration-name

# Run pending migrations
docker-compose exec backend npm run db:migrate
```

## 📦 Backup & Restore

### Database Backup
```bash
# Backup
docker-compose exec postgres pg_dump -U postgres project_management > backup.sql

# Restore
docker-compose exec -T postgres psql -U postgres project_management < backup.sql
```

### File Uploads Backup
```bash
# Backup uploads directory
tar -czf uploads-backup.tar.gz uploads/
```

## 🎯 Performance Optimization

1. **Enable Redis Caching**
2. **Configure Connection Pooling**
3. **Add Database Indexes**
4. **Enable Gzip Compression**
5. **Use CDN for Static Assets**
6. **Monitor with APM Tools**

## 📞 Support

For deployment issues:
- Check logs: `docker-compose logs`
- Review documentation
- Contact: support@projectmanagement.com
