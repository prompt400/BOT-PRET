import { pgTable, serial, text, timestamp, varchar, integer, boolean, json } from 'drizzle-orm/pg-core';

// Table des utilisateurs
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  discordId: varchar('discord_id', { length: 20 }).unique().notNull(),
  username: varchar('username', { length: 32 }).notNull(),
  discriminator: varchar('discriminator', { length: 4 }),
  avatar: text('avatar'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Table des guildes (serveurs)
export const guilds = pgTable('guilds', {
  id: serial('id').primaryKey(),
  guildId: varchar('guild_id', { length: 20 }).unique().notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  ownerId: varchar('owner_id', { length: 20 }).notNull(),
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
  settings: json('settings').default({}).notNull(),
});

// Table des commandes exécutées (pour les stats)
export const commandLogs = pgTable('command_logs', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 20 }).notNull(),
  guildId: varchar('guild_id', { length: 20 }),
  commandName: varchar('command_name', { length: 50 }).notNull(),
  executedAt: timestamp('executed_at').defaultNow().notNull(),
  success: boolean('success').default(true).notNull(),
  errorMessage: text('error_message'),
});

// Table des niveaux et XP
export const userLevels = pgTable('user_levels', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 20 }).notNull(),
  guildId: varchar('guild_id', { length: 20 }).notNull(),
  xp: integer('xp').default(0).notNull(),
  level: integer('level').default(1).notNull(),
  messages: integer('messages').default(0).notNull(),
  lastMessageAt: timestamp('last_message_at'),
});

// Table des warnings
export const warnings = pgTable('warnings', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 20 }).notNull(),
  guildId: varchar('guild_id', { length: 20 }).notNull(),
  moderatorId: varchar('moderator_id', { length: 20 }).notNull(),
  reason: text('reason').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
