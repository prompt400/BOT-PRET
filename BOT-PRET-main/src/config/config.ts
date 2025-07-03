import { env } from './env.js';

export const config = {
  discord: {
    token: env.DISCORD_TOKEN,
    clientId: env.CLIENT_ID,
    guildId: env.GUILD_ID,
    prefix: env.BOT_PREFIX,
  },
  database: {
    connectionString: env.DATABASE_URL,
    host: env.PGHOST,
    port: env.PGPORT ? parseInt(env.PGPORT, 10) : 5432,
    database: env.PGDATABASE,
    user: env.PGUSER,
    password: env.PGPASSWORD,
    ssl: env.PGSSL === 'true' || env.NODE_ENV === 'production',
  },
  features: {
    tickets: env.ENABLE_TICKETS === 'true',
    logging: env.ENABLE_LOGGING === 'true',
    automod: env.ENABLE_AUTOMOD === 'false', // Désactivé par défaut
  },
  tickets: {
    categoryId: env.TICKET_CATEGORY_ID,
    supportRoleId: env.SUPPORT_ROLE_ID,
    maxOpenPerUser: parseInt(env.MAX_OPEN_TICKETS_PER_USER, 10),
    inactiveHours: parseInt(env.TICKET_INACTIVE_HOURS, 10),
  },
  redis: {
    url: env.REDIS_URL,
  },
  sentry: {
    dsn: env.SENTRY_DSN,
  },
  nodeEnv: env.NODE_ENV,
  logLevel: env.LOG_LEVEL,
} as const;
