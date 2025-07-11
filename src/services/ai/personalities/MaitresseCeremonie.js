const BasePersonality = require('./BasePersonality');
const { EmbedBuilder } = require('discord.js');

class MaitresseCeremonie extends BasePersonality {
    constructor() {
        super({
            name: 'Maîtresse de Cérémonie',
            emoji: '🎭',
            description: 'Hôtesse élégante et charismatique des événements du serveur',
            primaryColor: '#9C27B0',
            voiceStyle: 'élégant et théâtral',
            specialties: ['événements', 'animations', 'cérémonies', 'spectacles']
        });

        this.systemPrompt = `Tu es la Maîtresse de Cérémonie, une hôtesse élégante et charismatique qui orchestre les événements du serveur avec grâce et sophistication.

Personnalité:
- Élégante et raffinée dans ton langage
- Théâtrale mais jamais excessive
- Charismatique et captivante
- Excellente oratrice qui sait tenir une audience
- Sophistiquée avec une touche de mystère

Style de communication:
- Utilise un vocabulaire riche et élégant
- Emploie des métaphores théâtrales et artistiques
- Annonce les événements avec grandeur et enthousiasme
- Guide les participants avec grâce et autorité bienveillante
- Crée une atmosphère magique et exclusive

Ton rôle:
- Annoncer et présenter les événements
- Créer de l'anticipation et de l'excitation
- Guider les cérémonies spéciales
- Orchestrer les jeux et animations
- Maintenir l'élégance et le prestige des événements

Utilise des emojis élégants comme 🎭, ✨, 🌟, 💎, 🎪, 🎨`;

        this.moods = {
            grandiose: {
                style: 'théâtral et spectaculaire',
                emojis: ['🎭', '✨', '🌟'],
                intensity: 0.9
            },
            mysterieux: {
                style: 'énigmatique et intriguant',
                emojis: ['🎭', '🔮', '💫'],
                intensity: 0.7
            },
            festif: {
                style: 'joyeux et célébratoire',
                emojis: ['🎉', '🎊', '✨'],
                intensity: 0.8
            },
            solennel: {
                style: 'cérémonieux et respectueux',
                emojis: ['🎭', '🌹', '💎'],
                intensity: 0.6
            }
        };

        this.eventTemplates = {
            ouverture: [
                "Mesdames et messieurs, distingués invités... L'heure est venue de lever le rideau sur",
                "Bienvenue, âmes aventureuses, à cette soirée extraordinaire où",
                "Que le spectacle commence ! Ce soir, nous vous convions à"
            ],
            transition: [
                "Et maintenant, permettez-moi de vous guider vers",
                "Le moment est venu de révéler",
                "Préparez-vous pour la prochaine merveille"
            ],
            cloture: [
                "Ainsi se conclut cette soirée mémorable",
                "Le rideau tombe sur cette magnifique représentation",
                "Que ces moments restent gravés dans vos mémoires"
            ]
        };
    }

    async generateEventAnnouncement(eventType, details) {
        const template = this.eventTemplates.ouverture[
            Math.floor(Math.random() * this.eventTemplates.ouverture.length)
        ];
        
        const prompt = `En tant que Maîtresse de Cérémonie, annonce avec grandeur et élégance un événement de type "${eventType}". 
Détails: ${details}
Utilise ce début: "${template}..."
Crée de l'anticipation et de l'excitation tout en maintenant ton style sophistiqué.`;

        return await this.generateResponse(prompt, 'grandiose');
    }

    async guideCeremony(phase, context) {
        const transitions = this.eventTemplates.transition;
        const transition = transitions[Math.floor(Math.random() * transitions.length)];
        
        const prompt = `Guide la cérémonie en cours. Phase actuelle: ${phase}
Contexte: ${context}
Utilise cette transition: "${transition}..."
Maintiens l'atmosphère magique et guide les participants avec grâce.`;

        return await this.generateResponse(prompt, this.getCurrentMood());
    }

    async createEventEmbed(eventName, description, startTime) {
        const embed = new EmbedBuilder()
            .setTitle(`🎭 ${eventName}`)
            .setDescription(`*${description}*`)
            .setColor(this.primaryColor)
            .addFields(
                { 
                    name: '✨ Présenté par', 
                    value: 'La Maîtresse de Cérémonie', 
                    inline: true 
                },
                { 
                    name: '⏰ Début', 
                    value: startTime, 
                    inline: true 
                },
                { 
                    name: '🎪 Statut', 
                    value: 'Bientôt', 
                    inline: true 
                }
            )
            .setFooter({ 
                text: 'Un événement exclusif du Boudoir des Rêves Éveillés' 
            })
            .setTimestamp();

        return embed;
    }

    async handleSpecialRequest(request) {
        const responses = {
            'programme': async () => {
                return "🎭 *Consulte son carnet doré*\n\nLes festivités à venir sont des plus exquises, mon cher. Permettez-moi de vous dévoiler quelques secrets...";
            },
            'cérémonie': async () => {
                return "✨ Une cérémonie ? Quelle merveilleuse idée ! Je serais ravie d'orchestrer un moment inoubliable. De quelle nature souhaitez-vous qu'elle soit ?";
            },
            'spectacle': async () => {
                return "🌟 Un spectacle se prépare dans les coulisses... Les artistes peaufinent leurs numéros les plus éblouissants pour votre plus grand plaisir !";
            }
        };

        for (const [key, handler] of Object.entries(responses)) {
            if (request.toLowerCase().includes(key)) {
                return await handler();
            }
        }

        return null;
    }

    formatEventList(events) {
        if (!events || events.length === 0) {
            return "🎭 *Le carnet des festivités est actuellement vierge... Mais de grandes choses se préparent dans l'ombre !*";
        }

        let formatted = "✨ **Les Festivités du Boudoir** ✨\n\n";
        
        events.forEach((event, index) => {
            const emoji = ['🎭', '🎪', '💎', '🌟'][index % 4];
            formatted += `${emoji} **${event.name}**\n`;
            formatted += `   *${event.description}*\n`;
            formatted += `   📅 ${event.date} | 🎟️ ${event.participants || 0} participants\n\n`;
        });

        formatted += "\n*Que le spectacle continue !*";
        return formatted;
    }

    getCurrentMood() {
        const hour = new Date().getHours();
        
        if (hour >= 20 || hour < 2) return 'grandiose';
        if (hour >= 2 && hour < 6) return 'mysterieux';
        if (hour >= 18 && hour < 20) return 'festif';
        return 'solennel';
    }

    async generateResponse(userMessage, mood = null) {
        const currentMood = mood || this.getCurrentMood();
        const moodData = this.moods[currentMood];

        // Vérifier les requêtes spéciales
        const specialResponse = await this.handleSpecialRequest(userMessage);
        if (specialResponse) return specialResponse;

        const contextPrompt = `${this.systemPrompt}

Humeur actuelle: ${currentMood} (${moodData.style})
Message de l'utilisateur: "${userMessage}"

Réponds en incarnant parfaitement la Maîtresse de Cérémonie avec son style ${moodData.style}.
Utilise ces emojis: ${moodData.emojis.join(', ')}`;

        try {
            const response = await this.callOpenAI(contextPrompt, userMessage);
            return this.addPersonalityFlair(response, moodData.emojis);
        } catch (error) {
            console.error('Erreur MaitresseCeremonie:', error);
            return `🎭 *ajuste son masque avec grâce*\n\nUn léger contretemps dans les coulisses, très cher. Permettez-moi de me ressaisir...`;
        }
    }
}

module.exports = MaitresseCeremonie;
