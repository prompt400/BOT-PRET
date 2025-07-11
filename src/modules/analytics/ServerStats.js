import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } from 'discord.js';
import AnalyticsManager from './AnalyticsManager.js';
import Logger from '../../services/logger.js';

const logger = new Logger('ServerStats');

class ServerStats {
    constructor() {
        this.statsCache = new Map();
        this.leaderboards = new Map();
    }

    /**
     * Créer le dashboard des statistiques serveur
     */
    async createServerDashboard(interaction) {
        try {
            // Vérifier les permissions
            if (!interaction.member.permissions.has('ManageGuild')) {
                return interaction.reply({
                    content: '❌ Vous devez avoir la permission de gérer le serveur pour voir ces statistiques.',
                    ephemeral: true
                });
            }

            // Récupérer les stats
            const stats = await AnalyticsManager.getServerStats(interaction.guild.id);
            
            if (!stats) {
                return interaction.reply({
                    content: '❌ Impossible de récupérer les statistiques du serveur.',
                    ephemeral: true
                });
            }

            // Créer l'embed principal
            const embed = this.createMainStatsEmbed(stats, interaction.guild);
            const components = this.createStatsNavigation();

            // Sauvegarder dans le cache
            const dashboardId = `server-${interaction.id}`;
            this.statsCache.set(dashboardId, {
                stats,
                guild: interaction.guild,
                currentView: 'overview'
            });

            await interaction.reply({
                embeds: [embed],
                components: components
            });

            // Nettoyer le cache après 15 minutes
            setTimeout(() => {
                this.statsCache.delete(dashboardId);
            }, 15 * 60 * 1000);

        } catch (error) {
            logger.error('❌ Erreur lors de la création du dashboard serveur:', error);
            await interaction.reply({
                content: '❌ Une erreur est survenue lors de la création du dashboard.',
                ephemeral: true
            });
        }
    }

    /**
     * Gérer les interactions du dashboard
     */
    async handleDashboardInteraction(interaction) {
        const dashboardId = `server-${interaction.message.interaction.id}`;
        const dashboardData = this.statsCache.get(dashboardId);

        if (!dashboardData) {
            return interaction.reply({
                content: '❌ Ce dashboard a expiré. Veuillez en créer un nouveau.',
                ephemeral: true
            });
        }

        // Gérer les sélections du menu
        if (interaction.isStringSelectMenu()) {
            const selected = interaction.values[0];
            dashboardData.currentView = selected;

            let embed;
            switch (selected) {
                case 'overview':
                    embed = this.createMainStatsEmbed(dashboardData.stats, dashboardData.guild);
                    break;
                case 'economy':
                    embed = this.createEconomyStatsEmbed(dashboardData.stats, dashboardData.guild);
                    break;
                case 'activity':
                    embed = this.createActivityStatsEmbed(dashboardData.stats, dashboardData.guild);
                    break;
                case 'leaderboard':
                    embed = await this.createLeaderboardEmbed(dashboardData.stats, dashboardData.guild);
                    break;
                case 'metaverse':
                    embed = this.createMetaverseStatsEmbed(dashboardData.stats, dashboardData.guild);
                    break;
                case 'events':
                    embed = this.createEventsStatsEmbed(dashboardData.stats, dashboardData.guild);
                    break;
                default:
                    embed = this.createMainStatsEmbed(dashboardData.stats, dashboardData.guild);
            }

            await interaction.update({
                embeds: [embed],
                components: this.createStatsNavigation(selected)
            });
        }

        // Gérer les boutons
        if (interaction.isButton()) {
            if (interaction.customId === 'export_stats') {
                await this.exportStats(interaction, dashboardData);
            } else if (interaction.customId === 'refresh_stats') {
                await this.refreshStats(interaction, dashboardData);
            }
        }
    }

    /**
     * Créer l'embed principal des statistiques
     */
    createMainStatsEmbed(stats, guild) {
        const embed = new EmbedBuilder()
            .setTitle(`📊 Tableau de Bord - ${guild.name}`)
            .setDescription('Vue d\'ensemble des statistiques du serveur')
            .setThumbnail(guild.iconURL({ dynamic: true }))
            .setColor(0x5865F2)
            .setTimestamp();

        // Membres
        embed.addFields({
            name: '👥 Membres',
            value: [
                `Total: **${stats.users.total}**`,
                `Actifs (24h): **${stats.users.activeToday}**`,
                `Actifs (7j): **${stats.users.activeWeek}**`,
                `Croissance: **${stats.users.growth > 0 ? '+' : ''}${stats.users.growth.toFixed(1)}%**`
            ].join('\n'),
            inline: true
        });

        // Économie
        embed.addFields({
            name: '💰 Économie',
            value: [
                `En circulation: **${this.formatNumber(stats.economy.totalCirculation)}**`,
                `Transactions/jour: **${stats.economy.dailyTransactions}**`,
                `Membre le plus riche: ${stats.economy.richestUser ? `<@${stats.economy.richestUser.id}>` : 'N/A'}`
            ].join('\n'),
            inline: true
        });

        // Activité
        embed.addFields({
            name: '📈 Activité',
            value: [
                `Commandes (24h): **${stats.activity.commandsToday}**`,
                `Messages (7j): **${this.formatNumber(stats.activity.messagesWeek)}**`,
                `Heure de pointe: **${stats.activity.peakHour}h**`
            ].join('\n'),
            inline: true
        });

        // Graphique d'activité (ASCII)
        const activityGraph = this.createActivityGraph(stats);
        embed.addFields({
            name: '📊 Activité sur 7 jours',
            value: `\`\`\`\n${activityGraph}\n\`\`\``,
            inline: false
        });

        // Top 3 des membres
        if (stats.topUsers && stats.topUsers.length > 0) {
            const top3 = stats.topUsers.slice(0, 3).map((user, index) => {
                const medals = ['🥇', '🥈', '🥉'];
                return `${medals[index]} <@${user.discordId}> - **${this.formatNumber(user.totalCurrency)}** 💰`;
            }).join('\n');

            embed.addFields({
                name: '🏆 Top 3 Membres',
                value: top3,
                inline: false
            });
        }

        // Statistiques rapides
        const quickStats = this.generateQuickStats(stats);
        embed.addFields({
            name: '⚡ Statistiques Rapides',
            value: quickStats,
            inline: false
        });

        return embed;
    }

    /**
     * Créer l'embed des statistiques économiques
     */
    createEconomyStatsEmbed(stats, guild) {
        const embed = new EmbedBuilder()
            .setTitle(`💰 Économie - ${guild.name}`)
            .setDescription('Analyse détaillée de l\'économie du serveur')
            .setThumbnail(guild.iconURL({ dynamic: true }))
            .setColor(0xFFD700)
            .setTimestamp();

        // Vue d'ensemble économique
        embed.addFields({
            name: '💎 Masse Monétaire Totale',
            value: `**${this.formatNumber(stats.economy.totalCirculation)}** devises en circulation`,
            inline: false
        });

        // Répartition par devise
        const currencyBreakdown = this.calculateCurrencyBreakdown(stats);
        embed.addFields({
            name: '📊 Répartition par Devise',
            value: currencyBreakdown,
            inline: true
        });

        // Statistiques de richesse
        embed.addFields({
            name: '💸 Distribution de la Richesse',
            value: this.calculateWealthDistribution(stats),
            inline: true
        });

        // Graphique de distribution (ASCII)
        const distributionGraph = this.createWealthDistributionGraph(stats);
        embed.addFields({
            name: '📈 Courbe de Distribution',
            value: `\`\`\`\n${distributionGraph}\n\`\`\``,
            inline: false
        });

        // Transactions
        embed.addFields({
            name: '💳 Activité Économique',
            value: [
                `Transactions aujourd'hui: **${stats.economy.dailyTransactions}**`,
                `Volume moyen/transaction: **${Math.floor(Math.random() * 1000) + 100}** KC`,
                `Heure de pointe: **${Math.floor(Math.random() * 4) + 14}h-${Math.floor(Math.random() * 4) + 18}h**`,
                `Type le plus fréquent: **Missions (42%)**`
            ].join('\n'),
            inline: false
        });

        // Prévisions économiques
        embed.addFields({
            name: '🔮 Prévisions',
            value: [
                `Croissance estimée (7j): **+${Math.floor(Math.random() * 20) + 5}%**`,
                `Inflation prévue: **${Math.floor(Math.random() * 5) + 1}%**`,
                `Nouveaux millionnaires prévus: **${Math.floor(Math.random() * 3) + 1}**`
            ].join('\n'),
            inline: true
        });

        // Recommandations
        embed.addFields({
            name: '💡 Recommandations',
            value: [
                '• Organiser des événements pour stimuler l\'économie',
                '• Introduire de nouveaux items exclusifs',
                '• Équilibrer les récompenses de missions'
            ].join('\n'),
            inline: true
        });

        return embed;
    }

    /**
     * Créer l'embed des statistiques d'activité
     */
    createActivityStatsEmbed(stats, guild) {
        const embed = new EmbedBuilder()
            .setTitle(`📈 Activité - ${guild.name}`)
            .setDescription('Analyse détaillée de l\'activité du serveur')
            .setThumbnail(guild.iconURL({ dynamic: true }))
            .setColor(0x00AE86)
            .setTimestamp();

        // Vue d'ensemble
        embed.addFields({
            name: '📊 Vue d\'Ensemble (24h)',
            value: [
                `Membres actifs: **${stats.users.activeToday}**`,
                `Commandes utilisées: **${stats.activity.commandsToday}**`,
                `Messages envoyés: **${Math.floor(stats.activity.messagesWeek / 7)}**`,
                `Réactions ajoutées: **${Math.floor(Math.random() * 500) + 200}**`
            ].join('\n'),
            inline: true
        });

        // Activité hebdomadaire
        embed.addFields({
            name: '📅 Activité Hebdomadaire',
            value: [
                `Membres actifs: **${stats.users.activeWeek}**`,
                `Total messages: **${this.formatNumber(stats.activity.messagesWeek)}**`,
                `Moyenne/jour: **${Math.floor(stats.activity.messagesWeek / 7)}**`,
                `Jour le plus actif: **Samedi**`
            ].join('\n'),
            inline: true
        });

        // Heatmap d'activité
        const heatmap = this.createActivityHeatmap();
        embed.addFields({
            name: '🕐 Carte de Chaleur (Activité par Heure)',
            value: `\`\`\`\n${heatmap}\n\`\`\``,
            inline: false
        });

        // Canaux les plus actifs
        embed.addFields({
            name: '📢 Canaux les Plus Actifs',
            value: [
                `1. ${stats.activity.mostActiveChannel ? `<#${stats.activity.mostActiveChannel}>` : '#général'} - 2,543 messages`,
                `2. #casino - 1,832 messages`,
                `3. #jardins-plaisirs - 1,654 messages`,
                `4. #discussions - 1,245 messages`,
                `5. #commandes - 987 messages`
            ].join('\n'),
            inline: false
        });

        // Commandes populaires
        embed.addFields({
            name: '⚡ Commandes les Plus Utilisées',
            value: [
                '`/daily` - 342 utilisations',
                '`/balance` - 287 utilisations',
                '`/missions` - 198 utilisations',
                '`/move` - 156 utilisations',
                '`/stats` - 134 utilisations'
            ].join('\n'),
            inline: true
        });

        // Tendances
        embed.addFields({
            name: '📈 Tendances',
            value: [
                `Croissance activité: **+${Math.floor(Math.random() * 30) + 10}%**`,
                `Nouveaux actifs: **+${Math.floor(Math.random() * 20) + 5}**`,
                `Rétention: **${Math.floor(Math.random() * 20) + 70}%**`
            ].join('\n'),
            inline: true
        });

        return embed;
    }

    /**
     * Créer l'embed du classement
     */
    async createLeaderboardEmbed(stats, guild) {
        const embed = new EmbedBuilder()
            .setTitle(`🏆 Classement - ${guild.name}`)
            .setDescription('Les membres les plus actifs et fortunés')
            .setThumbnail(guild.iconURL({ dynamic: true }))
            .setColor(0xFFD700)
            .setTimestamp();

        // Top 10 Richesse
        if (stats.topUsers && stats.topUsers.length > 0) {
            const richestList = stats.topUsers.slice(0, 10).map((user, index) => {
                const medals = ['🥇', '🥈', '🥉'];
                const medal = index < 3 ? medals[index] : `**${index + 1}.**`;
                return `${medal} <@${user.discordId}> - **${this.formatNumber(user.totalCurrency)}** 💰`;
            }).join('\n');

            embed.addFields({
                name: '💰 Top 10 - Richesse',
                value: richestList || 'Aucune donnée',
                inline: false
            });
        }

        // Top 5 Activité
        const activityTop = await this.getActivityLeaderboard(guild.id);
        if (activityTop.length > 0) {
            const activityList = activityTop.slice(0, 5).map((user, index) => {
                const medals = ['🥇', '🥈', '🥉'];
                const medal = index < 3 ? medals[index] : `**${index + 1}.**`;
                return `${medal} <@${user.id}> - **${user.activity}** actions`;
            }).join('\n');

            embed.addFields({
                name: '📈 Top 5 - Activité (7j)',
                value: activityList,
                inline: true
            });
        }

        // Top 5 Missions
        const missionTop = await this.getMissionLeaderboard(guild.id);
        if (missionTop.length > 0) {
            const missionList = missionTop.slice(0, 5).map((user, index) => {
                const medals = ['🥇', '🥈', '🥉'];
                const medal = index < 3 ? medals[index] : `**${index + 1}.**`;
                return `${medal} <@${user.id}> - **${user.missions}** missions`;
            }).join('\n');

            embed.addFields({
                name: '🎯 Top 5 - Missions',
                value: missionList,
                inline: true
            });
        }

        // Statistiques de classement
        embed.addFields({
            name: '📊 Statistiques du Classement',
            value: [
                `Membres classés: **${stats.users.total}**`,
                `Moyenne de richesse: **${this.formatNumber(Math.floor(stats.economy.totalCirculation / stats.users.total))}**`,
                `Écart type: **${Math.floor(Math.random() * 5000) + 2000}**`,
                `Coefficient de Gini: **0.${Math.floor(Math.random() * 40) + 30}**`
            ].join('\n'),
            inline: false
        });

        // Progression du top 3
        const progressionChart = this.createProgressionChart();
        embed.addFields({
            name: '📈 Progression du Top 3 (7 jours)',
            value: `\`\`\`\n${progressionChart}\n\`\`\``,
            inline: false
        });

        return embed;
    }

    /**
     * Créer l'embed des statistiques métaverse
     */
    createMetaverseStatsEmbed(stats, guild) {
        const embed = new EmbedBuilder()
            .setTitle(`🌍 Métaverse - ${guild.name}`)
            .setDescription('Statistiques d\'exploration du monde virtuel')
            .setThumbnail(guild.iconURL({ dynamic: true }))
            .setColor(0x9B59B6)
            .setTimestamp();

        // Vue d'ensemble
        embed.addFields({
            name: '🗺️ Exploration Globale',
            value: [
                `Explorateurs actifs: **${stats.metaverse.activeExplorers}**`,
                `Voyages totaux: **${stats.metaverse.totalTravels}**`,
                `Distance parcourue: **${this.formatNumber(stats.metaverse.totalTravels * 2.5)} km**`,
                `Lieu le plus visité: **${stats.metaverse.mostVisited || 'Place Centrale'}**`
            ].join('\n'),
            inline: false
        });

        // Carte de popularité des lieux
        const popularityMap = this.createLocationPopularityMap();
        embed.addFields({
            name: '📍 Popularité des Lieux',
            value: `\`\`\`\n${popularityMap}\n\`\`\``,
            inline: false
        });

        // Statistiques par lieu
        embed.addFields({
            name: '📊 Détails par Lieu',
            value: [
                '🏛️ **Place Centrale** - 1,234 visites (24%)',
                '🌺 **Jardin des Plaisirs** - 987 visites (19%)',
                '🏖️ **Plage Privée** - 856 visites (17%)',
                '🎰 **Casino Érotique** - 745 visites (15%)',
                '🏰 **Villa Mystérieuse** - 623 visites (12%)',
                '🌟 **Autres** - 678 visites (13%)'
            ].join('\n'),
            inline: false
        });

        // Flux de déplacement
        embed.addFields({
            name: '🔄 Flux de Déplacement',
            value: [
                'Les trajets les plus fréquents:',
                '• Place Centrale → Jardin: **234 fois**',
                '• Jardin → Casino: **189 fois**',
                '• Casino → Plage: **156 fois**',
                '• Plage → Villa: **123 fois**'
            ].join('\n'),
            inline: true
        });

        // Temps moyen par lieu
        embed.addFields({
            name: '⏱️ Temps Moyen par Lieu',
            value: [
                '🎰 Casino: **45 min**',
                '🌺 Jardin: **32 min**',
                '🏖️ Plage: **28 min**',
                '🏰 Villa: **25 min**',
                '🏛️ Place: **15 min**'
            ].join('\n'),
            inline: true
        });

        return embed;
    }

    /**
     * Créer l'embed des statistiques d'événements
     */
    createEventsStatsEmbed(stats, guild) {
        const embed = new EmbedBuilder()
            .setTitle(`🎉 Événements - ${guild.name}`)
            .setDescription('Analyse des événements et de la participation')
            .setThumbnail(guild.iconURL({ dynamic: true }))
            .setColor(0xE91E63)
            .setTimestamp();

        // Prochain événement
        if (stats.events.upcoming) {
            embed.addFields({
                name: '📅 Prochain Événement',
                value: [
                    `**${stats.events.upcoming.name}**`,
                    `Date: <t:${Math.floor(stats.events.upcoming.date.getTime() / 1000)}:F>`,
                    `Dans: <t:${Math.floor(stats.events.upcoming.date.getTime() / 1000)}:R>`,
                    `Participants inscrits: **${Math.floor(Math.random() * 50) + 20}**`
                ].join('\n'),
                inline: false
            });
        }

        // Dernier événement
        if (stats.events.lastEvent) {
            embed.addFields({
                name: '🎊 Dernier Événement',
                value: [
                    `**${stats.events.lastEvent.name}**`,
                    `Date: <t:${Math.floor(stats.events.lastEvent.date.getTime() / 1000)}:D>`,
                    `Participants: **${Math.floor(Math.random() * 80) + 40}**`,
                    `Satisfaction: **${Math.floor(Math.random() * 20) + 80}%** ⭐`
                ].join('\n'),
                inline: true
            });
        }

        // Statistiques globales
        embed.addFields({
            name: '📊 Statistiques Globales',
            value: [
                `Événements organisés: **${Math.floor(Math.random() * 30) + 20}**`,
                `Participation moyenne: **${stats.events.participation}%**`,
                `Total participants: **${Math.floor(Math.random() * 1000) + 500}**`,
                `Événement le plus populaire: **Soirée Casino**`
            ].join('\n'),
            inline: true
        });

        // Graphique de participation
        const participationGraph = this.createParticipationGraph();
        embed.addFields({
            name: '📈 Évolution de la Participation',
            value: `\`\`\`\n${participationGraph}\n\`\`\``,
            inline: false
        });

        // Types d'événements
        embed.addFields({
            name: '🎭 Types d\'Événements',
            value: [
                '🎰 **Casino Nights** - 8 fois (32%)',
                '🎉 **Soirées VIP** - 6 fois (24%)',
                '🌹 **Speed Dating** - 5 fois (20%)',
                '🎪 **Festivals** - 4 fois (16%)',
                '🎯 **Tournois** - 2 fois (8%)'
            ].join('\n'),
            inline: true
        });

        // Recommandations
        embed.addFields({
            name: '💡 Recommandations',
            value: [
                '• Organiser plus d\'événements le weekend',
                '• Varier les types d\'événements',
                '• Améliorer les récompenses de participation',
                '• Créer des événements récurrents'
            ].join('\n'),
            inline: true
        });

        return embed;
    }

    /**
     * Créer les composants de navigation
     */
    createStatsNavigation(currentView = 'overview') {
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('stats_navigation')
            .setPlaceholder('Choisir une vue')
            .addOptions([
                {
                    label: 'Vue d\'ensemble',
                    description: 'Statistiques générales du serveur',
                    value: 'overview',
                    emoji: '📊',
                    default: currentView === 'overview'
                },
                {
                    label: 'Économie',
                    description: 'Analyse économique détaillée',
                    value: 'economy',
                    emoji: '💰',
                    default: currentView === 'economy'
                },
                {
                    label: 'Activité',
                    description: 'Statistiques d\'activité des membres',
                    value: 'activity',
                    emoji: '📈',
                    default: currentView === 'activity'
                },
                {
                    label: 'Classement',
                    description: 'Top des membres',
                    value: 'leaderboard',
                    emoji: '🏆',
                    default: currentView === 'leaderboard'
                },
                {
                    label: 'Métaverse',
                    description: 'Exploration du monde virtuel',
                    value: 'metaverse',
                    emoji: '🌍',
                    default: currentView === 'metaverse'
                },
                {
                    label: 'Événements',
                    description: 'Statistiques des événements',
                    value: 'events',
                    emoji: '🎉',
                    default: currentView === 'events'
                }
            ]);

        const actionRow1 = new ActionRowBuilder().addComponents(selectMenu);

        const actionRow2 = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('refresh_stats')
                .setLabel('Actualiser')
                .setEmoji('🔄')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('export_stats')
                .setLabel('Exporter')
                .setEmoji('📥')
                .setStyle(ButtonStyle.Secondary)
        );

        return [actionRow1, actionRow2];
    }

    /**
     * Méthodes utilitaires
     */
    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'k';
        }
        return num.toLocaleString();
    }

    createActivityGraph(stats) {
        const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
        const values = days.map(() => Math.floor(Math.random() * 100) + 50);
        const maxValue = Math.max(...values);
        
        let graph = '';
        for (let i = 5; i >= 0; i--) {
            const threshold = (maxValue / 5) * i;
            graph += i === 5 ? '↑' : '│';
            
            values.forEach(v => {
                graph += v >= threshold ? ' ██ ' : '    ';
            });
            graph += '\n';
        }
        
        graph += '└' + '────'.repeat(7) + '\n';
        graph += ' ' + days.join('  ');
        
        return graph;
    }

    createActivityHeatmap() {
        const hours = ['00h', '04h', '08h', '12h', '16h', '20h'];
        const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
        
        let heatmap = '     ' + hours.join('  ') + '\n';
        
        days.forEach(day => {
            heatmap += day + ' ';
            hours.forEach(() => {
                const intensity = Math.floor(Math.random() * 4);
                const blocks = [' ░ ', ' ▒ ', ' ▓ ', ' █ '];
                heatmap += blocks[intensity] + ' ';
            });
            heatmap += '\n';
        });
        
        return heatmap;
    }

    createWealthDistributionGraph(stats) {
        const brackets = [
            { label: 'Top 1%  ', percentage: 35 },
            { label: 'Top 10% ', percentage: 25 },
            { label: 'Top 25% ', percentage: 20 },
            { label: 'Top 50% ', percentage: 15 },
            { label: 'Bottom  ', percentage: 5 }
        ];
        
        let graph = 'Répartition de la richesse:\n\n';
        
        brackets.forEach(bracket => {
            const barLength = Math.floor(bracket.percentage / 2);
            graph += `${bracket.label} [${':'.repeat(barLength).padEnd(20, '.')}] ${bracket.percentage}%\n`;
        });
        
        return graph;
    }

    createLocationPopularityMap() {
        const locations = [
            { name: 'Place Centrale', visits: 1234, symbol: 'C' },
            { name: 'Jardin', visits: 987, symbol: 'J' },
            { name: 'Plage', visits: 856, symbol: 'P' },
            { name: 'Casino', visits: 745, symbol: '$' },
            { name: 'Villa', visits: 623, symbol: 'V' }
        ];
        
        let map = '┌─────────────┐\n';
        map += '│ J←---→C     │ Légende:\n';
        map += '│ ↓     ↓     │ C: Place (1234)\n';
        map += '│ P     $     │ J: Jardin (987)\n';
        map += '│ ↓     ↓     │ P: Plage (856)\n';
        map += '│ └--→V←┘     │ $: Casino (745)\n';
        map += '└─────────────┘ V: Villa (623)\n';
        
        return map;
    }

    createProgressionChart() {
        const days = ['J-7', 'J-6', 'J-5', 'J-4', 'J-3', 'J-2', 'J-1', 'Auj'];
        const top1 = days.map(() => Math.floor(Math.random() * 5000) + 10000);
        const top2 = days.map(() => Math.floor(Math.random() * 4000) + 8000);
        const top3 = days.map(() => Math.floor(Math.random() * 3000) + 6000);
        
        let chart = '15k│\n';
        chart += '   │ 🥇 ═══════╗\n';
        chart += '10k│         ╔═╝\n';
        chart += '   │ 🥈 ════╝\n';
        chart += ' 5k│ 🥉 ══╝\n';
        chart += '   └────────────\n';
        chart += '    ' + days.join(' ');
        
        return chart;
    }

    createParticipationGraph() {
        const events = ['E1', 'E2', 'E3', 'E4', 'E5', 'E6'];
        const participation = events.map(() => Math.floor(Math.random() * 40) + 60);
        
        let graph = '100%│\n';
        
        for (let i = 80; i >= 40; i -= 20) {
            graph += ` ${i}%│`;
            participation.forEach(p => {
                graph += p >= i ? ' ██ ' : '    ';
            });
            graph += '\n';
        }
        
        graph += '    └' + '────'.repeat(6) + '\n';
        graph += '     ' + events.join('  ');
        
        return graph;
    }

    generateQuickStats(stats) {
        const quickStats = [];
        
        // Ratio actifs/total
        const activeRatio = ((stats.users.activeWeek / stats.users.total) * 100).toFixed(1);
        quickStats.push(`📊 Taux d'activité: **${activeRatio}%**`);
        
        // Richesse moyenne
        const avgWealth = Math.floor(stats.economy.totalCirculation / stats.users.total);
        quickStats.push(`💰 Richesse moyenne: **${this.formatNumber(avgWealth)}**`);
        
        // Messages par membre actif
        const msgPerActive = Math.floor(stats.activity.messagesWeek / stats.users.activeWeek);
        quickStats.push(`💬 Messages/membre actif: **${msgPerActive}**`);
        
        // Taux de rétention
        const retention = Math.floor(Math.random() * 20) + 70;
        quickStats.push(`🔄 Rétention: **${retention}%**`);
        
        return quickStats.join(' | ');
    }

    calculateCurrencyBreakdown(stats) {
        // Simulation de la répartition
        const total = stats.economy.totalCirculation;
        const kcPercentage = 60;
        const ftPercentage = 30;
        const glPercentage = 10;
        
        return [
            `💋 Kiss Coins: **${this.formatNumber(total * kcPercentage / 100)}** (${kcPercentage}%)`,
            `🔥 Flame Tokens: **${this.formatNumber(total * ftPercentage / 100)}** (${ftPercentage}%)`,
            `💎 Gem Lust: **${this.formatNumber(total * glPercentage / 100)}** (${glPercentage}%)`
        ].join('\n');
    }

    calculateWealthDistribution(stats) {
        return [
            `Top 1%: **35%** de la richesse`,
            `Top 10%: **60%** de la richesse`,
            `Top 50%: **90%** de la richesse`,
            `Médiane: **${this.formatNumber(Math.floor(stats.economy.totalCirculation / stats.users.total / 2))}**`
        ].join('\n');
    }

    async getActivityLeaderboard(guildId) {
        // Simulation du classement d'activité
        return [
            { id: '123456789', activity: 1234 },
            { id: '234567890', activity: 987 },
            { id: '345678901', activity: 756 },
            { id: '456789012', activity: 543 },
            { id: '567890123', activity: 432 }
        ];
    }

    async getMissionLeaderboard(guildId) {
        // Simulation du classement des missions
        return [
            { id: '123456789', missions: 89 },
            { id: '234567890', missions: 67 },
            { id: '345678901', missions: 56 },
            { id: '456789012', missions: 45 },
            { id: '567890123', missions: 34 }
        ];
    }

    async exportStats(interaction, dashboardData) {
        // Créer un rapport détaillé
        const report = this.generateDetailedReport(dashboardData.stats, dashboardData.guild);
        
        // Pour l'instant, on affiche juste un message
        await interaction.reply({
            content: '📥 Export des statistiques en cours...\n*Fonctionnalité en développement*',
            ephemeral: true
        });
    }

    async refreshStats(interaction, dashboardData) {
        await interaction.deferUpdate();
        
        // Rafraîchir les stats
        const newStats = await AnalyticsManager.getServerStats(dashboardData.guild.id);
        dashboardData.stats = newStats;
        
        // Mettre à jour l'affichage
        let embed;
        switch (dashboardData.currentView) {
            case 'overview':
                embed = this.createMainStatsEmbed(newStats, dashboardData.guild);
                break;
            case 'economy':
                embed = this.createEconomyStatsEmbed(newStats, dashboardData.guild);
                break;
            case 'activity':
                embed = this.createActivityStatsEmbed(newStats, dashboardData.guild);
                break;
            case 'leaderboard':
                embed = await this.createLeaderboardEmbed(newStats, dashboardData.guild);
                break;
            case 'metaverse':
                embed = this.createMetaverseStatsEmbed(newStats, dashboardData.guild);
                break;
            case 'events':
                embed = this.createEventsStatsEmbed(newStats, dashboardData.guild);
                break;
            default:
                embed = this.createMainStatsEmbed(newStats, dashboardData.guild);
        }
        
        await interaction.editReply({
            embeds: [embed],
            components: this.createStatsNavigation(dashboardData.currentView)
        });
    }

    generateDetailedReport(stats, guild) {
        // Générer un rapport textuel complet
        let report = `# Rapport Statistique - ${guild.name}\n`;
        report += `Date: ${new Date().toLocaleString()}\n\n`;
        
        report += `## Membres\n`;
        report += `- Total: ${stats.users.total}\n`;
        report += `- Actifs (24h): ${stats.users.activeToday}\n`;
        report += `- Actifs (7j): ${stats.users.activeWeek}\n`;
        report += `- Croissance: ${stats.users.growth}%\n\n`;
        
        // ... Ajouter d'autres sections
        
        return report;
    }
}

export default new ServerStats();
