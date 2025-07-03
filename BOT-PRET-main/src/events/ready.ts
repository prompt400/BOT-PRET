import { Events, ActivityType } from 'discord.js';
import { logger } from '../utils/logger.js';
import type { Event } from '../types/Event.js';
import { ticketService } from '../services/TicketService.js';
import { config } from '../config/config.js';
import { startMemoryMonitoring } from '../utils/performance.js';
import { CooldownService } from '../services/CooldownService.js';

const event: Event<Events.ClientReady> = {
  name: Events.ClientReady,
  once: true,

  async execute(client) {
    if (!client.user) {
      logger.error('Client user is not available');
      return;
    }

    logger.info(`Bot logged in as ${client.user.tag}`);
    logger.info(`Loaded ${client.commands.size} commands`);
    logger.info(`Connected to ${client.guilds.cache.size} guilds`);
    
    // Set bot activity
    client.user.setPresence({
      activities: [
        {
          name: 'for /help | Tickets',
          type: ActivityType.Watching,
        },
      ],
      status: 'online',
    });

    // Start memory monitoring in production
    if (config.nodeEnv === 'production') {
      startMemoryMonitoring(300000); // Every 5 minutes
    }

    // Setup periodic maintenance tasks
    if (config.features.tickets) {
      // Run ticket cleanup every hour with random offset
      const randomOffset = Math.floor(Math.random() * 600000); // 0-10 minutes
      setInterval(async () => {
        logger.info('Running scheduled ticket cleanup...');
        let totalClosed = 0;
        
        for (const guild of client.guilds.cache.values()) {
          try {
            const closedCount = await ticketService.cleanupInactiveTickets(guild);
            if (closedCount > 0) {
              logger.info(`Closed ${closedCount} inactive tickets in guild ${guild.name}`);
              totalClosed += closedCount;
            }
          } catch (error) {
            logger.error(`Failed to cleanup tickets in guild ${guild.name}:`, error);
          }
          // Delay between guilds to avoid rate limits
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
        if (totalClosed > 0) {
          logger.info(`Ticket cleanup completed: ${totalClosed} tickets closed`);
        }
      }, 3600000 + randomOffset); // Every hour with random offset
    }

    // Setup cooldown cleanup
    setInterval(async () => {
      try {
        await CooldownService.cleanup();
      } catch (error) {
        logger.error('Failed to cleanup cooldowns:', error);
      }
    }, 3600000); // Every hour

    // Log bot invite link with proper permissions
    const permissions = '326417619024'; // Manage channels, read/send messages, manage messages, embed links, attach files, read history, manage webhooks, use slash commands
    const inviteLink = `https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=${permissions}&scope=bot%20applications.commands`;
    logger.info(`Invite link: ${inviteLink}`);
  },
};

export default event;
