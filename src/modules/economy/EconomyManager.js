// Gestionnaire principal de l'économie du bot

class EconomyManager {
    constructor(userModel) {
        this.User = userModel;
    }

    // Convertir les monnaies entre elles
    async convertCurrency(userId, from, to, amount) {
        const user = await this.User.findByPk(userId);
        if (!user) throw new Error('Utilisateur introuvable');

        const conversionRates = {
            'kiss-flame': 100,
            'flame-gem': 100
        };

        const conversionKey = `${from}-${to}`;
        const rate = conversionRates[conversionKey];
        if (!rate) throw new Error('Conversion impossible');

        const fromAmount = user[from];
        if (fromAmount < amount) throw new Error('Pas assez de fonds');

        user[from] -= amount;
        user[to] += Math.floor(amount / rate);
        await user.save();

        return user;
    }

    // Ajouter des monnaies à un utilisateur
    async addCurrency(userId, type, amount) {
        const user = await this.User.findByPk(userId);
        if (!user) throw new Error('Utilisateur introuvable');

        user[type] += amount;
        await user.save();

        return user;
    }

    // Retirer des monnaies
    async removeCurrency(userId, type, amount) {
        const user = await this.User.findByPk(userId);
        if (!user) throw new Error('Utilisateur introuvable');

        if (user[type] < amount) throw new Error('Pas assez de fonds');

        user[type] -= amount;
        await user.save();

        return user;
    }
    
    // Récompense quotidienne pour un utilisateur
    async claimDailyReward(userId) {
        const user = await this.User.findByPk(userId);
        if (!user) throw new Error('Utilisateur introuvable');

        const now = new Date();
        const lastClaimed = user.lastDailyClaim;
        const oneDay = 24 * 60 * 60 * 1000;

        if (lastClaimed && (now - lastClaimed) < oneDay) {
            throw new Error('Récompense quotidienne déjà réclamée aujourd\'hui');
        }

        // Récompenses basées sur le jour consécutif sans interruption
        let kissCoinsReward = 100;
        let flameTokensReward = 0;

        // Logique pour récompenser davantage selon le nombre de jours consécutifs
        const consecutiveDays = user.dailyStreak || 0;
        if (consecutiveDays >= 7) flameTokensReward += 5;
        if (consecutiveDays >= 14) flameTokensReward += 10;
        if (consecutiveDays >= 30) flameTokensReward += 20;

        // Mise à jour des KissCoins et FlameTokens
        user.kissCoins += kissCoinsReward;
        user.flameTokens += flameTokensReward;

        // Réinitialiser le streak si plus d'un jour est passé
        const newStreak = (now - lastClaimed) > 2 * oneDay ? 1 : consecutiveDays + 1;
        
        // Enregistrement des infos mises à jour dans la base de données
        user.dailyStreak = newStreak;
        user.lastDailyClaim = now;
        await user.save();

        return {
            kissCoinsReward,
            flameTokensReward,
            newStreak
        };
    }

    // Obtenir le solde d'un utilisateur
    async getBalance(userId) {
        const user = await this.User.findByPk(userId);
        if (!user) throw new Error('Utilisateur introuvable');

        return {
            kissCoins: user.kissCoins,
            flameTokens: user.flameTokens,
            gemLust: user.gemLust
        };
    }
}

export default EconomyManager;

