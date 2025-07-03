import { SlashCommandBuilder, EmbedBuilder, TextChannel } from 'discord.js';
import type { Command } from '../../types/Command.js';
import { ticketService } from '../../services/TicketService.js';
import { Constants } from '../../utils/constants.js';
import { logger } from '../../utils/logger.js';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('Manage support tickets')
    .addSubcommand(subcommand =>
      subcommand
        .setName('create')
        .setDescription('Create a new support ticket')
        .addStringOption(option =>
          option
            .setName('reason')
            .setDescription('The reason for creating this ticket')
            .setRequired(false)
            .setMaxLength(1000)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('close')
        .setDescription('Close the current ticket')
        .addStringOption(option =>
          option
            .setName('reason')
            .setDescription('The reason for closing this ticket')
            .setRequired(false)
            .setMaxLength(1000)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('stats')
        .setDescription('View ticket statistics')
        .addUserOption(option =>
          option
            .setName('user')
            .setDescription('View statistics for a specific user')
            .setRequired(false)
        )
    ),

  category: 'tickets',
  cooldown: 10,

  async execute(interaction) {
    if (!interaction.guild) {
      await interaction.reply({
        content: '❌ This command can only be used in a server!',
        ephemeral: true,
      });
      return;
    }

    const subcommand = interaction.options.getSubcommand();

    switch (subcommand) {
      case 'create': {
        await interaction.deferReply({ ephemeral: true });

        try {
          const reason = interaction.options.getString('reason');
          const channel = await ticketService.createTicket(
            interaction.guild,
            interaction.user,
            reason || undefined
          );

          if (channel) {
            const embed = new EmbedBuilder()
              .setTitle('✅ Ticket Created')
              .setDescription(`Your ticket has been created: ${channel.toString()}`)
              .setColor(Constants.Colors.Success)
              .setTimestamp();

            await interaction.editReply({ embeds: [embed] });
          } else {
            throw new Error('Failed to create ticket channel');
          }
        } catch (error) {
            logger.error('Error creating ticket:', error);

            const embed = new EmbedBuilder()
              .setTitle('❌ Error')
              .setDescription(error instanceof Error ? error.message : 'Failed to create ticket')
              .setColor(Constants.Colors.Error)
              .setTimestamp();

            await interaction.editReply({ embeds: [embed] });
          }
        break;
      }

      case 'close': {
        if (!interaction.channel || !('parent' in interaction.channel)) {
          await interaction.reply({
            content: '❌ This command can only be used in a ticket channel!',
            ephemeral: true,
          });
          return;
        }

        await interaction.deferReply();

        try {
          const reason = interaction.options.getString('reason');
          await ticketService.closeTicket(
            interaction.channel as TextChannel,
            interaction.user,
            reason || undefined
          );
        } catch (error) {
          logger.error('Error closing ticket:', error);

          const embed = new EmbedBuilder()
            .setTitle('❌ Error')
            .setDescription(error instanceof Error ? error.message : 'Failed to close ticket')
            .setColor(Constants.Colors.Error)
            .setTimestamp();

          await interaction.editReply({ embeds: [embed] });
        }
        break;
      }

      case 'stats': {
        await interaction.deferReply({ ephemeral: true });

        try {
          const targetUser = interaction.options.getUser('user');
          const stats = await ticketService.getTicketStats(
            interaction.guild.id,
            targetUser?.id
          );

          const embed = new EmbedBuilder()
            .setTitle('📊 Ticket Statistics')
            .setDescription(targetUser ? `Statistics for ${targetUser.toString()}` : 'Server-wide statistics')
            .addFields(
              { name: 'Total Tickets', value: stats.totalTickets.toString(), inline: true },
              { name: 'Active Tickets', value: stats.activeTickets.toString(), inline: true },
              { name: 'Avg Response Time', value: stats.averageResponseTime ? `${stats.averageResponseTime.toFixed(1)} hours` : 'N/A', inline: true }
            )
            .setColor(Constants.Colors.Primary)
            .setTimestamp();

          if (targetUser) {
            embed.addFields({ name: 'User Tickets', value: stats.userTickets.toString(), inline: true });
          }

          await interaction.editReply({ embeds: [embed] });
        } catch (error) {
          logger.error('Error getting ticket stats:', error);

          const embed = new EmbedBuilder()
            .setTitle('❌ Error')
            .setDescription('Failed to fetch ticket statistics')
            .setColor(Constants.Colors.Error)
            .setTimestamp();

          await interaction.editReply({ embeds: [embed] });
        }
        break;
      }
    }
  },
};

export default command;
