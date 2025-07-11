const { UserMemory, ConversationHistory } = require('../../database/models');
const { EmbedBuilder } = require('discord.js');
const logger = require('../../utils/Logger');

class MemoryManager {
    constructor() {
        this.cache = new Map(); // Cache en mémoire pour performances
        this.maxHistoryLength = 50; // Nombre max de messages par conversation
        this.contextWindow = 10; // Nombre de messages de contexte à charger
    }

    /**
     * Récupère ou crée la mémoire d'un utilisateur
     */
    async getUserMemory(userId) {
        // Vérifier le cache d'abord
        if (this.cache.has(userId)) {
            return this.cache.get(userId);
        }

        try {
            // Chercher ou créer en base
            let memory = await UserMemory.findOne({ where: { userId } });
            
            if (!memory) {
                memory = await UserMemory.create({
                    userId,
                    preferences: {},
                    personalityProfile: {},
                    aiInteractions: {
                        favoriteAI: null,
                        totalInteractions: 0,
                        lastInteraction: null
                    },
                    contextData: {}
                });
            }

            // Mettre en cache
            this.cache.set(userId, memory);
            return memory;

        } catch (error) {
            logger.error('Erreur lors de la récupération de la mémoire utilisateur:', error);
            return null;
        }
    }

    /**
     * Met à jour les préférences utilisateur
     */
    async updateUserPreferences(userId, preferences) {
        try {
            const memory = await this.getUserMemory(userId);
            if (!memory) return false;

            memory.preferences = {
                ...memory.preferences,
                ...preferences,
                lastUpdated: new Date()
            };

            await memory.save();
            this.cache.set(userId, memory);
            return true;

        } catch (error) {
            logger.error('Erreur lors de la mise à jour des préférences:', error);
            return false;
        }
    }

    /**
     * Enregistre un message dans l'historique de conversation
     */
    async saveMessage(userId, aiPersonality, message, isUserMessage = true) {
        try {
            const conversationId = `${userId}_${aiPersonality}`;
            
            await ConversationHistory.create({
                conversationId,
                userId,
                aiPersonality,
                message,
                isUserMessage,
                timestamp: new Date(),
                metadata: {
                    messageLength: message.length,
                    hasEmoji: /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/gu.test(message)
                }
            });

            // Mettre à jour les stats d'interaction
            const memory = await this.getUserMemory(userId);
            if (memory) {
                memory.aiInteractions.totalInteractions++;
                memory.aiInteractions.lastInteraction = new Date();
                
                // Tracker l'IA favorite
                const aiStats = memory.aiInteractions.stats || {};
                aiStats[aiPersonality] = (aiStats[aiPersonality] || 0) + 1;
                memory.aiInteractions.stats = aiStats;
                
                // Déterminer l'IA favorite
                const favorite = Object.entries(aiStats).reduce((a, b) => 
                    aiStats[a[0]] > aiStats[b[0]] ? a : b
                )[0];
                memory.aiInteractions.favoriteAI = favorite;
                
                await memory.save();
            }

            // Nettoyer l'historique si trop long
            await this.cleanupHistory(conversationId);
            
            return true;

        } catch (error) {
            logger.error('Erreur lors de la sauvegarde du message:', error);
            return false;
        }
    }

    /**
     * Récupère le contexte de conversation récent
     */
    async getConversationContext(userId, aiPersonality, limit = null) {
        try {
            const conversationId = `${userId}_${aiPersonality}`;
            const contextLimit = limit || this.contextWindow;

            const messages = await ConversationHistory.findAll({
                where: { conversationId },
                order: [['timestamp', 'DESC']],
                limit: contextLimit
            });

            // Inverser pour avoir l'ordre chronologique
            return messages.reverse().map(msg => ({
                role: msg.isUserMessage ? 'user' : 'assistant',
                content: msg.message,
                timestamp: msg.timestamp
            }));

        } catch (error) {
            logger.error('Erreur lors de la récupération du contexte:', error);
            return [];
        }
    }

    /**
     * Analyse le profil de personnalité basé sur les interactions
     */
    async analyzePersonalityProfile(userId) {
        try {
            const memory = await this.getUserMemory(userId);
            if (!memory) return null;

            // Récupérer toutes les conversations de l'utilisateur
            const allMessages = await ConversationHistory.findAll({
                where: { userId, isUserMessage: true },
                order: [['timestamp', 'DESC']],
                limit: 100
            });

            // Analyser les patterns
            const profile = {
                communicationStyle: this.analyzeCommunicationStyle(allMessages),
                interests: this.extractInterests(allMessages),
                emotionalTone: this.analyzeEmotionalTone(allMessages),
                activityPattern: this.analyzeActivityPattern(allMessages),
                preferredAI: memory.aiInteractions.favoriteAI
            };

            // Sauvegarder le profil
            memory.personalityProfile = profile;
            await memory.save();

            return profile;

        } catch (error) {
            logger.error('Erreur lors de l\'analyse du profil:', error);
            return null;
        }
    }

    /**
     * Analyse le style de communication
     */
    analyzeCommunicationStyle(messages) {
        const totalMessages = messages.length;
        if (totalMessages === 0) return 'neutre';

        let shortMessages = 0;
        let longMessages = 0;
        let emojiUsage = 0;
        let questionCount = 0;

        messages.forEach(msg => {
            const content = msg.message;
            if (content.length < 50) shortMessages++;
            if (content.length > 200) longMessages++;
            if (msg.metadata?.hasEmoji) emojiUsage++;
            if (content.includes('?')) questionCount++;
        });

        // Déterminer le style
        if (shortMessages / totalMessages > 0.7) return 'concis';
        if (longMessages / totalMessages > 0.5) return 'détaillé';
        if (emojiUsage / totalMessages > 0.5) return 'expressif';
        if (questionCount / totalMessages > 0.4) return 'curieux';
        
        return 'équilibré';
    }

    /**
     * Extrait les centres d'intérêt
     */
    extractInterests(messages) {
        const keywords = {
            'romance': ['amour', 'romance', 'cœur', 'passion', 'sentiment'],
            'aventure': ['aventure', 'explorer', 'découvrir', 'excitation', 'défi'],
            'sensualité': ['sensuel', 'désir', 'plaisir', 'érotique', 'intime'],
            'jeux': ['jeu', 'jouer', 'défi', 'gagner', 'compétition'],
            'art': ['art', 'créatif', 'beauté', 'esthétique', 'expression']
        };

        const interests = {};
        
        messages.forEach(msg => {
            const content = msg.message.toLowerCase();
            Object.entries(keywords).forEach(([interest, words]) => {
                words.forEach(word => {
                    if (content.includes(word)) {
                        interests[interest] = (interests[interest] || 0) + 1;
                    }
                });
            });
        });

        // Retourner les top 3 intérêts
        return Object.entries(interests)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([interest]) => interest);
    }

    /**
     * Analyse le ton émotionnel
     */
    analyzeEmotionalTone(messages) {
        const emotions = {
            'joyeux': ['😊', '😄', '🎉', 'heureux', 'content', 'ravi'],
            'passionné': ['🔥', '❤️', '💋', 'passion', 'désir', 'ardent'],
            'taquin': ['😏', '😈', '😉', 'taquin', 'coquin', 'malicieux'],
            'romantique': ['💕', '🌹', '💖', 'amour', 'tendresse', 'doux'],
            'aventurier': ['🎭', '✨', '🌟', 'excité', 'curieux', 'explorer']
        };

        const emotionScores = {};
        
        messages.forEach(msg => {
            const content = msg.message.toLowerCase();
            Object.entries(emotions).forEach(([emotion, indicators]) => {
                indicators.forEach(indicator => {
                    if (content.includes(indicator)) {
                        emotionScores[emotion] = (emotionScores[emotion] || 0) + 1;
                    }
                });
            });
        });

        // Retourner l'émotion dominante
        const dominant = Object.entries(emotionScores)
            .sort((a, b) => b[1] - a[1])[0];
        
        return dominant ? dominant[0] : 'neutre';
    }

    /**
     * Analyse les patterns d'activité
     */
    analyzeActivityPattern(messages) {
        if (messages.length === 0) return 'inactif';

        const hours = messages.map(msg => 
            new Date(msg.timestamp).getHours()
        );

        const hourCounts = {};
        hours.forEach(hour => {
            hourCounts[hour] = (hourCounts[hour] || 0) + 1;
        });

        // Déterminer la période d'activité principale
        const peakHour = Object.entries(hourCounts)
            .sort((a, b) => b[1] - a[1])[0][0];

        if (peakHour >= 6 && peakHour < 12) return 'matinal';
        if (peakHour >= 12 && peakHour < 18) return 'après-midi';
        if (peakHour >= 18 && peakHour < 22) return 'soirée';
        return 'nocturne';
    }

    /**
     * Nettoie l'historique trop ancien
     */
    async cleanupHistory(conversationId) {
        try {
            const count = await ConversationHistory.count({
                where: { conversationId }
            });

            if (count > this.maxHistoryLength) {
                const toDelete = count - this.maxHistoryLength;
                
                const oldestMessages = await ConversationHistory.findAll({
                    where: { conversationId },
                    order: [['timestamp', 'ASC']],
                    limit: toDelete
                });

                for (const msg of oldestMessages) {
                    await msg.destroy();
                }
            }
        } catch (error) {
            logger.error('Erreur lors du nettoyage de l\'historique:', error);
        }
    }

    /**
     * Génère un résumé de mémoire pour l'affichage
     */
    async generateMemorySummary(userId) {
        try {
            const memory = await this.getUserMemory(userId);
            if (!memory) return null;

            const profile = memory.personalityProfile || {};
            const interactions = memory.aiInteractions || {};

            const embed = new EmbedBuilder()
                .setTitle('📊 Profil de Mémoire')
                .setColor('#FF69B4')
                .addFields(
                    {
                        name: '🎭 Style de Communication',
                        value: profile.communicationStyle || 'Non analysé',
                        inline: true
                    },
                    {
                        name: '💭 Ton Émotionnel',
                        value: profile.emotionalTone || 'Non analysé',
                        inline: true
                    },
                    {
                        name: '⏰ Pattern d\'Activité',
                        value: profile.activityPattern || 'Non analysé',
                        inline: true
                    },
                    {
                        name: '✨ Centres d\'Intérêt',
                        value: profile.interests?.join(', ') || 'Non analysés',
                        inline: false
                    },
                    {
                        name: '🤖 IA Préférée',
                        value: interactions.favoriteAI || 'Aucune',
                        inline: true
                    },
                    {
                        name: '💬 Total Interactions',
                        value: interactions.totalInteractions?.toString() || '0',
                        inline: true
                    }
                )
                .setTimestamp();

            return embed;

        } catch (error) {
            logger.error('Erreur lors de la génération du résumé:', error);
            return null;
        }
    }

    /**
     * Réinitialise le cache (utile pour les tests ou maintenance)
     */
    clearCache() {
        this.cache.clear();
        logger.info('Cache de mémoire vidé');
    }
}

module.exports = new MemoryManager();
