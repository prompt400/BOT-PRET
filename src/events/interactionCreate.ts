import logger from '../utils/logger.js';
import { Collection, Interaction, ChatInputCommandInteraction } from 'discord.js';
import config from '../config/config.js';

const cooldowns = new Collection<string, Collection<string, number>>();

export default {
    name: 'interactionCreate',
    once: false,
    async execute(interaction: Interaction): Promise<void> {
        if (!interaction.isChatInputCommand()) return;
        const commandInteraction = interaction as ChatInputCommandInteraction;
        const command = commandInteraction.client.commands.get(commandInteraction.commandName);
        if (!command) return;

        // Gestion des cooldowns
        if (!cooldowns.has(command.data.name)) {
            cooldowns.set(command.data.name, new Collection());
        }

        const now = Date.now();
        const timestamps = cooldowns.get(command.data.name);
        const cooldownAmount = config.cooldowns.commands[command.data.name] || config.cooldowns.default;

        if (timestamps.has(interaction.user.id)) {
            const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

            if (now < expirationTime) {
                const timeLeft = (expirationTime - now) / 1000;
                return interaction.reply({
                    content: `Merci d'attendre ${timeLeft.toFixed(1)} seconde(s) avant de réutiliser la commande \`${command.data.name}\`.`,
                    ephemeral: true
                });
            }
        }

        timestamps.set(interaction.user.id, now);
        setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

        // Exécution de la commande
        try {
            logger.info(`Commande ${command.data.name} utilisée par ${interaction.user.tag}`, {
                userId: interaction.user.id,
                guildId: interaction.guildId,
                command: command.data.name
            });

            await command.execute(interaction);
        } catch (error) {
            logger.error(`Erreur lors de l'exécution de la commande ${command.data.name}`, {
                error: error.stack,
                userId: interaction.user.id,
                guildId: interaction.guildId,
                command: command.data.name
            });

            const errorMessage = {
                content: 'Une erreur est survenue lors de l\'exécution de cette commande.',
                ephemeral: true
            };

            if (interaction.replied || interaction.deferred) {
                await interaction.followUp(errorMessage);
            } else {
                await interaction.reply(errorMessage);
            }
        }
    },
};
