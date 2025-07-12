import 'dotenv/config';

interface Config {
    bot: {
        token: string;
        clientId: string;
        prefix: string;
        version: string;
    };
    logging: {
        level: string;
        directory: string;
    };
    rateLimit: {
        windowMs: number;
        max: number;
    };
    database: {
        uri: string;
        options: {
            useNewUrlParser: boolean;
            useUnifiedTopology: boolean;
        };
    };
    intents: string[];
    cooldowns: {
        default: number;
        commands: Record<string, number>;
    };
}

const config: Config = {
    // Configuration du bot
    bot: {
        token: process.env.DISCORD_TOKEN,
        clientId: process.env.DISCORD_CLIENT_ID,
        prefix: '/',
        version: '2.0.0',
    },

    // Configuration des logs
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        directory: 'logs'
    },

    // Configuration du rate limiting
    rateLimit: {
        windowMs: 60 * 1000, // 1 minute
        max: 5 // limite à 5 requêtes par minute
    },

    // Configuration de la base de données
    database: {
        uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/discord-bot',
        options: {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }
    },

    // Configuration des intents Discord
    intents: [
        'Guilds',
        'GuildMessages',
        'MessageContent',
        'GuildMembers',
        'GuildPresences'
    ],

    // Configuration des cooldowns
    cooldowns: {
        default: 3000, // 3 secondes
        commands: {
            ping: 1000,
            // Ajoutez d'autres commandes ici
        }
    }
};

// Validation de la configuration
const validateConfig = () => {
    const requiredEnvVars = ['DISCORD_TOKEN', 'DISCORD_CLIENT_ID'];
    const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

    if (missingEnvVars.length > 0) {
        throw new Error(`Variables d'environnement manquantes: ${missingEnvVars.join(', ')}`);
    }
};

validateConfig();

export default config;
