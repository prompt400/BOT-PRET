import ModelLoader from '../models/ModelLoader.js';
import Logger from '../../../services/logger.js';
import modelsConfig from '../models/models.json' assert { type: 'json' };

const logger = new Logger('IA-Scenariste');

class Scenariste {
    constructor() {
        this.personality = modelsConfig.personalities.scenariste;
        this.prompts = modelsConfig.prompts;
        this.name = this.personality.name;
        this.emoji = this.personality.emoji;
        this.temperature = this.personality.temperature;
        this.style = this.personality.style;
    }

    /**
     * Génère une histoire complète
     */
    async generateStory(theme, userPreferences = {}, length = 'medium') {
        logger.debutOperation(`Génération d'histoire - Thème: ${theme}`);
        
        try {
            // Déterminer la longueur en tokens
            const lengthMap = {
                'short': 300,
                'medium': 500,
                'long': 800
            };
            const maxTokens = lengthMap[length] || 500;

            // Construire le prompt initial
            const contextPrompt = this._buildStoryPrompt(theme, userPreferences);
            
            // Générer l'histoire
            const story = await ModelLoader.generateText(contextPrompt, {
                max_new_tokens: maxTokens,
                temperature: this.temperature,
                top_p: 0.95,
                do_sample: true,
                repetition_penalty: 1.3
            });

            // Post-traiter l'histoire
            const processedStory = this._postProcessStory(story, theme);
            
            logger.finOperation('Génération d\'histoire', true);
            
            return {
                success: true,
                story: processedStory,
                theme,
                length,
                wordCount: processedStory.split(' ').length,
                metadata: {
                    generatedAt: new Date(),
                    personality: this.name,
                    temperature: this.temperature
                }
            };
            
        } catch (error) {
            logger.erreur('Erreur lors de la génération d\'histoire', error);
            logger.finOperation('Génération d\'histoire', false);
            throw error;
        }
    }

    /**
     * Continue une histoire existante
     */
    async continueStory(previousText, direction = null) {
        logger.info('Continuation d\'histoire demandée');
        
        try {
            // Extraire le contexte des dernières phrases
            const context = this._extractContext(previousText);
            
            // Construire le prompt de continuation
            let prompt = this.prompts.continue.replace('{previous}', context);
            
            if (direction) {
                prompt += ` L'histoire devrait évoluer vers ${direction}.`;
            }
            
            // Générer la suite
            const continuation = await ModelLoader.generateText(prompt, {
                max_new_tokens: 200,
                temperature: this.temperature,
                top_p: 0.95,
                do_sample: true
            });
            
            // Nettoyer et formater
            const processed = this._cleanContinuation(continuation, context);
            
            return {
                success: true,
                continuation: processed,
                fullStory: previousText + '\n\n' + processed
            };
            
        } catch (error) {
            logger.erreur('Erreur lors de la continuation', error);
            throw error;
        }
    }

    /**
     * Génère un titre pour une histoire
     */
    async generateTitle(storyContent) {
        try {
            const prompt = `Génère un titre sensuel et intriguant pour cette histoire : "${storyContent.substring(0, 200)}..."`;
            
            const title = await ModelLoader.generateText(prompt, {
                max_new_tokens: 20,
                temperature: 0.7,
                top_p: 0.9
            });
            
            return this._cleanTitle(title);
            
        } catch (error) {
            logger.erreur('Erreur lors de la génération du titre', error);
            return 'Histoire Sans Titre';
        }
    }

    /**
     * Analyse le ton émotionnel d'une histoire
     */
    async analyzeStoryTone(story) {
        try {
            const sentiment = await ModelLoader.analyzeSentiment(story);
            
            // Mapper le sentiment à des émotions sensuelles
            const emotionalTones = {
                'POSITIVE': ['passionné', 'romantique', 'tendre', 'sensuel'],
                'NEGATIVE': ['mélancolique', 'nostalgique', 'mystérieux', 'interdit']
            };
            
            const label = sentiment[0]?.label || 'POSITIVE';
            const tones = emotionalTones[label];
            const randomTone = tones[Math.floor(Math.random() * tones.length)];
            
            return {
                tone: randomTone,
                confidence: sentiment[0]?.score || 0.5,
                rawSentiment: sentiment
            };
            
        } catch (error) {
            logger.erreur('Erreur lors de l\'analyse du ton', error);
            return { tone: 'neutre', confidence: 0 };
        }
    }

    /**
     * Construit le prompt pour générer une histoire
     */
    _buildStoryPrompt(theme, preferences) {
        // Utiliser les prompts prédéfinis si le thème correspond
        const storyPrompts = this.prompts.story;
        let basePrompt = storyPrompts[theme] || storyPrompts.romantic;
        
        // Personnaliser selon les préférences
        let context = '';
        if (preferences.character) {
            context += `le personnage principal est ${preferences.character}. `;
        }
        if (preferences.setting) {
            context += `L'histoire se déroule ${preferences.setting}. `;
        }
        if (preferences.mood) {
            context += `L'ambiance est ${preferences.mood}. `;
        }
        
        // Ajouter le prompt système de la personnalité
        const fullPrompt = `${this.personality.systemPrompt}\n\n${basePrompt.replace('{context}', context)}`;
        
        return fullPrompt;
    }

    /**
     * Post-traite l'histoire générée
     */
    _postProcessStory(story, theme) {
        // Supprimer le prompt initial s'il est répété
        let processed = story;
        
        // Diviser en paragraphes si nécessaire
        if (!processed.includes('\n\n') && processed.length > 200) {
            // Ajouter des sauts de ligne après les points suivis d'une majuscule
            processed = processed.replace(/\. ([A-Z])/g, '.\n\n$1');
        }
        
        // Ajouter une conclusion si l'histoire semble incomplète
        if (!processed.match(/[.!?]$/)) {
            processed += '...';
        }
        
        // Formater les dialogues
        processed = processed.replace(/"([^"]+)"/g, '« $1 »');
        
        return processed.trim();
    }

    /**
     * Extrait le contexte des dernières phrases
     */
    _extractContext(text) {
        const sentences = text.split(/[.!?]+/);
        const lastSentences = sentences.slice(-3).join('. ');
        return lastSentences.trim();
    }

    /**
     * Nettoie la continuation générée
     */
    _cleanContinuation(continuation, context) {
        // Supprimer la répétition du contexte
        let cleaned = continuation.replace(context, '').trim();
        
        // Supprimer les préfixes indésirables
        cleaned = cleaned.replace(/^(Suite:|Continuation:|Ensuite,|Puis,)/i, '').trim();
        
        // Assurer une majuscule au début
        cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
        
        return cleaned;
    }

    /**
     * Nettoie un titre généré
     */
    _cleanTitle(title) {
        let cleaned = title.trim();
        
        // Supprimer les guillemets et préfixes
        cleaned = cleaned.replace(/["«»]/g, '');
        cleaned = cleaned.replace(/^(Titre:|Title:)/i, '').trim();
        
        // Capitaliser chaque mot important
        cleaned = cleaned.replace(/\b\w/g, l => l.toUpperCase());
        
        // Limiter la longueur
        if (cleaned.length > 50) {
            cleaned = cleaned.substring(0, 47) + '...';
        }
        
        return cleaned || 'Histoire Mystérieuse';
    }

    /**
     * Génère des suggestions de thèmes
     */
    async suggestThemes(userHistory = []) {
        const baseThemes = Object.keys(this.prompts.story);
        
        // Si l'utilisateur a un historique, personnaliser
        if (userHistory.length > 0) {
            // Analyser les thèmes préférés
            const preferredThemes = this._analyzePreferences(userHistory);
            return [...preferredThemes, ...baseThemes].slice(0, 5);
        }
        
        return baseThemes;
    }

    /**
     * Analyse les préférences utilisateur
     */
    _analyzePreferences(history) {
        const themeCounts = {};
        
        history.forEach(item => {
            if (item.theme) {
                themeCounts[item.theme] = (themeCounts[item.theme] || 0) + 1;
            }
        });
        
        // Trier par popularité
        return Object.keys(themeCounts)
            .sort((a, b) => themeCounts[b] - themeCounts[a])
            .slice(0, 3);
    }

    /**
     * Obtient des statistiques sur la personnalité
     */
    getStats() {
        return {
            name: this.name,
            emoji: this.emoji,
            style: this.style,
            temperature: this.temperature,
            capabilities: [
                'Génération d\'histoires',
                'Continuation narrative',
                'Génération de titres',
                'Analyse tonale',
                'Suggestions thématiques'
            ]
        };
    }
}

// Export singleton
export default new Scenariste();
