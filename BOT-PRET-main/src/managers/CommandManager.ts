import { Collection, REST, Routes } from 'discord.js';
import { readdir } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { logger, logPerformance } from '../utils/logger.js';
import { config } from '../config/config.js';
import { validateCommand } from '../utils/commandValidation.js';
import type { BotClient } from '../structures/BotClient.js';
import type { Command } from '../types/Command.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export class CommandManager {
  private client: BotClient;
  private rest: REST;

  constructor(client: BotClient) {
    this.client = client;
    this.rest = new REST({ version: '10' }).setToken(config.discord.token);
  }

  public async loadCommands(): Promise<void> {
    const startTime = Date.now();
    const commandsPath = join(__dirname, '..', 'commands');
    
    let loadedCount = 0;
    let failedCount = 0;
    
    try {
      const categories = await readdir(commandsPath);

      for (const category of categories) {
        const categoryPath = join(commandsPath, category);
        const files = (await readdir(categoryPath)).filter(
          (file) => file.endsWith('.js') || file.endsWith('.ts')
        );

        for (const file of files) {
          try {
            const filePath = join(categoryPath, file);
            const { default: command } = await import(filePath) as { default: Command };

            if (!command) {
              logger.warn(`No default export in command file: ${file}`);
              failedCount++;
              continue;
            }
            
            // Validate command structure
            if (!validateCommand(command)) {
              failedCount++;
              continue;
            }

            this.client.commands.set(command.data.name, command);
            logger.debug(`Loaded command: ${command.data.name} from category: ${category}`);
            loadedCount++;
          } catch (error) {
            logger.error(`Failed to load command ${file}:`, error);
            failedCount++;
          }
        }
      }
    } catch (error) {
      logger.error('Failed to read commands directory:', error);
      throw error;
    }

    logPerformance('commands_loaded', startTime, {
      loaded: loadedCount,
      failed: failedCount,
    });
    
    logger.info(`Loaded ${loadedCount} commands (${failedCount} failed)`);
  }

  public async deployCommands(): Promise<void> {
    try {
      const commands = this.client.commands.map((cmd) => cmd.data.toJSON());
      
      logger.info('Deploying slash commands...');
      
      if (config.discord.guildId) {
        // Guild commands (instant update)
        await this.rest.put(
          Routes.applicationGuildCommands(config.discord.clientId, config.discord.guildId),
          { body: commands }
        );
        logger.info(`Deployed ${commands.length} commands to guild ${config.discord.guildId}`);
      } else {
        // Global commands (takes up to 1 hour)
        await this.rest.put(
          Routes.applicationCommands(config.discord.clientId),
          { body: commands }
        );
        logger.info(`Deployed ${commands.length} global commands`);
      }
    } catch (error) {
      logger.error('Failed to deploy commands:', error);
      throw error;
    }
  }
}
