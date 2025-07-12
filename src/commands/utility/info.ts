import { SlashCommandBuilder } from 'discord.js';
import { CommandContext } from '../../types/commands.js';

export default {
    data: new SlashCommandBuilder()
        .setName('info')
        .setDescription('Affiche des informations sur le bot')
        .addSubcommand(subcommand =>
            subcommand
                .setName('bot')
                .setDescription('Informations sur le bot'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('server')
                .setDescription('Informations sur le serveur'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('user')
                .setDescription('Informations sur un utilisateur')
                .addUserOption(option =>
                    option.setName('target')
                        .setDescription('L\'utilisateur à afficher'))),

    async execute(context: CommandContext): Promise<void> {
        // TODO: Implémenter la logique d'information
        await context.interaction.reply({
            content: 'Cette commande sera bientôt disponible',
            ephemeral: true
        });
    }
};
