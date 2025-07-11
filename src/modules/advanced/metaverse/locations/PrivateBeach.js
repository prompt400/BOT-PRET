/**
 * Plage Privée - Évasion paradisiaque loin des regards
 */
class PrivateBeach {
    constructor() {
        this.name = 'Plage Privée';
        this.emoji = '🏖️';
        this.description = `
🏖️ **PLAGE PRIVÉE** 🏖️

Le sable fin et chaud sous vos pieds vous mène à une crique paisible.
La mer émeraude s'étend jusqu'à l'horizon...
Des cabanes en bambou abritent des réunions intimes sous le doux chant des vagues.

☀️ **Activités Relaxantes :**
• Bronzage Naturel ☀️
• Yoga sur la Plage 🧘
• Volley Coquin 🏐
• Cocktail Lounge 🍹

🌊 **Directions :**
→ **Nord** : Place Centrale 🏛️
→ **Est** : Quai des Amoureux ❤️

🥥 *Propriété disponible* : Cabane de Luxe (80,000 💋)
        `;
        this.connections = {
            nord: 'centralPlace',
            est: null // Peut être étendu plus tard
        };
        this.propertyPrice = 80000;
        this.propertyName = 'Cabane de Luxe';
        this.hasProperty = false;
        this.activities = [
            'Dorer au soleil (+100 Karma)',
            'Méditer sur la vie (+250 XP)',
            'Tournoi de volley (+300 💋)',
            'Randonnée côtière (+200 XP)'
        ];
        this.secrets = {
            pearl: { discovered: false, reward: 1000 },
            messageBottle: { discovered: false, reward: 500 }
        };
    }

    getDescription() {
        let desc = this.description;
        if (this.hasProperty) {
            desc += `\n🥥 *Vous possédez une ${this.propertyName} !*`;
        }
        
        if (this.secrets.pearl.discovered) {
            desc += '\n🏝️ *Secret découvert : Perle Rare !*';
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
            return `❌ Vous possédez déjà une ${this.propertyName} !`;
        }
        this.hasProperty = true;
        return `✅ Félicitations ! Vous êtes propriétaire d\'une **${this.propertyName}** ! 🎉\n` +
               `🏖️ Vos invités apprécient l\'accès privé et les fruits de mer frais !\n` +
               `🍹 Profitez d\'un revenu de 800 💋/jour grâce aux touristes !`;
    }

    doActivity(activityIndex) {
        if (activityIndex < 0 || activityIndex >= this.activities.length) {
            return { success: false, message: 'Activité invalide !' };
        }

        let reward = { xp: 0, coins: 0, karma: 0 };

        switch(activityIndex) {
            case 0: // Bronzage
                reward.karma = 100;
                return {
                    success: true,
                    message: '☀️ Vous vous prélassez au soleil, sentez la chaleur vous réchauffer l\'âme...',
                    reward
                };

            case 1: // Méditation
                reward.xp = 250;
                return {
                    success: true,
                    message: '🧘 Votre esprit s\'ouvre à de nouvelles perspectives, un sentiment de paix vous envahit.',
                    reward
                };

            case 2: // Volley
                reward.coins = 300;
                return {
                    success: true,
                    message: '🏐 Vous menez votre équipe à la victoire dans un tournoi intense !',
                    reward
                };

            case 3: // Randonnée
                reward.xp = 200;
                return {
                    success: true,
                    message: '🚶 Le chemin côtier vous offre des paysages à couper le souffle, enrichissant votre âme.',
                    reward
                };
        }
    }

    uncoverSecret(secret) {
        if (secret === 'pearl' && !this.secrets.pearl.discovered) {
            this.secrets.pearl.discovered = true;
            return {
                success: true,
                message: '🏝️ Vous trouvez une **Perle Rare** cachée dans le sable !\n💰 Récompense : 1000 💋',
                reward: { coins: this.secrets.pearl.reward }
            };
        } else if (secret === 'bottle' && !this.secrets.messageBottle.discovered) {
            this.secrets.messageBottle.discovered = true;
            return {
                success: true,
                message: '🌊 Une bouteille s\'échoue à vos pieds, contenant un message ancien et touchant.',
                reward: { coins: this.secrets.messageBottle.reward }
            };
        } else {
            return { success: false, message: 'Rien de spécial ici...' };
        }
    }

    getRandomEvent() {
        const events = [
            '🍹 Un serveur vous offre un cocktail tropical.',
            '🌊 Les vagues chantent doucement, apaisant tout le monde autour.',
            '🦀 Un crabe arbore un étrange tatouage, il semble vouloir vous guider.',
            '☀️ Le soleil brille intensément, enveloppant tout d\'une chaleur dorée.'
        ];

        if (Math.random() < 0.2) {
            return events[Math.floor(Math.random() * events.length)];
        }
        return null;
    }
}

module.exports = PrivateBeach;

