import { createServer, IncomingMessage, ServerResponse } from 'http';
import { Client } from 'discord.js';
import logger from '../utils/logger.js';
import { MetricsService } from '../services/MetricsService.js';
import { CacheService } from '../services/CacheService.js';

export class HealthController {
    private server: ReturnType<typeof createServer>;
    private client: Client;
    private metricsService: MetricsService;
    private cacheService: CacheService;
    private port: number;

    constructor(
        client: Client, 
        metricsService: MetricsService,
        cacheService: CacheService
    ) {
        this.client = client;
        this.metricsService = metricsService;
        this.cacheService = cacheService;
        this.port = parseInt(process.env.PORT || '3000');
        
        this.server = createServer(this.handleRequest.bind(this));
    }

    private async handleRequest(req: IncomingMessage, res: ServerResponse) {
        res.setHeader('Content-Type', 'application/json');

        try {
            const url = req.url || '/';
            
            switch (url) {
                case '/health':
                    await this.handleHealth(res);
                    break;
                    
                case '/metrics':
                    await this.handleMetrics(res);
                    break;
                    
                case '/':
                    res.writeHead(200);
                    res.end(JSON.stringify({ 
                        name: 'Discord Bot Pro',
                        version: '2.0.0',
                        endpoints: ['/health', '/metrics']
                    }));
                    break;
                    
                default:
                    res.writeHead(404);
                    res.end(JSON.stringify({ error: 'Not Found' }));
            }
        } catch (error) {
            logger.error('Health endpoint error:', error);
            res.writeHead(500);
            res.end(JSON.stringify({ error: 'Internal Server Error' }));
        }
    }

    private async handleHealth(res: ServerResponse) {
        const isReady = this.client.isReady();
        const health = {
            status: isReady ? 'healthy' : 'unhealthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            discord: {
                connected: isReady,
                ping: this.client.ws.ping,
                guilds: this.client.guilds.cache.size,
                users: this.client.users.cache.size
            },
            memory: {
                used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
                total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
            },
            cache: {
                size: this.cacheService.getSize(),
                hits: this.cacheService.getStats().hits,
                misses: this.cacheService.getStats().misses
            }
        };

        res.writeHead(isReady ? 200 : 503);
        res.end(JSON.stringify(health, null, 2));
    }

    private async handleMetrics(res: ServerResponse) {
        const metrics = await this.metricsService.getMetrics();
        
        res.writeHead(200);
        res.end(JSON.stringify(metrics, null, 2));
    }

    public async start(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.server.listen(this.port, () => {
                logger.info(`🏥 Health controller démarré sur le port ${this.port}`);
                resolve();
            });

            this.server.on('error', (error) => {
                logger.error('Erreur du serveur de santé:', error);
                reject(error);
            });
        });
    }

    public stop(): void {
        this.server.close();
    }
}
