import { Client, GatewayIntentBits } from 'discord.js';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { CommandHandler, EventHandler, ErrorHandler } from './handlers/index.js';
import logger from './utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, '..');

export class Bot {
    private readonly client: Client;
    private readonly commandHandler: CommandHandler;
    private readonly eventHandler: EventHandler;
    private readonly errorHandler: ErrorHandler;

    constructor() {
        this.client = new Client({
            intents: [GatewayIntentBits.Guilds]
        });

        // Initialisation des handlers
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
