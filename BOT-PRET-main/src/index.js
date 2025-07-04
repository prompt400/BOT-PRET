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
});

process.on('uncaughtException', (erreur) => {
    logger.erreur('Exception non capturée', erreur);
    healthCheckService.setHealthy(false);
    process.exit(1);
});

// Gestion de l'arrêt gracieux
process.on('SIGINT', async () => {
    logger.info('Signal d\'arrêt reçu, fermeture gracieuse...');
    healthCheckService.setHealthy(false);
    
    // Arrêter le client Discord proprement
    if (clientDiscord) {
        try {
            await clientDiscord.destroy();
        } catch (err) {
            logger.erreur('Erreur lors de la fermeture du client Discord', err);
        }
    }
    
    // Arrêter le serveur de health check
    healthCheckService.arreter();
    
    process.exit(0);
});

process.on('SIGTERM', async () => {
    logger.info('Signal SIGTERM reçu, fermeture gracieuse...');
    healthCheckService.setHealthy(false);
    
    if (clientDiscord) {
        try {
            await clientDiscord.destroy();
        } catch (err) {
            logger.erreur('Erreur lors de la fermeture du client Discord', err);
        }
    }
    
    healthCheckService.arreter();
    process.exit(0);
});

// Démarrage de l'application
demarrerApplication();
