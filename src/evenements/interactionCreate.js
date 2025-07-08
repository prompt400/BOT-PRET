// coding: utf-8
/**
 * Événement interactionCreate
 * Gère toutes les interactions Discord (commandes slash, boutons, etc.)
 */

import { Events } from 'discord.js';
import Logger from '../services/logger.js';
import { EMOJIS } from '../constantes/theme.js';

const logger = new Logger('InteractionCreate');

export default {
    name: Events.InteractionCreate,
    
    /**
     * Exécute l'événement interactionCreate
     * @param {import('discord.js').Interaction} interaction 
     */
    async execute(interaction) {
        // Gestion des commandes slash
        if (interaction.isChatInputCommand()) {
            await gererCommandeSlash(interaction);
        }
        // Autres types d'interactions peuvent être ajoutés ici
    }
};

/**
 * Gère l'exécution d'une commande slash
 * @param {import('discord.js').ChatInputCommandInteraction} interaction 
 */
async function gererCommandeSlash(interaction) {
    const commande = interaction.client.commands.get(interaction.commandName);
    
    if (!commande) {
        logger.avertissement(`⚠ Commande inconnue: ${interaction.commandName}`);
        return;
    }
    
    logger.info(`Exécution de /${interaction.commandName} par ${interaction.user.tag}`);
    
    try {
        await commande.execute(interaction);
        logger.succes(`✅ Commande /${interaction.commandName} exécutée`);
    } catch (erreur) {
        logger.erreur(`❌ Erreur commande /${interaction.commandName}`, erreur);
        
        const messageErreur = `${EMOJIS.ERREUR} Une erreur s'est produite lors de l'exécution de la commande.`;
        
        try {
            if (interaction.deferred || interaction.replied) {
                await interaction.followUp({ content: messageErreur, ephemeral: true });
            } else {
                await interaction.reply({ content: messageErreur, ephemeral: true });
            }
        } catch (e) {
            logger.erreur('Impossible de répondre', e);
        }
    }
}
