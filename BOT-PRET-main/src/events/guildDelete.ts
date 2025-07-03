import { Events } from 'discord.js';
import { logger } from '../utils/logger.js';
import type { Event } from '../types/Event.js';

const event: Event<Events.GuildDelete> = {
  name: Events.GuildDelete,

  execute(client, guild) {
    logger.info(`Left guild: ${guild.name} (${guild.id})`);
    logger.info(`Total guilds: ${client.guilds.cache.size}`);
  },
};

export default event;