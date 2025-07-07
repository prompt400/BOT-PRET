/**
 * Événement interactionCreate
 * Gère toutes les interactions Discord (commandes slash, boutons, etc.)
 */

import { Events } from 'discord.js';
import Logger from '../services/logger.js';
import { gestionnaireErreurs } from '../utilitaires/erreurs.js';
import SystemeRolesNSFW from '../services/systemeRolesNSFW.js';

const logger = new Logger('InteractionCreate');
let systemeRoles = null;

export default {
    name: Events.InteractionCreate,
    
    /**
     * Exécute l'événement interactionCreate
     * @param {import('discord.js').Interaction} interaction 
     */
    async execute(interaction) {
        // Initialiser le système de rôles si nécessaire
        if (!systemeRoles) {
            systemeRoles = new SystemeRolesNSFW(interaction.client);
        }
        
        // Gestion des commandes slash
        if (interaction.isChatInputCommand()) {
            await gererCommandeSlash(interaction);
        }
        
        // Gestion des interactions du système de rôles NSFW
        else if (interaction.isButton() || interaction.isStringSelectMenu()) {
            if (interaction.customId.startsWith('role_') || interaction.customId === 'select_role_fun') {
                await systemeRoles.gererInteraction(interaction);
            }
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
