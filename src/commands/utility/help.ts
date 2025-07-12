import { SlashCommandBuilder } from 'discord.js';
import { CommandContext } from '../../types/commands.js';

export default {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Affiche l\'aide du bot')
        .addStringOption(option =>
            option.setName('command')
                .setDescription('Nom de la commande pour plus de détails')),

    async execute(context: CommandContext): Promise<void> {
        // TODO: Implémenter la logique d'aide
        await context.interaction.reply({
            content: 'Cette commande sera bientôt disponible',
            ephemeral: true
        });
    }
};
