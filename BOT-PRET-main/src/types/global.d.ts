// Global type definitions for the Discord bot

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // Discord
      DISCORD_TOKEN: string;
      CLIENT_ID: string;
      GUILD_ID?: string;
      
      // Database
      DATABASE_URL?: string;
      DATABASE_CA_CERT?: string;
      PGHOST?: string;
      PGPORT?: string;
      PGDATABASE?: string;
      PGUSER?: string;
      PGPASSWORD?: string;
      PGSSL?: string;
      
      // Railway specific
      RAILWAY_ENVIRONMENT?: string;
      PORT?: string;
      
      // Bot Config
      NODE_ENV: 'development' | 'production' | 'test';
      LOG_LEVEL: 'error' | 'warn' | 'info' | 'debug';
      BOT_PREFIX: string;
      
      // Features
      ENABLE_TICKETS: string;
      ENABLE_LOGGING: string;
      ENABLE_AUTOMOD: string;
      
      // Ticket System
      TICKET_CATEGORY_ID?: string;
      SUPPORT_ROLE_ID?: string;
      MAX_OPEN_TICKETS_PER_USER: string;
      TICKET_INACTIVE_HOURS: string;
      
      // Redis
      REDIS_URL?: string;
      
      // Monitoring
      SENTRY_DSN?: string;
    }
  }
}

export {};
