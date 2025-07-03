import { Events, Collection, EmbedBuilder } from 'discord.js';
import { logger, logCommand } from '../utils/logger.js';
import type { Event } from '../types/Event.js';
import { CooldownService } from '../services/CooldownService.js';
import { Constants } from '../utils/constants.js';
import { validateCommandOptions } from '../utils/commandValidation.js';
import { ValidationError, PermissionError } from '../utils/errors.js';


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

      // Execute command with comprehensive error handling
      const startTime = Date.now();
      
      try {
        // Validate options before execution
        const options: Record<string, unknown> = {};
        interaction.options.data.forEach(opt => {
          options[opt.name] = opt.value;
        });
        validateCommandOptions(options);
        
        await command.execute(interaction);
        
        // Log successful execution
        logCommand(
          command.data.name,
          interaction.user.id,
          interaction.guildId,
          true,
          Date.now() - startTime
        );
      } catch (error) {
        // Log failed execution
        logCommand(
          command.data.name,
          interaction.user.id,
          interaction.guildId,
          false,
          Date.now() - startTime,
          error instanceof Error ? error : new Error(String(error))
        );
        
        logger.error(`Error executing ${interaction.commandName}:`, error);

        // Build error response based on error type
        let errorMessage = '❌ An error occurred while executing this command.';
        let errorDetails: string | undefined;
        
        if (error instanceof ValidationError) {
          errorMessage = '❌ Invalid input provided.';
          errorDetails = error.message;
        } else if (error instanceof PermissionError) {
          errorMessage = '❌ You do not have permission to use this command.';
          errorDetails = error.message;
        } else if (error instanceof Error && error.message) {
          // Only show error details in development
          if (process.env.NODE_ENV !== 'production') {
            errorDetails = error.message;
          }
        }
        
        const errorEmbed = new EmbedBuilder()
          .setTitle('Command Error')
          .setDescription(errorMessage)
          .setColor(Constants.Colors.Error)
          .setTimestamp();
          
        if (errorDetails) {
          errorEmbed.addFields({ name: 'Details', value: errorDetails.substring(0, 1024) });
        }

        try {
          if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ embeds: [errorEmbed], ephemeral: true });
          } else {
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
          }
        } catch (replyError) {
          logger.error('Failed to send error message:', replyError);
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
