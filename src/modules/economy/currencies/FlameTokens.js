// Classe représentant les FlameTokens - Monnaie premium

export default class FlameTokens {
    constructor() {
        this.name = 'FlameTokens';
        this.symbol = '🔥';
        this.shortCode = 'FT';
        this.color = 0xFF4500; // Orange rouge
        this.description = 'Monnaie premium obtenue par conversion ou récompenses spéciales';
        
        // Moyens de gagner des FlameTokens
        this.earnMethods = {
            conversion: 100,     // 100 KC = 1 FT
            daily7: 5,          // Récompense jour 7
            daily14: 10,        // Récompense jour 14
            daily30: 20,        // Récompense jour 30
            premiumQuest: 5,    // Quête premium
            monthlyChallenge: 15, // Défi mensuel
            donation: 10,       // Don au serveur
            specialEvent: 25    // Événement spécial
        };
        
        // Utilisations des FlameTokens
        this.uses = {
            vipAccess24h: 5,        // Accès VIP 24h
            customColor: 10,        // Couleur de nom personnalisée
            exclusiveBadge: 15,     // Badge exclusif
            priorityQueue: 3,       // File prioritaire événements
            doubleXP24h: 8,         // Double XP pendant 24h
            specialEmoji: 20,       // Emoji personnalisé
            privateChannel7d: 30    // Salon privé 7 jours
        };
    }

    /**
     * Calculer le coût de conversion depuis KissCoins
     */
    calculateConversionCost(amount) {
        return amount * this.earnMethods.conversion;
    }

    /**
     * Formater le montant avec le symbole
     */
    format(amount) {
        return `${this.symbol} ${amount.toLocaleString()} ${this.shortCode}`;
    }

    /**
     * Obtenir la liste des items achetables
     */
    getShopItems() {
        return Object.entries(this.uses).map(([item, cost]) => ({
            id: item,
            name: this.getItemName(item),
            description: this.getItemDescription(item),
            cost,
            currency: 'flameTokens'
        }));
    }

    /**
     * Noms des items
     */
    getItemName(item) {
        const names = {
            vipAccess24h: 'Accès VIP 24h',
            customColor: 'Couleur personnalisée',
            exclusiveBadge: 'Badge exclusif',
            priorityQueue: 'File prioritaire',
            doubleXP24h: 'Double XP 24h',
            specialEmoji: 'Emoji personnalisé',
            privateChannel7d: 'Salon privé 7 jours'
        };
        return names[item] || 'Item inconnu';
    }

    /**
     * Descriptions des items
     */
    getItemDescription(item) {
        const descriptions = {
            vipAccess24h: 'Accès au salon VIP pendant 24 heures',
            customColor: 'Change la couleur de ton nom pendant 30 jours',
            exclusiveBadge: 'Badge exclusif permanent sur ton profil',
            priorityQueue: 'Priorité dans les files d\'attente des événements',
            doubleXP24h: 'Double tes gains d\'XP pendant 24 heures',
            specialEmoji: 'Ajoute un emoji personnalisé au serveur',
            privateChannel7d: 'Crée ton salon privé pendant 7 jours'
        };
        return descriptions[item] || 'Description non disponible';
    }
}
