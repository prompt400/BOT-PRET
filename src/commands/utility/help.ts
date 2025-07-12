import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';


import { Command } from '../../types/commands.js';

export default <Command>{
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Affiche l\'aide du bot')
        .addStringOption(option =>
            option.setName('command')
                .setDescription('Nom de la commande pour plus de détails')),

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        // TODO: Implémenter la logique d'aide
        await interaction.reply({
            content: 'Cette commande sera bientôt disponible',
            ephemeral: true
        });
    }
};
