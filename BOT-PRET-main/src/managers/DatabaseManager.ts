import { Pool, PoolConfig, PoolClient } from 'pg';
import { config } from '../config/config.js';
import { logger } from '../utils/logger.js';
import { DatabaseError } from '../utils/errors.js';
import { Constants } from '../utils/constants.js';

export class DatabaseManager {
  private static instance: DatabaseManager;
  private pool: Pool | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 5000;
  private healthCheckInterval?: NodeJS.Timeout;
  private isReconnecting = false;

  private constructor() {}

  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  public getPoolConfig(): PoolConfig {
    const dbConfig = config.database;
    
    // Railway utilise DATABASE_URL ou les variables PG* individuelles
    const baseConfig: PoolConfig = dbConfig.connectionString
      ? { connectionString: dbConfig.connectionString }
      : {
          host: dbConfig.host!,
          port: dbConfig.port || 5432,
          database: dbConfig.database!,
          user: dbConfig.user!,
          password: dbConfig.password,
        };
    
    // Configuration optimisée pour PostgreSQL sur Railway
    return {
      ...baseConfig,
      ssl: dbConfig.ssl ? { 
        rejectUnauthorized: false, // Railway utilise des certificats auto-signés
        ca: process.env.DATABASE_CA_CERT,
      } : undefined,
      max: 10, // Limite de connexions pour Railway
      min: 2,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: Constants.Timeouts.DatabaseConnection,
      query_timeout: 30000,
      statement_timeout: 30000,
      allowExitOnIdle: false,
      // Optimisations spécifiques Railway
      keepAlive: true,
      keepAliveInitialDelayMillis: 10000,
      application_name: 'discord-bot',
    };
  }

  public async initialize(): Promise<void> {
    try {
      this.pool = new Pool(this.getPoolConfig());
      
      this.pool.on('error', this.handlePoolError.bind(this));
      this.pool.on('connect', (client) => {
        logger.debug('New database connection established');
        this.reconnectAttempts = 0;
        // Set search path for Railway PostgreSQL
        client.query('SET search_path TO public').catch((err) => {
          logger.error('Failed to set search path:', err);
        });
      });
      this.pool.on('remove', () => {
        logger.debug('Database connection removed from pool');
      });

      // Test connection with retry logic
      let retries = 3;
      let lastError: Error | null = null;
      
      while (retries > 0) {
        try {
          const testQuery = this.pool.query('SELECT NOW() as time, current_database() as db');
          const timeout = new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('Connection test timeout')), 5000)
          );
          
          const result = await Promise.race([testQuery, timeout]);
          logger.info('Database connection established successfully', {
            database: result.rows[0]?.db,
            time: result.rows[0]?.time,
          });
          break;
        } catch (error) {
          lastError = error as Error;
          retries--;
          if (retries > 0) {
            logger.warn(`Database connection attempt failed, retrying... (${retries} attempts left)`);
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        }
      }
      
      if (retries === 0 && lastError) {
        throw lastError;
      }
      
      // Setup connection check interval with jitter to avoid thundering herd
      const checkInterval = 60000 + Math.random() * 10000; // 60-70 seconds
      this.healthCheckInterval = setInterval(() => {
        void this.checkConnection();
      }, checkInterval);
    } catch (error) {
      if (this.pool) {
        await this.pool.end().catch(() => {});
        this.pool = null;
      }
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new DatabaseError(`Failed to initialize database: ${errorMessage}`);
    }
  }

  private async handlePoolError(err: Error): Promise<void> {
    logger.error('Database pool error:', err);
    
    // Check if error is recoverable
    const isRecoverable = this.isRecoverableError(err);
    if (!isRecoverable) {
      logger.error('Non-recoverable database error, not attempting reconnection');
      return;
    }
    
    if (this.isReconnecting || this.reconnectAttempts >= this.maxReconnectAttempts) {
      return;
    }
    
    this.isReconnecting = true;
    this.reconnectAttempts++;
    logger.info(`Attempting to reconnect to database (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
    
    // Clean up existing pool
    if (this.pool) {
      await this.pool.end().catch(() => {});
      this.pool = null;
    }
    
    // Exponential backoff with jitter
    const baseDelay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1), 30000);
    const jitter = Math.random() * 1000;
    const delay = baseDelay + jitter;
    
    setTimeout(async () => {
      try {
        await this.initialize();
        this.isReconnecting = false;
        logger.info('Database reconnection successful');
      } catch (error) {
        logger.error('Reconnection failed:', error);
        this.isReconnecting = false;
        // Try again if we haven't exceeded max attempts
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          void this.handlePoolError(error as Error);
        } else {
          logger.error('Maximum reconnection attempts reached. Database connection lost.');
        }
      }
    }, delay);
  }

  private isRecoverableError(error: Error): boolean {
    const message = error.message.toLowerCase();
    const recoverablePatterns = [
      'econnrefused',
      'econnreset',
      'etimedout',
      'ehostunreach',
      'enetunreach',
      'enotfound',
      'connection terminated',
      'connection lost',
      'connection timeout',
      'socket hang up',
    ];
    
    return recoverablePatterns.some(pattern => message.includes(pattern));
  }

  private async checkConnection(): Promise<void> {
    try {
      if (!this.pool) {
        logger.warn('No database pool available for health check');
        return;
      }
      
      const startTime = Date.now();
      const result = await this.pool.query('SELECT 1 as health, NOW() as time');
      const duration = Date.now() - startTime;
      
      if (duration > 1000) {
        logger.warn(`Database health check slow: ${duration}ms`);
      } else {
        logger.debug(`Database health check passed: ${duration}ms`);
      }
    } catch (error) {
      logger.error('Database health check failed:', error);
      void this.handlePoolError(error as Error);
    }
  }

  public getPool(): Pool {
    if (!this.pool) {
      throw new DatabaseError('Database pool not initialized');
    }
    return this.pool;
  }

  public async transaction<T>(
    callback: (client: PoolClient) => Promise<T>
  ): Promise<T> {
    const pool = this.getPool();
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK').catch((rollbackError) => {
        logger.error('Failed to rollback transaction:', rollbackError);
      });
      throw error;
    } finally {
      client.release();
    }
  }

  public async close(): Promise<void> {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = undefined;
    }
    
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
      logger.info('Database connection closed');
    }
  }

  public async runMigrations(): Promise<void> {
    try {
      const pool = this.getPool();
      const fs = await import('fs/promises');
      const path = await import('path');
      const { fileURLToPath } = await import('url');
      
      // Get migrations directory
      const __dirname = fileURLToPath(new URL('.', import.meta.url));
      const migrationsDir = path.join(__dirname, '..', '..', 'migrations');
      
      // Create migrations table
      await pool.query(`
        CREATE TABLE IF NOT EXISTS migrations (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL UNIQUE,
          executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // Check if migrations directory exists
      try {
        await fs.access(migrationsDir);
      } catch {
        logger.warn('Migrations directory not found, running embedded migrations');
        await this.runEmbeddedMigrations();
        return;
      }
      
      // Get migration files
      const files = await fs.readdir(migrationsDir);
      const sqlFiles = files
        .filter(f => f.endsWith('.sql'))
        .sort(); // Ensure migrations run in order
      
      for (const file of sqlFiles) {
        // Check if migration already executed
        const result = await pool.query(
          'SELECT 1 FROM migrations WHERE name = $1',
          [file]
        );
        
        if (result.rows.length === 0) {
          logger.info(`Running migration: ${file}`);
          
          // Read and execute migration
          const filePath = path.join(migrationsDir, file);
          const sql = await fs.readFile(filePath, 'utf-8');
          
          await this.transaction(async (client) => {
            // Execute migration SQL
            await client.query(sql);
            
            // Record migration (if not already done by the SQL file)
            await client.query(
              'INSERT INTO migrations (name) VALUES ($1) ON CONFLICT (name) DO NOTHING',
              [file]
            );
          });
          
          logger.info(`Migration ${file} completed successfully`);
        }
      }
      
      logger.info('All database migrations completed successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new DatabaseError(`Failed to run migrations: ${errorMessage}`);
    }
  }
  
  private async runEmbeddedMigrations(): Promise<void> {
    // Fallback embedded migrations for when files are not available
    await this.transaction(async (client) => {
      // Create basic tables
      await client.query(`
        CREATE TABLE IF NOT EXISTS tickets (
          id SERIAL PRIMARY KEY,
          user_id VARCHAR(20) NOT NULL,
          channel_id VARCHAR(20) UNIQUE NOT NULL,
          guild_id VARCHAR(20) NOT NULL,
          opened_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          closed_at TIMESTAMP WITH TIME ZONE,
          closed_by VARCHAR(20),
          active BOOLEAN DEFAULT TRUE,
          reason TEXT,
          CONSTRAINT unique_active_ticket UNIQUE(user_id, guild_id, active) WHERE active = true
        )
      `);

      // Indexes
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_tickets_user_active ON tickets(user_id, active) WHERE active = true;
        CREATE INDEX IF NOT EXISTS idx_tickets_channel ON tickets(channel_id);
        CREATE INDEX IF NOT EXISTS idx_tickets_guild ON tickets(guild_id);
      `);

      // Cooldowns table
      await client.query(`
        CREATE TABLE IF NOT EXISTS cooldowns (
          user_id VARCHAR(20) NOT NULL,
          command VARCHAR(100) NOT NULL,
          guild_id VARCHAR(20),
          expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
          PRIMARY KEY (user_id, command, guild_id)
        )
      `);

      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_cooldowns_expires ON cooldowns(expires_at);
      `);
      
      // Record embedded migration
      await client.query(
        'INSERT INTO migrations (name) VALUES ($1) ON CONFLICT (name) DO NOTHING',
        ['embedded_initial']
      );
    });
  }
}

// Export singleton instance
export const databaseManager = DatabaseManager.getInstance();
