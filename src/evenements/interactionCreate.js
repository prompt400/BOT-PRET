// coding: utf-8
/**
 * Événement interactionCreate
 * Gère toutes les interactions Discord (commandes slash, boutons, etc.)
 */

import { Events } from 'discord.js';
import Logger from '../services/logger.js';
import { EMOJIS, COULEURS } from '../constantes/theme.js';

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
        // Gestion des boutons
        else if (interaction.isButton()) {
            await gererBouton(interaction);
        }
        // Gestion des menus sélectifs
        else if (interaction.isStringSelectMenu()) {
            await gererMenuSelectif(interaction);
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

/**
 * Gère les interactions avec les boutons
 * @param {import('discord.js').ButtonInteraction} interaction 
 */
async function gererBouton(interaction) {
    logger.info(`Bouton cliqué: ${interaction.customId} par ${interaction.user.tag}`);
    
    try {
        // Gestion du bouton de vérification
        if (interaction.customId === 'verification_button') {
            await gererVerification(interaction);
        }
    } catch (erreur) {
        logger.erreur(`Erreur lors du traitement du bouton ${interaction.customId}`, erreur);
        
        try {
            await interaction.reply({
                content: `${EMOJIS.ERREUR} Une erreur s'est produite. Veuillez réessayer.`,
                ephemeral: true
            });
        } catch (e) {
            logger.erreur('Impossible de répondre', e);
        }
    }
}

/**
 * Gère la vérification d'un membre
 * @param {import('discord.js').ButtonInteraction} interaction 
 */
async function gererVerification(interaction) {
    const member = interaction.member;
    const guild = interaction.guild;
    
    // Vérifier si l'utilisateur est déjà vérifié
    const roleVerifie = guild.roles.cache.find(r => r.name === 'Vérifié');
    const roleNonVerifie = guild.roles.cache.find(r => r.name === 'Non vérifié');
    
    if (!roleVerifie || !roleNonVerifie) {
        await interaction.reply({
            content: `${EMOJIS.ERREUR} Configuration incorrecte. Veuillez contacter un administrateur.`,
            ephemeral: true
        });
        return;
    }
    
    if (member.roles.cache.has(roleVerifie.id)) {
        await interaction.reply({
            content: `${EMOJIS.INFO} Vous êtes déjà vérifié !`,
            ephemeral: true
        });
        return;
    }
    
    try {
        // Ajouter le rôle vérifié et retirer le rôle non vérifié
        await member.roles.add(roleVerifie);
        await member.roles.remove(roleNonVerifie);
        
        logger.succes(`Membre vérifié: ${member.user.tag}`);
        
        // Répondre à l'utilisateur
        await interaction.reply({
            content: `${EMOJIS.SUCCES} **Vérification réussie !**\n\nBienvenue sur ${guild.name} ! Vous avez maintenant accès à tous les salons du serveur.`,
            ephemeral: true
        });
        
        // Essayer de supprimer les messages de bienvenue personnalisés
        try {
            const messages = await interaction.channel.messages.fetch({ limit: 50 });
            const userMessages = messages.filter(msg => 
                msg.content.includes(`<@${member.id}>`) && 
                msg.author.id === interaction.client.user.id
            );
            
            for (const [, message] of userMessages) {
                try {
                    await message.delete();
                } catch (err) {
                    // Ignorer les erreurs de suppression
                }
            }
        } catch (err) {
            // Ignorer les erreurs de récupération des messages
        }
        
    } catch (erreur) {
        logger.erreur('Erreur lors de la vérification', erreur);
        await interaction.reply({
            content: `${EMOJIS.ERREUR} Une erreur s'est produite lors de la vérification. Veuillez réessayer ou contacter un administrateur.`,
            ephemeral: true
        });
    }
}

/**
 * Gère les interactions avec les menus sélectifs
 * @param {import('discord.js').StringSelectMenuInteraction} interaction 
 */
async function gererMenuSelectif(interaction) {
    logger.info(`Menu sélectif utilisé: ${interaction.customId} par ${interaction.user.tag}`);
    
    try {
    } catch (erreur) {
        logger.erreur(`Erreur lors du traitement du menu ${interaction.customId}`, erreur);
        
        try {
            await interaction.reply({
                content: `${EMOJIS.ERREUR} Une erreur s'est produite. Veuillez réessayer.`,
                ephemeral: true
            });
        } catch (e) {
            logger.erreur('Impossible de répondre', e);
        }
    }
}
