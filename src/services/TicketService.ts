import {
  Guild,
  GuildMember,
  TextChannel,
  ChannelType,
  PermissionsBitField,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} from 'discord.js';
import { DatabaseManager } from '../managers/DatabaseManager.js';
import { config } from '../config/config.js';
import { logger } from '../utils/logger.js';
import type { Ticket } from '../types/Database.js';

export class TicketService {
  private static db = databaseManager.getPool();

  public static async createTicket(
    guild: Guild,
    member: GuildMember
  ): Promise<TextChannel | null> {
    try {
      // Check for existing tickets
      const existing = await this.getActiveTicketByUser(member.id, guild.id);
      if (existing) {
        return null;
      }

      // Create ticket channel
      const channelName = `ticket-${member.user.username}-${Date.now().toString(36)}`;
      const channel = await guild.channels.create({
        name: channelName,
        type: ChannelType.GuildText,
        parent: config.tickets.categoryId,
        permissionOverwrites: [
          {
            id: guild.id,
            deny: [PermissionsBitField.Flags.ViewChannel],
          },
          {
            id: member.id,
            allow: [
              PermissionsBitField.Flags.ViewChannel,
              PermissionsBitField.Flags.SendMessages,
              PermissionsBitField.Flags.AttachFiles,
              PermissionsBitField.Flags.EmbedLinks,
            ],
          },
          ...(config.tickets.supportRoleId
            ? [
                {
                  id: config.tickets.supportRoleId,
                  allow: [
                    PermissionsBitField.Flags.ViewChannel,
                    PermissionsBitField.Flags.SendMessages,
                    PermissionsBitField.Flags.AttachFiles,
                    PermissionsBitField.Flags.EmbedLinks,
                    PermissionsBitField.Flags.ManageMessages,
                  ],
                },
              ]
            : []),
        ],
      });

      // Save to database
      await this.db.query(
        'INSERT INTO tickets (user_id, channel_id, guild_id) VALUES ($1, $2, $3)',
        [member.id, channel.id, guild.id]
      );

      // Send welcome message
      const embed = new EmbedBuilder()
        .setTitle('Support Ticket')
        .setDescription(
          `Hello ${member}, thank you for creating a ticket!\n\n` +
          'Please describe your issue in detail and our support team will assist you shortly.'
        )
        .setColor(0x00aaff)
        .setTimestamp();

      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId('close_ticket')
          .setLabel('Close Ticket')
          .setStyle(ButtonStyle.Danger)
          .setEmoji('🔒')
      );

      await channel.send({
        content: config.tickets.supportRoleId ? `<@&${config.tickets.supportRoleId}>` : undefined,
        embeds: [embed],
        components: [row],
      });

      logger.info(`Ticket created for user ${member.id} in guild ${guild.id}`);
      return channel;
    } catch (error) {
      logger.error('Failed to create ticket:', error);
      return null;
    }
  }

  public static async closeTicket(
    channelId: string,
    closedBy: string
  ): Promise<boolean> {
    try {
      const result = await this.db.query(
        'UPDATE tickets SET active = false, closed_at = NOW(), closed_by = $1 WHERE channel_id = $2 AND active = true RETURNING *',
        [closedBy, channelId]
      );

      if (result.rowCount === 0) {
        return false;
      }

      logger.info(`Ticket ${channelId} closed by ${closedBy}`);
      return true;
    } catch (error) {
      logger.error('Failed to close ticket:', error);
      return false;
    }
  }

  public static async getActiveTicketByUser(
    userId: string,
    guildId: string
  ): Promise<Ticket | null> {
    try {
      const result = await this.db.query(
        'SELECT * FROM tickets WHERE user_id = $1 AND guild_id = $2 AND active = true LIMIT 1',
        [userId, guildId]
      );

      return result.rows[0] || null;
    } catch (error) {
      logger.error('Failed to get active ticket:', error);
      return null;
    }
  }

  public static async getTicketByChannel(channelId: string): Promise<Ticket | null> {
    try {
      const result = await this.db.query(
        'SELECT * FROM tickets WHERE channel_id = $1 LIMIT 1',
        [channelId]
      );

      return result.rows[0] || null;
    } catch (error) {
      logger.error('Failed to get ticket by channel:', error);
      return null;
    }
  }
}
