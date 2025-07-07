/**
 * Service Keep-Alive
 * Maintient le bot actif et évite les timeouts sur Railway
 */

import Logger from './logger.js';
import healthCheckService from './healthcheck.js';

const logger = new Logger('KeepAlive');

class KeepAliveService {
    constructor() {
        this.intervalId = null;
        this.lastActivity = Date.now();
        this.inactivityThreshold = 300000; // 5 minutes
    }
    
    /**
     * Démarre le service keep-alive
     */
    start(client) {
        if (this.intervalId) {
            logger.avertissement('Service keep-alive déjà démarré');
            return;
        }
        
        logger.info('Démarrage du service keep-alive');
        
        // Ping toutes les 2 minutes
        this.intervalId = setInterval(() => {
            this.performKeepAlive(client);
        }, 120000); // 2 minutes
        
        // Premier ping immédiat
        this.performKeepAlive(client);
    }
    
    /**
     * Effectue les actions de keep-alive
     */
    performKeepAlive(client) {
        try {
            // Vérifier la connexion Discord
            if (!client || !client.isReady()) {
                logger.avertissement('Client Discord non prêt pour keep-alive');
                return;
            }
            
            // Mettre à jour le timestamp d'activité
            this.lastActivity = Date.now();
            
            // Vérifier le WebSocket ping
            const ping = client.ws.ping;
            logger.debug(`Keep-alive: WebSocket ping = ${ping}ms`);
            
            // Si le ping est trop élevé, logger un avertissement
            if (ping > 500) {
                logger.avertissement(`Ping élevé détecté: ${ping}ms`);
                healthCheckService.logError(new Error(`High ping: ${ping}ms`));
            }
            
            // Forcer une mise à jour des métriques
            healthCheckService.updateDiscordMetrics(client);
            
            // Log périodique pour Railway
            logger.info(`Keep-alive: Bot actif - Ping: ${ping}ms, Guilds: ${client.guilds.cache.size}`);
            
        } catch (erreur) {
            logger.erreur('Erreur dans keep-alive', erreur);
        }
    }
    
    /**
     * Vérifie si le bot est inactif depuis trop longtemps
     */
    checkInactivity() {
        const inactiveDuration = Date.now() - this.lastActivity;
        return inactiveDuration > this.inactivityThreshold;
    }
    
    /**
     * Arrête le service keep-alive
     */
    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
            logger.info('Service keep-alive arrêté');
        }
    }
}

export default new KeepAliveService();
