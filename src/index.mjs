// coding: utf-8
/**
 * Point d'entrée principal du bot Discord
 * Architecture professionnelle niveau entreprise
 */

import { config } from 'dotenv';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

// Importer les modules qui posent problème via require
const ClientDiscord = require('./client.js');
const Logger = require('./services/logger.js');
const { validateurEnvironnement } = require('./validateurs/environnement.js');
const healthCheckService = require('./services/healthcheck.js');

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
    logger.debutOperation('DÉMARRAGE DU BOT DISCORD');
    
    try {
        // ÉTAPE 1: Démarrage du health check
        logger.etape('Démarrage du serveur de health check');
        try {
            healthCheckService.demarrer();
            logger.succes('Serveur de health check démarré');
        } catch (erreur) {
            logger.erreur('Échec du démarrage du health check', erreur);
            throw erreur;
        }
        
        // ÉTAPE 2: Validation de l'environnement
        logger.etape('Validation de l\'environnement');
        try {
            validateurEnvironnement.valider();
            logger.succes('Environnement validé avec succès');
        } catch (erreur) {
            logger.erreur('Environnement invalide', erreur);
            throw erreur;
        }
        
        // ÉTAPE 3: Initialisation du client Discord
        logger.etape('Initialisation du client Discord');
        try {
            clientDiscord = new ClientDiscord();
            await clientDiscord.initialiser();
            logger.succes('Client Discord initialisé');
        } catch (erreur) {
            logger.erreur('Échec de l\'initialisation du client Discord', erreur);
            throw erreur;
        }
        
        // Activation de l'écoute pour guildMemberAdd
        clientDiscord.verificationModule.activateGuildMemberAdd();

        // ÉTAPE 4: Marquer le service comme sain
        healthCheckService.setHealthy(true);
        
        // Fin avec succès
        logger.finOperation('DÉMARRAGE DU BOT DISCORD', true);
        logger.info('✅ Bot Discord opérationnel et prêt à recevoir des commandes');
        
    } catch (erreur) {
        logger.finOperation('DÉMARRAGE DU BOT DISCORD', false);
        logger.erreur('❌ Échec du démarrage du bot Discord', erreur);
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
        logger.avertissement(`Signal ${signal} ignoré, arrêt déjà en cours`);
        return;
    }
    
    isShuttingDown = true;
    logger.debutOperation(`ARRÊT GRACIEUX (Signal: ${signal})`);
    
    // Timeout de sécurité pour forcer l'arrêt
    const forceExitTimeout = setTimeout(() => {
        logger.erreur('⚠️ Timeout d\'arrêt gracieux atteint (10s), arrêt forcé!');
        process.exit(1);
    }, 10000); // 10 secondes
    
    try {
        // ÉTAPE 1: Marquer comme non sain
        logger.etape('Mise à jour du statut de santé');
        healthCheckService.setHealthy(false);
        logger.succes('Service marqué comme non sain');
        
        // ÉTAPE 2: Arrêter le client Discord
        if (clientDiscord) {
            logger.etape('Arrêt du client Discord');
            try {
                await clientDiscord.arreter();
                logger.succes('Client Discord arrêté proprement');
            } catch (erreur) {
                logger.erreur('Erreur lors de l\'arrêt du client Discord', erreur);
            }
        }
        
        // ÉTAPE 3: Arrêter le serveur de health check
        logger.etape('Arrêt du serveur de health check');
        try {
            await new Promise((resolve) => {
                healthCheckService.arreter();
                setTimeout(resolve, 100); // Petit délai pour s'assurer de la fermeture
            });
            logger.succes('Serveur de health check arrêté');
        } catch (erreur) {
            logger.erreur('Erreur lors de l\'arrêt du health check', erreur);
        }
        
        clearTimeout(forceExitTimeout);
        logger.finOperation(`ARRÊT GRACIEUX (Signal: ${signal})`, true);
        logger.info('👋 Bot Discord arrêté proprement');
        process.exit(0);
    } catch (erreur) {
        clearTimeout(forceExitTimeout);
        logger.finOperation(`ARRÊT GRACIEUX (Signal: ${signal})`, false);
        logger.erreur('❌ Erreur fatale lors de l\'arrêt gracieux', erreur);
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
