import { Events, Collection } from 'discord.js';
import { logger } from '../utils/logger.js';
import { TicketService } from '../services/TicketService.js';
import type { Event } from '../types/Event.js';

const cooldowns = new Collection<string, Collection<string, number>>();

const event: Event<Events.InteractionCreate> = {
  name: Events.InteractionCreate,

  async execute(client, interaction) {
    // Handle slash commands
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);

      if (!command) {
        logger.warn(`Unknown command: ${interaction.commandName}`);
        return;
      }

      // Check cooldowns
      if (!cooldowns.has(command.data.name)) {
        cooldowns.set(command.data.name, new Collection());
      }

      const now = Date.now();
      const timestamps = cooldowns.get(command.data.name)!;
      const cooldownAmount = (command.cooldown || 3) * 1000;

      if (timestamps.has(interaction.user.id)) {
        const expirationTime = timestamps.get(interaction.user.id)! + cooldownAmount;

        if (now < expirationTime) {
          const timeLeft = (expirationTime - now) / 1000;
          await interaction.reply({
            content: `Please wait ${timeLeft.toFixed(1)} more seconds before using \`${command.data.name}\` again.`,
            ephemeral: true,
          });
          return;
        }
      }

      timestamps.set(interaction.user.id, now);
      setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

      // Execute command
      try {
        await command.execute(interaction);
      } catch (error) {
        logger.error(`Error executing ${interaction.commandName}:`, error);

        const reply = {
          content: '❌ There was an error executing this command.',
          ephemeral: true,
        };

        if (interaction.replied || interaction.deferred) {
          await interaction.followUp(reply);
        } else {
          await interaction.reply(reply);
        }
      }
    }

    // Handle buttons
    else if (interaction.isButton()) {
      if (interaction.customId === 'close_ticket') {
        const ticket = await TicketService.getTicketByChannel(interaction.channelId);

        if (!ticket || !ticket.active) {
          await interaction.reply({
            content: '❌ This ticket is already closed or invalid.',
            ephemeral: true,
          });
          return;
        }

        // Check permissions
        const isOwner = ticket.user_id === interaction.user.id;
        const member = interaction.guild?.members.cache.get(interaction.user.id);
        const isStaff = member?.permissions.has('ManageChannels') || false;

        if (!isOwner && !isStaff) {
          await interaction.reply({
            content: '❌ Only the ticket owner or staff can close this ticket.',
            ephemeral: true,
          });
          return;
        }

        await interaction.deferUpdate();

        const success = await TicketService.closeTicket(
          interaction.channelId,
          interaction.user.id
        );

        if (success) {
          await interaction.followUp({
            content: '🔒 Closing ticket...',
            ephemeral: true,
          });

          setTimeout(() => {
            interaction.channel?.delete().catch(() => {});
          }, 3000);
        }
      }
    }

    // Handle autocomplete
    else if (interaction.isAutocomplete()) {
      const command = client.commands.get(interaction.commandName);

      if (!command || !command.autocomplete) {
        return;
      }

      try {
        await command.autocomplete(interaction);
      } catch (error) {
        logger.error(`Error handling autocomplete for ${interaction.commandName}:`, error);
      }
    }
  },
};

export default event;