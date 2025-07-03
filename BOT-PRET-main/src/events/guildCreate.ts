import { Events } from 'discord.js';
import { logger } from '../utils/logger.js';
import type { Event } from '../types/Event.js';

const event: Event<Events.GuildCreate> = {
  name: Events.GuildCreate,

  execute(client, guild) {
    logger.info(`Joined new guild: ${guild.name} (${guild.id})`);
    logger.info(`Total guilds: ${client.guilds.cache.size}`);
  },
};

export default event;