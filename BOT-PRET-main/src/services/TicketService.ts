import { 
  TextChannel, 
  CategoryChannel, 
  Guild, 
  User, 
  PermissionsBitField,
  ChannelType,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Message
} from 'discord.js';
import { databaseManager } from '../managers/DatabaseManager.js';
import { logger } from '../utils/logger.js';
import { config } from '../config/config.js';
import { Constants } from '../utils/constants.js';

export interface Ticket {
  id: number;
  user_id: string;
  channel_id: string;
  guild_id: string;
  opened_at: Date;
  closed_at?: Date;
  closed_by?: string;
  active: boolean;
  reason?: string;
}

export interface TicketStats {
  totalTickets: number;
  activeTickets: number;
  averageResponseTime?: number;
  userTickets: number;
}

export class TicketService {
  private static instance: TicketService;
  
  private constructor() {}
  
  public static getInstance(): TicketService {
    if (!TicketService.instance) {
      TicketService.instance = new TicketService();
    }
    return TicketService.instance;
  }

  /**
   * Create a new ticket for a user
   */
  public async createTicket(
    guild: Guild, 
    user: User, 
    reason?: string
  ): Promise<TextChannel | null> {
    try {
      // Check if tickets are enabled
      if (!config.features.tickets) {
        throw new Error('Ticket system is disabled');
      }

      // Check for existing active tickets
      const activeTickets = await this.getUserActiveTickets(user.id, guild.id);
      if (activeTickets.length >= config.tickets.maxOpenPerUser) {
        throw new Error(`You already have ${activeTickets.length} open ticket(s). Please close existing tickets before opening new ones.`);
      }
      
      // Validate reason if provided
      if (reason && reason.length > 1000) {
        throw new Error('Ticket reason must be under 1000 characters');
      }

      // Get or create ticket category
      const category = await this.getOrCreateCategory(guild);
      if (!category) {
        throw new Error('Failed to create ticket category');
      }

      // Create ticket channel with safe username handling
      const ticketNumber = await this.getNextTicketNumber(guild.id);
      const safeUsername = user.username.replace(/[^a-zA-Z0-9]/g, '').substring(0, 20) || 'user';
      const channelName = `ticket-${ticketNumber}-${safeUsername}`.toLowerCase();
      
      const channel = await guild.channels.create({
        name: channelName,
        type: ChannelType.GuildText,
        parent: category.id,
        permissionOverwrites: [
          {
            id: guild.id,
            deny: [PermissionsBitField.Flags.ViewChannel],
          },
          {
            id: user.id,
            allow: [
              PermissionsBitField.Flags.ViewChannel,
              PermissionsBitField.Flags.SendMessages,
              PermissionsBitField.Flags.AttachFiles,
              PermissionsBitField.Flags.EmbedLinks,
              PermissionsBitField.Flags.ReadMessageHistory,
            ],
          },
          ...(config.tickets.supportRoleId ? [{
            id: config.tickets.supportRoleId,
            allow: [
              PermissionsBitField.Flags.ViewChannel,
              PermissionsBitField.Flags.SendMessages,
              PermissionsBitField.Flags.ManageMessages,
              PermissionsBitField.Flags.ReadMessageHistory,
              PermissionsBitField.Flags.AttachFiles,
              PermissionsBitField.Flags.EmbedLinks,
            ],
          }] : []),
        ],
        topic: `Ticket created by ${user.tag} | Reason: ${reason || 'No reason provided'}`,
        rateLimitPerUser: 5, // 5 second slowmode
      });

      // Save to database with transaction for consistency
      await databaseManager.transaction(async (client) => {
        await client.query(
          `INSERT INTO tickets (user_id, channel_id, guild_id, reason) 
           VALUES ($1, $2, $3, $4)`,
          [user.id, channel.id, guild.id, reason]
        );
      });

      // Send welcome message
      const embed = new EmbedBuilder()
        .setTitle(`🎫 Ticket #${ticketNumber}`)
        .setDescription('Thank you for creating a ticket! Our support team will assist you shortly.')
        .addFields(
          { name: 'Created by', value: user.toString(), inline: true },
          { name: 'Reason', value: reason || 'No reason provided', inline: true },
          { name: 'Status', value: '🟢 Open', inline: true }
        )
        .setColor(Constants.Colors.Primary)
        .setTimestamp();

      const closeButton = new ButtonBuilder()
        .setCustomId('ticket_close')
        .setLabel('Close Ticket')
        .setStyle(ButtonStyle.Danger)
        .setEmoji('🔒');

      const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(closeButton);

      await channel.send({ 
        content: config.tickets.supportRoleId ? `<@&${config.tickets.supportRoleId}>` : undefined,
        embeds: [embed], 
        components: [row] 
      });

      logger.info(`Ticket created: ${channel.name} for user ${user.tag}`);
      return channel;

    } catch (error) {
      logger.error('Failed to create ticket:', error);
      throw error;
    }
  }

  /**
   * Close a ticket
   */
  public async closeTicket(
    channel: TextChannel, 
    closedBy: User,
    reason?: string
  ): Promise<void> {
    try {
      const ticket = await this.getTicketByChannel(channel.id);
      if (!ticket) {
        throw new Error('This channel is not a ticket');
      }

      if (!ticket.active) {
        throw new Error('This ticket is already closed');
      }

      // Update database with transaction
      await databaseManager.transaction(async (client) => {
        await client.query(
          `UPDATE tickets 
           SET active = false, closed_at = NOW(), closed_by = $1, reason = COALESCE($2, reason)
           WHERE channel_id = $3 AND active = true`,
          [closedBy.id, reason, channel.id]
        );
      });

      // Send closing message
      const embed = new EmbedBuilder()
        .setTitle('🔒 Ticket Closed')
        .setDescription('This ticket has been closed.')
        .addFields(
          { name: 'Closed by', value: closedBy.toString(), inline: true },
          { name: 'Reason', value: reason || 'No reason provided', inline: true }
        )
        .setColor(Constants.Colors.Error)
        .setTimestamp();

      await channel.send({ embeds: [embed] });

      // Generate and send transcript
      const transcript = await this.generateTranscript(channel);
      if (transcript) {
        await channel.send({
          content: 'Ticket transcript:',
          files: [{
            attachment: Buffer.from(transcript),
            name: `transcript-${channel.name}.txt`
          }]
        });
      }

      // Delete channel after delay with proper error handling
      setTimeout(async () => {
        try {
          if (channel.deletable) {
            await channel.delete('Ticket closed');
            logger.info(`Ticket channel deleted: ${channel.name}`);
          } else {
            logger.warn(`Cannot delete ticket channel: ${channel.name} (insufficient permissions)`);
          }
        } catch (error) {
          logger.error('Failed to delete ticket channel:', error);
        }
      }, 10000); // 10 seconds delay

    } catch (error) {
      logger.error('Failed to close ticket:', error);
      throw error;
    }
  }

  /**
   * Get ticket by channel ID
   */
  public async getTicketByChannel(channelId: string): Promise<Ticket | null> {
    try {
      const result = await databaseManager.getPool().query(
        'SELECT * FROM tickets WHERE channel_id = $1 LIMIT 1',
        [channelId]
      );

      return result.rows[0] || null;
    } catch (error) {
      logger.error('Failed to get ticket by channel:', error);
      throw new Error('Failed to retrieve ticket information');
    }
  }

  /**
   * Get user's active tickets
   */
  public async getUserActiveTickets(userId: string, guildId: string): Promise<Ticket[]> {
    try {
      const result = await databaseManager.getPool().query(
        'SELECT * FROM tickets WHERE user_id = $1 AND guild_id = $2 AND active = true ORDER BY opened_at DESC',
        [userId, guildId]
      );

      return result.rows;
    } catch (error) {
      logger.error('Failed to get user active tickets:', error);
      throw new Error('Failed to retrieve active tickets');
    }
  }

  /**
   * Get ticket statistics
   */
  public async getTicketStats(guildId: string, userId?: string): Promise<TicketStats> {
    try {
      const statsQuery = userId
        ? `SELECT 
            COUNT(*) as total_tickets,
            COUNT(*) FILTER (WHERE active = true) as active_tickets,
            AVG(EXTRACT(EPOCH FROM (closed_at - opened_at))) / 3600 as avg_response_hours,
            COUNT(*) FILTER (WHERE user_id = $2) as user_tickets
           FROM tickets 
           WHERE guild_id = $1`
        : `SELECT 
            COUNT(*) as total_tickets,
            COUNT(*) FILTER (WHERE active = true) as active_tickets,
            AVG(EXTRACT(EPOCH FROM (closed_at - opened_at))) / 3600 as avg_response_hours,
            0 as user_tickets
           FROM tickets 
           WHERE guild_id = $1`;

      const params = userId ? [guildId, userId] : [guildId];
      const result = await databaseManager.getPool().query(statsQuery, params);

      const stats = result.rows[0];
      return {
        totalTickets: parseInt(stats.total_tickets),
        activeTickets: parseInt(stats.active_tickets),
        averageResponseTime: stats.avg_response_hours ? parseFloat(stats.avg_response_hours) : undefined,
        userTickets: parseInt(stats.user_tickets),
      };
    } catch (error) {
      logger.error('Failed to get ticket stats:', error);
      return {
        totalTickets: 0,
        activeTickets: 0,
        userTickets: 0,
      };
    }
  }

  /**
   * Clean up inactive tickets
   */
  public async cleanupInactiveTickets(guild: Guild): Promise<number> {
    try {
      const inactiveHours = Math.max(1, config.tickets.inactiveHours); // Ensure minimum 1 hour
      
      const result = await databaseManager.getPool().query(
        `SELECT channel_id, user_id FROM tickets 
         WHERE guild_id = $1 
         AND active = true 
         AND opened_at < NOW() - INTERVAL $2
         ORDER BY opened_at ASC
         LIMIT 50`, // Process max 50 tickets at once to avoid overload
        [guild.id, `${inactiveHours} hours`]
      );

      let closedCount = 0;
      for (const row of result.rows) {
        try {
          const channel = guild.channels.cache.get(row.channel_id) as TextChannel;
          if (channel && channel.deletable) {
            await this.closeTicket(channel, guild.client.user!, 'Closed due to inactivity');
            closedCount++;
            // Add small delay between closures to avoid rate limits
            await new Promise(resolve => setTimeout(resolve, 1000));
          } else if (!channel) {
            // Clean up orphaned database entries
            await databaseManager.getPool().query(
              'UPDATE tickets SET active = false, closed_at = NOW() WHERE channel_id = $1',
              [row.channel_id]
            );
            logger.info(`Cleaned up orphaned ticket entry: ${row.channel_id}`);
          }
        } catch (error) {
          logger.error(`Failed to close inactive ticket ${row.channel_id}:`, error);
        }
      }

      return closedCount;
    } catch (error) {
      logger.error('Failed to cleanup inactive tickets:', error);
      return 0;
    }
  }

  /**
   * Get or create ticket category
   */
  private async getOrCreateCategory(guild: Guild): Promise<CategoryChannel | null> {
    try {
      // Use configured category if available
      if (config.tickets.categoryId) {
        const category = guild.channels.cache.get(config.tickets.categoryId) as CategoryChannel;
        if (category && category.type === ChannelType.GuildCategory) {
          return category;
        }
      }

      // Find existing category
      const existingCategory = guild.channels.cache.find(
        (ch) => ch.type === ChannelType.GuildCategory && ch.name.toLowerCase() === 'tickets'
      ) as CategoryChannel;

      if (existingCategory) {
        return existingCategory;
      }

      // Create new category
      return await guild.channels.create({
        name: 'Tickets',
        type: ChannelType.GuildCategory,
        permissionOverwrites: [
          {
            id: guild.id,
            deny: [PermissionsBitField.Flags.ViewChannel],
          },
        ],
      });
    } catch (error) {
      logger.error('Failed to get or create ticket category:', error);
      return null;
    }
  }

  /**
   * Get next ticket number
   */
  private async getNextTicketNumber(guildId: string): Promise<number> {
    try {
      const result = await databaseManager.getPool().query(
        `SELECT COUNT(*) + 1 as next_number 
         FROM tickets 
         WHERE guild_id = $1`,
        [guildId]
      );

      return parseInt(result.rows[0].next_number) || 1;
    } catch (error) {
      logger.error('Failed to get next ticket number:', error);
      // Use a more readable fallback
      return Math.floor(Date.now() / 1000) % 10000; // Last 4 digits of timestamp
    }
  }

  /**
   * Generate ticket transcript
   */
  private async generateTranscript(channel: TextChannel): Promise<string | null> {
    try {
      // Fetch messages in batches for better performance
      const messages = await channel.messages.fetch({ limit: 100 });
      const sortedMessages = Array.from(messages.values())
        .filter(msg => !msg.author.bot || msg.author.id === channel.client.user?.id)
        .reverse();

      let transcript = `Ticket Transcript: ${channel.name}\n`;
      transcript += `Created: ${channel.createdAt.toUTCString()}\n`;
      transcript += `===============================================\n\n`;

      for (const msg of sortedMessages) {
        const timestamp = msg.createdAt.toUTCString();
        const author = msg.author.tag;
        const content = msg.content || '[No text content]';
        const attachments = msg.attachments.size > 0 
          ? `\n[Attachments: ${msg.attachments.map(a => a.url).join(', ')}]` 
          : '';

        transcript += `[${timestamp}] ${author}: ${content}${attachments}\n\n`;
      }

      return transcript;
    } catch (error) {
      logger.error('Failed to generate ticket transcript:', error);
      return null;
    }
  }
}

// Export singleton instance
export const ticketService = TicketService.getInstance();
