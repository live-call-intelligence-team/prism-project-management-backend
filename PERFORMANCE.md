# Performance Optimization Guide

## Overview

This guide covers performance optimization strategies for the Project Management System backend.

## 1. Database Optimization

### Indexing Strategy

**Existing Indexes:**
- Users: `email`, `orgId`, `role`
- Projects: `key`, `orgId`, `status`
- Issues: `key`, `projectId`, `status`, `assigneeId`, `sprintId`
- Sprints: `projectId`, `status`
- Comments: `issueId`
- WorkLogs: `issueId`, `userId`

**Query Optimization:**
```typescript
// Use select to limit fields
const users = await User.findAll({
  attributes: ['id', 'firstName', 'lastName', 'email'],
  where: { isActive: true }
});

// Use includes efficiently
const issues = await Issue.findAll({
  include: [{
    model: User,
    as: 'assignee',
    attributes: ['id', 'firstName', 'lastName']
  }]
});

// Use pagination
const { count, rows } = await Issue.findAndCountAll({
  limit: 20,
  offset: 0,
  order: [['createdAt', 'DESC']]
});
```

### Connection Pooling

Already configured in `database.ts`:
```typescript
pool: {
  max: 10,
  min: 2,
  acquire: 30000,
  idle: 10000,
}
```

## 2. Caching Strategy

### Redis Caching

**Cache Service Usage:**
```typescript
import { CacheService } from '../services/cacheService';

// Cache wrapper
const users = await CacheService.wrap(
  'users:active',
  async () => await User.findAll({ where: { isActive: true } }),
  CacheService.TTL.LONG
);

// Manual caching
await CacheService.set('project:123', project, 3600);
const cached = await CacheService.get('project:123');

// Invalidate cache
await CacheService.del('project:123');
await CacheService.delPattern('project:*');
```

**What to Cache:**
- User profiles (1 hour)
- Project details (5 minutes)
- Dashboard data (1 minute)
- Analytics data (5 minutes)
- Static configuration (24 hours)

**Cache Invalidation:**
```typescript
// After update
await Project.update(data, { where: { id } });
await CacheService.del(`project:${id}`);
await CacheService.delPattern('projects:*');
```

## 3. API Response Optimization

### Compression

Enable gzip compression:
```typescript
import compression from 'compression';
app.use(compression());
```

### Response Pagination

Always paginate list endpoints:
```typescript
const page = parseInt(req.query.page) || 1;
const limit = Math.min(parseInt(req.query.limit) || 10, 100);
```

### Field Selection

Allow clients to select fields:
```typescript
const fields = req.query.fields?.split(',') || [];
const attributes = fields.length > 0 ? fields : undefined;
```

## 4. Background Jobs

### Queue Processing

Use Bull for async operations:
```typescript
import { QueueService } from '../services/queueService';

// Queue email instead of sending synchronously
await QueueService.queueWelcomeEmail(email, name);
```

**Benefits:**
- Non-blocking API responses
- Automatic retries
- Job prioritization
- Monitoring and stats

## 5. N+1 Query Prevention

### Use Eager Loading

**Bad:**
```typescript
const issues = await Issue.findAll();
for (const issue of issues) {
  const assignee = await User.findByPk(issue.assigneeId);
}
```

**Good:**
```typescript
const issues = await Issue.findAll({
  include: [{
    model: User,
    as: 'assignee'
  }]
});
```

## 6. Rate Limiting

### Distributed Rate Limiting

Using Redis for rate limiting across multiple instances:
```typescript
import { apiLimiter } from '../middleware/rateLimiter';
app.use('/api', apiLimiter);
```

## 7. Monitoring

### Application Metrics

**Key Metrics to Monitor:**
- Request rate
- Response time (p50, p95, p99)
- Error rate
- Database query time
- Cache hit rate
- Queue length
- Memory usage
- CPU usage

### Logging

**Performance Logging:**
```typescript
const start = Date.now();
// ... operation
const duration = Date.now() - start;
logger.info(`Operation completed in ${duration}ms`);
```

## 8. Load Testing

### Using Artillery

```bash
npm install -g artillery

# Create test scenario
cat > load-test.yml << EOF
config:
  target: 'http://localhost:5000'
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - flow:
      - get:
          url: '/api/v1/projects'
          headers:
            Authorization: 'Bearer TOKEN'
EOF

# Run test
artillery run load-test.yml
```

### Using Apache Bench

```bash
# 1000 requests, 10 concurrent
ab -n 1000 -c 10 -H "Authorization: Bearer TOKEN" \
  http://localhost:5000/api/v1/projects
```

## 9. Optimization Checklist

### Database
- [ ] Indexes on frequently queried columns
- [ ] Connection pooling configured
- [ ] Query optimization (use EXPLAIN)
- [ ] Avoid N+1 queries
- [ ] Use pagination for large datasets
- [ ] Regular VACUUM and ANALYZE

### Caching
- [ ] Redis configured
- [ ] Cache frequently accessed data
- [ ] Implement cache invalidation
- [ ] Monitor cache hit rate
- [ ] Set appropriate TTLs

### API
- [ ] Response compression enabled
- [ ] Pagination implemented
- [ ] Field selection supported
- [ ] Rate limiting configured
- [ ] CORS optimized

### Code
- [ ] Async operations for I/O
- [ ] Background jobs for heavy tasks
- [ ] Efficient algorithms
- [ ] Memory leak prevention
- [ ] Error handling optimized

### Infrastructure
- [ ] Load balancing configured
- [ ] CDN for static assets
- [ ] Database read replicas
- [ ] Horizontal scaling ready
- [ ] Auto-scaling configured

## 10. Performance Targets

### Response Times
- API endpoints: < 200ms (p95)
- Database queries: < 50ms (p95)
- Cache operations: < 10ms (p95)

### Throughput
- Minimum: 100 req/s per instance
- Target: 500 req/s per instance

### Availability
- Uptime: 99.9%
- Error rate: < 0.1%

## 11. Profiling

### Node.js Profiling

```bash
# CPU profiling
node --prof dist/server.js

# Memory profiling
node --inspect dist/server.js
```

### Database Profiling

```sql
-- Enable query logging
ALTER SYSTEM SET log_min_duration_statement = 100;

-- Analyze slow queries
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

## 12. Best Practices

1. **Use Async/Await** - Non-blocking I/O
2. **Implement Caching** - Reduce database load
3. **Optimize Queries** - Use indexes and limit data
4. **Background Jobs** - Offload heavy tasks
5. **Monitor Everything** - Track performance metrics
6. **Load Test** - Identify bottlenecks early
7. **Scale Horizontally** - Add more instances
8. **Use CDN** - Serve static content faster
9. **Compress Responses** - Reduce bandwidth
10. **Keep Dependencies Updated** - Performance improvements

## Resources

- [Node.js Performance Best Practices](https://nodejs.org/en/docs/guides/simple-profiling/)
- [PostgreSQL Performance Tips](https://wiki.postgresql.org/wiki/Performance_Optimization)
- [Redis Best Practices](https://redis.io/topics/optimization)
- [Express.js Performance](https://expressjs.com/en/advanced/best-practice-performance.html)
