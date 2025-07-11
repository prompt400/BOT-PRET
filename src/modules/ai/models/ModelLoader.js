import { pipeline, env } from '@xenova/transformers';
import Logger from '../../../services/logger.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration de l'environnement Transformers.js
env.allowRemoteModels = true;
env.localURL = path.join(__dirname, '../../../..', 'models');
env.cacheDir = path.join(__dirname, '../../../..', '.cache', 'transformers');

const logger = new Logger('ModelLoader');

class ModelLoader {
    constructor() {
        this.models = new Map();
        this.loadingPromises = new Map();
        this.modelConfigs = {
            'text-generation': {
                model: 'Xenova/gpt2',  // GPT-2 optimisé pour Transformers.js
                task: 'text-generation',
                options: {
                    max_new_tokens: 150,
                    temperature: 0.8,
                    top_p: 0.95,
                    do_sample: true
                }
            },
            'text-generation-fr': {
                model: 'asi/gpt-fr-cased-small',  // Modèle français si disponible
                task: 'text-generation',
                options: {
                    max_new_tokens: 150,
                    temperature: 0.8,
                    top_p: 0.95,
                    do_sample: true
                }
            },
            'sentiment-analysis': {
                model: 'Xenova/distilbert-base-uncased-finetuned-sst-2-english',
                task: 'sentiment-analysis',
                options: {}
            },
            'feature-extraction': {
                model: 'Xenova/all-MiniLM-L6-v2',
                task: 'feature-extraction',
                options: {}
            }
        };
    }

    /**
     * Charge un modèle spécifique ou utilise le cache
     */
    async loadModel(modelType = 'text-generation') {
        // Si le modèle est déjà chargé, le retourner
        if (this.models.has(modelType)) {
            return this.models.get(modelType);
        }

        // Si le modèle est en cours de chargement, attendre
        if (this.loadingPromises.has(modelType)) {
            return await this.loadingPromises.get(modelType);
        }

        // Charger le modèle
        const loadingPromise = this._loadModelInternal(modelType);
        this.loadingPromises.set(modelType, loadingPromise);
        
        try {
            const model = await loadingPromise;
            this.models.set(modelType, model);
            this.loadingPromises.delete(modelType);
            return model;
        } catch (error) {
            this.loadingPromises.delete(modelType);
            throw error;
        }
    }

    /**
     * Chargement interne du modèle
     */
    async _loadModelInternal(modelType) {
        const config = this.modelConfigs[modelType];
        if (!config) {
            throw new Error(`Type de modèle inconnu : ${modelType}`);
        }

        logger.debutOperation(`Chargement du modèle ${modelType}`);
        
        try {
            // Essayer d'abord le modèle français si c'est pour la génération de texte
            if (modelType === 'text-generation') {
                try {
                    const frenchModel = await pipeline(
                        this.modelConfigs['text-generation-fr'].task,
                        this.modelConfigs['text-generation-fr'].model
                    );
                    logger.succes('Modèle français chargé avec succès');
                    return frenchModel;
                } catch (error) {
                    logger.avertissement('Modèle français non disponible, utilisation du modèle anglais');
                }
            }

            // Charger le modèle par défaut
            const model = await pipeline(config.task, config.model);
            logger.finOperation(`Modèle ${modelType} chargé`, true);
            return model;
            
        } catch (error) {
            logger.erreur(`Erreur lors du chargement du modèle ${modelType}`, error);
            logger.finOperation(`Chargement du modèle ${modelType}`, false);
            throw error;
        }
    }

    /**
     * Génère du texte avec le modèle
     */
    async generateText(prompt, options = {}) {
        const model = await this.loadModel('text-generation');
        const config = this.modelConfigs['text-generation'];
        
        const mergedOptions = {
            ...config.options,
            ...options
        };

        try {
            logger.info(`Génération de texte avec prompt : "${prompt.substring(0, 50)}..."`);
            
            const result = await model(prompt, mergedOptions);
            
            if (result && result.length > 0) {
                const generatedText = result[0].generated_text;
                logger.succes(`Texte généré : ${generatedText.length} caractères`);
                return generatedText;
            }
            
            throw new Error('Aucun texte généré');
            
        } catch (error) {
            logger.erreur('Erreur lors de la génération de texte', error);
            throw error;
        }
    }

    /**
     * Analyse le sentiment d'un texte
     */
    async analyzeSentiment(text) {
        const model = await this.loadModel('sentiment-analysis');
        
        try {
            const result = await model(text);
            return result;
        } catch (error) {
            logger.erreur('Erreur lors de l\'analyse de sentiment', error);
            throw error;
        }
    }

    /**
     * Extrait les features d'un texte pour la similarité
     */
    async extractFeatures(text) {
        const model = await this.loadModel('feature-extraction');
        
        try {
            const result = await model(text, { pooling: 'mean', normalize: true });
            return result;
        } catch (error) {
            logger.erreur('Erreur lors de l\'extraction de features', error);
            throw error;
        }
    }

    /**
     * Test de génération basique
     */
    async testGeneration() {
        logger.debutOperation('Test de génération de texte');
        
        const testPrompts = [
            "Dans une soirée romantique,",
            "La passion entre eux était",
            "Elle lui murmura doucement",
            "Sous les étoiles, ils"
        ];

        const results = [];
        
        for (const prompt of testPrompts) {
            try {
                const generated = await this.generateText(prompt, {
                    max_new_tokens: 50,
                    temperature: 0.9
                });
                
                results.push({
                    prompt,
                    generated,
                    success: true
                });
                
                logger.info(`✅ Prompt: "${prompt}"\n   Résultat: "${generated}"`);
                
            } catch (error) {
                results.push({
                    prompt,
                    error: error.message,
                    success: false
                });
                
                logger.erreur(`❌ Échec pour le prompt: "${prompt}"`, error);
            }
        }

        logger.finOperation('Test de génération de texte', true);
        return results;
    }

    /**
     * Précharge tous les modèles
     */
    async preloadAllModels() {
        logger.debutOperation('Préchargement de tous les modèles');
        
        const modelTypes = Object.keys(this.modelConfigs);
        const results = {};
        
        for (const modelType of modelTypes) {
            try {
                await this.loadModel(modelType);
                results[modelType] = 'success';
                logger.info(`✅ Modèle ${modelType} préchargé`);
            } catch (error) {
                results[modelType] = 'failed';
                logger.erreur(`❌ Échec du préchargement de ${modelType}`, error);
            }
        }
        
        logger.finOperation('Préchargement des modèles', true);
        return results;
    }

    /**
     * Nettoie les modèles de la mémoire
     */
    clearModels() {
        this.models.clear();
        this.loadingPromises.clear();
        logger.info('Tous les modèles ont été retirés de la mémoire');
    }

    /**
     * Obtient des statistiques sur les modèles chargés
     */
    getStats() {
        return {
            loadedModels: Array.from(this.models.keys()),
            loadingModels: Array.from(this.loadingPromises.keys()),
            totalLoaded: this.models.size,
            totalLoading: this.loadingPromises.size
        };
    }
}

// Export singleton
export default new ModelLoader();
