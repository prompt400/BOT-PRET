import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { TicketService } from '../../services/TicketService.js';
import type { Command } from '../../types/Command.js';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('Manage support tickets')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('open')
        .setDescription('Open a new support ticket')
        .addStringOption((option) =>
          option
            .setName('reason')
            .setDescription('Reason for opening the ticket')
            .setRequired(false)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand.setName('close').setDescription('Close the current ticket')
    ),

  category: 'ticket',
  cooldown: 10,

  async execute(interaction) {
    if (!interaction.guild || !interaction.member) {
      await interaction.reply({
        content: '❌ This command can only be used in a server.',
        ephemeral: true,
      });
      return;
    }

    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'open') {
      await interaction.deferReply({ ephemeral: true });

      const channel = await TicketService.createTicket(
        interaction.guild,
        interaction.member as any
      );

      if (!channel) {
        const existing = await TicketService.getActiveTicketByUser(
          interaction.user.id,
          interaction.guild.id
        );

        await interaction.editReply({
          content: existing
            ? `❌ You already have an open ticket: <#${existing.channel_id}>`
            : '❌ Failed to create ticket. Please try again later.',
        });
        return;
      }

      await interaction.editReply({
        content: `✅ Your ticket has been created: ${channel}`,
      });
    } else if (subcommand === 'close') {
      const ticket = await TicketService.getTicketByChannel(interaction.channelId);

      if (!ticket || !ticket.active) {
        await interaction.reply({
          content: '❌ This command can only be used in an active ticket channel.',
          ephemeral: true,
        });
        return;
      }

      // Check permissions
      const isOwner = ticket.user_id === interaction.user.id;
      const isStaff = (interaction.member as any).permissions.has('ManageChannels');

      if (!isOwner && !isStaff) {
        await interaction.reply({
          content: '❌ Only the ticket owner or staff can close this ticket.',
          ephemeral: true,
        });
        return;
      }

      await interaction.deferReply();

      const success = await TicketService.closeTicket(
        interaction.channelId,
        interaction.user.id
      );

      if (!success) {
        await interaction.editReply({
          content: '❌ Failed to close ticket. Please try again.',
        });
        return;
      }

      const embed = new EmbedBuilder()
        .setTitle('Ticket Closed')
        .setDescription('This ticket will be deleted in 5 seconds...')
        .setColor(0xff0000)
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });

      setTimeout(() => {
        interaction.channel?.delete().catch(() => {});
      }, 5000);
    }
  },
};

export default command;