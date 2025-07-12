import { ShardingManager } from 'discord.js';
import { config } from 'dotenv';
import logger from './utils/logger.js';

config();

class BotShardManager {
    private manager: ShardingManager;

    constructor() {
        this.manager = new ShardingManager('./src/Bot.ts', {
            token: process.env.DISCORD_TOKEN,
            totalShards: 'auto', // Discord.js calculera automatiquement le nombre optimal de shards
            respawn: true,
            mode: 'worker' // Utilise des workers Node.js pour une meilleure performance
        });

        this.setupEventHandlers();
    }

    private setupEventHandlers(): void {
        this.manager.on('shardCreate', shard => {
            logger.info(`Launched shard ${shard.id}`);

            shard.on('ready', () => {
                logger.info(`Shard ${shard.id} ready`);
            });

            shard.on('disconnect', () => {
                logger.warn(`Shard ${shard.id} disconnected`);
            });

            shard.on('reconnecting', () => {
                logger.info(`Shard ${shard.id} reconnecting`);
            });

            shard.on('death', () => {
                logger.error(`Shard ${shard.id} died`);
            });

            shard.on('error', error => {
                logger.error(`Shard ${shard.id} error:`, error);
            });
        });
    }

    public async start(): Promise<void> {
        try {
            logger.info('Starting bot with sharding enabled');
            await this.manager.spawn();
            
            // Collecter des statistiques périodiquement
            setInterval(() => {
                this.collectShardStats();
            }, 300000); // Toutes les 5 minutes
        } catch (error) {
            logger.error('Failed to start sharding manager:', error);
            process.exit(1);
        }
    }

    private async collectShardStats(): Promise<void> {
        try {
            const promises = [
                this.manager.broadcastEval(client => ({
                    guilds: client.guilds.cache.size,
                    users: client.users.cache.size,
                    ping: client.ws.ping,
                    ram: process.memoryUsage().heapUsed
                }))
            ];

            const results = await Promise.all(promises);
            const stats = results[0];

            const totalGuilds = stats.reduce((acc, shard) => acc + shard.guilds, 0);
            const totalUsers = stats.reduce((acc, shard) => acc + shard.users, 0);
            const avgPing = stats.reduce((acc, shard) => acc + shard.ping, 0) / stats.length;
            const totalRAM = stats.reduce((acc, shard) => acc + shard.ram, 0);

            logger.info('Shard Stats', {
                shards: stats.length,
                guilds: totalGuilds,
                users: totalUsers,
                averagePing: avgPing,
                totalRAM: `${(totalRAM / 1024 / 1024).toFixed(2)} MB`
            });
        } catch (error) {
            logger.error('Failed to collect shard stats:', error);
        }
    }
}

// Point d'entrée pour le sharding
if (require.main === module) {
    const shardManager = new BotShardManager();
    shardManager.start();
}

export default BotShardManager;
