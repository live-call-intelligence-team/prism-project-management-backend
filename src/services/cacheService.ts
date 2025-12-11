import Redis from 'ioredis';
import logger from '../utils/logger';

// Redis client configuration
const redisClient = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
    },
    maxRetriesPerRequest: 3,
});

redisClient.on('connect', () => {
    logger.info('Redis client connected');
});

redisClient.on('error', (err) => {
    logger.error('Redis client error:', err);
});

export class CacheService {
    private static TTL = {
        SHORT: 60, // 1 minute
        MEDIUM: 300, // 5 minutes
        LONG: 3600, // 1 hour
        DAY: 86400, // 24 hours
    };

    // Get cached data
    static async get<T>(key: string): Promise<T | null> {
        try {
            const data = await redisClient.get(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            logger.error(`Cache get error for key ${key}:`, error);
            return null;
        }
    }

    // Set cached data
    static async set(key: string, value: any, ttl: number = this.TTL.MEDIUM): Promise<void> {
        try {
            await redisClient.setex(key, ttl, JSON.stringify(value));
        } catch (error) {
            logger.error(`Cache set error for key ${key}:`, error);
        }
    }

    // Delete cached data
    static async del(key: string): Promise<void> {
        try {
            await redisClient.del(key);
        } catch (error) {
            logger.error(`Cache delete error for key ${key}:`, error);
        }
    }

    // Delete multiple keys by pattern
    static async delPattern(pattern: string): Promise<void> {
        try {
            const keys = await redisClient.keys(pattern);
            if (keys.length > 0) {
                await redisClient.del(...keys);
            }
        } catch (error) {
            logger.error(`Cache delete pattern error for ${pattern}:`, error);
        }
    }

    // Check if key exists
    static async exists(key: string): Promise<boolean> {
        try {
            const result = await redisClient.exists(key);
            return result === 1;
        } catch (error) {
            logger.error(`Cache exists error for key ${key}:`, error);
            return false;
        }
    }

    // Increment counter
    static async incr(key: string, ttl?: number): Promise<number> {
        try {
            const value = await redisClient.incr(key);
            if (ttl) {
                await redisClient.expire(key, ttl);
            }
            return value;
        } catch (error) {
            logger.error(`Cache incr error for key ${key}:`, error);
            return 0;
        }
    }

    // Cache wrapper for functions
    static async wrap<T>(
        key: string,
        fn: () => Promise<T>,
        ttl: number = this.TTL.MEDIUM
    ): Promise<T> {
        // Try to get from cache
        const cached = await this.get<T>(key);
        if (cached !== null) {
            return cached;
        }

        // Execute function and cache result
        const result = await fn();
        await this.set(key, result, ttl);
        return result;
    }

    // Clear all cache
    static async flush(): Promise<void> {
        try {
            await redisClient.flushdb();
            logger.info('Cache flushed');
        } catch (error) {
            logger.error('Cache flush error:', error);
        }
    }

    // Get cache stats
    static async getStats() {
        try {
            const info = await redisClient.info('stats');
            const keyspace = await redisClient.info('keyspace');
            return { info, keyspace };
        } catch (error) {
            logger.error('Cache stats error:', error);
            return null;
        }
    }

    // Close connection
    static async close(): Promise<void> {
        await redisClient.quit();
        logger.info('Redis connection closed');
    }
}

export default redisClient;
