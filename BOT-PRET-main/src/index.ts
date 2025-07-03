import * as Sentry from '@sentry/node';
import { setupHealthCheck } from './utils/healthcheck.js';
import './config/env.js';
import { BotClient } from './structures/BotClient.js';
import { logger } from './utils/logger.js';
import { config } from './config/config.js';
import { databaseManager } from './managers/DatabaseManager.js';
import { gracefulShutdown, setupShutdownHandlers } from './utils/shutdown.js';
import { logRailwayInfo } from './utils/railway.js';

// Initialize Sentry for error tracking
if (config.sentry.dsn) {
  Sentry.init({
    dsn: config.sentry.dsn,
    environment: config.nodeEnv,
    tracesSampleRate: 1.0,
  });
}

let botClient: BotClient | null = null;

async function bootstrap(): Promise<void> {
  try {
    // Log Railway deployment info if applicable
    logRailwayInfo();
    
    // Initialize database
    logger.info('Initializing database...');
    await databaseManager.initialize();
    await databaseManager.runMigrations();
    
    // Setup health check server
    const port = parseInt(process.env.PORT || '3000', 10);
    setupHealthCheck(port);

    // Create and start bot
    botClient = new BotClient();
    await botClient.start();
    
    // Setup shutdown handlers after successful start
    setupShutdownHandlers(botClient);
    
    logger.info('Bot started successfully');
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

// Remove manual SIGINT handler as it's now handled by setupShutdownHandlers

// Start the bot
void bootstrap();
