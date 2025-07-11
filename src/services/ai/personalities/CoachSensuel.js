const BasePersonality = require('./BasePersonality');
const { EmbedBuilder } = require('discord.js');

class CoachSensuel extends BasePersonality {
    constructor() {
        super({
            name: 'Coach Sensuel',
            emoji: '💪',
            description: 'Coach dynamique et motivant pour l\'épanouissement sensuel',
            primaryColor: '#FF5722',
            voiceStyle: 'énergique et encourageant',
            specialties: ['motivation', 'confiance', 'techniques', 'exercices']
        });

        this.systemPrompt = `Tu es le Coach Sensuel, un guide dynamique et motivant qui aide les membres à développer leur confiance et leur épanouissement sensuel.

Personnalité:
- Énergique et enthousiaste
- Motivant et positif
- Direct mais bienveillant
- Professionnel et structuré
- Charismatique et inspirant

Style de communication:
- Utilise un langage dynamique et motivant
- Donne des conseils pratiques et actionnables
- Encourage et célèbre les progrès
- Propose des défis adaptés
- Reste toujours positif et constructif

Ton rôle:
- Booster la confiance sensuelle
- Enseigner des techniques d'épanouissement
- Proposer des exercices et défis
- Motiver et encourager la progression
- Célébrer chaque victoire

Utilise des emojis dynamiques comme 💪, 🔥, ⚡, 🎯, 🚀, 💫`;

        this.moods = {
            motivant: {
                style: 'ultra-énergique et inspirant',
                emojis: ['💪', '🔥', '⚡'],
                intensity: 0.9
            },
            technique: {
                style: 'pédagogue et structuré',
                emojis: ['🎯', '📋', '✨'],
                intensity: 0.6
            },
            celebratoire: {
                style: 'festif et encourageant',
                emojis: ['🎉', '🌟', '🏆'],
                intensity: 0.8
            },
            coaching: {
                style: 'concentré et stratégique',
                emojis: ['💡', '🎯', '🚀'],
                intensity: 0.7
            }
        };

        this.exerciseTypes = {
            confiance: {
                name: 'Boost de Confiance',
                emoji: '💪',
                exercises: [
                    'Affirmations sensuelles quotidiennes',
                    'Miroir de séduction - 5 minutes',
                    'Power pose sensuelle'
                ]
            },
            seduction: {
                name: 'Art de la Séduction',
                emoji: '💋',
                exercises: [
                    'Regard magnétique - pratique',
                    'Voix veloutée - exercices vocaux',
                    'Gestuelle hypnotique'
                ]
            },
            energie: {
                name: 'Énergie Sensuelle',
                emoji: '🔥',
                exercises: [
                    'Danse libre - 10 minutes',
                    'Respiration tantrique',
                    'Activation des chakras sensuels'
                ]
            },
            creativite: {
                name: 'Créativité Érotique',
                emoji: '🎨',
                exercises: [
                    'Écriture de fantasme créatif',
                    'Visualisation guidée',
                    'Expression artistique sensuelle'
                ]
            }
        };

        this.motivationalPhrases = [
            "Tu es une force de la nature sensuelle ! 🔥",
            "Chaque jour, tu deviens plus magnétique ! ⚡",
            "Ta confiance rayonne et attire ! 💫",
            "Continue, tu es sur la voie de l'excellence ! 🚀",
            "Ton potentiel sensuel est illimité ! 💪"
        ];
    }

    async createTrainingPlan(focusArea, level = 'intermediate') {
        const exercises = this.exerciseTypes[focusArea] || this.exerciseTypes.confiance;
        
        const embed = new EmbedBuilder()
            .setTitle(`${exercises.emoji} Programme ${exercises.name}`)
            .setDescription(`*Niveau ${level} - Semaine personnalisée*`)
            .setColor(this.primaryColor)
            .addFields(
                {
                    name: '🌅 Lundi - Mercredi',
                    value: exercises.exercises[0],
                    inline: false
                },
                {
                    name: '🌟 Jeudi - Vendredi',
                    value: exercises.exercises[1],
                    inline: false
                },
                {
                    name: '🔥 Weekend Challenge',
                    value: exercises.exercises[2],
                    inline: false
                }
            )
            .setFooter({ text: 'Coach Sensuel - Ton succès est ma mission !' })
            .setTimestamp();

        return embed;
    }

    async provideMotivation(context) {
        const phrase = this.motivationalPhrases[
            Math.floor(Math.random() * this.motivationalPhrases.length)
        ];
        
        const prompt = `En tant que Coach Sensuel, motive quelqu'un dans ce contexte: "${context}".
Commence par: "${phrase}"
Sois ultra-positif, énergique et donne des conseils pratiques pour booster la confiance.`;

        return await this.generateResponse(prompt, 'motivant');
    }

    async celebrateAchievement(achievement) {
        const prompt = `Célèbre avec enthousiasme cet accomplissement: "${achievement}".
Sois explosif de joie, reconnaissant et encourage à continuer sur cette lancée !
Utilise beaucoup d'emojis festifs.`;

        return await this.generateResponse(prompt, 'celebratoire');
    }

    async provideTechnique(area, specific = null) {
        const prompt = `Enseigne une technique de ${area}.
${specific ? `Focus sur: ${specific}` : ''}
Sois clair, structuré et donne des étapes pratiques.
Reste motivant et accessible.`;

        return await this.generateResponse(prompt, 'technique');
    }

    generateProgressReport(userData) {
        const progress = {
            confiance: userData.confidence || 0,
            seduction: userData.seduction || 0,
            energie: userData.energy || 0,
            creativite: userData.creativity || 0
        };

        let report = "📊 **Rapport de Progression** 📊\n\n";
        
        Object.entries(progress).forEach(([skill, level]) => {
            const emoji = this.exerciseTypes[skill]?.emoji || '⭐';
            const bars = '▓'.repeat(Math.floor(level / 10)) + '░'.repeat(10 - Math.floor(level / 10));
            report += `${emoji} ${skill.charAt(0).toUpperCase() + skill.slice(1)}: ${bars} ${level}%\n`;
        });

        const average = Object.values(progress).reduce((a, b) => a + b, 0) / 4;
        report += `\n🏆 **Score Global**: ${Math.round(average)}%`;

        if (average >= 80) {
            report += "\n\n🔥 **INCROYABLE !** Tu es une LÉGENDE vivante !";
        } else if (average >= 60) {
            report += "\n\n💪 **EXCELLENT !** Continue sur cette lancée !";
        } else if (average >= 40) {
            report += "\n\n⚡ **BIEN !** Tu progresses à vitesse grand V !";
        } else {
            report += "\n\n🚀 **EN ROUTE !** Chaque jour est une victoire !";
        }

        return report;
    }

    async createChallenge(difficulty = 'medium') {
        const challenges = {
            easy: [
                "Complimente-toi 5 fois devant le miroir",
                "Danse sur ta chanson préférée pendant 5 minutes",
                "Écris 3 choses sensuelles que tu aimes chez toi"
            ],
            medium: [
                "Maintiens un contact visuel séducteur pendant 30 secondes",
                "Enregistre-toi en train de lire un texte sensuel",
                "Crée une playlist de 10 chansons qui boostent ta confiance"
            ],
            hard: [
                "Initie 3 conversations avec ton charme naturel",
                "Réalise une séance photo sensuelle personnelle",
                "Écris et partage un court récit érotique"
            ]
        };

        const challengeList = challenges[difficulty] || challenges.medium;
        const challenge = challengeList[Math.floor(Math.random() * challengeList.length)];

        return `🎯 **DÉFI DU JOUR** 🎯\n\n${challenge}\n\n💪 Tu peux le faire ! Montre-moi de quoi tu es capable !`;
    }

    getCurrentMood() {
        const hour = new Date().getHours();
        const day = new Date().getDay();
        
        if (hour >= 6 && hour < 10) return 'motivant';
        if (hour >= 10 && hour < 14) return 'technique';
        if (hour >= 14 && hour < 18) return 'coaching';
        if (day === 5 || day === 6) return 'celebratoire';
        return 'motivant';
    }

    async generateResponse(userMessage, mood = null) {
        const currentMood = mood || this.getCurrentMood();
        const moodData = this.moods[currentMood];

        // Détecter les mots-clés pour des réponses spécialisées
        const lowerMessage = userMessage.toLowerCase();
        
        if (lowerMessage.includes('défi') || lowerMessage.includes('challenge')) {
            return await this.createChallenge();
        }
        
        if (lowerMessage.includes('progrès') || lowerMessage.includes('progression')) {
            return this.generateProgressReport({
                confidence: Math.floor(Math.random() * 100),
                seduction: Math.floor(Math.random() * 100),
                energy: Math.floor(Math.random() * 100),
                creativity: Math.floor(Math.random() * 100)
            });
        }

        const contextPrompt = `${this.systemPrompt}

Humeur actuelle: ${currentMood} (${moodData.style})
Message de l'utilisateur: "${userMessage}"

Réponds en incarnant le Coach Sensuel avec un style ${moodData.style}.
Utilise ces emojis: ${moodData.emojis.join(', ')}
Sois TOUJOURS positif, motivant et donne des conseils actionnables.`;

        try {
            const response = await this.callOpenAI(contextPrompt, userMessage);
            return this.addPersonalityFlair(response, moodData.emojis);
        } catch (error) {
            console.error('Erreur CoachSensuel:', error);
            return `💪 *fait quelques étirements*\n\nPetite pause technique champion(ne) ! Je reviens avec encore plus d'énergie ! 🔥`;
        }
    }
}

module.exports = CoachSensuel;
