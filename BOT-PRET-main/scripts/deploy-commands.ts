import '../src/config/env.js';
import { REST, Routes } from 'discord.js';
import { logger } from '../src/utils/logger.js';
import { config } from '../src/config/config.js';
import { BotClient } from '../src/structures/BotClient.js';

async function deployCommands() {
  try {
    logger.info('Starting command deployment...');
    
    // Validate required environment variables
    if (!config.discord.token || !config.discord.clientId) {
      throw new Error('Missing required environment variables: DISCORD_TOKEN or CLIENT_ID');
    }
    
    const client = new BotClient();
    await client.commandManager.loadCommands();
    
    const commandCount = client.commands.size;
    if (commandCount === 0) {
      logger.warn('No commands found to deploy!');
      process.exit(0);
    }
    
    logger.info(`Found ${commandCount} commands to deploy`);
    await client.commandManager.deployCommands();
    
    logger.info('✅ Command deployment completed successfully!');
    logger.info(`Deployed ${commandCount} commands to ${config.discord.guildId ? 'guild' : 'global'}`);
    
    if (!config.discord.guildId) {
      logger.info('Note: Global commands may take up to 1 hour to propagate');
    }
    
    process.exit(0);
  } catch (error) {
    logger.error('❌ Failed to deploy commands:', error);
    
    if (error instanceof Error) {
      logger.error('Error details:', error.message);
      
      if ('code' in error) {
        const errorCode = (error as any).code;
        if (errorCode === 'TOKEN_INVALID') {
          logger.error('Invalid bot token provided');
        } else if (errorCode === 'INVALID_FORM_BODY') {
          logger.error('Invalid command structure detected');
        } else if (errorCode === 50001) {
          logger.error('Missing access to deploy commands. Check bot permissions.');
        }
      }
    }
    
    process.exit(1);
  }
}

// Run deployment
void deployCommands();
