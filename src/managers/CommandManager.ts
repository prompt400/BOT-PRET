// @ts-ignore
import { Collection, REST, Routes } from 'discord.js';
import { readdir } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { logger } from '../utils/logger.js';
import { config } from '../config/config.js';
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
    const commandsPath = join(__dirname, '..', 'commands');
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

          if (!command?.data || !command?.execute) {
            logger.warn(`Invalid command file: ${file}`);
            continue;
          }

          this.client.commands.set(command.data.name, command);
          logger.debug(`Loaded command: ${command.data.name}`);
        } catch (error) {
          logger.error(`Failed to load command ${file}:`, error);
        }
      }
    }

    logger.info(`Loaded ${this.client.commands.size} commands`);
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
