import { Events, Collection } from 'discord.js';
import { logger } from '../utils/logger.js';
import type { Event } from '../types/Event.js';
import { CooldownService } from '../services/CooldownService.js';
import { Constants } from '../utils/constants.js';


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
const cooldownMs = (command.cooldown || 3) * 1000;
const cooldownCheck = await CooldownService.check(
  interaction.user.id,
  command.data.name,
  cooldownMs,
  interaction.guildId || undefined
);

if (cooldownCheck.isOnCooldown) {
  const timeLeft = (cooldownCheck.remainingMs! / 1000).toFixed(1);
  await interaction.reply({
    content: `${Constants.Emojis.Warning} Please wait ${timeLeft} more seconds before using \`${command.data.name}\` again.`,
    ephemeral: true,
  });
  return;
}

// Set cooldown
await CooldownService.set(
  interaction.user.id,
  command.data.name,
  cooldownMs,
  interaction.guildId || undefined
);

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
