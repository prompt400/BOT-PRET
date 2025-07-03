import { Pool, PoolConfig } from 'pg';
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

  private constructor() {}

  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  private getPoolConfig(): PoolConfig {
    const dbConfig = config.database;
    
    return {
      connectionString: dbConfig.connectionString,
      host: dbConfig.host,
      port: dbConfig.port,
      database: dbConfig.database,
      user: dbConfig.user,
      password: dbConfig.password,
      ssl: dbConfig.ssl ? { rejectUnauthorized: false } : undefined,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: Constants.Timeouts.DatabaseConnection,
      query_timeout: 30000,
      statement_timeout: 30000,
    };
  }

  public async initialize(): Promise<void> {
    try {
      this.pool = new Pool(this.getPoolConfig());
      
      this.pool.on('error', this.handlePoolError.bind(this));
      this.pool.on('connect', () => {
        logger.debug('New database connection established');
        this.reconnectAttempts = 0;
      });

      // Test connection
      await this.pool.query('SELECT NOW()');
      logger.info('Database connection established successfully');
      
      // Setup connection check interval
      setInterval(() => this.checkConnection(), 60000); // Check every minute
    } catch (error) {
      throw new DatabaseError(`Failed to initialize database: ${error.message}`);
    }
  }

  private async handlePoolError(err: Error): Promise<void> {
    logger.error('Database pool error:', err);
    
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      logger.info(`Attempting to reconnect to database (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      
      setTimeout(async () => {
        try {
          await this.initialize();
        } catch (error) {
          logger.error('Reconnection failed:', error);
        }
      }, this.reconnectDelay * this.reconnectAttempts);
    }
  }

  private async checkConnection(): Promise<void> {
    try {
      if (this.pool) {
        await this.pool.query('SELECT 1');
      }
    } catch (error) {
      logger.error('Database health check failed:', error);
      this.handlePoolError(error as Error);
    }
  }

  public getPool(): Pool {
    if (!this.pool) {
      throw new DatabaseError('Database pool not initialized');
    }
    return this.pool;
  }

  public async transaction<T>(
    callback: (client: any) => Promise<T>
  ): Promise<T> {
    const client = await this.getPool().connect();
    
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  public async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
      logger.info('Database connection closed');
    }
  }

  public async runMigrations(): Promise<void> {
    try {
      const pool = this.getPool();
      
      // Create migrations table
      await pool.query(`
        CREATE TABLE IF NOT EXISTS migrations (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL UNIQUE,
          executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create tables with better error handling
      await this.transaction(async (client) => {
        // Tickets table
        await client.query(`
          CREATE TABLE IF NOT EXISTS tickets (
            id SERIAL PRIMARY KEY,
            user_id VARCHAR(20) NOT NULL,
            channel_id VARCHAR(20) UNIQUE NOT NULL,
            guild_id VARCHAR(20) NOT NULL,
            opened_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            closed_at TIMESTAMP,
            closed_by VARCHAR(20),
            active BOOLEAN DEFAULT TRUE,
            reason TEXT,
            CONSTRAINT unique_active_ticket UNIQUE(user_id, guild_id, active)
          )
        `);

        // Indexes
        await client.query(`
          CREATE INDEX IF NOT EXISTS idx_tickets_user_active ON tickets(user_id, active) WHERE active = true;
          CREATE INDEX IF NOT EXISTS idx_tickets_channel ON tickets(channel_id);
          CREATE INDEX IF NOT EXISTS idx_tickets_guild ON tickets(guild_id);
        `);

        // Cooldowns table for persistent cooldowns
        await client.query(`
          CREATE TABLE IF NOT EXISTS cooldowns (
            user_id VARCHAR(20) NOT NULL,
            command VARCHAR(100) NOT NULL,
            guild_id VARCHAR(20),
            expires_at TIMESTAMP NOT NULL,
            PRIMARY KEY (user_id, command, guild_id)
          )
        `);

        // Create index for cleanup
        await client.query(`
          CREATE INDEX IF NOT EXISTS idx_cooldowns_expires ON cooldowns(expires_at);
        `);
      });

      logger.info('Database migrations completed successfully');
    } catch (error) {
      throw new DatabaseError(`Failed to run migrations: ${error.message}`);
    }
  }
}

// Export singleton instance
export const databaseManager = DatabaseManager.getInstance();
