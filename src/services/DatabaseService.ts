import { eq, and } from 'drizzle-orm';
import { db, testConnection } from '../db/client.js';
import { users, guilds, commandLogs, userLevels, warnings } from '../db/schema.js';
import logger from '../utils/logger.js';
import type { User, Guild } from 'discord.js';

export class DatabaseService {
  private isConnected: boolean = false;

  constructor() {
    this.init();
  }

  private async init(): Promise<void> {
    this.isConnected = await testConnection();
    if (!this.isConnected) {
      logger.warn('DatabaseService: Impossible de se connecter à la base de données');
    }
  }

  // Gestion des utilisateurs
  async upsertUser(user: User): Promise<void> {
    if (!this.isConnected) return;
    
    try {
      await db.insert(users)
        .values({
          discordId: user.id,
          username: user.username,
          discriminator: user.discriminator,
          avatar: user.avatar,
        })
        .onConflictDoUpdate({
          target: users.discordId,
          set: {
            username: user.username,
            discriminator: user.discriminator,
            avatar: user.avatar,
            updatedAt: new Date(),
          },
        });
    } catch (error) {
      logger.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
    }
  }

  // Gestion des guildes
  async upsertGuild(guild: Guild): Promise<void> {
    if (!this.isConnected) return;
    
    try {
      await db.insert(guilds)
        .values({
          guildId: guild.id,
          name: guild.name,
          ownerId: guild.ownerId,
        })
        .onConflictDoUpdate({
          target: guilds.guildId,
          set: {
            name: guild.name,
            ownerId: guild.ownerId,
          },
        });
    } catch (error) {
      logger.error('Erreur lors de la mise à jour de la guilde:', error);
    }
  }

  // Logs des commandes
  async logCommand(
    userId: string,
    commandName: string,
    guildId?: string,
    success: boolean = true,
    errorMessage?: string
  ): Promise<void> {
    if (!this.isConnected) return;
    
    try {
      await db.insert(commandLogs).values({
        userId,
        commandName,
        guildId,
        success,
        errorMessage,
      });
    } catch (error) {
      logger.error('Erreur lors du log de la commande:', error);
    }
  }

  // Système de niveaux
  async addUserXP(userId: string, guildId: string, xpAmount: number): Promise<void> {
    if (!this.isConnected) return;
    
    try {
      const existingLevel = await db.select()
        .from(userLevels)
        .where(and(eq(userLevels.userId, userId), eq(userLevels.guildId, guildId)))
        .limit(1);

      if (existingLevel.length > 0) {
        const newXP = existingLevel[0].xp + xpAmount;
        const newLevel = Math.floor(newXP / 1000) + 1;
        
        await db.update(userLevels)
          .set({
            xp: newXP,
            level: newLevel,
            messages: existingLevel[0].messages + 1,
            lastMessageAt: new Date(),
          })
          .where(eq(userLevels.id, existingLevel[0].id));
      } else {
        await db.insert(userLevels).values({
          userId,
          guildId,
          xp: xpAmount,
          level: 1,
          messages: 1,
          lastMessageAt: new Date(),
        });
      }
    } catch (error) {
      logger.error('Erreur lors de l\'ajout d\'XP:', error);
    }
  }

  // Système de warnings
  async addWarning(
    userId: string,
    guildId: string,
    moderatorId: string,
    reason: string
  ): Promise<void> {
    if (!this.isConnected) return;
    
    try {
      await db.insert(warnings).values({
        userId,
        guildId,
        moderatorId,
        reason,
      });
    } catch (error) {
      logger.error('Erreur lors de l\'ajout du warning:', error);
    }
  }

  // Récupérer les warnings d'un utilisateur
  async getUserWarnings(userId: string, guildId: string) {
    if (!this.isConnected) return [];
    
    try {
      return await db.select()
        .from(warnings)
        .where(and(eq(warnings.userId, userId), eq(warnings.guildId, guildId)));
    } catch (error) {
      logger.error('Erreur lors de la récupération des warnings:', error);
      return [];
    }
  }
}
