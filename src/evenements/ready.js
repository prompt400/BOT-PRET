// coding: utf-8
/**
 * Événement ready
 * Déclenché une fois que le bot est complètement connecté et prêt
 */

import { Events, ActivityType } from 'discord.js';
import Logger from '../services/logger.js';
import healthCheckService from '../services/healthcheck.js';
import { CONFIGURATION } from '../config/bot.js';

const logger = new Logger('Ready');

// Stockage global des intervals pour pouvoir les nettoyer
const intervals = [];

export default {
    name: Events.ClientReady,
    once: true,
    
    /**
     * Exécute l'événement ready
     * @param {import('discord.js').Client} client 
     */
    async execute(client) {
        logger.info(`Bot connecté en tant que ${client.user.tag}`);
        logger.info(`Présent sur ${client.guilds.cache.size} serveurs`);
        
        // Configuration du serveur cible si spécifié
        if (CONFIGURATION.TARGET_SERVER_ID) {
            const serveurCible = client.guilds.cache.get(CONFIGURATION.TARGET_SERVER_ID);
            
            if (!serveurCible) {
                logger.erreur(`ERREUR CRITIQUE : Serveur cible non trouvé (ID: ${CONFIGURATION.TARGET_SERVER_ID})`);
                logger.erreur('Vérifiez que :');
                logger.erreur('1. L\'ID du serveur est correct dans DISCORD_SERVER_ID');
                logger.erreur('2. Le bot a été invité sur ce serveur');
                logger.erreur('3. Le bot a les permissions nécessaires');
                
                // Arrêt du bot car c'est une erreur bloquante
                healthCheckService.setHealthy(false);
                process.exit(1);
            }
            
            // Stockage unique de la référence du serveur cible
            client.targetGuild = serveurCible;
            logger.info(`Serveur cible configuré : ${serveurCible.name} (${serveurCible.id})`);
            logger.info(`Membres : ${serveurCible.memberCount} | Propriétaire : ${serveurCible.ownerId}`);
        } else {
            logger.avertissement('Aucun serveur cible spécifié. Le bot fonctionnera sur tous les serveurs.');
            logger.info('Pour spécifier un serveur cible, définissez DISCORD_SERVER_ID dans votre fichier .env');
        }
        
        // Mise à jour des métriques Discord
        healthCheckService.updateDiscordMetrics(client);
        
        // Initialisation du système Analytics
        try {
            const AnalyticsManager = require('../modules/analytics/AnalyticsManager');
            await AnalyticsManager.initialize();
            logger.succes('✅ Système Analytics initialisé');
        } catch (error) {
            logger.erreur('❌ Erreur lors de l\'initialisation du système Analytics:', error);
        }
        
        // Configuration du statut avec rotation
        const statuses = [
            { name: '/status pour vérifier l\'état', type: ActivityType.Watching },
            { name: `${client.guilds.cache.size} serveurs`, type: ActivityType.Listening },
            { name: 'Bot professionnel', type: ActivityType.Playing }
        ];
        
        let currentStatus = 0;
        const updateStatus = () => {
            try {
                client.user.setActivity(statuses[currentStatus]);
                currentStatus = (currentStatus + 1) % statuses.length;
            } catch (error) {
                logger.erreur('Erreur lors de la mise à jour du statut:', error);
            }
        };
        
        updateStatus();
        
        // Stockage des intervals pour nettoyage
        const statusInterval = setInterval(updateStatus, 300000); // Change toutes les 5 minutes
        intervals.push(statusInterval);
        
        // Mise à jour périodique des métriques Discord
        const metricsInterval = setInterval(() => {
            try {
                healthCheckService.updateDiscordMetrics(client);
            } catch (error) {
                logger.erreur('Erreur lors de la mise à jour des métriques:', error);
            }
        }, 60000); // Toutes les minutes
        intervals.push(metricsInterval);
        
        // Heartbeat pour Railway - empêche le processus d'être considéré comme "terminé"
        const heartbeatInterval = setInterval(() => {
            logger.debug('Heartbeat - Bot actif');
        }, 30000); // Toutes les 30 secondes
        intervals.push(heartbeatInterval);
        
        // Nettoyage des intervals lors de la déconnexion
        client.once('disconnect', () => {
            logger.info('Nettoyage des intervals suite à la déconnexion');
            intervals.forEach(interval => clearInterval(interval));
            intervals.length = 0;
        });
        
        // Gestion de la fermeture propre
        const cleanupHandler = () => {
            logger.info('Nettoyage des intervals avant arrêt');
            intervals.forEach(interval => clearInterval(interval));
            intervals.length = 0;
        };
        
        process.once('SIGINT', cleanupHandler);
        process.once('SIGTERM', cleanupHandler);
        
        // IMPORTANT : Maintenir le processus actif sur Railway
        logger.info('Bot opérationnel et prêt à recevoir des commandes');
        logger.info('Maintien du processus actif pour Railway...');
    }
};
