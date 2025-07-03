/**
 * Événement ready
 * Déclenché une fois que le bot est complètement connecté et prêt
 */

import { Events, ActivityType } from 'discord.js';
import Logger from '../services/logger.js';

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
        
        // Configuration du statut
        client.user.setActivity({
            name: '/status pour vérifier l\'état',
            type: ActivityType.Watching
        });
        
        // Informations supplémentaires
        logger.info('Bot opérationnel et prêt à recevoir des commandes');
    }
};
