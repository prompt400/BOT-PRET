/**
 * Place Centrale - Cœur vibrant du métaverse érotique
 */
class CentralPlace {
    constructor() {
        this.name = 'Place Centrale';
        this.emoji = '🏛️';
        this.description = `
🏛️ **PLACE CENTRALE DU PLAISIR** 🏛️

Vous êtes au cœur battant du métaverse érotique. 
La fontaine de l'Extase murmure des promesses sensuelles...
Des silhouettes mystérieuses passent, vous frôlant avec désir.

🌟 **Lieux accessibles :**
→ **Nord** : Jardin des Plaisirs 🌺
→ **Est** : Casino Érotique 🎰
→ **Sud** : Plage Privée 🏖️
→ **Ouest** : Villa des Mystères 🏰

💫 *Propriétés disponibles* : Kiosque Central (50,000 💋)
        `;
        this.connections = {
            nord: 'pleasureGarden',
            est: 'eroticCasino',
            sud: 'privateBeach',
            ouest: 'mysteryVilla'
        };
        this.propertyPrice = 50000;
        this.propertyName = 'Kiosque Central';
        this.hasProperty = false;
        this.activities = [
            'Danser à la fontaine (+100 XP)',
            'Distribuer des flyers sensuels (+50 💋)',
            'Organiser un flash mob érotique (+200 XP)'
        ];
    }

    getDescription() {
        let desc = this.description;
        if (this.hasProperty) {
            desc += `\n🏪 *Vous possédez le ${this.propertyName} !*`;
        }
        desc += '\n\n**Activités disponibles :**\n';
        this.activities.forEach(activity => {
            desc += `• ${activity}\n`;
        });
        return desc;
    }

    move(direction) {
        const normalizedDirection = direction.toLowerCase();
        return this.connections[normalizedDirection] || null;
    }

    buyProperty() {
        if (this.hasProperty) {
            return `❌ Vous possédez déjà le ${this.propertyName} !`;
        }
        // Ici on devrait vérifier l'argent du joueur
        this.hasProperty = true;
        return `✅ Félicitations ! Vous êtes maintenant propriétaire du **${this.propertyName}** ! 🎉\n` +
               `Cette propriété vous rapportera 500 💋/jour !`;
    }

    /**
     * Exécute une activité spécifique
     * @param {number} activityIndex - Index de l'activité
     * @returns {Object} Résultat de l'activité
     */
    doActivity(activityIndex) {
        if (activityIndex < 0 || activityIndex >= this.activities.length) {
            return { success: false, message: 'Activité invalide !' };
        }

        const activity = this.activities[activityIndex];
        let reward = { xp: 0, coins: 0 };

        switch(activityIndex) {
            case 0: // Danser
                reward.xp = 100;
                return {
                    success: true,
                    message: '💃 Vous dansez sensuellement près de la fontaine ! Les passants vous admirent...',
                    reward
                };
            case 1: // Flyers
                reward.coins = 50;
                return {
                    success: true,
                    message: '📜 Vous distribuez des invitations coquines... Les gens sourient et vous remercient !',
                    reward
                };
            case 2: // Flash mob
                reward.xp = 200;
                return {
                    success: true,
                    message: '🔥 Flash mob érotique lancé ! La place s\'enflamme de passion collective !',
                    reward
                };
        }
    }

    /**
     * Événements aléatoires qui peuvent se produire
     * @returns {string|null} Description de l'événement
     */
    getRandomEvent() {
        const events = [
            '💋 Une mystérieuse inconnue vous glisse un mot doux dans la poche...',
            '🎭 Un spectacle improvisé commence ! Les danseurs vous invitent à participer.',
            '✨ La fontaine s\'illumine soudainement de mille couleurs sensuelles !',
            '🌹 Quelqu\'un a laissé une rose rouge sur le banc... avec votre nom dessus.'
        ];

        // 20% de chance d'événement
        if (Math.random() < 0.2) {
            return events[Math.floor(Math.random() * events.length)];
        }
        return null;
    }
}

module.exports = CentralPlace;
