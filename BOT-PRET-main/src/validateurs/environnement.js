/**
 * Validateur d'environnement
 * Vérifie que toutes les variables d'environnement requises sont présentes
 */

import Logger from '../services/logger.js';

const logger = new Logger('ValidateurEnvironnement');

/**
 * Variables d'environnement requises
 */
const VARIABLES_REQUISES = [
    'DISCORD_TOKEN',
    'DISCORD_CLIENT_ID'
];

/**
 * Variables d'environnement optionnelles avec valeurs par défaut
 */
const VARIABLES_OPTIONNELLES = {
    NODE_ENV: 'production',
    LOG_LEVEL: 'INFO',
    PORT: '3000'
};

/**
 * Classe de validation de l'environnement
 */
class ValidateurEnvironnement {
    /**
     * Valide toutes les variables d'environnement
     * @throws {Error} Si une variable requise est manquante
     */
    valider() {
        logger.info('Validation de l\'environnement...');
        
        const variablesManquantes = [];
        
        // Vérification des variables requises
        for (const variable of VARIABLES_REQUISES) {
            if (!process.env[variable]) {
                variablesManquantes.push(variable);
            }
        }
        
        if (variablesManquantes.length > 0) {
            const erreur = new Error(`Variables d'environnement manquantes: ${variablesManquantes.join(', ')}`);
            logger.erreur('Validation échouée', erreur);
            throw erreur;
        }
        
        // Application des valeurs par défaut pour les variables optionnelles
        for (const [variable, valeurDefaut] of Object.entries(VARIABLES_OPTIONNELLES)) {
            if (!process.env[variable]) {
                process.env[variable] = valeurDefaut;
                logger.info(`Variable ${variable} définie à la valeur par défaut: ${valeurDefaut}`);
            }
        }
        
        // Validation du format du token Discord
        if (!this.validerTokenDiscord(process.env.DISCORD_TOKEN)) {
            throw new Error('Le token Discord semble invalide');
        }
        
        logger.info('Environnement validé avec succès');
    }
    
    /**
     * Valide le format d'un token Discord
     * @param {string} token Token à valider
     * @returns {boolean} True si le token semble valide
     */
    validerTokenDiscord(token) {
        // Un token Discord a généralement ce format
        const parties = token.split('.');
        return parties.length === 3 && parties.every(partie => partie.length > 0);
    }
}

export const validateurEnvironnement = new ValidateurEnvironnement();
