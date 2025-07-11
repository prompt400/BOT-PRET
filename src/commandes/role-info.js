// coding: utf-8
/**
 * Commande /role-info
 * Affiche les informations sur un rôle et ses salons associés
 */

import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { CHANNEL_CONFIGS } from '../modules/channels/channelConfigs.js';
import { COULEURS } from '../constantes/theme.js';

export default {
    data: new SlashCommandBuilder()
        .setName('role-info')
        .setDescription('Affiche les informations sur un rôle et ses salons')
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('Le rôle dont vous voulez voir les informations')
                .setRequired(true)
        ),

    async execute(interaction) {
        const role = interaction.options.getRole('role');
        const guild = interaction.guild;

        // Trouver tous les salons accessibles à ce rôle
        const accessibleChannels = [];
        const exclusiveChannels = [];

        // Parcourir toutes les catégories et salons
        for (const categoryKey in CHANNEL_CONFIGS) {
            const category = CHANNEL_CONFIGS[categoryKey];
            
            for (const channelConfig of category.channels) {
                // Vérifier si le salon existe sur le serveur
                const channel = guild.channels.cache.find(c => c.name === channelConfig.name);
                if (!channel) continue;

                // Vérifier les permissions
                if (channelConfig.permissions) {
                    // Salon exclusif au rôle
                    if (channelConfig.permissions.roles && 
                        channelConfig.permissions.roles.length === 1 &&
                        channelConfig.permissions.roles.includes(role.name)) {
                        exclusiveChannels.push(channel);
                    }
                    // Salon accessible au rôle
                    else if (channelConfig.permissions.roles && 
                             channelConfig.permissions.roles.includes(role.name)) {
                        accessibleChannels.push(channel);
                    }
                    // Vérifier si c'est un rôle vérifié
                    else if (role.name === 'Vérifié' && channelConfig.permissions.verified) {
                        accessibleChannels.push(channel);
                    }
                }
            }
        }

        // Créer l'embed
        const embed = new EmbedBuilder()
            .setTitle(`📋 Informations sur le rôle: ${role.name}`)
            .setColor(role.color || COULEURS.PRIMAIRE)
            .setTimestamp()
            .addFields(
                { name: '🎨 Couleur', value: `#${role.color.toString(16).padStart(6, '0')}`, inline: true },
                { name: '👥 Membres', value: `${role.members.size}`, inline: true },
                { name: '📊 Position', value: `${role.position}`, inline: true },
                { name: '📅 Créé le', value: `<t:${Math.floor(role.createdTimestamp / 1000)}:F>`, inline: false }
            );

        // Ajouter les salons exclusifs
        if (exclusiveChannels.length > 0) {
            embed.addFields({
                name: `🔐 Salons exclusifs (${exclusiveChannels.length})`,
                value: exclusiveChannels.map(c => `<#${c.id}>`).join('\n'),
                inline: false
            });
        }

        // Ajouter les salons accessibles
        if (accessibleChannels.length > 0) {
            const channelList = accessibleChannels.slice(0, 10).map(c => `<#${c.id}>`).join('\n');
            embed.addFields({
                name: `🚪 Salons accessibles (${accessibleChannels.length})`,
                value: channelList + (accessibleChannels.length > 10 ? `\n... et ${accessibleChannels.length - 10} autres` : ''),
                inline: false
            });
        }

        // Ajouter les permissions du rôle
        const permissions = role.permissions.toArray();
        if (permissions.length > 0) {
            const permList = permissions.slice(0, 5).map(p => `• ${p}`).join('\n');
            embed.addFields({
                name: `⚙️ Permissions principales`,
                value: permList + (permissions.length > 5 ? `\n... et ${permissions.length - 5} autres` : ''),
                inline: false
            });
        }

        // Description spéciale pour certains rôles
        const roleDescriptions = {
            'Soft': '🌸 Personnalité douce et romantique',
            'Playful': '😏 Personnalité taquine et joueuse',
            'Dominant': '👑 Personnalité dominante et autoritaire',
            'VIP': '💎 Membre VIP avec accès exclusifs',
            'Membre Premium': '🥂 Accès premium au serveur',
            'Vérifié': '✅ Membre vérifié du serveur',
            'Nouveau Libertin': '🎭 Nouveau membre fraîchement arrivé',
            'Légende Infinie': '♾️ Le rang ultime du serveur'
        };

        if (roleDescriptions[role.name]) {
            embed.setDescription(roleDescriptions[role.name]);
        }

        await interaction.reply({ embeds: [embed] });
    }
};
