/**
 * Point d'entrée principal du bot Discord
 * Architecture professionnelle niveau entreprise
 */

import { config } from 'dotenv';
import ClientDiscord from './client.js';
import Logger from './services/logger.js';
import { validateurEnvironnement } from './validateurs/environnement.js';

// Chargement des variables d'environnement
config();

// Instance globale du logger
const logger = new Logger('Principal');

/**
 * Fonction principale d'initialisation
 * Gère le cycle de vie complet de l'application
 */
async function demarrerApplication() {
    try {
        logger.info('Démarrage de l\'application...');
        
        // Validation de l'environnement
        validateurEnvironnement.valider();
        logger.info('Environnement validé avec succès');
        
        // Initialisation du client Discord
        const client = new ClientDiscord();
        await client.initialiser();
        
        logger.info('Bot Discord démarré avec succès');
    } catch (erreur) {
        logger.erreur('Erreur fatale lors du démarrage', erreur);
        process.exit(1);
    }
}

// Gestion des erreurs non capturées
process.on('unhandledRejection', (raison, promesse) => {
    logger.erreur('Promesse rejetée non gérée', { raison, promesse });
});

process.on('uncaughtException', (erreur) => {
    logger.erreur('Exception non capturée', erreur);
    process.exit(1);
});

// Gestion de l'arrêt gracieux
process.on('SIGINT', async () => {
    logger.info('Signal d\'arrêt reçu, fermeture gracieuse...');
    process.exit(0);
});

// Démarrage de l'application
demarrerApplication();
