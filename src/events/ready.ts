import { Events, ActivityType } from 'discord.js';
import { logger } from '../utils/logger.js';
import type { Event } from '../types/Event.js';

const event: Event<Events.ClientReady> = {
  name: Events.ClientReady,
  once: true,

  execute(client) {
    logger.info(`Bot logged in as ${client.user?.tag}`);
    
    // Set bot activity
    client.user?.setPresence({
      activities: [
        {
          name: 'with Discord.js v14',
          type: ActivityType.Playing,
        },
      ],
      status: 'online',
    });

    // Log stats
    logger.info(`Loaded ${client.commands.size} commands`);
    logger.info(`Connected to ${client.guilds.cache.size} guilds`);
  },
};

export default event;