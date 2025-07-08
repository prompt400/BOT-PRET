// coding: utf-8
/**
 * Service de logging professionnel
 * Gère tous les logs de l'application avec support UTF-8
 */

import chalk from 'chalk';
import { format } from 'date-fns';

class Logger {
    constructor(contexte = 'General') {
        this.contexte = contexte;
        this.niveaux = {
            DEBUG: 0,
            INFO: 1,
            AVERTISSEMENT: 2,
            ERREUR: 3,
            ETAPE: 1,
            SUCCES: 1
        };
        this.niveauActuel = this.niveaux[process.env.LOG_LEVEL] || this.niveaux.INFO;
    }
    
    /**
     * Formate le timestamp avec support UTF-8
     */
    getTimestamp() {
        return format(new Date(), 'yyyy-MM-dd\'T\'HH:mm:ss.SSS\'Z\'');
    }
    
    /**
     * Assure que le texte est correctement encodé en UTF-8
     */
    ensureUTF8(text) {
        if (typeof text !== 'string') {
            return String(text);
        }
        // Force l'encodage UTF-8 pour l'affichage console
        return Buffer.from(text, 'utf8').toString('utf8');
    }
    
    /**
     * Formate le message de log
     */
    formatMessage(niveau, message, data = null) {
        const timestamp = this.getTimestamp();
        const context = this.ensureUTF8(this.contexte);
        const msg = this.ensureUTF8(message);
        
        let logMessage = `[${timestamp}] [${niveau}] [${context}] ${msg}`;
        
        if (data) {
            if (data instanceof Error) {
                logMessage += `\n${data.stack || data.message}`;
            } else {
                logMessage += `\n${JSON.stringify(data, null, 2)}`;
            }
        }
        
        return logMessage;
    }
    
    /**
     * Log de niveau DEBUG
     */
    debug(message, data = null) {
        if (this.niveauActuel <= this.niveaux.DEBUG) {
            console.log(chalk.gray(this.formatMessage('DEBUG', message, data)));
        }
    }
    
    /**
     * Log de niveau INFO
     */
    info(message, data = null) {
        if (this.niveauActuel <= this.niveaux.INFO) {
            console.log(chalk.blue(this.formatMessage('INFO', message, data)));
        }
    }
    
    /**
     * Log de niveau AVERTISSEMENT
     */
    avertissement(message, data = null) {
        if (this.niveauActuel <= this.niveaux.AVERTISSEMENT) {
            console.log(chalk.yellow(this.formatMessage('AVERTISSEMENT', message, data)));
        }
    }
    
    /**
     * Log de niveau ERREUR
     */
    erreur(message, data = null) {
        if (this.niveauActuel <= this.niveaux.ERREUR) {
            console.error(chalk.red(this.formatMessage('ERREUR', message, data)));
        }
    }
    
    /**
     * Log pour marquer une étape importante
     */
    etape(message) {
        if (this.niveauActuel <= this.niveaux.ETAPE) {
            console.log(chalk.cyan(this.formatMessage('ETAPE', message)));
        }
    }
    
    /**
     * Log pour marquer un succès
     */
    succes(message) {
        if (this.niveauActuel <= this.niveaux.SUCCES) {
            console.log(chalk.green(this.formatMessage('SUCCES', message)));
        }
    }
    
    /**
     * Log pour le début d'une opération
     */
    debutOperation(operation) {
        const separator = '='.repeat(60);
        this.etape(`${separator}\n  DÉBUT: ${this.ensureUTF8(operation)}\n${separator}`);
    }
    
    /**
     * Log pour la fin d'une opération
     */
    finOperation(operation, succes = true) {
        const separator = '='.repeat(60);
        if (succes) {
            this.succes(`${separator}\n  FIN AVEC SUCCÈS: ${this.ensureUTF8(operation)}\n${separator}`);
        } else {
            this.erreur(`${separator}\n  FIN AVEC ERREUR: ${this.ensureUTF8(operation)}\n${separator}`);
        }
    }
}

export default Logger;
