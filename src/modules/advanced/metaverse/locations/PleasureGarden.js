/**
 * Jardin des Plaisirs - Oasis de sensualité et de romance
 */
class PleasureGarden {
    constructor() {
        this.name = 'Jardin des Plaisirs';
        this.emoji = '🌺';
        this.description = `
🌺 **JARDIN DES PLAISIRS** 🌺

Un paradis verdoyant où les fleurs exotiques exhalent des parfums aphrodisiaques.
Les allées sinueuses cachent des alcôves intimes pour les amoureux...
Le murmure de la cascade masque les soupirs de plaisir.

🌸 **Points d'intérêt :**
• Labyrinthe de l'Amour 💕
• Serre aux Orchidées 🌺
• Pavillon des Massages 💆
• Étang aux Nénuphars 🪷

🌿 **Directions :**
→ **Sud** : Place Centrale 🏛️
→ **Est** : Grotte Secrète 🕳️

🏡 *Propriété disponible* : Pavillon Romantique (75,000 💋)
        `;
        this.connections = {
            sud: 'centralPlace',
            est: null // Peut être étendu plus tard
        };
        this.propertyPrice = 75000;
        this.propertyName = 'Pavillon Romantique';
        this.hasProperty = false;
        this.activities = [
            'Cueillir des fleurs aphrodisiaques (+150 XP)',
            'Méditer près de la cascade (+100 Karma)',
            'Organiser un pique-nique coquin (+200 💋)',
            'Explorer le labyrinthe (Mystère!)'
        ];
        this.secretSpots = {
            labyrinthe: { discovered: false, reward: 500 },
            grotte: { discovered: false, reward: 1000 }
        };
    }

    getDescription() {
        let desc = this.description;
        if (this.hasProperty) {
            desc += `\n🏡 *Vous possédez le ${this.propertyName} !*`;
        }
        
        // Afficher les spots secrets découverts
        if (this.secretSpots.labyrinthe.discovered) {
            desc += '\n🗝️ *Secret découvert : Centre du Labyrinthe !*';
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
        this.hasProperty = true;
        return `✅ Félicitations ! Vous êtes propriétaire du **${this.propertyName}** ! 🎉\n` +
               `🌺 Cette propriété romantique vous rapporte 750 💋/jour et attire les couples !`;
    }

    doActivity(activityIndex) {
        if (activityIndex < 0 || activityIndex >= this.activities.length) {
            return { success: false, message: 'Activité invalide !' };
        }

        let reward = { xp: 0, coins: 0, karma: 0 };

        switch(activityIndex) {
            case 0: // Cueillir des fleurs
                reward.xp = 150;
                return {
                    success: true,
                    message: '🌺 Vous cueillez des fleurs aux propriétés... intéressantes. Leur parfum vous enivre !',
                    reward,
                    special: 'Vous obtenez : Bouquet Aphrodisiaque 💐'
                };
                
            case 1: // Méditer
                reward.karma = 100;
                return {
                    success: true,
                    message: '🧘 La cascade apaise vos sens... Vous atteignez un état de plénitude sensuelle.',
                    reward
                };
                
            case 2: // Pique-nique
                reward.coins = 200;
                return {
                    success: true,
                    message: '🧺 Votre pique-nique attire des convives charmants ! L\'ambiance devient... torride.',
                    reward
                };
                
            case 3: // Explorer le labyrinthe
                if (!this.secretSpots.labyrinthe.discovered) {
                    this.secretSpots.labyrinthe.discovered = true;
                    reward.coins = this.secretSpots.labyrinthe.reward;
                    return {
                        success: true,
                        message: '🗝️ **DÉCOUVERTE !** Au centre du labyrinthe, vous trouvez la Fontaine des Désirs !\n' +
                                '✨ Les pièces jetées par les amoureux vous enrichissent !',
                        reward,
                        achievement: 'Explorateur du Labyrinthe'
                    };
                } else {
                    return {
                        success: true,
                        message: '💕 Vous retrouvez la Fontaine des Désirs. Des couples s\'y embrassent passionnément.',
                        reward: { coins: 50 }
                    };
                }
        }
    }

    getRandomEvent() {
        const events = [
            '🦋 Un papillon aux ailes irisées se pose sur votre épaule... Il semble vous guider quelque part.',
            '💏 Un couple s\'embrasse passionnément dans une alcôve. Ils vous invitent à les rejoindre...',
            '🌹 Les roses du jardin s\'ouvrent soudainement, libérant un parfum enivrant !',
            '🧚‍♀️ Une fée coquine apparaît et vous lance un clin d\'œil avant de disparaître.',
            '🍃 Le vent soulève les pétales, créant une danse sensuelle autour de vous.'
        ];

        // 25% de chance d'événement (plus fréquent que la place centrale)
        if (Math.random() < 0.25) {
            return events[Math.floor(Math.random() * events.length)];
        }
        return null;
    }

    /**
     * Interactions spéciales avec les éléments du jardin
     * @param {string} element - L'élément avec lequel interagir
     * @returns {Object} Résultat de l'interaction
     */
    interact(element) {
        const interactions = {
            'cascade': {
                message: '💧 Vous passez la main dans l\'eau fraîche... Une sensation de bien-être vous envahit.',
                effect: 'Régénération +50 HP'
            },
            'orchidées': {
                message: '🌺 Les orchidées réagissent à votre présence en s\'ouvrant davantage.',
                effect: 'Charisme +10 pour 1h'
            },
            'banc': {
                message: '💑 Vous vous asseyez sur le banc des amoureux. Il est encore tiède...',
                effect: 'Chance en amour +20%'
            }
        };

        return interactions[element] || { message: 'Rien de spécial ici.', effect: null };
    }
}

module.exports = PleasureGarden;
