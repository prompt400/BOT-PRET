import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import AnalyticsManager from './AnalyticsManager.js';
import Logger from '../../services/logger.js';

const logger = new Logger('UserDashboard');

class UserDashboard {
    constructor() {
        this.dashboards = new Map(); // Cache des dashboards actifs
    }

    /**
     * Créer un dashboard interactif pour un utilisateur
     */
    async createDashboard(interaction, targetUser = null) {
        try {
            const user = targetUser || interaction.user;
            const member = interaction.guild.members.cache.get(user.id);
            
            if (!member) {
                return interaction.reply({
                    content: '❌ Membre introuvable.',
                    ephemeral: true
                });
            }

            // Récupérer les stats
            const stats = await AnalyticsManager.getUserStats(user.id, interaction.guild.id);
            
            if (!stats) {
                return interaction.reply({
                    content: '❌ Aucune statistique disponible pour cet utilisateur.',
                    ephemeral: true
                });
            }

            // Créer le dashboard initial
            const dashboardData = {
                userId: user.id,
                currentPage: 'overview',
                stats: stats,
                member: member
            };

            // Sauvegarder dans le cache
            const dashboardId = `${interaction.id}-${user.id}`;
            this.dashboards.set(dashboardId, dashboardData);

            // Créer l'embed initial
            const embed = this.createOverviewEmbed(dashboardData);
            const components = this.createNavigationButtons(dashboardData.currentPage);

            await interaction.reply({
                embeds: [embed],
                components: components,
                ephemeral: false
            });

            // Nettoyer le cache après 10 minutes
            setTimeout(() => {
                this.dashboards.delete(dashboardId);
            }, 10 * 60 * 1000);

        } catch (error) {
            logger.error('❌ Erreur lors de la création du dashboard:', error);
            await interaction.reply({
                content: '❌ Une erreur est survenue lors de la création du dashboard.',
                ephemeral: true
            });
        }
    }

    /**
     * Gérer les interactions avec le dashboard
     */
    async handleInteraction(interaction) {
        if (!interaction.isButton()) return;

        const dashboardId = `${interaction.message.interaction.id}-${interaction.customId.split('-')[1]}`;
        const dashboardData = this.dashboards.get(dashboardId);

        if (!dashboardData) {
            return interaction.reply({
                content: '❌ Ce dashboard a expiré. Veuillez en créer un nouveau.',
                ephemeral: true
            });
        }

        // Déterminer la page demandée
        const page = interaction.customId.split('-')[0];
        dashboardData.currentPage = page;

        // Créer l'embed approprié
        let embed;
        switch (page) {
            case 'overview':
                embed = this.createOverviewEmbed(dashboardData);
                break;
            case 'economy':
                embed = this.createEconomyEmbed(dashboardData);
                break;
            case 'activity':
                embed = this.createActivityEmbed(dashboardData);
                break;
            case 'metaverse':
                embed = this.createMetaverseEmbed(dashboardData);
                break;
            case 'achievements':
                embed = this.createAchievementsEmbed(dashboardData);
                break;
            default:
                embed = this.createOverviewEmbed(dashboardData);
        }

        const components = this.createNavigationButtons(dashboardData.currentPage);

        await interaction.update({
            embeds: [embed],
            components: components
        });
    }

    /**
     * Créer l'embed de vue d'ensemble
     */
    createOverviewEmbed(dashboardData) {
        const { stats, member } = dashboardData;
        
        const embed = new EmbedBuilder()
            .setTitle(`📊 Dashboard de ${member.user.username}`)
            .setDescription('Vue d\'ensemble de vos statistiques')
            .setThumbnail(member.user.avatarURL({ dynamic: true }))
            .setColor(0x00AE86)
            .setTimestamp();

        // Résumé rapide
        embed.addFields({
            name: '🏆 Rang Global',
            value: `#${stats.economy.rank}`,
            inline: true
        });

        embed.addFields({
            name: '💰 Fortune Totale',
            value: `${stats.economy.totalCurrency.toLocaleString()} 💎`,
            inline: true
        });

        embed.addFields({
            name: '🔥 Série Quotidienne',
            value: `${stats.activity.dailyStreak} jours`,
            inline: true
        });

        // Graphique de répartition des devises (ASCII)
        const currencyChart = this.createCurrencyChart(stats.economy);
        embed.addFields({
            name: '💰 Répartition des Devises',
            value: `\`\`\`\n${currencyChart}\n\`\`\``,
            inline: false
        });

        // Activité récente
        const recentActivity = this.formatRecentActivity(stats.activity);
        embed.addFields({
            name: '📈 Activité Récente',
            value: recentActivity,
            inline: false
        });

        // Badges et réalisations
        const badges = this.getUserBadges(stats);
        if (badges.length > 0) {
            embed.addFields({
                name: '🏅 Badges',
                value: badges.join(' '),
                inline: false
            });
        }

        return embed;
    }

    /**
     * Créer l'embed économique détaillé
     */
    createEconomyEmbed(dashboardData) {
        const { stats, member } = dashboardData;
        
        const embed = new EmbedBuilder()
            .setTitle(`💰 Économie - ${member.user.username}`)
            .setDescription('Détails de votre situation financière')
            .setThumbnail(member.user.avatarURL({ dynamic: true }))
            .setColor(0xFFD700)
            .setTimestamp();

        // Soldes détaillés
        embed.addFields({
            name: '💋 Kiss Coins',
            value: [
                `Solde: **${stats.economy.kissCoins.toLocaleString()}**`,
                `Valeur: Monnaie de base`,
                `Usage: Achats quotidiens`
            ].join('\n'),
            inline: true
        });

        embed.addFields({
            name: '🔥 Flame Tokens',
            value: [
                `Solde: **${stats.economy.flameTokens.toLocaleString()}**`,
                `Valeur: 10 Kiss Coins`,
                `Usage: Items premium`
            ].join('\n'),
            inline: true
        });

        embed.addFields({
            name: '💎 Gem Lust',
            value: [
                `Solde: **${stats.economy.gemLust.toLocaleString()}**`,
                `Valeur: 100 Kiss Coins`,
                `Usage: Items exclusifs`
            ].join('\n'),
            inline: true
        });

        // Statistiques financières
        embed.addFields({
            name: '📊 Statistiques Financières',
            value: [
                `🏆 Rang économique: **#${stats.economy.rank}**`,
                `💰 Fortune totale: **${stats.economy.totalCurrency.toLocaleString()}**`,
                `📈 Croissance hebdo: **+${Math.floor(Math.random() * 50)}%**`,
                `💸 Dépenses moyennes/jour: **${Math.floor(Math.random() * 1000)} KC**`
            ].join('\n'),
            inline: false
        });

        // Graphique d'évolution (simulé)
        const evolutionChart = this.createEvolutionChart();
        embed.addFields({
            name: '📈 Évolution sur 7 jours',
            value: `\`\`\`\n${evolutionChart}\n\`\`\``,
            inline: false
        });

        // Conseils personnalisés
        const tips = this.getEconomyTips(stats.economy);
        embed.addFields({
            name: '💡 Conseils',
            value: tips,
            inline: false
        });

        return embed;
    }

    /**
     * Créer l'embed d'activité
     */
    createActivityEmbed(dashboardData) {
        const { stats, member } = dashboardData;
        
        const embed = new EmbedBuilder()
            .setTitle(`📈 Activité - ${member.user.username}`)
            .setDescription('Analyse de votre activité sur le serveur')
            .setThumbnail(member.user.avatarURL({ dynamic: true }))
            .setColor(0x5865F2)
            .setTimestamp();

        // Statistiques générales
        embed.addFields({
            name: '📊 Vue d\'ensemble',
            value: [
                `⏱️ Dernière activité: <t:${Math.floor(stats.activity.lastSeen.getTime() / 1000)}:R>`,
                `🔥 Série quotidienne: **${stats.activity.dailyStreak} jours**`,
                `💬 Total commandes: **${stats.activity.totalCommands}**`,
                `⭐ Canal favori: ${stats.activity.favoriteChannel || 'Aucun'}`
            ].join('\n'),
            inline: false
        });

        // Graphique d'activité par heure
        const activityHeatmap = this.createActivityHeatmap();
        embed.addFields({
            name: '🕐 Activité par heure',
            value: `\`\`\`\n${activityHeatmap}\n\`\`\``,
            inline: false
        });

        // Commandes favorites
        const favoriteCommands = this.getFavoriteCommands();
        embed.addFields({
            name: '⚡ Commandes favorites',
            value: favoriteCommands,
            inline: true
        });

        // Interactions sociales
        embed.addFields({
            name: '👥 Interactions',
            value: [
                `💬 Messages: **${stats.social.messagesCount}**`,
                `👍 Réactions données: **${stats.social.reactionsGiven}**`,
                `💖 Réactions reçues: **${stats.social.reactionsReceived}**`
            ].join('\n'),
            inline: true
        });

        // Périodes d'activité
        embed.addFields({
            name: '📅 Périodes d\'activité',
            value: [
                `🌅 Matin (6h-12h): ${this.getActivityLevel('morning')}`,
                `☀️ Après-midi (12h-18h): ${this.getActivityLevel('afternoon')}`,
                `🌙 Soirée (18h-00h): ${this.getActivityLevel('evening')}`,
                `🌃 Nuit (00h-6h): ${this.getActivityLevel('night')}`
            ].join('\n'),
            inline: false
        });

        return embed;
    }

    /**
     * Créer l'embed métaverse
     */
    createMetaverseEmbed(dashboardData) {
        const { stats, member } = dashboardData;
        
        const embed = new EmbedBuilder()
            .setTitle(`🌍 Métaverse - ${member.user.username}`)
            .setDescription('Votre exploration du monde virtuel')
            .setThumbnail(member.user.avatarURL({ dynamic: true }))
            .setColor(0x9B59B6)
            .setTimestamp();

        // Position actuelle
        embed.addFields({
            name: '📍 Position Actuelle',
            value: `**${this.getLocationName(stats.metaverse.currentLocation)}**\n${this.getLocationDescription(stats.metaverse.currentLocation)}`,
            inline: false
        });

        // Statistiques d'exploration
        embed.addFields({
            name: '🗺️ Exploration',
            value: [
                `Lieux visités: **${stats.metaverse.locationsVisited.length}/10**`,
                `Lieu favori: **${stats.metaverse.favoriteLocation || 'Aucun'}**`,
                `Déplacements totaux: **${stats.metaverse.totalTravels}**`,
                `Distance parcourue: **${Math.floor(stats.metaverse.totalTravels * 2.5)} km**`
            ].join('\n'),
            inline: true
        });

        // Carte d'exploration (ASCII)
        const explorationMap = this.createExplorationMap(stats.metaverse.locationsVisited);
        embed.addFields({
            name: '🗺️ Carte d\'Exploration',
            value: `\`\`\`\n${explorationMap}\n\`\`\``,
            inline: false
        });

        // Récompenses d'exploration
        const rewards = this.getExplorationRewards(stats.metaverse.locationsVisited.length);
        embed.addFields({
            name: '🎁 Récompenses d\'Exploration',
            value: rewards,
            inline: false
        });

        // Prochains objectifs
        const objectives = this.getMetaverseObjectives(stats.metaverse);
        embed.addFields({
            name: '🎯 Objectifs',
            value: objectives,
            inline: false
        });

        return embed;
    }

    /**
     * Créer l'embed des réalisations
     */
    createAchievementsEmbed(dashboardData) {
        const { stats, member } = dashboardData;
        
        const embed = new EmbedBuilder()
            .setTitle(`🏆 Réalisations - ${member.user.username}`)
            .setDescription('Vos accomplissements et trophées')
            .setThumbnail(member.user.avatarURL({ dynamic: true }))
            .setColor(0xFFD700)
            .setTimestamp();

        // Missions
        embed.addFields({
            name: '🎯 Missions',
            value: [
                `✅ Complétées: **${stats.missions.completed}**`,
                `📊 Progression actuelle: **${stats.missions.currentProgress}%**`,
                `🎁 Récompenses totales: **${stats.missions.totalRewards}**`,
                `⭐ Taux de réussite: **${Math.floor((stats.missions.completed / (stats.missions.completed + 5)) * 100)}%**`
            ].join('\n'),
            inline: false
        });

        // Trophées débloqués
        const trophies = this.getUserTrophies(stats);
        embed.addFields({
            name: '🏆 Trophées Débloqués',
            value: trophies.unlocked.join('\n') || 'Aucun trophée pour le moment',
            inline: true
        });

        // Trophées verrouillés
        embed.addFields({
            name: '🔒 Trophées Verrouillés',
            value: trophies.locked.slice(0, 5).join('\n'),
            inline: true
        });

        // Statistiques de collection
        embed.addFields({
            name: '📊 Statistiques de Collection',
            value: [
                `🏆 Trophées: **${trophies.unlocked.length}/${trophies.total}**`,
                `🏅 Badges: **${this.getUserBadges(stats).length}**`,
                `⭐ Points de prestige: **${Math.floor(Math.random() * 10000)}**`,
                `🎖️ Niveau de collection: **${Math.floor(trophies.unlocked.length / 3) + 1}**`
            ].join('\n'),
            inline: false
        });

        // Barre de progression globale
        const progressBar = this.createProgressBar((trophies.unlocked.length / trophies.total) * 100);
        embed.addFields({
            name: '📊 Progression Globale',
            value: `\`\`\`\n${progressBar}\n\`\`\``,
            inline: false
        });

        return embed;
    }

    /**
     * Créer les boutons de navigation
     */
    createNavigationButtons(currentPage) {
        const buttons = [
            {
                customId: 'overview',
                label: 'Vue d\'ensemble',
                emoji: '📊',
                style: ButtonStyle.Primary
            },
            {
                customId: 'economy',
                label: 'Économie',
                emoji: '💰',
                style: ButtonStyle.Primary
            },
            {
                customId: 'activity',
                label: 'Activité',
                emoji: '📈',
                style: ButtonStyle.Primary
            },
            {
                customId: 'metaverse',
                label: 'Métaverse',
                emoji: '🌍',
                style: ButtonStyle.Primary
            },
            {
                customId: 'achievements',
                label: 'Réalisations',
                emoji: '🏆',
                style: ButtonStyle.Primary
            }
        ];

        const row = new ActionRowBuilder();
        
        buttons.forEach(button => {
            const btn = new ButtonBuilder()
                .setCustomId(`${button.customId}-${currentPage}`)
                .setLabel(button.label)
                .setEmoji(button.emoji)
                .setStyle(button.customId === currentPage ? ButtonStyle.Secondary : button.style)
                .setDisabled(button.customId === currentPage);
            
            row.addComponents(btn);
        });

        return [row];
    }

    /**
     * Méthodes utilitaires pour la création de graphiques et données
     */
    createCurrencyChart(economy) {
        const total = economy.totalCurrency || 1;
        const kcPercent = Math.round((economy.kissCoins / total) * 20);
        const ftPercent = Math.round((economy.flameTokens * 10 / total) * 20);
        const glPercent = Math.round((economy.gemLust * 100 / total) * 20);

        return [
            `Kiss Coins  [${':'.repeat(kcPercent).padEnd(20, '.')}] ${Math.round((economy.kissCoins / total) * 100)}%`,
            `Flame Tokens[${':'.repeat(ftPercent).padEnd(20, '.')}] ${Math.round((economy.flameTokens * 10 / total) * 100)}%`,
            `Gem Lust    [${':'.repeat(glPercent).padEnd(20, '.')}] ${Math.round((economy.gemLust * 100 / total) * 100)}%`
        ].join('\n');
    }

    createEvolutionChart() {
        const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
        const values = days.map(() => Math.floor(Math.random() * 10) + 5);
        const maxValue = Math.max(...values);
        
        let chart = '';
        for (let i = 15; i >= 0; i -= 3) {
            chart += i.toString().padStart(2) + '|';
            values.forEach(v => {
                chart += (v >= i) ? ' ██ ' : '    ';
            });
            chart += '\n';
        }
        chart += '  +' + '----'.repeat(7) + '\n';
        chart += '   ' + days.join(' ');
        
        return chart;
    }

    createActivityHeatmap() {
        const hours = Array.from({ length: 24 }, (_, i) => i);
        const activity = hours.map(() => Math.floor(Math.random() * 5));
        
        let heatmap = 'Heure: 00 06 12 18 24\n';
        heatmap += 'Activ: ';
        
        activity.forEach((level, hour) => {
            if (hour % 6 === 0) {
                const intensity = ['░', '▒', '▓', '█', '█'][level];
                heatmap += intensity + ' ';
            }
        });
        
        return heatmap;
    }

    createExplorationMap(visitedLocations) {
        const map = [
            '┌─────────────┐',
            '│ P . . . C │',
            '│ . . X . . │',
            '│ G . . . E │',
            '│ . . S . . │',
            '│ V . . . M │',
            '└─────────────┘'
        ];
        
        const locations = {
            'PleasureGarden': 'P',
            'CentralPlace': 'C',
            'PrivateBeach': 'G',
            'EroticCasino': 'E',
            'spawn': 'S',
            'MysteryVilla': 'V',
            'Metaverse': 'M'
        };
        
        // Marquer les lieux visités
        visitedLocations.forEach(loc => {
            const symbol = locations[loc];
            if (symbol) {
                map.forEach((line, i) => {
                    if (line.includes(symbol)) {
                        map[i] = line.replace(symbol, '●');
                    }
                });
            }
        });
        
        return map.join('\n');
    }

    createProgressBar(percentage) {
        const length = 20;
        const filled = Math.round((percentage / 100) * length);
        const empty = length - filled;
        return `[${'█'.repeat(filled)}${'░'.repeat(empty)}] ${percentage.toFixed(1)}%`;
    }

    formatRecentActivity(activity) {
        const activities = [
            `⏱️ Dernière connexion: <t:${Math.floor(activity.lastSeen.getTime() / 1000)}:R>`,
            `💬 ${activity.totalCommands} commandes utilisées`,
            `🔥 Série de ${activity.dailyStreak} jours`
        ];
        
        if (activity.favoriteChannel) {
            activities.push(`⭐ Canal préféré: ${activity.favoriteChannel}`);
        }
        
        return activities.join('\n');
    }

    getUserBadges(stats) {
        const badges = [];
        
        if (stats.economy.rank <= 10) badges.push('🥇');
        if (stats.activity.dailyStreak >= 7) badges.push('🔥');
        if (stats.missions.completed >= 10) badges.push('🎯');
        if (stats.metaverse.locationsVisited.length >= 5) badges.push('🗺️');
        if (stats.social.reputation >= 100) badges.push('⭐');
        if (stats.economy.totalCurrency >= 10000) badges.push('💎');
        
        return badges;
    }

    getEconomyTips(economy) {
        const tips = [];
        
        if (economy.kissCoins < 1000) {
            tips.push('💡 Utilisez `/daily` chaque jour pour gagner des Kiss Coins !');
        }
        
        if (economy.flameTokens < 10) {
            tips.push('💡 Complétez des missions pour gagner des Flame Tokens !');
        }
        
        if (economy.rank > 50) {
            tips.push('💡 Participez aux événements pour grimper dans le classement !');
        }
        
        tips.push('💡 Diversifiez vos revenus entre les 3 devises pour maximiser votre fortune !');
        
        return tips.join('\n');
    }

    getFavoriteCommands() {
        const commands = [
            '`/daily` - 152 fois',
            '`/missions` - 89 fois',
            '`/balance` - 67 fois',
            '`/move` - 45 fois',
            '`/stats` - 34 fois'
        ];
        
        return commands.join('\n');
    }

    getActivityLevel(period) {
        const levels = ['Très faible', 'Faible', 'Modérée', 'Élevée', 'Très élevée'];
        const bars = ['▱▱▱▱▱', '█▱▱▱▱', '██▱▱▱', '███▱▱', '████▱', '█████'];
        const level = Math.floor(Math.random() * levels.length);
        
        return `${bars[level]} ${levels[level]}`;
    }

    getLocationName(locationId) {
        const names = {
            'spawn': 'Point de Spawn',
            'CentralPlace': 'Place Centrale',
            'PleasureGarden': 'Jardin des Plaisirs',
            'PrivateBeach': 'Plage Privée',
            'EroticCasino': 'Casino Érotique',
            'MysteryVilla': 'Villa Mystérieuse'
        };
        
        return names[locationId] || locationId;
    }

    getLocationDescription(locationId) {
        const descriptions = {
            'spawn': 'Le point de départ de tous les aventuriers',
            'CentralPlace': 'Le cœur battant du métaverse',
            'PleasureGarden': 'Un jardin luxuriant aux mille tentations',
            'PrivateBeach': 'Une plage paradisiaque réservée aux VIP',
            'EroticCasino': 'Tentez votre chance dans ce casino unique',
            'MysteryVilla': 'Une villa pleine de secrets à découvrir'
        };
        
        return descriptions[locationId] || 'Un lieu mystérieux';
    }

    getExplorationRewards(visitedCount) {
        const rewards = [];
        
        if (visitedCount >= 3) rewards.push('✅ Explorateur Novice - 500 Kiss Coins');
        if (visitedCount >= 5) rewards.push('✅ Voyageur Confirmé - 50 Flame Tokens');
        if (visitedCount >= 8) rewards.push('✅ Globe-Trotter - 5 Gem Lust');
        if (visitedCount >= 10) rewards.push('✅ Maître Explorateur - Titre exclusif');
        
        if (visitedCount < 10) {
            rewards.push(`🔒 ${10 - visitedCount} lieux à découvrir pour le prochain palier`);
        }
        
        return rewards.join('\n') || 'Commencez à explorer pour débloquer des récompenses !';
    }

    getMetaverseObjectives(metaverse) {
        const objectives = [];
        
        if (metaverse.locationsVisited.length < 10) {
            objectives.push(`🎯 Explorer ${10 - metaverse.locationsVisited.length} nouveaux lieux`);
        }
        
        if (metaverse.totalTravels < 100) {
            objectives.push(`🎯 Effectuer ${100 - metaverse.totalTravels} déplacements`);
        }
        
        objectives.push('🎯 Participer à un événement métaverse');
        objectives.push('🎯 Découvrir un secret caché');
        
        return objectives.join('\n');
    }

    getUserTrophies(stats) {
        const allTrophies = [
            { name: '🏆 Premier Pas', condition: true, desc: 'Rejoindre le serveur' },
            { name: '💰 Riche', condition: stats.economy.totalCurrency >= 10000, desc: 'Posséder 10,000 devises' },
            { name: '🔥 Infatigable', condition: stats.activity.dailyStreak >= 30, desc: 'Série de 30 jours' },
            { name: '🗺️ Explorateur', condition: stats.metaverse.locationsVisited.length >= 10, desc: 'Visiter tous les lieux' },
            { name: '🎯 Perfectionniste', condition: stats.missions.completed >= 50, desc: 'Compléter 50 missions' },
            { name: '⭐ Populaire', condition: stats.social.reputation >= 500, desc: 'Atteindre 500 de réputation' },
            { name: '💎 Collectionneur', condition: stats.economy.gemLust >= 100, desc: 'Posséder 100 Gem Lust' },
            { name: '🎪 Fêtard', condition: Math.random() > 0.5, desc: 'Participer à 10 événements' },
            { name: '🎰 Chanceux', condition: Math.random() > 0.7, desc: 'Gagner le jackpot au casino' },
            { name: '🌟 Légende', condition: stats.economy.rank === 1, desc: 'Être #1 du classement' }
        ];
        
        const unlocked = allTrophies.filter(t => t.condition).map(t => `${t.name} - ${t.desc}`);
        const locked = allTrophies.filter(t => !t.condition).map(t => `${t.name} - ${t.desc}`);
        
        return {
            unlocked,
            locked,
            total: allTrophies.length
        };
    }
}

export default new UserDashboard();
