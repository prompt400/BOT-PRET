import { SlashCommandBuilder } from 'discord.js';
import { CommandContext } from '../../types/commands.js';

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

    async execute(context: CommandContext): Promise<void> {
        // TODO: Implémenter la logique d'expulsion
        await context.interaction.reply({
            content: 'Cette commande sera bientôt disponible',
            ephemeral: true
        });
    }
};
