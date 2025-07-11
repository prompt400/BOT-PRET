const NarrateurScenariste = require('./personalities/NarrateurScenariste');
const MaitresseCeremonie = require('./personalities/MaitresseCeremonie');
const PsychologueErotique = require('./personalities/PsychologueErotique');
const CoachSensuel = require('./personalities/CoachSensuel');
const DJAmbiance = require('./personalities/DJAmbiance');
const logger = require('../../utils/Logger');

class AIManager {
    constructor() {
        this.personalities = new Map();
        this.defaultPersonality = 'narrateur';
        this.initializePersonalities();
    }

    initializePersonalities() {
        try {
            // Initialiser toutes les personnalités
            const narrateur = new NarrateurScenariste();
            this.personalities.set('narrateur', narrateur);
            
            const maitresse = new MaitresseCeremonie();
            this.personalities.set('maitresse', maitresse);
            
            const psychologue = new PsychologueErotique();
            this.personalities.set('psychologue', psychologue);
            
            const coach = new CoachSensuel();
            this.personalities.set('coach', coach);
            
            const dj = new DJAmbiance();
            this.personalities.set('dj', dj);
            
            logger.info(`${this.personalities.size} personnalités IA initialisées avec succès`);
        } catch (error) {
            logger.error('Erreur lors de l\'initialisation des personnalités IA:', error);
        }
    }

    /**
     * Chat avec une personnalité spécifique
     */
    async chat(personalityName, message, context = {}) {
        try {
            const personality = this.personalities.get(personalityName) || 
                               this.personalities.get(this.defaultPersonality);
            
            if (!personality) {
                throw new Error(`Personnalité ${personalityName} non trouvée`);
            }

            // Enrichir le contexte avec les infos de conversation
            const enrichedContext = {
                ...context,
                timestamp: new Date(),
                personalityName
            };

            // Générer la réponse
            const response = await personality.generateResponse(message, null, enrichedContext);
            
            return response;
        } catch (error) {
            logger.error(`Erreur lors du chat avec ${personalityName}:`, error);
            return "Désolé, je rencontre un petit problème technique. Réessayons dans un moment ! 💫";
        }
    }

    /**
     * Obtenir une personnalité par son nom
     */
    getPersonality(name) {
        return this.personalities.get(name);
    }

    /**
     * Obtenir toutes les personnalités disponibles
     */
    getAllPersonalities() {
        const personalities = [];
        this.personalities.forEach((personality, key) => {
            personalities.push({
                key,
                name: personality.name,
                emoji: personality.emoji,
                description: personality.description,
                specialties: personality.specialties
            });
        });
        return personalities;
    }

    /**
     * Générer une histoire avec le narrateur
     */
    async generateStory(theme, style, elements, userId) {
        const narrateur = this.personalities.get('narrateur');
        if (!narrateur) {
            throw new Error('Narrateur non disponible');
        }
        return await narrateur.generateStory(theme, style, elements, userId);
    }

    /**
     * Annoncer un événement avec la maîtresse de cérémonie
     */
    async announceEvent(eventType, details) {
        const maitresse = this.personalities.get('maitresse');
        if (!maitresse) {
            throw new Error('Maîtresse de cérémonie non disponible');
        }
        return await maitresse.generateEventAnnouncement(eventType, details);
    }

    /**
     * Fournir des conseils avec le psychologue
     */
    async provideGuidance(topic, userContext) {
        const psychologue = this.personalities.get('psychologue');
        if (!psychologue) {
            throw new Error('Psychologue érotique non disponible');
        }
        return await psychologue.provideGuidance(topic, userContext);
    }

    /**
     * Motiver avec le coach sensuel
     */
    async motivate(context) {
        const coach = this.personalities.get('coach');
        if (!coach) {
            throw new Error('Coach sensuel non disponible');
        }
        return await coach.provideMotivation(context);
    }

    /**
     * Créer une playlist avec le DJ
     */
    async createPlaylist(theme) {
        const dj = this.personalities.get('dj');
        if (!dj) {
            throw new Error('DJ Ambiance non disponible');
        }
        return await dj.createPlaylist(theme);
    }

    /**
     * Obtenir une recommandation de personnalité basée sur le message
     */
    recommendPersonality(message) {
        const lowerMessage = message.toLowerCase();
        
        // Mots-clés pour chaque personnalité
        const keywords = {
            narrateur: ['histoire', 'récit', 'conte', 'raconter', 'scénario', 'aventure'],
            maitresse: ['événement', 'cérémonie', 'fête', 'célébration', 'spectacle', 'animation'],
            psychologue: ['aide', 'comprendre', 'explorer', 'désir', 'sentiment', 'émotion'],
            coach: ['motivation', 'confiance', 'défi', 'exercice', 'progresser', 'booster'],
            dj: ['musique', 'playlist', 'ambiance', 'son', 'mood', 'vibe']
        };

        // Compter les correspondances pour chaque personnalité
        const scores = {};
        Object.entries(keywords).forEach(([personality, words]) => {
            scores[personality] = words.filter(word => lowerMessage.includes(word)).length;
        });

        // Retourner la personnalité avec le score le plus élevé
        const recommended = Object.entries(scores).reduce((a, b) => 
            scores[a[0]] > scores[b[0]] ? a : b
        );

        return recommended[1] > 0 ? recommended[0] : this.defaultPersonality;
    }

    /**
     * Obtenir des statistiques sur l'utilisation des IA
     */
    async getUsageStats(userId = null) {
        // Cette méthode pourrait être enrichie avec des données de la base
        const stats = {
            totalPersonalities: this.personalities.size,
            activePersonalities: Array.from(this.personalities.keys()),
            defaultPersonality: this.defaultPersonality
        };

        if (userId) {
            // Ajouter des stats spécifiques à l'utilisateur si nécessaire
            stats.userFavorite = 'narrateur'; // À implémenter avec MemoryManager
        }

        return stats;
    }
}

module.exports = new AIManager();
