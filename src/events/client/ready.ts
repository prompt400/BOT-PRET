import logger from '../../utils/logger.js';
import { Client, ActivityType } from 'discord.js';
import { MetricsService } from '../../services/MetricsService.js';

export default {
    name: 'ready',
    once: true,
    async execute(client: Client): Promise<void> {
        if (!client.user) return;
        
        const startTime = Date.now();
        
        // Tâches de démarrage en parallèle
        await Promise.all([
            this.updatePresence(client),
            this.logStartupInfo(client),
            this.initializeServices(client)
        ]);
        
        const bootTime = Date.now() - startTime;
        logger.info(`✅ Bot prêt en ${bootTime}ms`);
        
        // Mise à jour périodique du statut (optimisée)
        this.startPresenceUpdater(client);
    },
    
    async updatePresence(client: Client): Promise<void> {
        const presenceData = {
            activities: [{
                name: `${client.guilds.cache.size} serveurs | /help`,
                type: ActivityType.Watching
            }],
            status: 'online' as const
        };
        
        client.user!.setPresence(presenceData);
    },
    
    async logStartupInfo(client: Client): Promise<void> {
        logger.info(`Bot connecté comme ${client.user!.tag}`);
        logger.info(`Serveurs: ${client.guilds.cache.size}`);
        logger.info(`Utilisateurs en cache: ${client.users.cache.size}`);
        logger.info(`Utilisation mémoire: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`);
    },
    
    async initializeServices(client: Client): Promise<void> {
        // Initialiser les services supplémentaires si nécessaire
        logger.info('Services initialisés');
    },
    
    startPresenceUpdater(client: Client): void {
        // Utiliser un intervalle plus long pour économiser les ressources
        const updateInterval = 10 * 60 * 1000; // 10 minutes
        
        setInterval(() => {
            if (client.user) {
                const memberCount = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
                
                client.user.setPresence({
                    activities: [{
                        name: `${client.guilds.cache.size} serveurs | ${memberCount} membres`,
                        type: ActivityType.Watching
                    }],
                    status: 'online'
                });
            }
        }, updateInterval);
    }
};
