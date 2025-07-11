const { EmbedBuilder } = require('discord.js');

/**
 * EventScheduler - Gère la programmation et l'exécution des événements dans le métaverse
 */
class EventScheduler {
    constructor(client) {
        this.client = client;
        this.activeEvents = new Map();
        this.eventHistory = [];
        this.bonusMultipliers = {
            xp: 1,
            coins: 1
        };
    }

    /**
     * Démarre un événement programmé
     * @param {string} eventType - Type de l'événement
     * @param {Object} eventData - Données de l'événement
     */
    async startEvent(eventType, eventData) {
        const event = {
            id: Date.now().toString(),
            type: eventType,
            startTime: new Date(),
            duration: eventData.duration || 3600000, // 1 heure par défaut
            ...eventData
        };

        this.activeEvents.set(event.id, event);
        this.eventHistory.push(event);

        // Appliquer les bonus
        if (eventData.bonuses) {
            this.applyBonuses(eventData.bonuses);
        }

        // Annoncer l'événement
        await this.announceEvent(event);

        // Programmer la fin de l'événement
        setTimeout(() => this.endEvent(event.id), event.duration);

        return event;
    }

    /**
     * Termine un événement
     * @param {string} eventId - ID de l'événement
     */
    async endEvent(eventId) {
        const event = this.activeEvents.get(eventId);
        if (!event) return;

        // Retirer les bonus
        if (event.bonuses) {
            this.removeBonuses(event.bonuses);
        }

        this.activeEvents.delete(eventId);
        await this.announceEventEnd(event);
    }

    /**
     * Applique les bonus d'un événement
     * @param {Object} bonuses - Les bonus à appliquer
     */
    applyBonuses(bonuses) {
        if (bonuses.xpMultiplier) {
            this.bonusMultipliers.xp *= bonuses.xpMultiplier;
        }
        if (bonuses.coinsMultiplier) {
            this.bonusMultipliers.coins *= bonuses.coinsMultiplier;
        }
    }

    /**
     * Retire les bonus d'un événement
     * @param {Object} bonuses - Les bonus à retirer
     */
    removeBonuses(bonuses) {
        if (bonuses.xpMultiplier) {
            this.bonusMultipliers.xp /= bonuses.xpMultiplier;
        }
        if (bonuses.coinsMultiplier) {
            this.bonusMultipliers.coins /= bonuses.coinsMultiplier;
        }
    }

    /**
     * Annonce un événement dans tous les serveurs
     * @param {Object} event - L'événement à annoncer
     */
    async announceEvent(event) {
        const embed = new EmbedBuilder()
            .setColor(event.color || 0xFF69B4)
            .setTitle(`${event.emoji || '🎉'} ${event.name}`)
            .setDescription(event.description)
            .addFields(
                { name: '⏱️ Durée', value: `${event.duration / 60000} minutes`, inline: true },
                { name: '🎁 Bonus', value: this.formatBonuses(event.bonuses), inline: true }
            )
            .setTimestamp()
            .setFooter({ text: 'Événement spécial actif !' });

        // Envoyer dans tous les serveurs (channel d'événements)
        this.client.guilds.cache.forEach(guild => {
            const eventChannel = guild.channels.cache.find(ch => ch.name === 'événements');
            if (eventChannel) {
                eventChannel.send({ embeds: [embed] });
            }
        });
    }

    /**
     * Annonce la fin d'un événement
     * @param {Object} event - L'événement terminé
     */
    async announceEventEnd(event) {
        const embed = new EmbedBuilder()
            .setColor(0x808080)
            .setTitle(`⏹️ Fin de l'événement : ${event.name}`)
            .setDescription('L\'événement est maintenant terminé. Merci de votre participation !')
            .setTimestamp();

        this.client.guilds.cache.forEach(guild => {
            const eventChannel = guild.channels.cache.find(ch => ch.name === 'événements');
            if (eventChannel) {
                eventChannel.send({ embeds: [embed] });
            }
        });
    }

    /**
     * Formate les bonus pour l'affichage
     * @param {Object} bonuses - Les bonus à formater
     * @returns {string} Les bonus formatés
     */
    formatBonuses(bonuses) {
        if (!bonuses) return 'Aucun bonus';
        
        const parts = [];
        if (bonuses.xpMultiplier) parts.push(`XP x${bonuses.xpMultiplier}`);
        if (bonuses.coinsMultiplier) parts.push(`💋 x${bonuses.coinsMultiplier}`);
        if (bonuses.special) parts.push(bonuses.special);
        
        return parts.join('\n');
    }

    /**
     * Déclenche un événement aléatoire
     * @param {number} probability - Probabilité (0-1)
     */
    async triggerRandomEvent(probability = 0.1) {
        if (Math.random() > probability) return;

        const randomEvents = [
            {
                name: 'Flash Orgie',
                emoji: '🔥',
                description: 'Une orgie spontanée commence ! Double XP pendant 30 minutes !',
                duration: 1800000, // 30 minutes
                color: 0xFF0000,
                bonuses: { xpMultiplier: 2 }
            },
            {
                name: 'Invasion Érotique',
                emoji: '👾',
                description: 'Des créatures sensuelles envahissent le métaverse ! Battez-les pour des récompenses !',
                duration: 2400000, // 40 minutes
                color: 0x9400D3,
                bonuses: { coinsMultiplier: 1.5, special: 'Boss communautaire actif' }
            },
            {
                name: 'Pluie de GemLust',
                emoji: '💎',
                description: 'Une pluie rare de GemLust tombe du ciel ! Triple récompenses en 💋 !',
                duration: 900000, // 15 minutes
                color: 0x00FFFF,
                bonuses: { coinsMultiplier: 3 }
            }
        ];

        const event = randomEvents[Math.floor(Math.random() * randomEvents.length)];
        await this.startEvent('random', event);
    }

    /**
     * Programme les événements réguliers
     */
    scheduleRegularEvents() {
        // Soirée du vendredi (21h)
        setInterval(() => {
            const now = new Date();
            if (now.getDay() === 5 && now.getHours() === 21 && now.getMinutes() === 0) {
                this.startEvent('scheduled', {
                    name: 'Soirée Érotique du Vendredi',
                    emoji: '🎉',
                    description: 'La soirée hebdomadaire commence ! Ambiance torride garantie !',
                    duration: 7200000, // 2 heures
                    color: 0xFF1493,
                    bonuses: { xpMultiplier: 1.5, coinsMultiplier: 1.5 }
                });
            }
        }, 60000); // Vérifier chaque minute

        // Happy Hour quotidien (18h)
        setInterval(() => {
            const now = new Date();
            if (now.getHours() === 18 && now.getMinutes() === 0) {
                this.startEvent('scheduled', {
                    name: 'Happy Hour Sensuel',
                    emoji: '🍹',
                    description: 'C\'est l\'heure de l\'apéro coquin ! Bonus sur les KissCoins !',
                    duration: 3600000, // 1 heure
                    color: 0xFF8C00,
                    bonuses: { coinsMultiplier: 2 }
                });
            }
        }, 60000);

        // Déclencher des événements aléatoires toutes les heures
        setInterval(() => {
            this.triggerRandomEvent(0.2); // 20% de chance
        }, 3600000);
    }

    /**
     * Obtient la liste des événements actifs
     * @returns {Array} Liste des événements actifs
     */
    getActiveEvents() {
        return Array.from(this.activeEvents.values());
    }

    /**
     * Obtient les multiplicateurs actuels
     * @returns {Object} Les multiplicateurs de bonus
     */
    getCurrentMultipliers() {
        return { ...this.bonusMultipliers };
    }
}

module.exports = EventScheduler;
