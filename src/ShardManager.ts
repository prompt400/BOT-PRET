import { ShardingManager } from 'discord.js';
import { join } from 'path';
import { fileURLToPath } from 'url';
import logger from './utils/logger.js';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, '..');

export class BotShardManager {
    private manager: ShardingManager;
    private readonly maxShards: number | 'auto';
    private readonly respawnDelay: number;
    private shardReadyTimeout: NodeJS.Timeout | null = null;

    constructor() {
        const token = process.env.DISCORD_TOKEN;
        if (!token) {
            throw new Error('DISCORD_TOKEN non défini');
        }

        this.maxShards = process.env.SHARD_COUNT ? parseInt(process.env.SHARD_COUNT) : 'auto';
        this.respawnDelay = 5000; // 5 secondes

        this.manager = new ShardingManager(join(__dirname, 'index.js'), {
            token,
            totalShards: this.maxShards,
            shardList: 'auto',
            mode: 'process',
            respawn: true,
            shardArgs: ['--ansi', '--color'],
            execArgv: process.env.NODE_ENV === 'development' ? ['--inspect'] : []
        });

        this.setupEventHandlers();
    }

    private setupEventHandlers(): void {
        this.manager.on('shardCreate', shard => {
            logger.info(`[Shard ${shard.id}] Lancement...`);
            
            shard.on('ready', () => {
                logger.info(`[Shard ${shard.id}] Prêt`);
            });

            shard.on('disconnect', () => {
                logger.warn(`[Shard ${shard.id}] Déconnecté`);
            });

            shard.on('reconnecting', () => {
                logger.info(`[Shard ${shard.id}] Reconnexion...`);
            });

            shard.on('death', process => {
                logger.error(`[Shard ${shard.id}] Processus mort (PID: ${process.pid})`);
                
                // Respawn automatique après un délai
                if (this.manager.respawn) {
                    setTimeout(() => {
                        logger.info(`[Shard ${shard.id}] Respawn...`);
                        shard.spawn();
                    }, this.respawnDelay);
                }
            });

            shard.on('error', error => {
                logger.error(`[Shard ${shard.id}] Erreur:`, error);
            });

            // Monitoring des performances
            this.monitorShard(shard);
        });
    }

    private monitorShard(shard: any): void {
        setInterval(async () => {
            try {
                const stats = await shard.fetchClientValue('{
                    guilds: client.guilds.cache.size,
                    users: client.users.cache.size,
                    memory: process.memoryUsage().heapUsed / 1024 / 1024,
                    uptime: client.uptime
                }');
                
                logger.debug(`[Shard ${shard.id}] Stats:`, stats);
            } catch (error) {
                logger.error(`[Shard ${shard.id}] Erreur de monitoring:`, error);
            }
        }, 5 * 60 * 1000); // Toutes les 5 minutes
    }

    public async start(): Promise<void> {
        try {
            logger.info('Démarrage du ShardingManager...');
            
            // Attendre que tous les shards soient prêts
            await this.manager.spawn({
                amount: this.maxShards,
                delay: 5500,
                timeout: 30000
            });
            
            logger.info(`✅ ${this.manager.shards.size} shard(s) lancé(s) avec succès`);
            
            // Statistiques globales périodiques
            this.startGlobalStats();
        } catch (error) {
            logger.error('Erreur lors du démarrage des shards:', error);
            process.exit(1);
        }
    }

    private startGlobalStats(): void {
        setInterval(async () => {
            try {
                const results = await this.manager.broadcastEval(client => ({
                    guilds: client.guilds.cache.size,
                    users: client.users.cache.size,
                    memory: Math.round(process.memoryUsage().heapUsed / 1024 / 1024)
                }));

                const totalStats = results.reduce((acc, stats) => ({
                    guilds: acc.guilds + stats.guilds,
                    users: acc.users + stats.users,
                    memory: acc.memory + stats.memory
                }), { guilds: 0, users: 0, memory: 0 });

                logger.info('📊 Statistiques globales:', {
                    shards: this.manager.shards.size,
                    guilds: totalStats.guilds,
                    users: totalStats.users,
                    memory: `${totalStats.memory}MB`
                });
            } catch (error) {
                logger.error('Erreur lors de la collecte des stats:', error);
            }
        }, 10 * 60 * 1000); // Toutes les 10 minutes
    }

    public async restartShard(shardId: number): Promise<void> {
        const shard = this.manager.shards.get(shardId);
        if (!shard) {
            throw new Error(`Shard ${shardId} non trouvé`);
        }

        logger.info(`[Shard ${shardId}] Redémarrage...`);
        await shard.respawn();
    }

    public async broadcastCommand(command: string, ...args: any[]): Promise<any[]> {
        return this.manager.broadcastEval(
            (client, context) => {
                // Exécuter la commande sur chaque shard
                return (client as any)[context.command](...context.args);
            },
            { context: { command, args } }
        );
    }
}

// Point d'entrée pour le sharding
if (import.meta.url === `file://${process.argv[1]}`) {
    const manager = new BotShardManager();
    manager.start().catch(error => {
        logger.error('Erreur fatale du ShardManager:', error);
        process.exit(1);
    });
}

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
