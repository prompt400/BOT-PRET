import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';


import { Command } from '../../types/commands.js';

export default <Command>{
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Expulse un membre du serveur')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('L\'utilisateur à expulser')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('La raison de l\'expulsion')),

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        // TODO: Implémenter la logique d'expulsion
        await interaction.reply({
            content: 'Cette commande sera bientôt disponible',
            ephemeral: true
        });
    }
};
