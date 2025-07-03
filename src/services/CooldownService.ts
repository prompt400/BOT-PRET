// @ts-ignore
import { databaseManager } from '../managers/DatabaseManager.js';
import { logger } from '../utils/logger.js';

export class CooldownService {
  private static memoryCache = new Map<string, number>();
  
  public static async check(
    userId: string,
    commandName: string,
    cooldownMs: number,
    guildId?: string
  ): Promise<{ isOnCooldown: boolean; remainingMs?: number }> {
    const key = `${userId}-${commandName}-${guildId || 'dm'}`;
    const now = Date.now();
    
    // Check memory cache first
    const cached = this.memoryCache.get(key);
    if (cached && cached > now) {
      return {
        isOnCooldown: true,
        remainingMs: cached - now,
      };
    }
    
    // Check database for persistent cooldowns
    try {
      const result = await databaseManager.getPool().query(
        'SELECT expires_at FROM cooldowns WHERE user_id = $1 AND command = $2 AND guild_id = $3',
        [userId, commandName, guildId || null]
      );
      
      if (result.rows[0]) {
        const expiresAt = new Date(result.rows[0].expires_at).getTime();
        if (expiresAt > now) {
          this.memoryCache.set(key, expiresAt);
          return {
            isOnCooldown: true,
            remainingMs: expiresAt - now,
          };
        }
      }
    } catch (error) {
      logger.error('Failed to check cooldown from database:', error);
    }
    
    return { isOnCooldown: false };
  }
  
  public static async set(
    userId: string,
    commandName: string,
    cooldownMs: number,
    guildId?: string
  ): Promise<void> {
    const key = `${userId}-${commandName}-${guildId || 'dm'}`;
    const expiresAt = Date.now() + cooldownMs;
    
    // Set in memory
    this.memoryCache.set(key, expiresAt);
    
    // Set in database for persistence
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
    
    // Schedule cleanup
    setTimeout(() => {
      this.memoryCache.delete(key);
    }, cooldownMs);
  }
  
  public static async cleanup(): Promise<void> {
    try {
      const result = await databaseManager.getPool().query(
        'DELETE FROM cooldowns WHERE expires_at < NOW()'
      );
      logger.debug(`Cleaned up ${result.rowCount} expired cooldowns`);
    } catch (error) {
      logger.error('Failed to cleanup cooldowns:', error);
    }
  }
  
  // Run cleanup every hour
  static {
    setInterval(() => this.cleanup(), 3600000);
  }
}
