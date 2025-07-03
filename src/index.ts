import * as Sentry from '@sentry/node';
import { setupHealthCheck } from './utils/healthcheck.js';
import './config/env.js';
import { BotClient } from './structures/BotClient.js';
import { logger } from './utils/logger.js';
import { config } from './config/config.js';
   import { databaseManager } from './managers/DatabaseManager.js';

// Initialize Sentry for error tracking
if (config.sentry.dsn) {
  Sentry.init({
    dsn: config.sentry.dsn,
    environment: config.nodeEnv,
    tracesSampleRate: 1.0,
  });
}

async function bootstrap(): Promise<void> {
  try {
    // Initialize database
    logger.info('Initializing database...');
    await databaseManager.initialize();
    await databaseManager.runMigrations();
    setupHealthCheck(parseInt(process.env.PORT || '3000'));

    // Create and start bot
    const client = new BotClient();
    await client.start();
  } catch (error) {
    logger.error('Failed to start bot:', error);
    Sentry.captureException(error);
    process.exit(1);
  }
}

// Handle process events
process.on('unhandledRejection', (error: Error) => {
  logger.error('Unhandled Rejection:', error);
  Sentry.captureException(error);
});

process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', error);
  Sentry.captureException(error);
  process.exit(1);
});

process.on('SIGINT', async () => {
  logger.info('Received SIGINT, shutting down gracefully...');
  await databaseManager.close();
  process.exit(0);
});

// Start the bot
void bootstrap();
