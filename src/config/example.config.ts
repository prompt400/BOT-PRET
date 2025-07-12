export default {
    // Configuration du bot
    bot: {
        prefix: '/',
        defaultCooldown: 3, // secondes
        ownerId: process.env.OWNER_ID || '',
    },

    // Configuration des commandes
    commands: {
        defaultPermissions: true,
        guildOnly: false,
        cooldowns: {
            enabled: true,
            defaultDuration: 3000, // ms
            exemptRoles: [], // IDs des rôles exemptés
        },
    },

    // Configuration du système de logs
    logging: {
        level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
        directory: './logs',
        maxFiles: 30,
        maxSize: '10m',
    },

    // Configuration du système de cache
    cache: {
        ttl: 5 * 60 * 1000, // 5 minutes
        checkPeriod: 60 * 1000, // 1 minute
        maxItems: 1000,
    },

    // Configuration des alertes et notifications
    alerts: {
        errorThreshold: 10, // nombre d'erreurs avant alerte
        memoryThreshold: 500, // MB
        notificationChannels: [
            process.env.ERROR_CHANNEL_ID || '',
        ],
    },

    // Configuration des rateLimits
    rateLimit: {
        global: {
            limit: 1000,
            window: 60000, // 1 minute
        },
        user: {
            limit: 10,
            window: 60000, // 1 minute
        },
        command: {
            limit: 3,
            window: 10000, // 10 secondes
        },
    },

    // Configuration du sharding
    sharding: {
        spawnDelay: 5000, // 5 secondes entre chaque shard
        respawn: true,
        mode: 'worker',
    },
} as const;
