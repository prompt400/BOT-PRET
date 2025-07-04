/**
 * Service de health check HTTP
 * Fournit un endpoint /health pour Railway
 */

import { createServer } from 'http';
import Logger from './logger.js';

const logger = new Logger('HealthCheck');

class HealthCheckService {
    constructor() {
        this.server = null;
        this.isHealthy = false;
        this.startTime = Date.now();
    }

    /**
     * Démarre le serveur HTTP de health check
     */
    demarrer() {
        const port = process.env.PORT || 3000;
        
        this.server = createServer((req, res) => {
            if (req.url === '/health' && req.method === 'GET') {
                const uptime = Math.floor((Date.now() - this.startTime) / 1000);
                const response = {
                    status: this.isHealthy ? 'healthy' : 'unhealthy',
                    uptime: uptime,
                    timestamp: new Date().toISOString(),
                    service: 'bot-discord',
                    version: '1.0.0'
                };
                
                res.writeHead(this.isHealthy ? 200 : 503, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(response));
            } else {
                res.writeHead(404);
                res.end('Not Found');
            }
        });
        
        this.server.listen(port, () => {
            logger.info(`Serveur de health check démarré sur le port ${port}`);
        });
    }
    
    /**
     * Définit l'état de santé du service
     */
    setHealthy(isHealthy) {
        this.isHealthy = isHealthy;
        logger.info(`État de santé mis à jour: ${isHealthy ? 'sain' : 'non sain'}`);
    }
    
    /**
     * Arrête le serveur de health check
     */
    arreter() {
        if (this.server) {
            this.server.close(() => {
                logger.info('Serveur de health check arrêté');
            });
        }
    }
}

export default new HealthCheckService();
