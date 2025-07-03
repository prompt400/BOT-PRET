#!/usr/bin/env node
import '../src/config/env.js';
import { databaseManager } from '../src/managers/DatabaseManager.js';
import { logger } from '../src/utils/logger.js';

const command = process.argv[2];

async function runMigrations(): Promise<void> {
  try {
    await databaseManager.initialize();
    await databaseManager.runMigrations();
    logger.info('Migrations completed successfully');
  } catch (error) {
    logger.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await databaseManager.close();
  }
}

async function rollbackMigrations(): Promise<void> {
  logger.warn('Rollback functionality not implemented yet');
  process.exit(0);
}

async function main(): Promise<void> {
  switch (command) {
    case 'up':
      await runMigrations();
      break;
    case 'down':
      await rollbackMigrations();
      break;
    default:
      console.error('Usage: npm run db:migrate [up|down]');
      process.exit(1);
  }
}

void main();
