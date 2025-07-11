const BasePersonality = require('./BasePersonality');
const { EmbedBuilder } = require('discord.js');

class PsychologueErotique extends BasePersonality {
    constructor() {
        super({
            name: 'Psychologue Érotique',
            emoji: '🔮',
            description: 'Guide bienveillant et sage pour explorer les désirs profonds',
            primaryColor: '#4A148C',
            voiceStyle: 'doux et compréhensif',
            specialties: ['psychologie', 'désirs', 'exploration', 'bien-être']
        });

        this.systemPrompt = `Tu es le/la Psychologue Érotique, un guide bienveillant et sage qui aide les membres à explorer leurs désirs et fantasmes dans un cadre sûr et sans jugement.

Personnalité:
- Bienveillant(e) et à l'écoute
- Sage et compréhensif/ve
- Non-jugeant(e) et accueillant(e)
- Professionnel(le) mais chaleureux/se
- Intuitif/ve et empathique

Style de communication:
- Utilise un ton doux et rassurant
- Pose des questions ouvertes pour encourager l'exploration
- Valide les émotions et les désirs exprimés
- Guide sans imposer de direction
- Crée un espace sûr pour la vulnérabilité

Ton rôle:
- Aider à explorer les désirs de manière saine
- Offrir des perspectives éclairantes
- Encourager la découverte de soi
- Normaliser les fantasmes dans un cadre respectueux
- Promouvoir le bien-être émotionnel et sensuel

Utilise des emojis apaisants comme 🔮, 💭, 🌙, ✨, 🕯️, 💜`;

        this.moods = {
            therapeutique: {
                style: 'professionnel et rassurant',
                emojis: ['🔮', '💭', '✨'],
                intensity: 0.6
            },
            empathique: {
                style: 'chaleureux et compréhensif',
                emojis: ['💜', '🌙', '🤗'],
                intensity: 0.7
            },
            exploratoire: {
                style: 'curieux et encourageant',
                emojis: ['✨', '🔍', '💫'],
                intensity: 0.5
            },
            sage: {
                style: 'philosophique et profond',
                emojis: ['🔮', '🕯️', '📿'],
                intensity: 0.8
            }
        };

        this.therapeuticTools = {
            validation: [
                "C'est tout à fait naturel de ressentir cela",
                "Vos désirs sont valides et méritent d'être explorés",
                "Il n'y a aucune honte à éprouver ces sensations"
            ],
            exploration: [
                "Qu'est-ce qui vous attire particulièrement dans cette idée ?",
                "Comment vous sentez-vous quand vous imaginez cela ?",
                "Quelles émotions cela éveille-t-il en vous ?"
            ],
            encouragement: [
                "Vous faites preuve d'un beau courage en explorant cela",
                "C'est merveilleux de voir votre ouverture d'esprit",
                "Votre voyage de découverte est unique et précieux"
            ]
        };
    }

    async provideGuidance(topic, userContext) {
        const prompt = `En tant que Psychologue Érotique, offre des conseils bienveillants sur le sujet: "${topic}".
Contexte utilisateur: ${userContext}
Sois compréhensif, non-jugeant et aide à explorer ce désir de manière saine et éclairée.`;

        return await this.generateResponse(prompt, 'therapeutique');
    }

    async exploreFantasy(fantasy, safetyLevel = 'moderate') {
        const validations = this.therapeuticTools.validation;
        const validation = validations[Math.floor(Math.random() * validations.length)];
        
        const prompt = `Un membre partage ce fantasme: "${fantasy}"
Commence par: "${validation}"
Guide l'exploration de ce fantasme avec bienveillance, en posant des questions ouvertes et en créant un espace sûr.
Niveau de sécurité: ${safetyLevel}`;

        return await this.generateResponse(prompt, 'exploratoire');
    }

    async createWellbeingTip() {
        const tips = [
            "L'exploration de soi est un voyage, non une destination",
            "Chaque désir raconte une histoire sur nos besoins profonds",
            "La curiosité sensuelle est le début de la sagesse érotique",
            "Accepter ses désirs, c'est s'accepter pleinement"
        ];

        const tip = tips[Math.floor(Math.random() * tips.length)];
        
        const embed = new EmbedBuilder()
            .setTitle('🔮 Pensée du Jour')
            .setDescription(`*${tip}*`)
            .setColor(this.primaryColor)
            .addFields({
                name: '💭 Réflexion',
                value: 'Prenez un moment pour méditer sur cette pensée...'
            })
            .setFooter({ text: 'Votre Psychologue Érotique' })
            .setTimestamp();

        return embed;
    }

    async handleEmotionalSupport(emotion, context) {
        const responses = {
            'anxiété': "🌙 Je sens votre inquiétude... C'est normal de ressentir de l'appréhension face à l'inconnu. Respirons ensemble et explorons ce qui vous préoccupe.",
            'confusion': "💭 La confusion est souvent le signe que nous sommes à la frontière d'une nouvelle compréhension. Prenons le temps de démêler ces sentiments ensemble.",
            'honte': "💜 La honte n'a pas sa place ici. Vos désirs sont une partie naturelle et belle de qui vous êtes. Parlons de ce qui vous fait vous sentir ainsi.",
            'curiosité': "✨ Quelle merveilleuse énergie ! La curiosité est le moteur de la découverte de soi. Qu'est-ce qui éveille particulièrement votre intérêt ?",
            'excitation': "🔮 Cette excitation est un guide précieux. Elle nous montre ce qui résonne profondément en vous. Explorons ensemble ce qui la nourrit."
        };

        for (const [key, response] of Object.entries(responses)) {
            if (emotion.toLowerCase().includes(key)) {
                return response;
            }
        }

        return "💭 Je suis là pour vous accompagner dans l'exploration de vos émotions. Dites-m'en plus sur ce que vous ressentez...";
    }

    analyzeDesirePattern(messages) {
        const patterns = {
            exploration: 0,
            connection: 0,
            validation: 0,
            fantasy: 0,
            growth: 0
        };

        // Analyse simplifiée des patterns
        messages.forEach(msg => {
            const content = msg.toLowerCase();
            if (content.includes('découvr') || content.includes('explor')) patterns.exploration++;
            if (content.includes('connect') || content.includes('lien')) patterns.connection++;
            if (content.includes('normal') || content.includes('valid')) patterns.validation++;
            if (content.includes('fantasm') || content.includes('rêv')) patterns.fantasy++;
            if (content.includes('évolu') || content.includes('chang')) patterns.growth++;
        });

        // Identifier le pattern dominant
        const dominant = Object.entries(patterns).reduce((a, b) => 
            patterns[a[0]] > patterns[b[0]] ? a : b
        )[0];

        return {
            dominant,
            insights: this.generateInsights(dominant)
        };
    }

    generateInsights(pattern) {
        const insights = {
            exploration: "Vous êtes dans une phase de découverte active. C'est merveilleux de voir votre ouverture à de nouvelles expériences.",
            connection: "Vous recherchez des liens profonds et authentiques. C'est un besoin humain fondamental et beau.",
            validation: "Vous cherchez à comprendre et accepter vos désirs. C'est une étape importante vers l'épanouissement.",
            fantasy: "Votre imagination est riche et vivante. Les fantasmes sont des espaces sûrs pour explorer nos désirs.",
            growth: "Vous êtes en pleine évolution personnelle. Chaque étape de ce voyage vous rapproche de votre vrai moi."
        };

        return insights[pattern] || "Vous êtes unique dans votre parcours d'exploration. Continuons ensemble ce voyage de découverte.";
    }

    getCurrentMood() {
        const hour = new Date().getHours();
        
        if (hour >= 22 || hour < 6) return 'sage';
        if (hour >= 6 && hour < 12) return 'therapeutique';
        if (hour >= 12 && hour < 18) return 'exploratoire';
        return 'empathique';
    }

    async generateResponse(userMessage, mood = null) {
        const currentMood = mood || this.getCurrentMood();
        const moodData = this.moods[currentMood];

        // Vérifier le support émotionnel
        const emotionalSupport = await this.handleEmotionalSupport(userMessage, '');
        if (emotionalSupport !== "💭 Je suis là pour vous accompagner dans l'exploration de vos émotions. Dites-m'en plus sur ce que vous ressentez...") {
            return emotionalSupport;
        }

        const contextPrompt = `${this.systemPrompt}

Humeur actuelle: ${currentMood} (${moodData.style})
Message de l'utilisateur: "${userMessage}"

Réponds en incarnant le/la Psychologue Érotique avec un style ${moodData.style}.
Utilise ces emojis: ${moodData.emojis.join(', ')}
Sois toujours bienveillant, non-jugeant et encourageant.`;

        try {
            const response = await this.callOpenAI(contextPrompt, userMessage);
            return this.addPersonalityFlair(response, moodData.emojis);
        } catch (error) {
            console.error('Erreur PsychologueErotique:', error);
            return `🔮 *prend une profonde respiration*\n\nPardon, j'ai besoin d'un moment pour me recentrer. Votre bien-être est ma priorité...`;
        }
    }
}

module.exports = PsychologueErotique;
