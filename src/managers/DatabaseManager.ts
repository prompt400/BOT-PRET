import { Pool } from 'pg';
import { config } from '../config/config.js';
import { logger } from '../utils/logger.js';

export class DatabaseManager {
  private static pool: Pool;

  public static getPool(): Pool {
    if (!this.pool) {
      const dbConfig = config.database;
      
      this.pool = new Pool({
        connectionString: dbConfig.connectionString,
        host: dbConfig.host,
        port: dbConfig.port,
        database: dbConfig.database,
        user: dbConfig.user,
        password: dbConfig.password,
        ssl: dbConfig.ssl ? { rejectUnauthorized: false } : undefined,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      });

      this.pool.on('error', (err) => {
        logger.error('Unexpected database error:', err);
      });
    }

    return this.pool;
  }

  public static async initialize(): Promise<void> {
    try {
      const pool = this.getPool();
      await pool.query('SELECT NOW()');
      logger.info('Database connection established');
    } catch (error) {
      logger.error('Failed to connect to database:', error);
      throw error;
    }
  }

  public static async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      logger.info('Database connection closed');
    }
  }

  public static async runMigrations(): Promise<void> {
    try {
      // Create migrations table if not exists
      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS migrations (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL UNIQUE,
          executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Run initial schema
      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS tickets (
          id SERIAL PRIMARY KEY,
          user_id VARCHAR(20) NOT NULL,
          channel_id VARCHAR(20) NOT NULL,
          guild_id VARCHAR(20) NOT NULL,
          opened_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          closed_at TIMESTAMP,
          closed_by VARCHAR(20),
          active BOOLEAN DEFAULT TRUE,
          reason TEXT
        )
      `);

      // Create indexes
      await this.pool.query(`
        CREATE INDEX IF NOT EXISTS idx_tickets_user_active ON tickets(user_id, active);
        CREATE INDEX IF NOT EXISTS idx_tickets_channel ON tickets(channel_id);
      `);

      logger.info('Database migrations completed');
    } catch (error) {
      logger.error('Failed to run migrations:', error);
      throw error;
    }
  }
}