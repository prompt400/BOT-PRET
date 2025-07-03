import { Client, GatewayIntentBits, Collection } from 'discord.js';
import { CommandManager } from '../managers/CommandManager.js';
import { EventManager } from '../managers/EventManager.js';
import { logger } from '../utils/logger.js';
import { config } from '../config/config.js';
import type { Command } from '../types/Command.js';

export class BotClient extends Client {
  public commands: Collection<string, Command>;
  public commandManager: CommandManager;
  public eventManager: EventManager;

  constructor() {
    super({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.DirectMessages,
      ],
      failIfNotExists: false,
    });

    this.commands = new Collection();
    this.commandManager = new CommandManager(this);
    this.eventManager = new EventManager(this);
  }

  public async start(): Promise<void> {
    try {
      // Load commands and events
      await this.commandManager.loadCommands();
      await this.eventManager.loadEvents();

      // Login to Discord
      await this.login(config.discord.token);
    } catch (error) {
      logger.error('Failed to start bot client:', error);
      throw error;
    }
  }
}