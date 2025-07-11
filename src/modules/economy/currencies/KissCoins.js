// Classe représentant les KissCoins - Monnaie de base

export default class KissCoins {
    constructor() {
        this.name = 'KissCoins';
        this.symbol = '💋';
        this.shortCode = 'KC';
        this.color = 0xFF69B4; // Rose
        this.description = 'La monnaie de base du serveur, gagnée par l\'activité quotidienne';
        
        // Moyens de gagner des KissCoins
        this.earnMethods = {
            message: 5,          // Par message envoyé
            reaction: 2,         // Par réaction reçue
            voiceMinute: 1,      // Par minute en vocal
            daily: 100,          // Récompense quotidienne de base
            levelUp: 50,         // Par niveau gagné (multiplié par le niveau)
            achievement: 100,    // Par achievement débloqué
            event: 200          // Participation à un événement
        };
        
        // Limites quotidiennes
        this.dailyLimits = {
            message: 500,        // Max 100 messages par jour
            reaction: 100,       // Max 50 réactions par jour
            voiceMinute: 300     // Max 5 heures en vocal
        };
    }

    /**
     * Calculer la récompense selon l'action
     */
    calculateReward(action, multiplier = 1) {
        const baseReward = this.earnMethods[action] || 0;
        return Math.floor(baseReward * multiplier);
    }

    /**
     * Formater le montant avec le symbole
     */
    format(amount) {
        return `${this.symbol} ${amount.toLocaleString()} ${this.shortCode}`;
    }

    /**
     * Obtenir la description détaillée
     */
    getDetailedInfo() {
        return {
            name: this.name,
            symbol: this.symbol,
            shortCode: this.shortCode,
            color: this.color,
            description: this.description,
            earnMethods: Object.entries(this.earnMethods).map(([method, amount]) => ({
                method,
                amount,
                description: this.getMethodDescription(method)
            })),
            dailyLimits: this.dailyLimits
        };
    }

    /**
     * Descriptions des méthodes pour gagner des KissCoins
     */
    getMethodDescription(method) {
        const descriptions = {
            message: 'Envoyer un message',
            reaction: 'Recevoir une réaction',
            voiceMinute: 'Passer du temps en vocal',
            daily: 'Récompense quotidienne',
            levelUp: 'Monter de niveau',
            achievement: 'Débloquer un achievement',
            event: 'Participer à un événement'
        };
        return descriptions[method] || 'Méthode inconnue';
    }
}
