/**
 * Villa des Mystères - Demeure énigmatique aux mille secrets
 */
class MysteryVilla {
    constructor() {
        this.name = 'Villa des Mystères';
        this.emoji = '🏰';
        this.description = `
🏰 **VILLA DES MYSTÈRES** 🏰

Une demeure gothique se dresse devant vous, voilée de brume mystique.
Les portes s'ouvrent d'elles-mêmes, révélant des couloirs sombres éclairés de bougies...
Des murmures sensuels s'échappent des chambres closes.

🕯️ **Salles Mystérieuses :**
• Bibliothèque Interdite 📚
• Salon des Masques 🎭
• Chambre des Miroirs 🪞
• Cave aux Secrets 🍷

🗝️ **Énigmes à résoudre :**
• Le Code du Plaisir (Facile)
• La Clé du Désir (Moyen)
• Le Rituel Ancien (Difficile)

🌫️ **Directions :**
→ **Est** : Place Centrale 🏛️
→ **Bas** : Crypte Secrète 💀

🏰 *Propriété disponible* : Aile Privée (150,000 💋)
        `;
        this.connections = {
            est: 'centralPlace',
            bas: null // Crypte secrète verrouillée
        };
        this.propertyPrice = 150000;
        this.propertyName = 'Aile Privée de la Villa';
        this.hasProperty = false;
        this.riddles = {
            easy: { 
                solved: false, 
                question: 'Je grandis quand on me nourrit, je meurs quand on me mouille. Qui suis-je ?',
                answer: 'feu',
                reward: 500 
            },
            medium: { 
                solved: false, 
                question: 'Plus tu en prends, plus tu en laisses derrière toi. Qu\'est-ce ?',
                answer: 'pas',
                reward: 1000 
            },
            hard: { 
                solved: false, 
                question: 'Je suis désir quand je suis caché, plaisir quand je suis révélé. Qui suis-je ?',
                answer: 'secret',
                reward: 2500 
            }
        };
        this.roomsUnlocked = {
            library: false,
            maskRoom: false,
            mirrorRoom: false,
            cellar: false
        };
    }

    getDescription() {
        let desc = this.description;
        if (this.hasProperty) {
            desc += `\n🏰 *Vous possédez l'${this.propertyName} !*`;
            desc += '\n✨ *Les fantômes vous servent fidèlement...*';
        }
        
        // Afficher les salles débloquées
        const unlockedRooms = Object.entries(this.roomsUnlocked)
            .filter(([_, unlocked]) => unlocked)
            .map(([room, _]) => room);
            
        if (unlockedRooms.length > 0) {
            desc += '\n\n🗝️ **Salles débloquées :**';
            unlockedRooms.forEach(room => {
                desc += `\n• ${this.getRoomName(room)}`;
            });
        }
        
        return desc;
    }

    getRoomName(room) {
        const names = {
            library: '📚 Bibliothèque Interdite',
            maskRoom: '🎭 Salon des Masques',
            mirrorRoom: '🪞 Chambre des Miroirs',
            cellar: '🍷 Cave aux Secrets'
        };
        return names[room] || room;
    }

    move(direction) {
        const normalizedDirection = direction.toLowerCase();
        if (normalizedDirection === 'bas' && !this.roomsUnlocked.cellar) {
            return null; // Crypte verrouillée
        }
        return this.connections[normalizedDirection] || null;
    }

    buyProperty() {
        if (this.hasProperty) {
            return `❌ Vous possédez déjà l'${this.propertyName} !`;
        }
        this.hasProperty = true;
        return `✅ Félicitations ! Vous êtes maintenant maître de l'**${this.propertyName}** ! 🎉\n` +
               `🏰 Les esprits de la villa reconnaissent votre autorité.\n` +
               `👻 Revenus mystérieux : 1500 💋/jour + bonus aléatoires !`;
    }

    /**
     * Résout une énigme de la villa
     * @param {string} difficulty - Difficulté de l'énigme (easy, medium, hard)
     * @param {string} answer - Réponse proposée
     * @returns {Object} Résultat
     */
    solveRiddle(difficulty, answer) {
        const riddle = this.riddles[difficulty];
        if (!riddle) {
            return { success: false, message: 'Cette énigme n\'existe pas !' };
        }
        
        if (riddle.solved) {
            return { success: false, message: 'Vous avez déjà résolu cette énigme !' };
        }
        
        if (answer.toLowerCase() === riddle.answer) {
            riddle.solved = true;
            
            // Débloquer une salle selon la difficulté
            if (difficulty === 'easy') this.roomsUnlocked.library = true;
            else if (difficulty === 'medium') this.roomsUnlocked.maskRoom = true;
            else if (difficulty === 'hard') this.roomsUnlocked.cellar = true;
            
            return {
                success: true,
                message: `🎉 **CORRECT !** L'énigme est résolue !\n` +
                        `🗝️ Une nouvelle salle s'ouvre à vous...\n` +
                        `💰 Récompense : ${riddle.reward} 💋`,
                reward: { coins: riddle.reward },
                achievement: `Maître des Énigmes (${difficulty})`
            };
        } else {
            return {
                success: false,
                message: '❌ Ce n\'est pas la bonne réponse... Les murs murmurent leur déception.'
            };
        }
    }

    /**
     * Explore une salle spécifique
     * @param {string} roomName - Nom de la salle
     * @returns {Object} Description et résultat
     */
    exploreRoom(roomName) {
        if (!this.roomsUnlocked[roomName]) {
            return { 
                success: false, 
                message: '🔒 Cette salle est verrouillée. Résolvez les énigmes pour l\'ouvrir !' 
            };
        }

        const rooms = {
            library: {
                description: '📚 La Bibliothèque Interdite regorge de livres aux contenus... troublants.',
                event: 'Vous trouvez un grimoire de sorts sensuels !',
                reward: { xp: 300, item: 'Grimoire Érotique' }
            },
            maskRoom: {
                description: '🎭 Le Salon des Masques est rempli de visages mystérieux qui semblent vous observer.',
                event: 'Un masque vous appelle... En le portant, vous ressentez une vague de désir !',
                reward: { coins: 500, effect: 'Charisme +50% (1h)' }
            },
            mirrorRoom: {
                description: '🪞 La Chambre des Miroirs reflète vos désirs les plus profonds...',
                event: 'Votre reflet vous sourit et vous tend la main. Vous découvrez un passage secret !',
                reward: { coins: 1000, secret: 'Passage vers la Tour Interdite' }
            },
            cellar: {
                description: '🍷 La Cave aux Secrets abrite des millésimes aux propriétés... particulières.',
                event: 'Vous goûtez un vin millénaire. Vos sens s\'aiguisent, votre corps frissonne !',
                reward: { xp: 500, effect: 'Perception +100% (30min)' }
            }
        };

        const room = rooms[roomName];
        if (!room) {
            return { success: false, message: 'Cette salle n\'existe pas !' };
        }

        return {
            success: true,
            description: room.description,
            event: room.event,
            reward: room.reward
        };
    }

    /**
     * Rituel mystérieux (nécessite tous les secrets débloqués)
     * @returns {Object} Résultat du rituel
     */
    performRitual() {
        const allRiddlesSolved = Object.values(this.riddles).every(r => r.solved);
        const allRoomsUnlocked = Object.values(this.roomsUnlocked).every(r => r);
        
        if (!allRiddlesSolved || !allRoomsUnlocked) {
            return {
                success: false,
                message: '🕯️ Le rituel nécessite que tous les mystères soient résolus...'
            };
        }

        return {
            success: true,
            message: '✨ **LE GRAND RITUEL EST ACCOMPLI !** ✨\n' +
                    '🌟 La villa tremble... Les murs s\'illuminent...\n' +
                    '👁️ Un portail vers une dimension de plaisir infini s\'ouvre !\n' +
                    '🎁 Vous êtes maintenant Maître Absolu des Mystères !',
            reward: { 
                coins: 10000, 
                xp: 5000,
                title: 'Maître des Mystères',
                special: 'Accès au Portail Dimensionnel'
            },
            achievement: 'Grand Maître de la Villa'
        };
    }

    getRandomEvent() {
        const events = [
            '👻 Un fantôme séduisant traverse le mur en vous faisant un clin d\'œil...',
            '🕯️ Les bougies vacillent, formant des ombres suggestives sur les murs.',
            '🎵 Une mélodie envoûtante résonne dans les couloirs, vous attirant vers l\'inconnu.',
            '📜 Un parchemin apparaît sur la table : "Les plaisirs les plus grands se cachent dans l\'ombre..."',
            '🌹 Une rose noire se matérialise dans votre main, son parfum est... troublant.'
        ];

        // 35% de chance d'événement (lieu le plus mystérieux)
        if (Math.random() < 0.35) {
            return events[Math.floor(Math.random() * events.length)];
        }
        return null;
    }

    /**
     * Interaction avec les entités de la villa
     * @param {string} entity - L'entité avec laquelle interagir
     * @returns {Object} Résultat de l'interaction
     */
    interactWithEntity(entity) {
        const entities = {
            'fantôme': {
                message: '👻 Le fantôme vous murmure des secrets oubliés du plaisir ancien...',
                effect: 'Sagesse +10',
                chance: 0.7
            },
            'miroir': {
                message: '🪞 Votre reflet vous montre votre moi le plus désirable...',
                effect: 'Confiance +20',
                chance: 0.8
            },
            'statue': {
                message: '🗿 La statue s\'anime brièvement et vous embrasse !',
                effect: 'Passion +30',
                chance: 0.5
            },
            'grimoire': {
                message: '📖 Les pages tournent seules, révélant un sort de séduction...',
                effect: 'Nouveau sort appris',
                chance: 0.6
            }
        };

        const entityData = entities[entity.toLowerCase()];
        if (!entityData) {
            return { success: false, message: 'Cette entité n\'existe pas ici.' };
        }

        if (Math.random() < entityData.chance) {
            return {
                success: true,
                message: entityData.message,
                effect: entityData.effect
            };
        } else {
            return {
                success: false,
                message: 'L\'entité reste silencieuse... Peut-être une autre fois.'
            };
        }
    }
}

module.exports = MysteryVilla;
