// coding: utf-8
/**
 * Événement guildMemberAdd
 * Gère l'arrivée des nouveaux membres et le système de vérification
 */

import { Events } from 'discord.js';
import Logger from '../services/logger.js';

const logger = new Logger('GuildMemberAdd');

export default {
    name: Events.GuildMemberAdd,
    
    /**
     * Exécute l'événement guildMemberAdd
     * @param {import('discord.js').GuildMember} member 
     */
    async execute(member) {
        logger.info(`Nouveau membre : ${member.user.tag} sur ${member.guild.name}`);
        
        try {
            // Le VerificationModule gère tout automatiquement
            // L'event est écouté directement par le module
            logger.info('Le module de vérification prendra en charge ce membre');
            
        } catch (erreur) {
            logger.erreur('Erreur lors du traitement du nouveau membre', erreur);
        }
    }
};

/**
 * Obtient ou crée le salon de vérification
 * @param {import('discord.js').Guild} guild 
 * @returns {Promise<import('discord.js').TextChannel>}
 */
async function obtenirOuCreerSalonVerification(guild) {
    try {
        // Chercher le salon existant
        let salon = guild.channels.cache.find(
            channel => channel.name === VERIFICATION_CONFIG.channelName && 
                      channel.type === ChannelType.GuildText
        );
        
        if (salon) {
            logger.info('Salon de vérification existant trouvé');
            return salon;
        }
        
        logger.info('Création du salon de vérification...');
        
        // Obtenir les rôles
        const roleEveryone = guild.roles.everyone;
        const roleVerifie = await obtenirOuCreerRole(guild, VERIFICATION_CONFIG.verifiedRoleName, {
            color: COULEURS.SUCCES,
            permissions: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
        });
        const roleNonVerifie = await obtenirOuCreerRole(guild, VERIFICATION_CONFIG.unverifiedRoleName, {
            color: COULEURS.AVERTISSEMENT,
            permissions: []
        });
        
        // Créer le salon avec les bonnes permissions
        salon = await guild.channels.create({
            name: VERIFICATION_CONFIG.channelName,
            type: ChannelType.GuildText,
            topic: 'Bienvenue ! Cliquez sur le bouton ci-dessous pour accéder au serveur.',
            position: 0, // Placer en premier
            permissionOverwrites: [
                {
                    id: roleEveryone.id,
                    deny: [PermissionFlagsBits.ViewChannel]
                },
                {
                    id: roleNonVerifie.id,
                    allow: [PermissionFlagsBits.ViewChannel],
                    deny: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.AddReactions]
                },
                {
                    id: roleVerifie.id,
                    deny: [PermissionFlagsBits.ViewChannel]
                },
                {
                    id: guild.client.user.id,
                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.ManageMessages,
                        PermissionFlagsBits.ManageChannels,
                        PermissionFlagsBits.EmbedLinks
                    ]
                }
            ]
        });
        
        logger.succes('Salon de vérification créé avec succès');
        
        // Envoyer le message permanent de vérification
        await envoyerMessagePermanent(salon);
        
        return salon;
        
    } catch (erreur) {
        logger.erreur('Erreur lors de la création du salon de vérification', erreur);
        return null;
    }
}

/**
 * Obtient ou crée un rôle
 * @param {import('discord.js').Guild} guild 
 * @param {string} roleName 
 * @param {Object} options 
 * @returns {Promise<import('discord.js').Role>}
 */
async function obtenirOuCreerRole(guild, roleName, options = {}) {
    try {
        // Chercher le rôle existant
        let role = guild.roles.cache.find(r => r.name === roleName);
        
        if (role) {
            return role;
        }
        
        // Créer le rôle
        role = await guild.roles.create({
            name: roleName,
            ...options,
            reason: 'Rôle nécessaire pour le système de vérification'
        });
        
        logger.info(`Rôle "${roleName}" créé`);
        return role;
        
    } catch (erreur) {
        logger.erreur(`Erreur lors de la création du rôle "${roleName}"`, erreur);
        throw erreur;
    }
}

/**
 * Envoie le message permanent dans le salon de vérification
 * @param {import('discord.js').TextChannel} salon 
 */
async function envoyerMessagePermanent(salon) {
    try {
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.VERIFICATION} Système de Vérification`)
            .setDescription(
                `Bienvenue sur **${salon.guild.name}** !\n\n` +
                `Pour accéder au serveur, vous devez d'abord vous vérifier.\n` +
                `Cliquez sur le bouton ci-dessous pour confirmer que vous êtes un humain.\n\n` +
                `${EMOJIS.INFO} **Pourquoi cette vérification ?**\n` +
                `Ce système nous aide à protéger notre communauté contre les bots et le spam.`
            )
            .setColor(COULEURS.PRIMAIRE)
            .setFooter({ text: 'La vérification est rapide et ne prend que quelques secondes.' })
            .setTimestamp();
        
        const bouton = new ButtonBuilder()
            .setCustomId('verification_button')
            .setLabel('✅ Se vérifier')
            .setStyle(ButtonStyle.Success)
            .setEmoji('✅');
        
        const actionRow = new ActionRowBuilder().addComponents(bouton);
        
        await salon.send({
            embeds: [embed],
            components: [actionRow]
        });
        
        logger.info('Message permanent de vérification envoyé');
        
    } catch (erreur) {
        logger.erreur('Erreur lors de l\'envoi du message permanent', erreur);
    }
}

/**
 * Envoie un message de bienvenue personnalisé pour le nouveau membre
 * @param {import('discord.js').TextChannel} salon 
 * @param {import('discord.js').GuildMember} member 
 */
async function envoyerMessageVerification(salon, member) {
    try {
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.WAVE} Bienvenue ${member.user.username} !`)
            .setDescription(
                `Bonjour <@${member.id}> !\n\n` +
                `Pour accéder au serveur **${member.guild.name}**, ` +
                `veuillez cliquer sur le bouton de vérification ci-dessus.\n\n` +
                `${EMOJIS.HORLOGE} Cette étape ne prend que quelques secondes.`
            )
            .setColor(COULEURS.INFO)
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
            .setFooter({ text: 'Ce message sera supprimé automatiquement après vérification.' })
            .setTimestamp();
        
        const message = await salon.send({
            content: `<@${member.id}>`,
            embeds: [embed]
        });
        
        // Supprimer le message après 5 minutes si non vérifié
        setTimeout(async () => {
            try {
                await message.delete();
            } catch (err) {
                // Le message a peut-être déjà été supprimé
            }
        }, 300000); // 5 minutes
        
    } catch (erreur) {
        logger.erreur('Erreur lors de l\'envoi du message de bienvenue', erreur);
    }
}
