import { Client, GatewayIntentBits, Options } from 'discord.js';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { CommandHandler, EventHandler, ErrorHandler } from './handlers/index.js';
import { CacheService } from './services/CacheService.js';
import logger from './utils/logger.js';
import { HealthController } from './controllers/HealthController.js';
import { MetricsService } from './services/MetricsService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, '..');

export class Bot {
    private readonly client: Client;
    private readonly commandHandler: CommandHandler;
    private readonly eventHandler: EventHandler;
    private readonly errorHandler: ErrorHandler;
    private readonly cacheService: CacheService;
    private readonly healthController: HealthController;
    private readonly metricsService: MetricsService;

    constructor() {
        // Configuration optimisée du client
        this.client = new Client({
            intents: [GatewayIntentBits.Guilds],
            makeCache: Options.cacheWithLimits({
                MessageManager: 200, // Limite la taille du cache des messages
                PresenceManager: 0,  // Désactive le cache des présences
                GuildMemberManager: {
                    maxSize: 200,
                    keepOverLimit: member => member.id === this.client.user?.id
                }
            }),
            sweepers: {
                messages: {
                    interval: 300, // 5 minutes
                    lifetime: 1800 // 30 minutes
                }
            }
        });

        // Initialisation des services
        this.cacheService = new CacheService({
            ttl: 5 * 60 * 1000, // 5 minutes
            maxSize: 1000
        });

        this.metricsService = new MetricsService();
        this.healthController = new HealthController(this.client, this.metricsService, this.cacheService);

        // Initialisation des handlers avec lazy loading
        this.commandHandler = new CommandHandler({
            client: this.client,
            directory: join(__dirname, 'commands')
        });

        this.eventHandler = new EventHandler({
            client: this.client,
            directory: join(__dirname, 'events')
        });

        this.errorHandler = new ErrorHandler({
            client: this.client,
            directory: join(__dirname, 'errors')
        });
    }

    public async start(): Promise<void> {
        try {
            // Démarrage du service de cache
            this.cacheService.startCleanupInterval();
            
            // Démarrage du serveur de santé pour Railway
            await this.healthController.start();
            
            // Initialisation des handlers
            await this.errorHandler.init();
            await this.commandHandler.init();
            await this.eventHandler.init();

            // Connexion du bot
            await this.client.login(process.env.DISCORD_TOKEN);
            logger.info(`Bot connecté en tant que ${this.client.user?.tag}`);

            // Gestion des signaux pour Railway
            this.setupGracefulShutdown();
        } catch (error) {
            logger.error('Erreur lors du démarrage du bot:', error);
            process.exit(1);
        }
    }

    private setupGracefulShutdown(): void {
        const gracefulShutdown = async (signal: string) => {
            logger.info(`Signal ${signal} reçu, arrêt en cours...`);
            
            try {
                // Arrêt du serveur de santé
                this.healthController.stop();
                
                // Arrêt du cache
                this.cacheService.stopCleanupInterval();
                
                // Déconnexion propre du bot
                await this.client.destroy();
                
                logger.info('Bot arrêté proprement');
                process.exit(0);
            } catch (error) {
                logger.error('Erreur lors de l\'arrêt:', error);
                process.exit(1);
            }
        };

        // Écoute des signaux de Railway
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    }
}
