import { SlashCommandBuilder } from 'discord.js';
import { CommandContext } from '../../types/commands.js';

export default {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Bannit un membre du serveur')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('L\'utilisateur à bannir')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('La raison du bannissement'))
        .addIntegerOption(option =>
            option.setName('days')
                .setDescription('Nombre de jours de messages à supprimer')
                .setMinValue(0)
                .setMaxValue(7)),

    async execute(context: CommandContext): Promise<void> {
        // TODO: Implémenter la logique de bannissement
        await context.interaction.reply({
            content: 'Cette commande sera bientôt disponible',
            ephemeral: true
        });
    }
};
