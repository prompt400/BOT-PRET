import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { databaseManager } from '../src/managers/DatabaseManager';
import { config } from '../src/config/config';

describe('Database Connection', () => {
  beforeAll(async () => {
    await databaseManager.initialize();
  });

  afterAll(async () => {
    await databaseManager.close();
  });

  it('should connect to database successfully', async () => {
    const pool = databaseManager.getPool();
    const result = await pool.query('SELECT 1 as test');
    expect(result.rows[0].test).toBe(1);
  });

  it('should have correct pool configuration', () => {
    const poolConfig = databaseManager.getPoolConfig();
    expect(poolConfig).toBeDefined();
    expect(poolConfig.max).toBeLessThanOrEqual(10);
  });

  it('should handle transactions', async () => {
    const result = await databaseManager.transaction(async (client) => {
      const res = await client.query('SELECT NOW() as time');
      return res.rows[0].time;
    });
    expect(result).toBeDefined();
  });
});
