import { Collection } from 'discord.js';
import { MiddlewareContext, RateLimitConfig } from '../types/middleware.js';
import logger from '../utils/logger.js';

interface RateLimit {
    timestamp: number;
    count: number;
}

export class RateLimiterMiddleware {
    private readonly globalLimits: Collection<string, RateLimit>;
    private readonly userLimits: Collection<string, Collection<string, RateLimit>>;
    private readonly commandLimits: Collection<string, RateLimit>;
    private readonly config: RateLimitConfig;

    constructor(config: RateLimitConfig) {
        this.config = config;
        this.globalLimits = new Collection();
        this.userLimits = new Collection();
        this.commandLimits = new Collection();
    }

    public create() {
        return async (context: MiddlewareContext): Promise<boolean> => {
            const { interaction, commandName } = context;
            const now = Date.now();

            // Vérification de la limite globale
            if (!this.checkLimit('global', 'global', now, this.config.global)) {
                await interaction.reply({
                    content: '⚠️ Le bot est actuellement surchargé. Veuillez réessayer dans quelques instants.',
                    ephemeral: true
                });
                return false;
            }

            // Vérification de la limite par utilisateur
            if (!this.checkLimit('user', interaction.user.id, now, this.config.user)) {
                const timeLeft = this.getTimeLeft('user', interaction.user.id);
                await interaction.reply({
                    content: `⚠️ Veuillez attendre ${timeLeft} secondes avant de réutiliser une commande.`,
                    ephemeral: true
                });
                return false;
            }

            // Vérification de la limite par commande
            if (!this.checkLimit('command', commandName, now, this.config.command)) {
                const timeLeft = this.getTimeLeft('command', commandName);
                await interaction.reply({
                    content: `⚠️ Cette commande est en cooldown. Réessayez dans ${timeLeft} secondes.`,
                    ephemeral: true
                });
                return false;
            }

            logger.debug(`Rate limits validés pour ${interaction.user.tag} - Commande: ${commandName}`);
            return true;
        };
    }

    private checkLimit(type: 'global' | 'user' | 'command', key: string, now: number, config: { limit: number; window: number }): boolean {
        const collection = type === 'user' ? this.userLimits.get(key) ?? new Collection() : 
                         type === 'command' ? this.commandLimits :
                         this.globalLimits;

        const limit = collection.get(key) ?? { timestamp: now, count: 0 };

        // Réinitialisation si la fenêtre est passée
        if (now - limit.timestamp > config.window) {
            limit.timestamp = now;
            limit.count = 0;
        }

        // Vérification de la limite
        if (limit.count >= config.limit) {
            return false;
        }

        // Mise à jour du compteur
        limit.count++;
        collection.set(key, limit);

        if (type === 'user') {
            this.userLimits.set(key, collection);
        }

        return true;
    }

    private getTimeLeft(type: 'global' | 'user' | 'command', key: string): number {
        const collection = type === 'user' ? this.userLimits.get(key) : 
                         type === 'command' ? this.commandLimits :
                         this.globalLimits;
        
        const limit = collection?.get(key);
        if (!limit) return 0;

        const config = type === 'user' ? this.config.user :
                      type === 'command' ? this.config.command :
                      this.config.global;

        const timeLeft = Math.ceil((limit.timestamp + config.window - Date.now()) / 1000);
        return Math.max(0, timeLeft);
    }
}
