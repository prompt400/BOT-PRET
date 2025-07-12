import logger from '../../utils/logger.js';
import { Client, ActivityType } from 'discord.js';

export default {
    name: 'ready',
    once: true,
    async execute(client: Client): Promise<void> {
        if (!client.user) return;
        
        logger.info(`Bot connecté comme ${client.user.tag}`);
        
        // Status dynamique
        client.user.setPresence({
            activities: [{
                name: `${client.guilds.cache.size} serveurs`,
                type: ActivityType.Watching
            }],
            status: 'online'
        });

        // Mise à jour du statut toutes les 5 minutes
        setInterval(() => {
            client.user?.setPresence({
                activities: [{
                    name: `${client.guilds.cache.size} serveurs`,
                    type: ActivityType.Watching
                }],
                status: 'online'
            });
        }, 5 * 60 * 1000);
    }
};
