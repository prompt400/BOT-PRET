/**
 * Gestionnaire d'erreurs
 * Centralise la gestion des erreurs de l'application
 */

import { EMOJIS } from '../constantes/theme.js';
import Logger from '../services/logger.js';

const logger = new Logger('GestionnaireErreurs');

/**
 * Classe de gestion des erreurs
 */
class GestionnaireErreurs {
    constructor() {
        this.compteurErreurs = new Map();
    }
    
    /**
     * Obtient un message d'erreur formaté pour l'utilisateur
     * @param {Error} erreur L'erreur à formater
     * @returns {string} Message d'erreur formaté
     */
    obtenirMessageErreur(erreur) {
        // Erreurs Discord.js courantes
        if (erreur.code === 'InteractionAlreadyReplied') {
            return `${EMOJIS.ERREUR} Cette interaction a déjà reçu une réponse.`;
        }
        
        if (erreur.code === 50013) {
            return `${EMOJIS.ERREUR} Permissions insuffisantes pour effectuer cette action.`;
        }
        
        if (erreur.code === 50001) {
            return `${EMOJIS.ERREUR} Je n'ai pas accès à ce canal.`;
        }
        
        // Erreurs réseau
        if (erreur.code === 'ECONNREFUSED' || erreur.code === 'ETIMEDOUT') {
            return `${EMOJIS.ERREUR} Problème de connexion. Veuillez réessayer.`;
        }
        
        // Message par défaut
        return `${EMOJIS.ERREUR} Une erreur inattendue s'est produite. Veuillez réessayer plus tard.`;
    }
    
    /**
     * Enregistre une erreur et incrémente le compteur
     * @param {string} contexte Contexte de l'erreur
     * @param {Error} erreur L'erreur à enregistrer
     */
    enregistrerErreur(contexte, erreur) {
        const cle = `${contexte}:${erreur.message}`;
        const compte = (this.compteurErreurs.get(cle) || 0) + 1;
        this.compteurErreurs.set(cle, compte);
        
        if (compte === 1 || compte % 10 === 0) {
            logger.erreur(`Erreur dans ${contexte} (occurence ${compte})`, erreur);
        }
        
        // Nettoyage périodique du compteur
        if (this.compteurErreurs.size > 100) {
            this.nettoyerCompteur();
        }
    }
    
    /**
     * Nettoie le compteur d'erreurs
     */
    nettoyerCompteur() {
        const maintenant = Date.now();
        const dureeRetention = 3600000; // 1 heure
        
        // Garde seulement les erreurs récentes
        const nouvelleMap = new Map();
        this.compteurErreurs.forEach((value, key) => {
            if (value > 5) { // Garde les erreurs fréquentes
                nouvelleMap.set(key, value);
            }
        });
        
        this.compteurErreurs = nouvelleMap;
        logger.info('Compteur d\'erreurs nettoyé');
    }
    
    /**
     * Obtient les statistiques d'erreurs
     * @returns {Object} Statistiques des erreurs
     */
    obtenirStatistiques() {
        const stats = {
            total: 0,
            parType: {}
        };
        
        this.compteurErreurs.forEach((compte, cle) => {
            stats.total += compte;
            const [contexte] = cle.split(':');
            stats.parType[contexte] = (stats.parType[contexte] || 0) + compte;
        });
        
        return stats;
    }
}

export const gestionnaireErreurs = new GestionnaireErreurs();
