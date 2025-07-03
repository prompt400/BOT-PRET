import { databaseManager } from '../managers/DatabaseManager.js';
import { logger, logPerformance } from '../utils/logger.js';
import Redis from 'ioredis';
import { config } from '../config/config.js';

export class CooldownService {
  private static memoryCache = new Map<string, number>();
  private static redis: Redis | null = null;
  private static readonly MAX_MEMORY_CACHE_SIZE = 10000; // Limit cache size
  
  static {
    // Initialize Redis if available
    if (config.redis.url) {
      try {
        CooldownService.redis = new Redis(config.redis.url, {
          maxRetriesPerRequest: 3,
          enableReadyCheck: true,
          retryStrategy: (times) => {
            if (times > 3) {
              logger.warn('Redis connection failed, falling back to memory cache');
              return null;
            }
            return Math.min(times * 1000, 3000);
          },
        });
        
        CooldownService.redis.on('error', (err) => {
          logger.error('Redis error:', err);
        });
        
        CooldownService.redis.on('connect', () => {
          logger.info('Redis connected for cooldown cache');
        });
      } catch (error) {
        logger.error('Failed to initialize Redis:', error);
        CooldownService.redis = null;
      }
    }
  }
  
  public static async check(
    userId: string,
    commandName: string,
    cooldownMs: number,
    guildId?: string
  ): Promise<{ isOnCooldown: boolean; remainingMs?: number }> {
    const startTime = Date.now();
    const key = `cooldown:${userId}:${commandName}:${guildId || 'dm'}`;
    const now = Date.now();
    
    // Check Redis first if available
    if (this.redis?.status === 'ready') {
      try {
        const redisValue = await this.redis.get(key);
        if (redisValue) {
          const expiresAt = parseInt(redisValue);
          if (expiresAt > now) {
            logPerformance('cooldown_check_redis', startTime);
            return {
              isOnCooldown: true,
              remainingMs: expiresAt - now,
            };
          }
        }
      } catch (error) {
        logger.error('Redis cooldown check failed:', error);
      }
    }
    
    // Check memory cache as fallback
    const memKey = `${userId}-${commandName}-${guildId || 'dm'}`;
    const cached = this.memoryCache.get(memKey);
    if (cached && cached > now) {
      logPerformance('cooldown_check_memory', startTime);
      return {
        isOnCooldown: true,
        remainingMs: cached - now,
      };
    }
    
    // Check database for persistent cooldowns only if cooldown is long
    if (cooldownMs > 60000) { // Only persist cooldowns > 1 minute
      try {
        const result = await databaseManager.getPool().query(
          'SELECT expires_at FROM cooldowns WHERE user_id = $1 AND command = $2 AND guild_id = $3',
          [userId, commandName, guildId || null]
        );
        
        if (result.rows[0]) {
          const expiresAt = new Date(result.rows[0].expires_at).getTime();
          if (expiresAt > now) {
            // Update caches
            this.memoryCache.set(memKey, expiresAt);
            if (this.redis?.status === 'ready') {
              await this.redis.set(key, expiresAt.toString(), 'PX', expiresAt - now).catch(() => {});
            }
            logPerformance('cooldown_check_db', startTime);
            return {
              isOnCooldown: true,
              remainingMs: expiresAt - now,
            };
          }
        }
      } catch (error) {
        logger.error('Failed to check cooldown from database:', error);
      }
    }
    
    logPerformance('cooldown_check_miss', startTime);
    return { isOnCooldown: false };
  }
  
  public static async set(
    userId: string,
    commandName: string,
    cooldownMs: number,
    guildId?: string
  ): Promise<void> {
    const memKey = `${userId}-${commandName}-${guildId || 'dm'}`;
    const redisKey = `cooldown:${userId}:${commandName}:${guildId || 'dm'}`;
    const expiresAt = Date.now() + cooldownMs;
    
    // Set in memory with size limit
    this.memoryCache.set(memKey, expiresAt);
    
    // Enforce memory cache size limit
    if (this.memoryCache.size > this.MAX_MEMORY_CACHE_SIZE) {
      // Remove oldest entries
      const entriesToRemove = this.memoryCache.size - this.MAX_MEMORY_CACHE_SIZE;
      const iterator = this.memoryCache.entries();
      for (let i = 0; i < entriesToRemove; i++) {
        const { value } = iterator.next();
        if (value) {
          this.memoryCache.delete(value[0]);
        }
      }
    }
    
    // Set in Redis if available
    if (this.redis?.status === 'ready') {
      try {
        await this.redis.set(redisKey, expiresAt.toString(), 'PX', cooldownMs);
      } catch (error) {
        logger.error('Failed to set cooldown in Redis:', error);
      }
    }
    
    // Only persist to database for long cooldowns
    if (cooldownMs > 60000) { // Only persist cooldowns > 1 minute
      try {
        await databaseManager.getPool().query(
          `INSERT INTO cooldowns (user_id, command, guild_id, expires_at) 
           VALUES ($1, $2, $3, $4) 
           ON CONFLICT (user_id, command, guild_id) 
           DO UPDATE SET expires_at = $4`,
          [userId, commandName, guildId || null, new Date(expiresAt)]
        );
      } catch (error) {
        logger.error('Failed to set cooldown in database:', error);
      }
    }
    
    // Schedule cleanup
    setTimeout(() => {
      this.memoryCache.delete(memKey);
    }, cooldownMs);
  }
  
  public static async cleanup(): Promise<void> {
    const startTime = Date.now();
    try {
      // Clean database cooldowns
      const result = await databaseManager.getPool().query(
        'DELETE FROM cooldowns WHERE expires_at < NOW()'
      );
      
      // Clean memory cache
      const now = Date.now();
      let memoryCleanedCount = 0;
      for (const [key, expiresAt] of this.memoryCache.entries()) {
        if (expiresAt < now) {
          this.memoryCache.delete(key);
          memoryCleanedCount++;
        }
      }
      
      logger.info(`Cooldown cleanup completed`, {
        database: result.rowCount || 0,
        memory: memoryCleanedCount,
        duration_ms: Date.now() - startTime,
      });
    } catch (error) {
      logger.error('Failed to cleanup cooldowns:', error);
    }
  }
  
  // Run cleanup every hour with jitter
  static {
    const interval = 3600000 + Math.random() * 600000; // 60-70 minutes
    setInterval(() => {
      void this.cleanup();
    }, interval);
  }
  
  // Cleanup on shutdown
  public static async shutdown(): Promise<void> {
    if (this.redis) {
      await this.redis.quit();
      this.redis = null;
    }
    this.memoryCache.clear();
  }
}
