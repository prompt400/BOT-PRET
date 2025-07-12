import { SlashCommandBuilder } from 'discord.js';
import { CommandContext } from '../../types/commands.js';

import { Command } from '../../types/commands.js';

export default <Command>{
    data: new SlashCommandBuilder()
        .setName('mute')
        .setDescription('Réduit au silence un membre du serveur')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('L\'utilisateur à réduire au silence')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('duration')
                .setDescription('Durée en minutes')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(43200)) // 30 jours
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('La raison du mute')),

    async execute(context: CommandContext): Promise<void> {
        // TODO: Implémenter la logique de mute
        await context.interaction.reply({
            content: 'Cette commande sera bientôt disponible',
            ephemeral: true
        });
    }
};
