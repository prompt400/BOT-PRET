/**
 * Configuration du bot
 * Centralise tous les paramètres de configuration
 */

export const CONFIGURATION = {
    // Options du client Discord
    clientOptions: {
        failIfNotExists: false,
        allowedMentions: {
            parse: ['users', 'roles'],
            repliedUser: true
        },
        presence: {
            status: 'online'
        }
    },
    
    // Configuration des commandes
    commandes: {
        // Cooldown par défaut en secondes
        cooldownDefaut: 3,
        // Nombre maximum de tentatives
        maxTentatives: 3
    },
    
    // Configuration des logs
    logs: {
        // Niveau de log (DEBUG, INFO, AVERTISSEMENT, ERREUR)
        niveau: process.env.LOG_LEVEL || 'INFO',
        // Durée de rétention des logs en jours
        retention: 30
    },
    
    // Configuration de l'API Discord
    api: {
        version: '10',
        timeout: 30000
    },
    
    // Limites et seuils
    limites: {
        // Taille maximale des messages
        tailleMessage: 2000,
        // Nombre maximum d'embeds par message
        maxEmbeds: 10,
        // Taille maximale des fichiers (en MB)
        tailleFichier: 8
    }
};
