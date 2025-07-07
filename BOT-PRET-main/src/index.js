/**
 * Point d'entrée principal du bot Discord
 * Architecture professionnelle niveau entreprise
 */

import { config } from 'dotenv';
import ClientDiscord from './client.js';
import Logger from './services/logger.js';
import { validateurEnvironnement } from './validateurs/environnement.js';
import healthCheckService from './services/healthcheck.js';

// Chargement des variables d'environnement
config();

// Instance globale du logger
const logger = new Logger('Principal');

// Log des informations de démarrage
logger.info(`Démarrage avec NODE_ENV=${process.env.NODE_ENV}`);
logger.info(`Version Node.js: ${process.version}`);
logger.info(`Plateforme: ${process.platform}`);
logger.info(`PID: ${process.pid}`);
logger.debug('Variables d\'environnement chargées');

// Variable globale pour le client Discord
let clientDiscord = null;

/**
 * Fonction principale d'initialisation
 * Gère le cycle de vie complet de l'application
 */
async function demarrerApplication() {
    try {
        logger.info('Démarrage de l\'application...');
        
        // Démarrer le serveur de health check immédiatement
        healthCheckService.demarrer();
        
        // Validation de l'environnement
        validateurEnvironnement.valider();
        logger.info('Environnement validé avec succès');
        
        // Initialisation du client Discord
        clientDiscord = new ClientDiscord();
        await clientDiscord.initialiser();
        
        // Marquer le service comme sain une fois connecté
        healthCheckService.setHealthy(true);
        
        logger.info('Bot Discord démarré avec succès');
    } catch (erreur) {
        logger.erreur('Erreur fatale lors du démarrage', erreur);
        healthCheckService.setHealthy(false);
        process.exit(1);
    }
}

// Gestion des erreurs non capturées
process.on('unhandledRejection', (raison, promesse) => {
    logger.erreur('Promesse rejetée non gérée', { raison, promesse });
    healthCheckService.setHealthy(false);
    healthCheckService.logError(new Error(`Unhandled Rejection: ${raison}`));
    
    // Ne pas crash en production pour les rejets de promesses
    if (process.env.NODE_ENV !== 'production') {
        process.exit(1);
    }
});

process.on('uncaughtException', (erreur) => {
    logger.erreur('Exception non capturée', erreur);
    healthCheckService.setHealthy(false);
    healthCheckService.logError(erreur);
    
    // Toujours exit pour les exceptions non capturées
    process.exit(1);
});

// Variable pour éviter les arrêts multiples
let isShuttingDown = false;

/**
 * Fonction d'arrêt gracieux centralisée
 */
async function arreterGracieusement(signal) {
    if (isShuttingDown) {
        logger.info(`Signal ${signal} ignoré, arrêt déjà en cours`);
        return;
    }
    
    isShuttingDown = true;
    logger.info(`Signal ${signal} reçu, début de l'arrêt gracieux...`);
    
    // Timeout de sécurité pour forcer l'arrêt
    const forceExitTimeout = setTimeout(() => {
        logger.erreur('Timeout d\'arrêt gracieux atteint, arrêt forcé');
        process.exit(1);
    }, 10000); // 10 secondes
    
    try {
        // Marquer comme non sain immédiatement
        healthCheckService.setHealthy(false);
        
        // Arrêter le client Discord
        if (clientDiscord) {
            logger.info('Arrêt du client Discord...');
            await clientDiscord.arreter();
        }
        
        // Arrêter le serveur de health check
        logger.info('Arrêt du serveur de health check...');
        await new Promise((resolve) => {
            healthCheckService.arreter();
            setTimeout(resolve, 100); // Petit délai pour s'assurer de la fermeture
        });
        
        clearTimeout(forceExitTimeout);
        logger.info('Arrêt gracieux terminé');
        process.exit(0);
    } catch (erreur) {
        logger.erreur('Erreur lors de l\'arrêt gracieux', erreur);
        clearTimeout(forceExitTimeout);
        process.exit(1);
    }
}

// Gestion des signaux d'arrêt
process.on('SIGINT', () => arreterGracieusement('SIGINT'));
process.on('SIGTERM', () => arreterGracieusement('SIGTERM'));

// Gestion spécifique pour Windows
if (process.platform === 'win32') {
    import('readline').then(({ createInterface }) => {
        const rl = createInterface({
            input: process.stdin,
            output: process.stdout
        });
        
        rl.on('SIGINT', () => {
            process.emit('SIGINT');
        });
    }).catch(err => {
        logger.erreur('Erreur lors du chargement de readline', err);
    });
}

// Démarrage de l'application
demarrerApplication();
