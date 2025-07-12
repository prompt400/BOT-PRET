import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';


import { Command } from '../../types/commands.js';

export default <Command>{
    data: new SlashCommandBuilder()
        .setName('reload')
        .setDescription('Recharge une commande')
        .addStringOption(option =>
            option.setName('command')
                .setDescription('La commande à recharger')
                .setRequired(true)),

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        // TODO: Implémenter la logique de rechargement
        await interaction.reply({
            content: 'Cette commande sera bientôt disponible',
            ephemeral: true
        });
    }
};
