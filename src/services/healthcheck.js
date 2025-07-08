// coding: utf-8
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
        this.metrics = {
            commandsExecuted: 0,
            errorsCount: 0,
            lastError: null,
            memoryUsage: {},
            discordPing: 0,
            connectedGuilds: 0,
            lastHeartbeat: Date.now()
        };
        
        // Mise à jour périodique des métriques
        this.metricsInterval = setInterval(() => this.updateMetrics(), 30000); // 30 secondes
    }

    /**
     * Démarre le serveur HTTP de health check
     */
    demarrer() {
        const port = process.env.PORT || 3000;
        
        this.server = createServer((req, res) => {
            res.setHeader('Content-Type', 'application/json');
            
            if (req.url === '/health' && req.method === 'GET') {
                const uptime = Math.floor((Date.now() - this.startTime) / 1000);
                const response = {
                    status: this.isHealthy ? 'healthy' : 'unhealthy',
                    uptime: uptime,
                    timestamp: new Date().toISOString(),
                    service: 'bot-discord-professionnel',
                    version: '1.0.0',
                    checks: {
                        discord: this.isHealthy,
                        memory: this.checkMemoryHealth(),
                        uptime: uptime > 0
                    }
                };
                
                res.writeHead(this.isHealthy ? 200 : 503);
                res.end(JSON.stringify(response));
            } else if (req.url === '/metrics' && req.method === 'GET') {
                // Endpoint de métriques au format Prometheus
                const uptime = Math.floor((Date.now() - this.startTime) / 1000);
                const memUsage = process.memoryUsage();
                
                const prometheusMetrics = `
# HELP bot_discord_uptime_seconds Uptime du bot Discord en secondes
# TYPE bot_discord_uptime_seconds counter
bot_discord_uptime_seconds ${uptime}

# HELP bot_discord_commands_total Nombre total de commandes exécutées
# TYPE bot_discord_commands_total counter
bot_discord_commands_total ${this.metrics.commandsExecuted}

# HELP bot_discord_errors_total Nombre total d'erreurs
# TYPE bot_discord_errors_total counter
bot_discord_errors_total ${this.metrics.errorsCount}

# HELP bot_discord_guilds_count Nombre de serveurs connectés
# TYPE bot_discord_guilds_count gauge
bot_discord_guilds_count ${this.metrics.connectedGuilds}

# HELP bot_discord_ping_ms Ping Discord en millisecondes
# TYPE bot_discord_ping_ms gauge
bot_discord_ping_ms ${this.metrics.discordPing}

# HELP process_heap_bytes Mémoire heap utilisée en bytes
# TYPE process_heap_bytes gauge
process_heap_bytes ${memUsage.heapUsed}

# HELP process_rss_bytes RSS mémoire en bytes
# TYPE process_rss_bytes gauge
process_rss_bytes ${memUsage.rss}
`.trim();
                
                res.setHeader('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
                res.writeHead(200);
                res.end(prometheusMetrics);
            } else if (req.url === '/ready' && req.method === 'GET') {
                // Endpoint de readiness pour Kubernetes/Railway
                res.writeHead(this.isHealthy ? 200 : 503);
                res.end(JSON.stringify({ ready: this.isHealthy }));
            } else {
                res.writeHead(404);
                res.end(JSON.stringify({ error: 'Not Found' }));
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
     * Met à jour les métriques système
     */
    updateMetrics() {
        const memUsage = process.memoryUsage();
        this.metrics.memoryUsage = {
            heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
            heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
            rss: Math.round(memUsage.rss / 1024 / 1024), // MB
            external: Math.round(memUsage.external / 1024 / 1024) // MB
        };
        this.metrics.lastHeartbeat = Date.now();
    }
    
    /**
     * Vérifie la santé de la mémoire
     */
    checkMemoryHealth() {
        const memUsage = process.memoryUsage();
        const heapUsedMB = memUsage.heapUsed / 1024 / 1024;
        const heapLimitMB = 512; // Limite configurée dans NODE_OPTIONS
        
        return heapUsedMB < heapLimitMB * 0.9; // Alerte si > 90% de la limite
    }
    
    /**
     * Met à jour les métriques Discord
     */
    updateDiscordMetrics(client) {
        if (client && client.ws) {
            this.metrics.discordPing = client.ws.ping || 0;
            this.metrics.connectedGuilds = client.guilds.cache.size || 0;
        }
    }
    
    /**
     * Incrémente le compteur de commandes
     */
    incrementCommandCount() {
        this.metrics.commandsExecuted++;
    }
    
    /**
     * Enregistre une erreur
     */
    logError(error) {
        this.metrics.errorsCount++;
        this.metrics.lastError = {
            message: error.message,
            timestamp: new Date().toISOString(),
            stack: error.stack?.split('\n').slice(0, 3).join('\n') // Premières lignes seulement
        };
    }
    
    /**
     * Arrête le serveur de health check
     */
    arreter() {
        if (this.metricsInterval) {
            clearInterval(this.metricsInterval);
        }
        
        if (this.server) {
            this.server.close(() => {
                logger.info('Serveur de health check arrêté');
            });
        }
    }
}

export default new HealthCheckService();
