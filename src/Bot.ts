import { Client, GatewayIntentBits, Options } from 'discord.js';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { CommandHandler, EventHandler, ErrorHandler } from './handlers/index.js';
import { CacheService } from './services/CacheService.js';
import logger from './utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, '..');

export class Bot {
    private readonly client: Client;
    private readonly commandHandler: CommandHandler;
    private readonly eventHandler: EventHandler;
    private readonly errorHandler: ErrorHandler;
    private readonly cacheService: CacheService;

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
            // Initialisation des handlers
            await this.errorHandler.init();
            await this.commandHandler.init();
            await this.eventHandler.init();

            // Connexion du bot
            await this.client.login(process.env.DISCORD_TOKEN);
            logger.info(`Bot connecté en tant que ${this.client.user?.tag}`);
        } catch (error) {
            logger.error('Erreur lors du démarrage du bot:', error);
            process.exit(1);
        }
    }
}
