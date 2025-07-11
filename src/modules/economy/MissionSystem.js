import { User } from '../../database/models/index.js';
import Logger from '../../services/logger.js';
import EconomySystem from './EconomySystem.js';

const logger = new Logger('MissionSystem');

class MissionSystem {
    constructor() {
        // Types de missions disponibles
        this.MISSIONS = {
            daily: [
                {
                    id: 'daily_messages',
                    name: 'Bavard du jour',
                    description: 'Envoie 20 messages aujourd\'hui',
                    type: 'message_count',
                    target: 20,
                    rewards: { kissCoins: 50, flameTokens: 0, gemLust: 0 },
                    emoji: '💬'
                },
                {
                    id: 'daily_reactions',
                    name: 'Réactif',
                    description: 'Ajoute 10 réactions aujourd\'hui',
                    type: 'reaction_count',
                    target: 10,
                    rewards: { kissCoins: 30, flameTokens: 0, gemLust: 0 },
                    emoji: '😍'
                },
                {
                    id: 'daily_voice',
                    name: 'Voix sensuelle',
                    description: 'Passe 30 minutes en vocal',
                    type: 'voice_time',
                    target: 30, // en minutes
                    rewards: { kissCoins: 75, flameTokens: 1, gemLust: 0 },
                    emoji: '🎤'
                }
            ],
            weekly: [
                {
                    id: 'weekly_active',
                    name: 'Présence hebdomadaire',
                    description: 'Sois actif 5 jours sur 7',
                    type: 'active_days',
                    target: 5,
                    rewards: { kissCoins: 500, flameTokens: 5, gemLust: 0 },
                    emoji: '📅'
                },
                {
                    id: 'weekly_roleplay',
                    name: 'Maître du Roleplay',
                    description: 'Participe à 3 sessions de roleplay',
                    type: 'roleplay_count',
                    target: 3,
                    rewards: { kissCoins: 300, flameTokens: 3, gemLust: 0 },
                    emoji: '🎭'
                },
                {
                    id: 'weekly_events',
                    name: 'Fêtard',
                    description: 'Participe à 2 événements du serveur',
                    type: 'event_participation',
                    target: 2,
                    rewards: { kissCoins: 400, flameTokens: 4, gemLust: 0 },
                    emoji: '🎉'
                }
            ],
            special: [
                {
                    id: 'special_first_kiss',
                    name: 'Premier baiser',
                    description: 'Obtiens ton premier KissCoin',
                    type: 'achievement',
                    target: 1,
                    rewards: { kissCoins: 100, flameTokens: 1, gemLust: 0 },
                    emoji: '💋',
                    oneTime: true
                },
                {
                    id: 'special_flame_master',
                    name: 'Maître des flammes',
                    description: 'Accumule 100 FlameTokens',
                    type: 'currency_milestone',
                    target: 100,
                    currency: 'flameTokens',
                    rewards: { kissCoins: 1000, flameTokens: 10, gemLust: 1 },
                    emoji: '🔥',
                    oneTime: true
                },
                {
                    id: 'special_gem_collector',
                    name: 'Collectionneur de gemmes',
                    description: 'Obtiens ta première GemLust',
                    type: 'currency_milestone',
                    target: 1,
                    currency: 'gemLust',
                    rewards: { kissCoins: 2000, flameTokens: 20, gemLust: 0 },
                    emoji: '💎',
                    oneTime: true
                }
            ]
        };

        // Cache des progressions utilisateur
        this.userProgress = new Map();
    }

    /**
     * Obtenir les missions actives d'un utilisateur
     */
    async getUserMissions(discordId) {
        const user = await User.findOne({ where: { discordId } });
        if (!user) throw new Error('Utilisateur introuvable');

        const userMissions = user.missions || {
            daily: {},
            weekly: {},
            special: {},
            completedMissions: []
        };

        // Réinitialiser les missions quotidiennes si nécessaire
        const lastReset = userMissions.lastDailyReset ? new Date(userMissions.lastDailyReset) : null;
        const now = new Date();
        
        if (!lastReset || this.isDifferentDay(lastReset, now)) {
            userMissions.daily = {};
            userMissions.lastDailyReset = now;
        }

        // Réinitialiser les missions hebdomadaires si nécessaire
        const lastWeeklyReset = userMissions.lastWeeklyReset ? new Date(userMissions.lastWeeklyReset) : null;
        
        if (!lastWeeklyReset || this.isDifferentWeek(lastWeeklyReset, now)) {
            userMissions.weekly = {};
            userMissions.lastWeeklyReset = now;
        }

        // Sauvegarder les changements
        user.missions = userMissions;
        await user.save();

        return this.formatMissionsForDisplay(userMissions);
    }

    /**
     * Mettre à jour la progression d'une mission
     */
    async updateMissionProgress(discordId, missionType, progressType, value = 1) {
        const user = await User.findOne({ where: { discordId } });
        if (!user) return;

        const userMissions = user.missions || {
            daily: {},
            weekly: {},
            special: {},
            completedMissions: []
        };

        // Trouver toutes les missions qui correspondent au type de progression
        const applicableMissions = [];
        
        for (const [category, missions] of Object.entries(this.MISSIONS)) {
            for (const mission of missions) {
                if (mission.type === progressType && !userMissions.completedMissions.includes(mission.id)) {
                    applicableMissions.push({ ...mission, category });
                }
            }
        }

        // Mettre à jour la progression pour chaque mission applicable
        for (const mission of applicableMissions) {
            const categoryProgress = userMissions[mission.category];
            
            if (!categoryProgress[mission.id]) {
                categoryProgress[mission.id] = {
                    progress: 0,
                    completed: false,
                    startedAt: new Date()
                };
            }

            const missionProgress = categoryProgress[mission.id];
            
            if (!missionProgress.completed) {
                missionProgress.progress += value;
                
                // Vérifier si la mission est complétée
                if (missionProgress.progress >= mission.target) {
                    missionProgress.completed = true;
                    missionProgress.completedAt = new Date();
                    
                    // Donner les récompenses
                    await this.grantMissionRewards(discordId, mission);
                    
                    // Ajouter aux missions complétées si c'est une mission unique
                    if (mission.oneTime) {
                        userMissions.completedMissions.push(mission.id);
                    }
                    
                    logger.info(`Mission complétée: ${mission.name} par ${user.username}`);
                }
            }
        }

        // Sauvegarder les changements
        user.missions = userMissions;
        await user.save();

        return applicableMissions;
    }

    /**
     * Donner les récompenses d'une mission
     */
    async grantMissionRewards(discordId, mission) {
        const { rewards } = mission;
        
        if (rewards.kissCoins > 0) {
            await EconomySystem.addCurrency(discordId, 'kissCoins', rewards.kissCoins, `Mission: ${mission.name}`);
        }
        
        if (rewards.flameTokens > 0) {
            await EconomySystem.addCurrency(discordId, 'flameTokens', rewards.flameTokens, `Mission: ${mission.name}`);
        }
        
        if (rewards.gemLust > 0) {
            await EconomySystem.addCurrency(discordId, 'gemLust', rewards.gemLust, `Mission: ${mission.name}`);
        }
    }

    /**
     * Formater les missions pour l'affichage
     */
    formatMissionsForDisplay(userMissions) {
        const formatted = {
            daily: [],
            weekly: [],
            special: []
        };

        for (const [category, missions] of Object.entries(this.MISSIONS)) {
            for (const mission of missions) {
                const progress = userMissions[category][mission.id] || { progress: 0, completed: false };
                
                // Ignorer les missions uniques déjà complétées
                if (mission.oneTime && userMissions.completedMissions.includes(mission.id)) {
                    continue;
                }

                formatted[category].push({
                    ...mission,
                    currentProgress: progress.progress,
                    completed: progress.completed,
                    percentage: Math.min(100, Math.floor((progress.progress / mission.target) * 100))
                });
            }
        }

        return formatted;
    }

    /**
     * Vérifier si deux dates sont de jours différents
     */
    isDifferentDay(date1, date2) {
        return date1.toDateString() !== date2.toDateString();
    }

    /**
     * Vérifier si deux dates sont de semaines différentes
     */
    isDifferentWeek(date1, date2) {
        const oneWeek = 7 * 24 * 60 * 60 * 1000;
        return Math.floor(date1 / oneWeek) !== Math.floor(date2 / oneWeek);
    }

    /**
     * Obtenir le temps restant avant la prochaine réinitialisation
     */
    getTimeUntilReset(type = 'daily') {
        const now = new Date();
        let resetTime;

        if (type === 'daily') {
            resetTime = new Date(now);
            resetTime.setDate(resetTime.getDate() + 1);
            resetTime.setHours(0, 0, 0, 0);
        } else if (type === 'weekly') {
            resetTime = new Date(now);
            const daysUntilMonday = (8 - resetTime.getDay()) % 7 || 7;
            resetTime.setDate(resetTime.getDate() + daysUntilMonday);
            resetTime.setHours(0, 0, 0, 0);
        }

        const timeRemaining = resetTime - now;
        const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
        const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));

        return { hours, minutes, timestamp: resetTime };
    }
}

// Export singleton
export default new MissionSystem();
