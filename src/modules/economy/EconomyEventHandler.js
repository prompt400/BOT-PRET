import { Events } from 'discord.js';
import EconomySystem from './EconomySystem.js';
import MissionSystem from './MissionSystem.js';
import Logger from '../../services/logger.js';

const logger = new Logger('EconomyEventHandler');

class EconomyEventHandler {
    constructor(client) {
        this.client = client;
        this.userActivity = new Map();
        this.voiceStates = new Map();
    }

    /**
     * Initialiser tous les gestionnaires d'événements économiques
     */
    initialize() {
        // Messages envoyés
        this.client.on(Events.MessageCreate, async (message) => {
            if (message.author.bot || !message.guild) return;
            
            try {
                // Donner des KissCoins pour l'activité
                const lastMessage = this.userActivity.get(message.author.id);
                const now = Date.now();
                
                // Limiter à 1 KissCoin par minute pour éviter le spam
                if (!lastMessage || now - lastMessage > 60000) {
                    await EconomySystem.addCurrency(
                        message.author.id, 
                        'kissCoins', 
                        5, 
                        'Message envoyé'
                    );
                    this.userActivity.set(message.author.id, now);
                    
                    // Mettre à jour la progression des missions
                    await MissionSystem.updateMissionProgress(
                        message.author.id,
                        'daily',
                        'message_count',
                        1
                    );
                }
            } catch (error) {
                logger.erreur('Erreur lors du traitement du message', error);
            }
        });

        // Réactions ajoutées
        this.client.on(Events.MessageReactionAdd, async (reaction, user) => {
            if (user.bot || !reaction.message.guild) return;
            
            try {
                // Donner des KissCoins à celui qui reçoit la réaction
                if (reaction.message.author && !reaction.message.author.bot && 
                    reaction.message.author.id !== user.id) {
                    await EconomySystem.addCurrency(
                        reaction.message.author.id,
                        'kissCoins',
                        2,
                        'Réaction reçue'
                    );
                }
                
                // Mettre à jour la progression des missions pour celui qui réagit
                await MissionSystem.updateMissionProgress(
                    user.id,
                    'daily',
                    'reaction_count',
                    1
                );
            } catch (error) {
                logger.erreur('Erreur lors du traitement de la réaction', error);
            }
        });

        // État vocal (rejoindre/quitter)
        this.client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
            const userId = newState.member.user.id;
            
            if (newState.member.user.bot) return;
            
            try {
                // L'utilisateur rejoint un canal vocal
                if (!oldState.channel && newState.channel) {
                    this.voiceStates.set(userId, {
                        joinedAt: Date.now(),
                        channel: newState.channel.id
                    });
                }
                
                // L'utilisateur quitte un canal vocal
                else if (oldState.channel && !newState.channel) {
                    const voiceSession = this.voiceStates.get(userId);
                    
                    if (voiceSession) {
                        const duration = Date.now() - voiceSession.joinedAt;
                        const minutes = Math.floor(duration / 60000);
                        
                        if (minutes > 0) {
                            // Donner des KissCoins pour le temps en vocal (1 par minute, max 300 par jour)
                            const kissCoinsReward = Math.min(minutes, 300);
                            await EconomySystem.addCurrency(
                                userId,
                                'kissCoins',
                                kissCoinsReward,
                                `${minutes} minutes en vocal`
                            );
                            
                            // Mettre à jour la progression des missions
                            await MissionSystem.updateMissionProgress(
                                userId,
                                'daily',
                                'voice_time',
                                minutes
                            );
                        }
                        
                        this.voiceStates.delete(userId);
                    }
                }
            } catch (error) {
                logger.erreur('Erreur lors du traitement de l\'état vocal', error);
            }
        });

        // Interaction avec les commandes slash
        this.client.on(Events.InteractionCreate, async (interaction) => {
            if (!interaction.isCommand() || interaction.user.bot) return;
            
            try {
                // Récompense pour la première interaction du jour
                const user = await EconomySystem.getOrCreateUser(
                    interaction.user.id, 
                    interaction.user.username
                );
                
                const lastInteraction = user.stats?.lastInteraction;
                const now = new Date();
                
                if (!lastInteraction || this.isDifferentDay(new Date(lastInteraction), now)) {
                    await EconomySystem.addCurrency(
                        interaction.user.id,
                        'kissCoins',
                        10,
                        'Première interaction du jour'
                    );
                    
                    // Mettre à jour les stats
                    user.stats = {
                        ...user.stats,
                        lastInteraction: now
                    };
                    await user.save();
                    
                    // Mettre à jour la mission de jours actifs
                    await MissionSystem.updateMissionProgress(
                        interaction.user.id,
                        'weekly',
                        'active_days',
                        1
                    );
                }
            } catch (error) {
                logger.erreur('Erreur lors du traitement de l\'interaction', error);
            }
        });

        // Membre rejoint le serveur
        this.client.on(Events.GuildMemberAdd, async (member) => {
            if (member.user.bot) return;
            
            try {
                // Bonus de bienvenue
                await EconomySystem.getOrCreateUser(
                    member.user.id,
                    member.user.username
                );
                
                logger.info(`Bonus de bienvenue accordé à ${member.user.username}`);
            } catch (error) {
                logger.erreur('Erreur lors de l\'accueil du nouveau membre', error);
            }
        });

        logger.info('🎯 Gestionnaire d\'événements économiques initialisé');
    }

    /**
     * Vérifier si deux dates sont de jours différents
     */
    isDifferentDay(date1, date2) {
        return date1.toDateString() !== date2.toDateString();
    }

    /**
     * Nettoyer les données temporaires (à appeler périodiquement)
     */
    cleanup() {
        // Nettoyer les anciennes entrées d'activité
        const now = Date.now();
        const oneHour = 60 * 60 * 1000;
        
        for (const [userId, timestamp] of this.userActivity.entries()) {
            if (now - timestamp > oneHour) {
                this.userActivity.delete(userId);
            }
        }
        
        // Vérifier les sessions vocales abandonnées
        for (const [userId, session] of this.voiceStates.entries()) {
            if (now - session.joinedAt > 24 * oneHour) {
                this.voiceStates.delete(userId);
                logger.avertissement(`Session vocale abandonnée nettoyée pour l'utilisateur ${userId}`);
            }
        }
    }

    /**
     * Arrêter tous les gestionnaires d'événements
     */
    shutdown() {
        // Traiter toutes les sessions vocales en cours
        for (const [userId, session] of this.voiceStates.entries()) {
            const duration = Date.now() - session.joinedAt;
            const minutes = Math.floor(duration / 60000);
            
            if (minutes > 0) {
                EconomySystem.addCurrency(
                    userId,
                    'kissCoins',
                    Math.min(minutes, 300),
                    `${minutes} minutes en vocal (shutdown)`
                ).catch(error => {
                    logger.erreur(`Erreur lors de la sauvegarde de la session vocale pour ${userId}`, error);
                });
            }
        }
        
        this.voiceStates.clear();
        this.userActivity.clear();
        
        logger.info('Gestionnaire d\'événements économiques arrêté');
    }
}

export default EconomyEventHandler;
