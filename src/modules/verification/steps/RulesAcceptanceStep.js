class RulesAcceptanceStep {
    constructor() {
        this.name = 'Règlement du Serveur';
        this.emoji = '📜';
        this.rules = [
            {
                title: "Règle #1 : Respect et Consentement 💕",
                description: "Tout le monde doit se sentir à l'aise. Le consentement est roi !",
                icon: "❤️"
            },
            {
                title: "Règle #2 : Discrétion Absolue 🤫",
                description: "Ce qui se passe ici, reste ici. Pas de screenshots !",
                icon: "🔒"
            },
            {
                title: "Règle #3 : Ambiance Torride Garantie 🔥",
                description: "Laissez votre timidité à la porte, ici on s'amuse !",
                icon: "🌶️"
            },
            {
                title: "Règle #4 : Roleplay Encouragé 🎭",
                description: "Incarnez vos fantasmes, explorez vos désirs...",
                icon: "😈"
            },
            {
                title: "Règle #5 : Âge Minimum 18+ 🔞",
                description: "Strictement réservé aux adultes. Aucune exception !",
                icon: "⛔"
            }
        ];
    }
    
    async execute(interaction, personality) {
        // Création d'un embed gamifié avec les règles
        return {
            rules: this.rules,
            personality: personality,
            requiresAcceptance: true
        };
    }
    
    formatRules() {
        return this.rules.map(rule => 
            `${rule.icon} **${rule.title}**\n└ ${rule.description}`
        ).join('\n\n');
    }
}

module.exports = RulesAcceptanceStep;
