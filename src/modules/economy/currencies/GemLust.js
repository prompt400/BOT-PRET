// Classe représentant les GemLust - Monnaie spéciale

export default class GemLust {
    constructor() {
        this.name = 'GemLust';
        this.symbol = '💎';
        this.shortCode = 'GL';
        this.color = 0xFF69B4; // Rose vif
        this.description = 'Monnaie rare obtenue uniquement lors d\'événements spéciaux ou récompenses exceptionnelles.';
        
        // Moyens de gagner des GemLust
        this.earnMethods = {
            specialEventWin: 1,    // Victoire événement spécial
            leaderboardTop: 3,     // Top classement
            uniqueQuest: 2,        // Quête unique
            achievementUnlocked: 1 // Déverrouiller un succès unique
        };
        
        // Utilisations des GemLust
        this.uses = {
            legendaryItem: 100,    // Item légendaire
            foreverTitle: 150,     // Titre éternel
            themePack: 50,         // Pack thème
            megaBoost: 200,        // Boost méga 48h
            mysteryBox: 300        // Boîte mystère
        };
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
            currency: 'gemLust'
        }));
    }

    /**
     * Noms des items
     */
    getItemName(item) {
        const names = {
            legendaryItem: 'Item légendaire',
            foreverTitle: 'Titre éternel',
            themePack: 'Pack thème',
            megaBoost: 'Boost méga 48h',
            mysteryBox: 'Boîte mystère'
        };
        return names[item] || 'Item inconnu';
    }

    /**
     * Descriptions des items
     */
    getItemDescription(item) {
        const descriptions = {
            legendaryItem: 'Obtiens un item légendaire rare',
            foreverTitle: 'Titre d\'utilisateur permanent',
            themePack: 'Personnalise le look de ton interface',
            megaBoost: 'Boost immense pour une période limitée',
            mysteryBox: 'Une boîte remplie de surprises!'
        };
        return descriptions[item] || 'Description non disponible';
    }
}
