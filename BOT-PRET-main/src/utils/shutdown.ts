import { logger } from './logger.js';
import { databaseManager } from '../managers/DatabaseManager.js';
import { CooldownService } from '../services/CooldownService.js';
import type { BotClient } from '../structures/BotClient.js';

interface ShutdownOptions {
  timeout?: number;
  client?: BotClient;
}

export async function gracefulShutdown(options: ShutdownOptions = {}): Promise<void> {
  const { timeout = 30000, client } = options;
  
  logger.info('Starting graceful shutdown...');
  
  const shutdownPromise = Promise.all([
    // Close database connections
    databaseManager.close().catch((error) => {
      logger.error('Error closing database:', error);
    }),
    
    // Shutdown cooldown service (includes Redis)
    CooldownService.shutdown().catch((error) => {
      logger.error('Error shutting down cooldown service:', error);
    }),
    
    // Destroy Discord client if provided
    client?.destroy().catch((error) => {
      logger.error('Error destroying Discord client:', error);
    }),
  ]);
  
  try {
    await Promise.race([
      shutdownPromise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Shutdown timeout')), timeout)
      ),
    ]);
    
    logger.info('Graceful shutdown completed');
  } catch (error) {
    logger.error('Error during graceful shutdown:', error);
    throw error;
  }
}

// Setup shutdown handlers
export function setupShutdownHandlers(client?: BotClient): void {
  const signals: NodeJS.Signals[] = ['SIGTERM', 'SIGINT', 'SIGUSR2'];
  let isShuttingDown = false;
  
  signals.forEach((signal) => {
    process.on(signal, async () => {
      if (isShuttingDown) {
        logger.warn(`Already shutting down, ignoring ${signal}`);
        return;
      }
      
      isShuttingDown = true;
      logger.info(`Received ${signal}, initiating graceful shutdown...`);
      
      try {
        await gracefulShutdown({ client });
        process.exit(0);
      } catch (error) {
        logger.error('Graceful shutdown failed:', error);
        process.exit(1);
      }
    });
  });
  
  // Handle Windows-specific signals
  if (process.platform === 'win32') {
    import('readline').then((readline) => {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });
      
      rl.on('SIGINT', () => {
        process.emit('SIGINT' as NodeJS.Signals);
      });
    }).catch((error) => {
      logger.error('Failed to setup Windows signal handler:', error);
    });
  }
}
