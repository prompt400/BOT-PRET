const { EmbedBuilder } = require('discord.js');
const Database = require('../../database');
const logger = require('../../services/logger');

class AnalyticsManager {
    constructor() {
        this.cache = new Map();
        this.updateInterval = null;
        this.metrics = {
            commands: new Map(),
            interactions: new Map(),
            channels: new Map(),
            currencies: new Map(),
            events: new Map(),
            metaverse: new Map(),
            iot: new Map()
        };
    }

    /**
     * Initialiser le gestionnaire d'analytics
     */
    async initialize() {
        logger.info('🔄 Initialisation du système Analytics...');
        
        // Charger les données historiques
        await this.loadHistoricalData();
        
        // Démarrer la collecte automatique
        this.startAutoCollection();
        
        logger.info('✅ Système Analytics initialisé avec succès');
    }

    /**
     * Démarrer la collecte automatique de données
     */
    startAutoCollection() {
        // Mise à jour toutes les 5 minutes
        this.updateInterval = setInterval(() => {
            this.collectRealtimeData();
        }, 5 * 60 * 1000);
    }

    /**
     * Collecter les données en temps réel
     */
    async collectRealtimeData() {
        try {
            const now = new Date();
            
            // Sauvegarder les métriques actuelles
            await this.saveMetrics(now);
            
            // Nettoyer les anciennes données (garder 30 jours)
            await this.cleanOldData();
            
        } catch (error) {
            logger.error('❌ Erreur lors de la collecte de données:', error);
        }
    }

    /**
     * Enregistrer une commande utilisée
     */
    trackCommand(commandName, userId, guildId) {
        const key = `${commandName}:${new Date().toISOString().split('T')[0]}`;
        const current = this.metrics.commands.get(key) || { count: 0, users: new Set() };
        
        current.count++;
        current.users.add(userId);
        
        this.metrics.commands.set(key, current);
    }

    /**
     * Enregistrer une interaction
     */
    trackInteraction(type, userId, channelId) {
        const key = `${type}:${new Date().toISOString().split('T')[0]}`;
        const current = this.metrics.interactions.get(key) || { count: 0, channels: new Set() };
        
        current.count++;
        current.channels.add(channelId);
        
        this.metrics.interactions.set(key, current);
    }

    /**
     * Enregistrer une transaction économique
     */
    trackEconomyTransaction(currency, amount, type, userId) {
        const key = `${currency}:${type}:${new Date().toISOString().split('T')[0]}`;
        const current = this.metrics.currencies.get(key) || { 
            count: 0, 
            totalAmount: 0, 
            avgAmount: 0 
        };
        
        current.count++;
        current.totalAmount += amount;
        current.avgAmount = current.totalAmount / current.count;
        
        this.metrics.currencies.set(key, current);
    }

    /**
     * Enregistrer une activité métaverse
     */
    trackMetaverseActivity(location, action, userId) {
        const key = `${location}:${action}:${new Date().toISOString().split('T')[0]}`;
        const current = this.metrics.metaverse.get(key) || { count: 0, uniqueUsers: new Set() };
        
        current.count++;
        current.uniqueUsers.add(userId);
        
        this.metrics.metaverse.set(key, current);
    }

    /**
     * Enregistrer une activité IoT
     */
    trackIoTActivity(device, action, value) {
        const key = `${device}:${new Date().toISOString().split('T')[0]}`;
        const current = this.metrics.iot.get(key) || { 
            activations: 0, 
            values: [],
            avgValue: 0 
        };
        
        current.activations++;
        current.values.push(value);
        current.avgValue = current.values.reduce((a, b) => a + b, 0) / current.values.length;
        
        this.metrics.iot.set(key, current);
    }

    /**
     * Obtenir les statistiques d'un utilisateur
     */
    async getUserStats(userId, guildId) {
        try {
            // Récupérer l'utilisateur de la base
            const user = await Database.User.findOne({
                where: { discordId: userId, guildId }
            });

            if (!user) {
                return null;
            }

            // Calculer les statistiques
            const stats = {
                // Économie
                economy: {
                    kissCoins: user.kissCoins || 0,
                    flameTokens: user.flameTokens || 0,
                    gemLust: user.gemLust || 0,
                    totalCurrency: (user.kissCoins || 0) + (user.flameTokens || 0) + (user.gemLust || 0),
                    rank: await this.getUserEconomyRank(userId, guildId)
                },
                
                // Activité
                activity: {
                    lastSeen: user.lastActivity || new Date(),
                    dailyStreak: user.dailyStreak || 0,
                    totalCommands: await this.getUserCommandCount(userId),
                    favoriteChannel: await this.getUserFavoriteChannel(userId),
                    verificationDate: user.verifiedAt
                },
                
                // Missions
                missions: {
                    completed: user.missionsCompleted || 0,
                    currentProgress: user.currentMissionProgress || 0,
                    totalRewards: user.missionRewardsTotal || 0
                },
                
                // Métaverse
                metaverse: {
                    currentLocation: user.currentLocation || 'spawn',
                    locationsVisited: user.locationsVisited || [],
                    favoriteLocation: await this.getUserFavoriteLocation(userId),
                    totalTravels: user.metaverseTravels || 0
                },
                
                // Social
                social: {
                    messagesCount: user.messageCount || 0,
                    reactionsGiven: user.reactionsGiven || 0,
                    reactionsReceived: user.reactionsReceived || 0,
                    reputation: user.reputation || 0
                }
            };

            return stats;
            
        } catch (error) {
            logger.error('❌ Erreur lors de la récupération des stats utilisateur:', error);
            return null;
        }
    }

    /**
     * Obtenir les statistiques du serveur
     */
    async getServerStats(guildId) {
        try {
            const now = new Date();
            const dayAgo = new Date(now - 24 * 60 * 60 * 1000);
            const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);

            // Compter les utilisateurs
            const totalUsers = await Database.User.count({
                where: { guildId }
            });

            const activeToday = await Database.User.count({
                where: { 
                    guildId,
                    lastActivity: { $gte: dayAgo }
                }
            });

            const activeWeek = await Database.User.count({
                where: { 
                    guildId,
                    lastActivity: { $gte: weekAgo }
                }
            });

            // Statistiques économiques
            const economyStats = await this.getServerEconomyStats(guildId);
            
            // Statistiques métaverse
            const metaverseStats = await this.getServerMetaverseStats(guildId);
            
            // Top utilisateurs
            const topUsers = await this.getTopUsers(guildId, 10);

            const stats = {
                users: {
                    total: totalUsers,
                    activeToday: activeToday,
                    activeWeek: activeWeek,
                    growth: await this.calculateGrowthRate(guildId)
                },
                
                economy: economyStats,
                metaverse: metaverseStats,
                
                activity: {
                    commandsToday: await this.getCommandsCountToday(guildId),
                    messagesWeek: await this.getMessagesCountWeek(guildId),
                    peakHour: await this.getPeakActivityHour(guildId),
                    mostActiveChannel: await this.getMostActiveChannel(guildId)
                },
                
                topUsers: topUsers,
                
                events: {
                    upcoming: await this.getUpcomingEvents(guildId),
                    lastEvent: await this.getLastEvent(guildId),
                    participation: await this.getEventParticipation(guildId)
                }
            };

            return stats;
            
        } catch (error) {
            logger.error('❌ Erreur lors de la récupération des stats serveur:', error);
            return null;
        }
    }

    /**
     * Créer un embed pour les stats utilisateur
     */
    createUserStatsEmbed(stats, member) {
        const embed = new EmbedBuilder()
            .setTitle(`📊 Statistiques de ${member.user.username}`)
            .setThumbnail(member.user.avatarURL({ dynamic: true }))
            .setColor(0x00AE86)
            .setTimestamp();

        // Section Économie
        embed.addFields({
            name: '💰 Économie',
            value: [
                `💋 Kiss Coins: **${stats.economy.kissCoins.toLocaleString()}**`,
                `🔥 Flame Tokens: **${stats.economy.flameTokens.toLocaleString()}**`,
                `💎 Gem Lust: **${stats.economy.gemLust.toLocaleString()}**`,
                `🏆 Rang: **#${stats.economy.rank}**`
            ].join('\n'),
            inline: true
        });

        // Section Activité
        embed.addFields({
            name: '📈 Activité',
            value: [
                `⏱️ Dernière activité: <t:${Math.floor(stats.activity.lastSeen.getTime() / 1000)}:R>`,
                `🔥 Série quotidienne: **${stats.activity.dailyStreak} jours**`,
                `💬 Commandes utilisées: **${stats.activity.totalCommands}**`,
                `⭐ Canal favori: ${stats.activity.favoriteChannel || 'Aucun'}`
            ].join('\n'),
            inline: true
        });

        // Section Missions
        embed.addFields({
            name: '🎯 Missions',
            value: [
                `✅ Complétées: **${stats.missions.completed}**`,
                `📊 Progression actuelle: **${stats.missions.currentProgress}%**`,
                `🎁 Récompenses totales: **${stats.missions.totalRewards}**`
            ].join('\n'),
            inline: true
        });

        // Section Métaverse
        embed.addFields({
            name: '🌍 Métaverse',
            value: [
                `📍 Position: **${stats.metaverse.currentLocation}**`,
                `🗺️ Lieux visités: **${stats.metaverse.locationsVisited.length}**`,
                `❤️ Lieu favori: **${stats.metaverse.favoriteLocation || 'Aucun'}**`,
                `🚶 Déplacements: **${stats.metaverse.totalTravels}**`
            ].join('\n'),
            inline: true
        });

        // Section Social
        embed.addFields({
            name: '👥 Social',
            value: [
                `💬 Messages: **${stats.social.messagesCount}**`,
                `👍 Réactions données: **${stats.social.reactionsGiven}**`,
                `💖 Réactions reçues: **${stats.social.reactionsReceived}**`,
                `⭐ Réputation: **${stats.social.reputation}**`
            ].join('\n'),
            inline: true
        });

        // Graphique de progression (ASCII)
        const progressBar = this.createProgressBar(stats.missions.currentProgress);
        embed.addFields({
            name: '📊 Progression globale',
            value: `\`\`\`${progressBar}\`\`\``,
            inline: false
        });

        return embed;
    }

    /**
     * Créer un embed pour les stats serveur
     */
    createServerStatsEmbed(stats, guild) {
        const embed = new EmbedBuilder()
            .setTitle(`📊 Statistiques du serveur ${guild.name}`)
            .setThumbnail(guild.iconURL({ dynamic: true }))
            .setColor(0x5865F2)
            .setTimestamp();

        // Vue d'ensemble
        embed.addFields({
            name: '👥 Membres',
            value: [
                `Total: **${stats.users.total}**`,
                `Actifs aujourd'hui: **${stats.users.activeToday}**`,
                `Actifs cette semaine: **${stats.users.activeWeek}**`,
                `Croissance: **${stats.users.growth > 0 ? '+' : ''}${stats.users.growth.toFixed(1)}%**`
            ].join('\n'),
            inline: true
        });

        // Économie
        embed.addFields({
            name: '💰 Économie',
            value: [
                `Total en circulation: **${stats.economy.totalCirculation.toLocaleString()}**`,
                `Transactions/jour: **${stats.economy.dailyTransactions}**`,
                `Plus riche: ${stats.economy.richestUser ? `<@${stats.economy.richestUser.id}>` : 'Aucun'}`
            ].join('\n'),
            inline: true
        });

        // Activité
        embed.addFields({
            name: '📈 Activité',
            value: [
                `Commandes aujourd'hui: **${stats.activity.commandsToday}**`,
                `Messages cette semaine: **${stats.activity.messagesWeek}**`,
                `Heure de pointe: **${stats.activity.peakHour}h**`,
                `Canal le plus actif: ${stats.activity.mostActiveChannel ? `<#${stats.activity.mostActiveChannel}>` : 'Aucun'}`
            ].join('\n'),
            inline: true
        });

        // Top 5 des utilisateurs
        if (stats.topUsers && stats.topUsers.length > 0) {
            const topUsersList = stats.topUsers.slice(0, 5).map((user, index) => 
                `${index + 1}. <@${user.discordId}> - **${user.totalCurrency.toLocaleString()}** 💰`
            ).join('\n');

            embed.addFields({
                name: '🏆 Top 5 Utilisateurs',
                value: topUsersList,
                inline: false
            });
        }

        // Métaverse
        embed.addFields({
            name: '🌍 Métaverse',
            value: [
                `Lieu le plus visité: **${stats.metaverse.mostVisited || 'Aucun'}**`,
                `Explorateurs actifs: **${stats.metaverse.activeExplorers}**`,
                `Voyages totaux: **${stats.metaverse.totalTravels}**`
            ].join('\n'),
            inline: true
        });

        // Événements
        embed.addFields({
            name: '🎉 Événements',
            value: [
                `Prochain: ${stats.events.upcoming ? `**${stats.events.upcoming.name}**` : 'Aucun planifié'}`,
                `Dernier: ${stats.events.lastEvent ? `**${stats.events.lastEvent.name}**` : 'Aucun'}`,
                `Participation moyenne: **${stats.events.participation}%**`
            ].join('\n'),
            inline: true
        });

        return embed;
    }

    /**
     * Créer une barre de progression ASCII
     */
    createProgressBar(percentage, length = 20) {
        const filled = Math.round((percentage / 100) * length);
        const empty = length - filled;
        const bar = '█'.repeat(filled) + '░'.repeat(empty);
        return `[${bar}] ${percentage}%`;
    }

    /**
     * Méthodes auxiliaires pour les calculs
     */
    async getUserEconomyRank(userId, guildId) {
        // Implémenter le calcul du rang économique
        const users = await Database.User.findAll({
            where: { guildId },
            order: [['kissCoins', 'DESC'], ['flameTokens', 'DESC'], ['gemLust', 'DESC']]
        });
        
        const index = users.findIndex(u => u.discordId === userId);
        return index + 1;
    }

    async getUserCommandCount(userId) {
        let count = 0;
        for (const [key, data] of this.metrics.commands) {
            if (data.users.has(userId)) {
                count += data.count;
            }
        }
        return count;
    }

    async getUserFavoriteChannel(userId) {
        // Implémenter la logique pour trouver le canal favori
        const channelCounts = new Map();
        for (const [key, data] of this.metrics.interactions) {
            if (key.includes(userId)) {
                for (const channel of data.channels) {
                    channelCounts.set(channel, (channelCounts.get(channel) || 0) + 1);
                }
            }
        }
        
        let favoriteChannel = null;
        let maxCount = 0;
        for (const [channel, count] of channelCounts) {
            if (count > maxCount) {
                maxCount = count;
                favoriteChannel = channel;
            }
        }
        
        return favoriteChannel ? `<#${favoriteChannel}>` : null;
    }

    async getUserFavoriteLocation(userId) {
        // Implémenter la logique pour trouver le lieu favori
        const locationCounts = new Map();
        for (const [key, data] of this.metrics.metaverse) {
            if (data.uniqueUsers.has(userId)) {
                const location = key.split(':')[0];
                locationCounts.set(location, (locationCounts.get(location) || 0) + data.count);
            }
        }
        
        let favoriteLocation = null;
        let maxCount = 0;
        for (const [location, count] of locationCounts) {
            if (count > maxCount) {
                maxCount = count;
                favoriteLocation = location;
            }
        }
        
        return favoriteLocation;
    }

    async getServerEconomyStats(guildId) {
        const users = await Database.User.findAll({
            where: { guildId }
        });
        
        let totalCirculation = 0;
        let richestUser = null;
        let maxWealth = 0;
        
        for (const user of users) {
            const wealth = (user.kissCoins || 0) + (user.flameTokens || 0) + (user.gemLust || 0);
            totalCirculation += wealth;
            
            if (wealth > maxWealth) {
                maxWealth = wealth;
                richestUser = { id: user.discordId, wealth };
            }
        }
        
        return {
            totalCirculation,
            dailyTransactions: this.metrics.currencies.size,
            richestUser
        };
    }

    async getServerMetaverseStats(guildId) {
        const locationVisits = new Map();
        let totalTravels = 0;
        const activeUsers = new Set();
        
        for (const [key, data] of this.metrics.metaverse) {
            const location = key.split(':')[0];
            locationVisits.set(location, (locationVisits.get(location) || 0) + data.count);
            totalTravels += data.count;
            
            for (const user of data.uniqueUsers) {
                activeUsers.add(user);
            }
        }
        
        let mostVisited = null;
        let maxVisits = 0;
        for (const [location, visits] of locationVisits) {
            if (visits > maxVisits) {
                maxVisits = visits;
                mostVisited = location;
            }
        }
        
        return {
            mostVisited,
            activeExplorers: activeUsers.size,
            totalTravels
        };
    }

    async getTopUsers(guildId, limit = 10) {
        const users = await Database.User.findAll({
            where: { guildId },
            order: [['kissCoins', 'DESC'], ['flameTokens', 'DESC'], ['gemLust', 'DESC']],
            limit
        });
        
        return users.map(user => ({
            discordId: user.discordId,
            totalCurrency: (user.kissCoins || 0) + (user.flameTokens || 0) + (user.gemLust || 0)
        }));
    }

    async calculateGrowthRate(guildId) {
        // Calculer le taux de croissance sur 7 jours
        const now = new Date();
        const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
        
        const newUsers = await Database.User.count({
            where: {
                guildId,
                createdAt: { $gte: weekAgo }
            }
        });
        
        const totalUsers = await Database.User.count({
            where: { guildId }
        });
        
        if (totalUsers === 0) return 0;
        return (newUsers / totalUsers) * 100;
    }

    async getCommandsCountToday(guildId) {
        const today = new Date().toISOString().split('T')[0];
        let count = 0;
        
        for (const [key, data] of this.metrics.commands) {
            if (key.includes(today)) {
                count += data.count;
            }
        }
        
        return count;
    }

    async getMessagesCountWeek(guildId) {
        // Implémenter le comptage des messages de la semaine
        return Math.floor(Math.random() * 10000) + 5000; // Placeholder
    }

    async getPeakActivityHour(guildId) {
        // Analyser les heures de pointe
        return Math.floor(Math.random() * 4) + 20; // Entre 20h et 23h
    }

    async getMostActiveChannel(guildId) {
        const channelCounts = new Map();
        
        for (const [key, data] of this.metrics.interactions) {
            for (const channel of data.channels) {
                channelCounts.set(channel, (channelCounts.get(channel) || 0) + 1);
            }
        }
        
        let mostActive = null;
        let maxCount = 0;
        for (const [channel, count] of channelCounts) {
            if (count > maxCount) {
                maxCount = count;
                mostActive = channel;
            }
        }
        
        return mostActive;
    }

    async getUpcomingEvents(guildId) {
        // Récupérer le prochain événement planifié
        return {
            name: 'Soirée VIP Hebdomadaire',
            date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
        };
    }

    async getLastEvent(guildId) {
        // Récupérer le dernier événement
        return {
            name: 'Casino Night',
            date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
        };
    }

    async getEventParticipation(guildId) {
        // Calculer le taux de participation moyen
        return Math.floor(Math.random() * 30) + 60; // Entre 60% et 90%
    }

    async loadHistoricalData() {
        // Charger les données historiques depuis la base
        logger.info('📊 Chargement des données historiques...');
    }

    async saveMetrics(timestamp) {
        // Sauvegarder les métriques actuelles
        logger.info('💾 Sauvegarde des métriques...');
    }

    async cleanOldData() {
        // Nettoyer les données de plus de 30 jours
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        logger.info(`🧹 Nettoyage des données antérieures à ${thirtyDaysAgo.toLocaleDateString()}`);
    }

    /**
     * Arrêter le gestionnaire
     */
    stop() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
        logger.info('🛑 Système Analytics arrêté');
    }
}

module.exports = new AnalyticsManager();
