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
            logger.avertissement('Le format du token Discord semble inhabituel, mais continuons...');
        }
        
        logger.info('Environnement validé avec succès');
    }
    
    /**
     * Valide le format d'un token Discord
     * @param {string} token Token à valider
     * @returns {boolean} True si le token semble valide
     */
    validerTokenDiscord(token) {
        // Un token Discord peut avoir différents formats selon la version
        // Format moderne : XXX.YYY.ZZZ (3 parties séparées par des points)
        // Format legacy : peut varier
        
        if (!token || token.length < 50) {
            return false;
        }
        
        // Vérification basique : le token ne doit pas contenir d'espaces
        if (token.includes(' ')) {
            return false;
        }
        
        // Les tokens modernes ont généralement 3 parties
        const parties = token.split('.');
        if (parties.length === 3) {
            return parties.every(partie => partie && partie.length > 0);
        }
        
        // Pour les tokens legacy ou formats spéciaux, on accepte s'ils ont au moins 50 caractères
        return token.length >= 50;
    }
}

export const validateurEnvironnement = new ValidateurEnvironnement();
