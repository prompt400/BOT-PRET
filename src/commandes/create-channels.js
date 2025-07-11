// coding: utf-8
/**
 * Commande /create-channels
 * Crée tous les salons du serveur (admin only)
 */

import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { ChannelType, PermissionFlagsBits } from 'discord.js';
import { CHANNEL_CONFIGS, REQUIRED_ROLES } from '../modules/channels/channelConfigs.js';
import Logger from '../services/logger.js';
import { COULEURS } from '../constantes/theme.js';

const logger = new Logger('CreateChannels');

export default {
    data: new SlashCommandBuilder()
        .setName('create-channels')
        .setDescription('Crée tous les salons du serveur (admin only)'),

    async execute(interaction) {
        // Vérifier les permissions admin
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({
                content: '❌ Vous devez être administrateur pour utiliser cette commande.',
                ephemeral: true
            });
        }

        await interaction.deferReply();

        const guild = interaction.guild;
        let createdChannels = 0;
        let createdCategories = 0;
        let createdRoles = 0;
        const report = [];

        try {
            // Étape 1: Créer les rôles nécessaires
            logger.info('Création des rôles nécessaires...');
            for (const roleName of REQUIRED_ROLES) {
                let role = guild.roles.cache.find(r => r.name === roleName);
                if (!role) {
                    const roleConfig = {
                        name: roleName,
                        reason: 'Rôle nécessaire pour le système de salons'
                    };

                    // Couleurs par défaut pour certains rôles
                    if (roleName === 'Soft') roleConfig.color = 0xFFB6C1;
                    if (roleName === 'Playful') roleConfig.color = 0xFF69B4;
                    if (roleName === 'Dominant') roleConfig.color = 0x8B0000;
                    if (roleName === 'VIP') roleConfig.color = 0xFFD700;
                    if (roleName === 'Membre Premium') roleConfig.color = 0xFFA500;
                    if (roleName === 'Admin') roleConfig.color = 0xFF0000;
                    if (roleName === 'Modérateur') roleConfig.color = 0x00FF00;

                    role = await guild.roles.create(roleConfig);
                    createdRoles++;
                    logger.info(`✅ Rôle créé: ${roleName}`);
                }
            }

            // Étape 2: Créer les catégories et salons
            logger.info('Création des catégories et salons...');
            for (const categoryKey in CHANNEL_CONFIGS) {
                const categoryConfig = CHANNEL_CONFIGS[categoryKey];
                
                // Créer ou récupérer la catégorie
                let category = guild.channels.cache.find(
                    c => c.name === categoryConfig.name && c.type === ChannelType.GuildCategory
                );

                if (!category) {
                    category = await guild.channels.create({
                        name: categoryConfig.name,
                        type: ChannelType.GuildCategory
                    });
                    createdCategories++;
                    logger.info(`✅ Catégorie créée: ${categoryConfig.name}`);
                }

                // Créer les salons dans la catégorie
                for (const channelConfig of categoryConfig.channels) {
                    let channel = guild.channels.cache.find(
                        c => c.name === channelConfig.name && c.parentId === category.id
                    );

                    if (!channel) {
                        const channelOptions = {
                            name: channelConfig.name,
                            type: channelConfig.type,
                            parent: category,
                            topic: channelConfig.topic,
                            nsfw: channelConfig.nsfw || false,
                            permissionOverwrites: []
                        };

                        // Configurer les permissions
                        const everyoneRole = guild.roles.everyone;
                        
                        // Permissions par défaut: @everyone ne peut pas voir
                        channelOptions.permissionOverwrites.push({
                            id: everyoneRole.id,
                            deny: [PermissionFlagsBits.ViewChannel]
                        });

                        // Permissions spécifiques
                        if (channelConfig.permissions) {
                            // Permissions pour @everyone
                            if (channelConfig.permissions.everyone) {
                                const everyonePerms = channelConfig.permissions.everyone;
                                const allow = [];
                                const deny = [];

                                if (everyonePerms.view) allow.push(PermissionFlagsBits.ViewChannel);
                                else deny.push(PermissionFlagsBits.ViewChannel);
                                
                                if (everyonePerms.send === false) deny.push(PermissionFlagsBits.SendMessages);
                                else if (everyonePerms.send) allow.push(PermissionFlagsBits.SendMessages);

                                channelOptions.permissionOverwrites[0] = {
                                    id: everyoneRole.id,
                                    allow: allow,
                                    deny: deny
                                };
                            }

                            // Permissions pour les rôles vérifiés
                            if (channelConfig.permissions.verified) {
                                const verifiedRole = guild.roles.cache.find(r => r.name === 'Vérifié');
                                if (verifiedRole) {
                                    channelOptions.permissionOverwrites.push({
                                        id: verifiedRole.id,
                                        allow: [
                                            PermissionFlagsBits.ViewChannel,
                                            PermissionFlagsBits.SendMessages,
                                            PermissionFlagsBits.ReadMessageHistory
                                        ]
                                    });
                                }
                            }

                            // Permissions pour des rôles spécifiques
                            if (channelConfig.permissions.roles) {
                                for (const roleName of channelConfig.permissions.roles) {
                                    const role = guild.roles.cache.find(r => r.name === roleName);
                                    if (role) {
                                        channelOptions.permissionOverwrites.push({
                                            id: role.id,
                                            allow: [
                                                PermissionFlagsBits.ViewChannel,
                                                PermissionFlagsBits.SendMessages,
                                                PermissionFlagsBits.ReadMessageHistory
                                            ]
                                        });
                                    }
                                }
                            }

                            // Permissions admin
                            if (channelConfig.permissions.admin) {
                                const adminRole = guild.roles.cache.find(r => r.name === 'Admin');
                                if (adminRole) {
                                    channelOptions.permissionOverwrites.push({
                                        id: adminRole.id,
                                        allow: [
                                            PermissionFlagsBits.ViewChannel,
                                            PermissionFlagsBits.SendMessages,
                                            PermissionFlagsBits.ManageChannels,
                                            PermissionFlagsBits.ManageMessages
                                        ]
                                    });
                                }
                            }
                        }

                        channel = await guild.channels.create(channelOptions);
                        createdChannels++;
                        logger.info(`✅ Salon créé: ${channelConfig.name}`);
                        report.push(`✅ ${channelConfig.name} (${channelConfig.nsfw ? 'NSFW' : 'SFW'})`);
                    }
                }
            }

            // Créer l'embed de rapport
            const reportEmbed = new EmbedBuilder()
                .setTitle('📊 Rapport de création des salons')
                .setColor(COULEURS.SUCCES)
                .setTimestamp()
                .addFields(
                    { name: 'Rôles créés', value: `${createdRoles}`, inline: true },
                    { name: 'Catégories créées', value: `${createdCategories}`, inline: true },
                    { name: 'Salons créés', value: `${createdChannels}`, inline: true }
                );

            if (report.length > 0) {
                const channelList = report.slice(0, 20).join('\n');
                reportEmbed.addFields({
                    name: 'Salons créés',
                    value: channelList + (report.length > 20 ? `\n... et ${report.length - 20} autres` : '')
                });
            }

            // Compter le total
            let totalChannels = 0;
            for (const categoryKey in CHANNEL_CONFIGS) {
                totalChannels += CHANNEL_CONFIGS[categoryKey].channels.length;
            }

            reportEmbed.setDescription(
                `✅ Configuration terminée!\n\n` +
                `**Total prévu:** ${totalChannels} salons\n` +
                `**Total existant:** ${guild.channels.cache.filter(c => c.type === ChannelType.GuildText).size} salons texte`
            );

            await interaction.editReply({ embeds: [reportEmbed] });

        } catch (error) {
            logger.erreur('Erreur lors de la création des salons', error);
            
            const errorEmbed = new EmbedBuilder()
                .setTitle('❌ Erreur lors de la création')
                .setDescription(`Une erreur s'est produite: ${error.message}`)
                .setColor(COULEURS.ERREUR)
                .setTimestamp();

            await interaction.editReply({ embeds: [errorEmbed] });
        }
    }
};
