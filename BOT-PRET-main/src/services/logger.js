/**
 * Service de logging
 * Gère les logs de l'application de manière professionnelle
 */

import { existsSync, mkdirSync, appendFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Niveaux de log
 */
const NIVEAUX = {
    ERREUR: 'ERREUR',
    AVERTISSEMENT: 'AVERTISSEMENT',
    INFO: 'INFO',
    DEBUG: 'DEBUG'
};

/**
 * Couleurs ANSI pour la console
 */
const COULEURS = {
    ERREUR: '\x1b[31m',
    AVERTISSEMENT: '\x1b[33m',
    INFO: '\x1b[36m',
    DEBUG: '\x1b[35m',
    RESET: '\x1b[0m'
};

/**
 * Classe Logger pour gérer les logs
 */
export default class Logger {
    constructor(contexte = 'General') {
        this.contexte = contexte;
        this.dossierLogs = join(__dirname, '..', '..', 'logs');
        
        // Création du dossier logs si inexistant
        if (!existsSync(this.dossierLogs)) {
            mkdirSync(this.dossierLogs, { recursive: true });
        }
    }
    
    /**
     * Formate un message de log
     * @param {string} niveau Niveau du log
     * @param {string} message Message à logger
     * @param {*} donnees Données supplémentaires
     * @returns {string} Message formaté
     */
    formaterMessage(niveau, message, donnees = null) {
        const timestamp = new Date().toISOString();
        let messageFormatte = `[${timestamp}] [${niveau}] [${this.contexte}] ${message}`;
        
        if (donnees) {
            if (donnees instanceof Error) {
                messageFormatte += `\n${donnees.stack || donnees.message}`;
            } else if (typeof donnees === 'object') {
                messageFormatte += `\n${JSON.stringify(donnees, null, 2)}`;
            } else {
                messageFormatte += ` ${donnees}`;
            }
        }
        
        return messageFormatte;
    }
    
    /**
     * Écrit un log dans la console et dans un fichier
     * @param {string} niveau Niveau du log
     * @param {string} message Message à logger
     * @param {*} donnees Données supplémentaires
     */
    log(niveau, message, donnees = null) {
        const messageFormatte = this.formaterMessage(niveau, message, donnees);
        
        // Log console avec couleur
        const couleur = COULEURS[niveau] || COULEURS.RESET;
        console.log(`${couleur}${messageFormatte}${COULEURS.RESET}`);
        
        // Log fichier
        const fichierLog = join(this.dossierLogs, `${new Date().toISOString().split('T')[0]}.log`);
        appendFileSync(fichierLog, messageFormatte + '\n', 'utf8');
    }
    
    /**
     * Log d'erreur
     */
    erreur(message, donnees = null) {
        this.log(NIVEAUX.ERREUR, message, donnees);
    }
    
    /**
     * Log d'avertissement
     */
    avertissement(message, donnees = null) {
        this.log(NIVEAUX.AVERTISSEMENT, message, donnees);
    }
    
    /**
     * Log d'information
     */
    info(message, donnees = null) {
        this.log(NIVEAUX.INFO, message, donnees);
    }
    
    /**
     * Log de debug
     */
    debug(message, donnees = null) {
        // Afficher les logs DEBUG si LOG_LEVEL le permet
        const logLevel = process.env.LOG_LEVEL || 'INFO';
        if (logLevel === 'DEBUG' || process.env.NODE_ENV === 'development') {
            this.log(NIVEAUX.DEBUG, message, donnees);
        }
    }
}
