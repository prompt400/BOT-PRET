import '../src/config/env.js';
import { BotClient } from '../src/structures/BotClient.js';
import { logger } from '../src/utils/logger.js';

async function deployCommands(): Promise<void> {
  try {
    const client = new BotClient();
    await client.commandManager.loadCommands();
    await client.commandManager.deployCommands();
    process.exit(0);
  } catch (error) {
    logger.error('Failed to deploy commands:', error);
    process.exit(1);
  }
}

void deployCommands();