/**
 * Événement ready
 * Déclenché une fois que le bot est complètement connecté et prêt
 */

import { Events, ActivityType } from 'discord.js';
import Logger from '../services/logger.js';
import healthCheckService from '../services/healthcheck.js';

const logger = new Logger('Ready');

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
        
        // Mise à jour des métriques Discord
        healthCheckService.updateDiscordMetrics(client);
        
        // Configuration du statut avec rotation
        const statuses = [
            { name: '/status pour vérifier l\'état', type: ActivityType.Watching },
            { name: `${client.guilds.cache.size} serveurs`, type: ActivityType.Listening },
            { name: 'Bot professionnel', type: ActivityType.Playing }
        ];
        
        let currentStatus = 0;
        const updateStatus = () => {
            client.user.setActivity(statuses[currentStatus]);
            currentStatus = (currentStatus + 1) % statuses.length;
        };
        
        updateStatus();
        setInterval(updateStatus, 300000); // Change toutes les 5 minutes
        
        // Mise à jour périodique des métriques Discord
        setInterval(() => {
            healthCheckService.updateDiscordMetrics(client);
        }, 60000); // Toutes les minutes
        
        // Informations supplémentaires
        logger.info('Bot opérationnel et prêt à recevoir des commandes');
    }
};
