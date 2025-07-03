import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables
dotenv.config();

// Define environment schema
const envSchema = z.object({
  // Discord
  DISCORD_TOKEN: z.string().min(1),
  CLIENT_ID: z.string().min(1),
  GUILD_ID: z.string().optional(),
  
  // Database
  DATABASE_URL: z.string().url().optional(),
  DATABASE_CA_CERT: z.string().optional(),
  PGHOST: z.string().optional(),
  PGPORT: z.string().regex(/^\d+$/).optional(),
  PGDATABASE: z.string().optional(),
  PGUSER: z.string().optional(),
  PGPASSWORD: z.string().optional(),
  PGSSL: z.enum(['true', 'false']).optional(),
  
  // Bot Config
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  BOT_PREFIX: z.string().default('!'),
  
  // Features
  ENABLE_TICKETS: z.enum(['true', 'false']).default('true'),
  ENABLE_LOGGING: z.enum(['true', 'false']).default('true'),
  ENABLE_AUTOMOD: z.enum(['true', 'false']).default('false'),
  
  // Ticket System
  TICKET_CATEGORY_ID: z.string().optional(),
  SUPPORT_ROLE_ID: z.string().optional(),
  MAX_OPEN_TICKETS_PER_USER: z.string().regex(/^\d+$/).default('1'),
  TICKET_INACTIVE_HOURS: z.string().regex(/^\d+$/).default('24'),
  
  // Redis
  REDIS_URL: z.string().url().optional(),
  
  // Monitoring
  SENTRY_DSN: z.string().url().optional(),
  
  // Server
  PORT: z.string().regex(/^\d+$/).optional(),
});

// Validate environment
const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:');
  const errors = parsed.error.flatten().fieldErrors;
  Object.entries(errors).forEach(([field, messages]) => {
    console.error(`  ${field}: ${messages?.join(', ')}`);
  });
  process.exit(1);
}

// Validate database config
const hasConnectionString = !!parsed.data.DATABASE_URL;
const hasIndividualConfig = !!(
  parsed.data.PGHOST &&
  parsed.data.PGDATABASE &&
  parsed.data.PGUSER
);

if (!hasConnectionString && !hasIndividualConfig) {
  console.error('❌ Database configuration missing!');
  console.error('Provide either DATABASE_URL or PGHOST, PGDATABASE, PGUSER');
  process.exit(1);
}

export const env = parsed.data;

// Type export for better TypeScript support
export type Env = typeof env;
