import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';


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

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        // TODO: Implémenter la logique de mute
        await interaction.reply({
            content: 'Cette commande sera bientôt disponible',
            ephemeral: true
        });
    }
};
