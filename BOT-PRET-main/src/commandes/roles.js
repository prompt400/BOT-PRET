import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import SystemeRolesNSFW from '../services/systemeRolesNSFW.js';

export default {
    data: new SlashCommandBuilder()
        .setName('roles')
        .setDescription('Gestion des rôles NSFW')
        .setNSFW(true)
        .addSubcommand(subcommand =>
            subcommand
                .setName('orientation')
                .setDescription('Choisir ou changer ton orientation sexuelle')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('fun')
                .setDescription('Voir et choisir des rôles fun')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('progression')
                .setDescription('Voir ta progression et tes badges')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('liste')
                .setDescription('Voir tous les rôles disponibles')
        ),

    async execute(interaction) {
        const systeme = new SystemeRolesNSFW(interaction.client);
        const subcommand = interaction.options.getSubcommand();

        switch (subcommand) {
            case 'orientation':
                const interfaceOrientation = systeme.creerInterfaceOrientation();
                await interaction.reply({ 
                    ...interfaceOrientation, 
                    ephemeral: true 
                });
                break;

            case 'fun':
                const interfaceFun = systeme.creerInterfaceFun();
                await interaction.reply({ 
                    ...interfaceFun, 
                    ephemeral: true 
                });
                break;

            case 'progression':
                await this.afficherProgression(interaction, systeme);
                break;

            case 'liste':
                await this.afficherListeRoles(interaction);
                break;
        }
    },

    async afficherProgression(interaction, systeme) {
        const userId = interaction.user.id;
        const progression = systeme.progressionUtilisateurs.get(userId) || { xp: 0, niveau: 1 };
        
        const embed = {
            title: '📊 Ta Progression',
            description: `**Niveau:** ${progression.niveau}\n**XP:** ${progression.xp}\n**Prochain niveau:** ${(progression.niveau * progression.niveau * 100)} XP`,
            color: 0xFF1493,
            fields: [
                {
                    name: '🏅 Badges',
                    value: 'Système de badges en développement...',
                    inline: false
                },
                {
                    name: '🎯 Défis complétés',
                    value: '0/50',
                    inline: true
                },
                {
                    name: '💬 Messages hot',
                    value: '0',
                    inline: true
                }
            ]
        };

        await interaction.reply({ embeds: [embed], ephemeral: true });
    },

    async afficherListeRoles(interaction) {
        const { ROLES_CONFIG } = await import('../config/rolesNSFW.js');
        
        const embed = {
            title: '📜 Liste des Rôles NSFW',
            description: 'Voici tous les rôles disponibles sur le serveur',
            color: 0xFF1493,
            fields: []
        };

        // Grouper par catégorie
        const categories = {
            'orientation': '🔥 Orientation',
            'fun_immediat': '😈 Fun Immédiat',
            'progression': '📈 Progression',
            'reputation': '⭐ Réputation',
            'statut': '🎨 Statut',
            'cles_unlock': '🔑 Déblocables',
            'badges': '🏅 Badges'
        };

        for (const [cat, titre] of Object.entries(categories)) {
            if (ROLES_CONFIG[cat]) {
                let valeur = '';
                for (const config of Object.values(ROLES_CONFIG[cat])) {
                    valeur += `${config.emoji} **${config.nom}**\n`;
                }
                if (valeur) {
                    embed.fields.push({
                        name: titre,
                        value: valeur.slice(0, 1024),
                        inline: true
                    });
                }
            }
        }

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
};
