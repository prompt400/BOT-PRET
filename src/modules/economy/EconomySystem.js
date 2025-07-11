// Système économique complet du bot
import Logger from '../../services/logger.js';
import { EmbedBuilder } from 'discord.js';
import { COULEURS } from '../../constantes/theme.js';

const logger = new Logger('EconomySystem');

class EconomySystem {
    constructor() {
        this.CONVERSION_RATES = {
            'kiss_to_flame': 100,
            'flame_to_gem': 100,
            'kiss_to_gem': 10000 // 100 * 100
        };

        this.DAILY_REWARDS = [
            { day: 1, kissCoins: 100, flameTokens: 0, gemLust: 0 },
            { day: 2, kissCoins: 150, flameTokens: 0, gemLust: 0 },
            { day: 3, kissCoins: 200, flameTokens: 1, gemLust: 0 },
            { day: 4, kissCoins: 250, flameTokens: 1, gemLust: 0 },
            { day: 5, kissCoins: 300, flameTokens: 2, gemLust: 0 },
            { day: 6, kissCoins: 400, flameTokens: 3, gemLust: 0 },
            { day: 7, kissCoins: 500, flameTokens: 5, gemLust: 0 },
            { day: 14, kissCoins: 1000, flameTokens: 10, gemLust: 0 },
            { day: 30, kissCoins: 2000, flameTokens: 20, gemLust: 1 }
        ];

        this.transactions = new Map(); // Pour éviter les duplications
        this._User = null; // Cache pour le modèle User
    }

    /**
     * Obtenir le modèle User avec lazy loading
     */
    async getUserModel() {
        if (!this._User) {
            const { User } = await import('../../database/models/index.js');
            this._User = User;
        }
        return this._User;
    }

    /**
     * Obtenir ou créer un utilisateur
     */
    async getOrCreateUser(discordId, username) {
        try {
            let user = await User.findOne({ where: { discordId } });
            
            if (!user) {
                user = await User.create({
                    discordId,
                    username,
                    kissCoins: 100, // Bonus de bienvenue
                    flameTokens: 0,
                    gemLust: 0
                });
                logger.info(`Nouvel utilisateur créé: ${username} avec 100 KissCoins de bienvenue`);
            }
            
            return user;
        } catch (error) {
            logger.erreur('Erreur lors de la récupération de l\'utilisateur', error);
            throw error;
        }
    }

    /**
     * Ajouter des monnaies à un utilisateur
     */
    async addCurrency(discordId, currencyType, amount, reason = 'Unknown') {
        const transactionId = `${discordId}-${Date.now()}-${Math.random()}`;
        
        if (this.transactions.has(transactionId)) {
            throw new Error('Transaction déjà en cours');
        }
        
        this.transactions.set(transactionId, true);
        
        try {
            const user = await User.findOne({ where: { discordId } });
            if (!user) throw new Error('Utilisateur introuvable');

            const oldBalance = user[currencyType];
            user[currencyType] += amount;
            await user.save();

            logger.info(`[TRANSACTION] +${amount} ${currencyType} pour ${user.username}. Raison: ${reason}. Nouveau solde: ${user[currencyType]}`);

            this.transactions.delete(transactionId);
            return {
                success: true,
                oldBalance,
                newBalance: user[currencyType],
                user
            };
        } catch (error) {
            this.transactions.delete(transactionId);
            logger.erreur('Erreur lors de l\'ajout de monnaie', error);
            throw error;
        }
    }

    /**
     * Retirer des monnaies à un utilisateur
     */
    async removeCurrency(discordId, currencyType, amount, reason = 'Unknown') {
        const transactionId = `${discordId}-${Date.now()}-${Math.random()}`;
        
        if (this.transactions.has(transactionId)) {
            throw new Error('Transaction déjà en cours');
        }
        
        this.transactions.set(transactionId, true);
        
        try {
            const user = await User.findOne({ where: { discordId } });
            if (!user) throw new Error('Utilisateur introuvable');

            if (user[currencyType] < amount) {
                throw new Error(`Solde insuffisant. Solde actuel: ${user[currencyType]}`);
            }

            const oldBalance = user[currencyType];
            user[currencyType] -= amount;
            await user.save();

            logger.info(`[TRANSACTION] -${amount} ${currencyType} pour ${user.username}. Raison: ${reason}. Nouveau solde: ${user[currencyType]}`);

            this.transactions.delete(transactionId);
            return {
                success: true,
                oldBalance,
                newBalance: user[currencyType],
                user
            };
        } catch (error) {
            this.transactions.delete(transactionId);
            logger.erreur('Erreur lors du retrait de monnaie', error);
            throw error;
        }
    }

    /**
     * Convertir entre les monnaies
     */
    async convertCurrency(discordId, fromType, toType, amount) {
        const user = await User.findOne({ where: { discordId } });
        if (!user) throw new Error('Utilisateur introuvable');

        let rate;
        if (fromType === 'kissCoins' && toType === 'flameTokens') {
            rate = this.CONVERSION_RATES.kiss_to_flame;
        } else if (fromType === 'flameTokens' && toType === 'gemLust') {
            rate = this.CONVERSION_RATES.flame_to_gem;
        } else if (fromType === 'kissCoins' && toType === 'gemLust') {
            rate = this.CONVERSION_RATES.kiss_to_gem;
        } else {
            throw new Error('Conversion non supportée');
        }

        const requiredAmount = amount * rate;
        if (user[fromType] < requiredAmount) {
            throw new Error(`Solde insuffisant. Requis: ${requiredAmount} ${fromType}`);
        }

        // Transaction atomique
        const transactionId = `convert-${discordId}-${Date.now()}`;
        if (this.transactions.has(transactionId)) {
            throw new Error('Conversion déjà en cours');
        }

        this.transactions.set(transactionId, true);

        try {
            await this.removeCurrency(discordId, fromType, requiredAmount, `Conversion vers ${toType}`);
            await this.addCurrency(discordId, toType, amount, `Conversion depuis ${fromType}`);

            this.transactions.delete(transactionId);
            return {
                success: true,
                converted: amount,
                fromType,
                toType,
                rate,
                cost: requiredAmount
            };
        } catch (error) {
            this.transactions.delete(transactionId);
            throw error;
        }
    }

    /**
     * Obtenir le solde d'un utilisateur
     */
    async getBalance(discordId) {
        const user = await User.findOne({ where: { discordId } });
        if (!user) return null;

        return {
            kissCoins: user.kissCoins,
            flameTokens: user.flameTokens,
            gemLust: user.gemLust,
            totalValue: user.kissCoins + (user.flameTokens * 100) + (user.gemLust * 10000)
        };
    }

    /**
     * Créer un embed de balance
     */
    createBalanceEmbed(user, balance) {
        const embed = new EmbedBuilder()
            .setTitle(`💰 Portefeuille de ${user.username}`)
            .setColor(COULEURS.PRIMAIRE)
            .setThumbnail(user.avatar ? `https://cdn.discordapp.com/avatars/${user.discordId}/${user.avatar}.png` : null)
            .addFields(
                {
                    name: '💋 KissCoins',
                    value: `\`\`\`${balance.kissCoins.toLocaleString()}\`\`\``,
                    inline: true
                },
                {
                    name: '🔥 FlameTokens',
                    value: `\`\`\`${balance.flameTokens.toLocaleString()}\`\`\``,
                    inline: true
                },
                {
                    name: '💎 GemLust',
                    value: `\`\`\`${balance.gemLust.toLocaleString()}\`\`\``,
                    inline: true
                }
            )
            .addFields({
                name: '📊 Valeur totale',
                value: `\`\`\`${balance.totalValue.toLocaleString()} KissCoins\`\`\``,
                inline: false
            })
            .setFooter({
                text: 'Taux: 100 KC = 1 FT | 100 FT = 1 GL'
            })
            .setTimestamp();

        // Ajouter un statut selon la richesse
        if (balance.gemLust >= 10) {
            embed.setDescription('👑 **Statut:** Légende du Luxure');
        } else if (balance.gemLust >= 5) {
            embed.setDescription('💎 **Statut:** Magnât du Plaisir');
        } else if (balance.flameTokens >= 100) {
            embed.setDescription('🔥 **Statut:** Baron des Flammes');
        } else if (balance.flameTokens >= 50) {
            embed.setDescription('✨ **Statut:** Marchand Prospère');
        } else if (balance.kissCoins >= 10000) {
            embed.setDescription('💋 **Statut:** Collectionneur Passionné');
        } else {
            embed.setDescription('🌱 **Statut:** Libertin en Devenir');
        }

        return embed;
    }

    /**
     * Réclamer la récompense quotidienne
     */
    async claimDaily(discordId, username) {
        const user = await this.getOrCreateUser(discordId, username);
        
        const lastClaim = user.stats?.lastDailyClaim;
        const now = new Date();
        
        if (lastClaim) {
            const lastClaimDate = new Date(lastClaim);
            const hoursSinceLastClaim = (now - lastClaimDate) / (1000 * 60 * 60);
            
            if (hoursSinceLastClaim < 24) {
                const hoursRemaining = 24 - hoursSinceLastClaim;
                const hoursRemainingFormatted = Math.floor(hoursRemaining);
                const minutesRemaining = Math.floor((hoursRemaining % 1) * 60);
                
                return {
                    success: false,
                    timeRemaining: `${hoursRemainingFormatted}h ${minutesRemaining}m`
                };
            }
        }

        // Calculer le streak
        let streak = 1;
        if (lastClaim) {
            const daysSinceLastClaim = (now - new Date(lastClaim)) / (1000 * 60 * 60 * 24);
            if (daysSinceLastClaim <= 2) {
                streak = (user.stats?.dailyStreak || 0) + 1;
            }
        }

        // Obtenir la récompense selon le streak
        let reward = this.DAILY_REWARDS[0];
        for (const r of this.DAILY_REWARDS) {
            if (streak >= r.day) {
                reward = r;
            }
        }

        // Donner les récompenses
        if (reward.kissCoins > 0) {
            await this.addCurrency(discordId, 'kissCoins', reward.kissCoins, 'Récompense quotidienne');
        }
        if (reward.flameTokens > 0) {
            await this.addCurrency(discordId, 'flameTokens', reward.flameTokens, 'Récompense quotidienne');
        }
        if (reward.gemLust > 0) {
            await this.addCurrency(discordId, 'gemLust', reward.gemLust, 'Récompense quotidienne');
        }

        // Mettre à jour les stats
        user.stats = {
            ...user.stats,
            lastDailyClaim: now,
            dailyStreak: streak
        };
        await user.save();

        return {
            success: true,
            streak,
            reward
        };
    }

    /**
     * Transférer des monnaies entre utilisateurs
     */
    async transfer(fromDiscordId, toDiscordId, currencyType, amount, reason = 'Transfert') {
        const transactionId = `transfer-${fromDiscordId}-${toDiscordId}-${Date.now()}`;
        
        if (this.transactions.has(transactionId)) {
            throw new Error('Transfert déjà en cours');
        }
        
        this.transactions.set(transactionId, true);

        try {
            // Vérifier que les deux utilisateurs existent
            const fromUser = await User.findOne({ where: { discordId: fromDiscordId } });
            const toUser = await User.findOne({ where: { discordId: toDiscordId } });
            
            if (!fromUser || !toUser) {
                throw new Error('Un des utilisateurs est introuvable');
            }

            // Effectuer le transfert
            await this.removeCurrency(fromDiscordId, currencyType, amount, `Transfert vers ${toUser.username}`);
            await this.addCurrency(toDiscordId, currencyType, amount, `Transfert de ${fromUser.username}`);

            logger.info(`[TRANSFERT] ${amount} ${currencyType} de ${fromUser.username} vers ${toUser.username}. Raison: ${reason}`);

            this.transactions.delete(transactionId);
            return {
                success: true,
                from: fromUser,
                to: toUser,
                amount,
                currencyType
            };
        } catch (error) {
            this.transactions.delete(transactionId);
            throw error;
        }
    }
}

// Export singleton
export default new EconomySystem();
