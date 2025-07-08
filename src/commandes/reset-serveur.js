// coding: utf-8
/**
 * Commande /reset-serveur
 * Réinitialise les paramètres du serveur (réservé aux administrateurs)
 */

import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ChannelType } from 'discord.js';
import { COULEURS } from '../constantes/theme.js';
import Logger from '../services/logger.js';

const logger = new Logger('ResetServeur');

export default {
    data: new SlashCommandBuilder()
        .setName('reset-serveur')
        .setDescription('Réinitialise les paramètres du serveur (Administrateurs uniquement)')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDMPermission(false),
    
    /**
     * Exécute la commande reset-serveur
     * @param {import('discord.js').CommandInteraction} interaction 
     */
    async execute(interaction) {
        // Vérification des permissions administrateur
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return await interaction.reply({
                content: '❌ Vous devez être administrateur pour utiliser cette commande.',
                ephemeral: true
            });
        }

        await interaction.deferReply({ ephemeral: true });
        
        try {
            logger.debutOperation(`Réinitialisation du serveur ${interaction.guild.name}`);
            
            const guild = interaction.guild;
            const stats = {
                rolesSupprimes: 0,
                categoriesSupprimees: 0,
                canauxTexteSupprimes: 0,
                canauxVocauxSupprimes: 0,
                canauxStageSupprimes: 0,
                canauxForumSupprimes: 0,
                erreurs: []
            };
            
            // Supprimer tous les rôles sauf @everyone
            logger.etape('Suppression des rôles...');
            const roles = await guild.roles.fetch();
            for (const [id, role] of roles) {
                if (role.name !== '@everyone' && role.editable) {
                    try {
                        await role.delete(`Réinitialisation du serveur par ${interaction.user.tag}`);
                        stats.rolesSupprimes++;
                        logger.debug(`Rôle supprimé: ${role.name}`);
                    } catch (erreur) {
                        logger.avertissement(`Impossible de supprimer le rôle ${role.name}: ${erreur.message}`);
                        stats.erreurs.push(`Rôle ${role.name}: ${erreur.message}`);
                    }
                }
            }
            
            // Supprimer toutes les catégories
            logger.etape('Suppression des catégories...');
            const categories = guild.channels.cache.filter(channel => channel.type === ChannelType.GuildCategory);
            for (const [id, category] of categories) {
                try {
                    await category.delete(`Réinitialisation du serveur par ${interaction.user.tag}`);
                    stats.categoriesSupprimees++;
                    logger.debug(`Catégorie supprimée: ${category.name}`);
                } catch (erreur) {
                    logger.avertissement(`Impossible de supprimer la catégorie ${category.name}: ${erreur.message}`);
                    stats.erreurs.push(`Catégorie ${category.name}: ${erreur.message}`);
                }
            }
            
            // Supprimer tous les canaux texte
            logger.etape('Suppression des canaux texte...');
            const textChannels = guild.channels.cache.filter(channel => channel.type === ChannelType.GuildText);
            for (const [id, channel] of textChannels) {
                try {
                    await channel.delete(`Réinitialisation du serveur par ${interaction.user.tag}`);
                    stats.canauxTexteSupprimes++;
                    logger.debug(`Canal texte supprimé: ${channel.name}`);
                } catch (erreur) {
                    logger.avertissement(`Impossible de supprimer le canal texte ${channel.name}: ${erreur.message}`);
                    stats.erreurs.push(`Canal texte ${channel.name}: ${erreur.message}`);
                }
            }
            
            // Supprimer tous les canaux vocaux
            logger.etape('Suppression des canaux vocaux...');
            const voiceChannels = guild.channels.cache.filter(channel => channel.type === ChannelType.GuildVoice);
            for (const [id, channel] of voiceChannels) {
                try {
                    await channel.delete(`Réinitialisation du serveur par ${interaction.user.tag}`);
                    stats.canauxVocauxSupprimes++;
                    logger.debug(`Canal vocal supprimé: ${channel.name}`);
                } catch (erreur) {
                    logger.avertissement(`Impossible de supprimer le canal vocal ${channel.name}: ${erreur.message}`);
                    stats.erreurs.push(`Canal vocal ${channel.name}: ${erreur.message}`);
                }
            }
            
            // Supprimer tous les canaux stage
            logger.etape('Suppression des canaux stage...');
            const stageChannels = guild.channels.cache.filter(channel => channel.type === ChannelType.GuildStageVoice);
            for (const [id, channel] of stageChannels) {
                try {
                    await channel.delete(`Réinitialisation du serveur par ${interaction.user.tag}`);
                    stats.canauxStageSupprimes++;
                    logger.debug(`Canal stage supprimé: ${channel.name}`);
                } catch (erreur) {
                    logger.avertissement(`Impossible de supprimer le canal stage ${channel.name}: ${erreur.message}`);
                    stats.erreurs.push(`Canal stage ${channel.name}: ${erreur.message}`);
                }
            }
            
            // Supprimer tous les canaux forum
            logger.etape('Suppression des canaux forum...');
            const forumChannels = guild.channels.cache.filter(channel => channel.type === ChannelType.GuildForum);
            for (const [id, channel] of forumChannels) {
                try {
                    await channel.delete(`Réinitialisation du serveur par ${interaction.user.tag}`);
                    stats.canauxForumSupprimes++;
                    logger.debug(`Canal forum supprimé: ${channel.name}`);
                } catch (erreur) {
                    logger.avertissement(`Impossible de supprimer le canal forum ${channel.name}: ${erreur.message}`);
                    stats.erreurs.push(`Canal forum ${channel.name}: ${erreur.message}`);
                }
            }
            
            // Préparation du résumé des actions
            const actionsEffectuees = [];
            if (stats.rolesSupprimes > 0) actionsEffectuees.push(`• ${stats.rolesSupprimes} rôle(s) supprimé(s)`);
            if (stats.categoriesSupprimees > 0) actionsEffectuees.push(`• ${stats.categoriesSupprimees} catégorie(s) supprimée(s)`);
            if (stats.canauxTexteSupprimes > 0) actionsEffectuees.push(`• ${stats.canauxTexteSupprimes} canal(aux) texte supprimé(s)`);
            if (stats.canauxVocauxSupprimes > 0) actionsEffectuees.push(`• ${stats.canauxVocauxSupprimes} canal(aux) vocal(aux) supprimé(s)`);
            if (stats.canauxStageSupprimes > 0) actionsEffectuees.push(`• ${stats.canauxStageSupprimes} canal(aux) stage supprimé(s)`);
            if (stats.canauxForumSupprimes > 0) actionsEffectuees.push(`• ${stats.canauxForumSupprimes} canal(aux) forum supprimé(s)`);
            
            // Construction de l'embed de confirmation
            const embed = new EmbedBuilder()
                .setTitle('🔄 Réinitialisation du serveur')
                .setColor(stats.erreurs.length > 0 ? COULEURS.AVERTISSEMENT : COULEURS.SUCCES)
                .setDescription(stats.erreurs.length > 0 
                    ? 'La réinitialisation s\'est terminée avec quelques avertissements.'
                    : 'La réinitialisation du serveur s\'est terminée avec succès.')
                .addFields(
                    {
                        name: '📋 Actions effectuées',
                        value: actionsEffectuees.length > 0 ? actionsEffectuees.join('\n') : '• Aucune action effectuée',
                        inline: false
                    },
                    {
                        name: '👤 Exécuté par',
                        value: interaction.user.tag,
                        inline: true
                    },
                    {
                        name: '🏢 Serveur',
                        value: interaction.guild.name,
                        inline: true
                    }
                );
            
            // Ajouter les erreurs si présentes
            if (stats.erreurs.length > 0) {
                const erreursTexte = stats.erreurs.slice(0, 5).join('\n'); // Limite à 5 erreurs pour éviter un embed trop long
                const erreursSupplementaires = stats.erreurs.length > 5 ? `\n... et ${stats.erreurs.length - 5} autre(s) erreur(s)` : '';
                embed.addFields({
                    name: '⚠️ Avertissements',
                    value: `${erreursTexte}${erreursSupplementaires}`,
                    inline: false
                });
            }
            
            embed.setTimestamp()
                .setFooter({ 
                    text: 'Bot Discord Professionnel',
                    iconURL: interaction.client.user.displayAvatarURL()
                });
            
            await interaction.editReply({ embeds: [embed] });
            
            // Log final de l'opération
            logger.finOperation(`Réinitialisation du serveur ${interaction.guild.name}`, stats.erreurs.length === 0);
            logger.info(`Statistiques: ${stats.rolesSupprimes} rôles, ${stats.categoriesSupprimees} catégories, ${stats.canauxTexteSupprimes} canaux texte, ${stats.canauxVocauxSupprimes} canaux vocaux, ${stats.canauxStageSupprimes} canaux stage, ${stats.canauxForumSupprimes} canaux forum supprimés`);
            if (stats.erreurs.length > 0) {
                logger.avertissement(`${stats.erreurs.length} erreur(s) rencontrée(s) lors de la réinitialisation`);
            }
            
        } catch (erreur) {
            logger.erreur('Erreur dans la commande reset-serveur', erreur);
            logger.finOperation(`Réinitialisation du serveur ${interaction.guild.name}`, false);
            
            await interaction.editReply({
                content: '❌ Une erreur est survenue lors de la réinitialisation du serveur.',
                ephemeral: true
            });
        }
    }
};
