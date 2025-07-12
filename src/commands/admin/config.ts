import { SlashCommandBuilder } from 'discord.js';
import { CommandContext } from '../../types/commands.js';

import { Command } from '../../types/commands.js';

export default <Command>{
    data: new SlashCommandBuilder()
        .setName('config')
        .setDescription('Configure les paramètres du bot')
        .addSubcommand(subcommand =>
            subcommand
                .setName('view')
                .setDescription('Affiche la configuration actuelle'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('set')
                .setDescription('Modifie un paramètre')
                .addStringOption(option =>
                    option.setName('key')
                        .setDescription('La clé du paramètre')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('value')
                        .setDescription('La nouvelle valeur')
                        .setRequired(true))),

    async execute(context: CommandContext): Promise<void> {
        // TODO: Implémenter la logique de configuration
        await context.interaction.reply({
            content: 'Cette commande sera bientôt disponible',
            ephemeral: true
        });
    }
};
