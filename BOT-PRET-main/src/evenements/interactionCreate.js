/**
 * Événement interactionCreate
 * Gère toutes les interactions Discord (commandes slash, boutons, etc.)
 */

import { Events } from 'discord.js';
import Logger from '../services/logger.js';
import { gestionnaireErreurs } from '../utilitaires/erreurs.js';

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
        
        // Ici on peut ajouter la gestion d'autres types d'interactions
        // Boutons, menus déroulants, modaux, etc.
    }
};

/**
 * Gère l'exécution d'une commande slash
 * @param {import('discord.js').ChatInputCommandInteraction} interaction 
 */
async function gererCommandeSlash(interaction) {
    const commande = interaction.client.commands.get(interaction.commandName);
    
    if (!commande) {
        logger.avertissement(`Commande inconnue: ${interaction.commandName}`);
        return;
    }
    
    try {
        logger.info(`Exécution de la commande ${interaction.commandName} par ${interaction.user.tag}`);
        await commande.execute(interaction);
        
    } catch (erreur) {
        logger.erreur(`Erreur lors de l'exécution de ${interaction.commandName}`, erreur);
        
        const messageErreur = gestionnaireErreurs.obtenirMessageErreur(erreur);
        
        try {
            if (interaction.deferred || interaction.replied) {
                await interaction.followUp({
                    content: messageErreur,
                    ephemeral: true
                });
            } else {
                await interaction.reply({
                    content: messageErreur,
                    ephemeral: true
                });
            }
        } catch (erreurReponse) {
            logger.erreur('Impossible de répondre à l\'interaction', erreurReponse);
        }
    }
}
