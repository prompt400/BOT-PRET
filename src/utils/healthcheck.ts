import { createServer } from 'http';
import { databaseManager } from '../managers/DatabaseManager.js';
import { logger } from '../utils/logger.js';

export function setupHealthCheck(port: number = 3000): void {
  const server = createServer(async (req, res) => {
    if (req.url === '/health') {
      try {
        // Check database
        await databaseManager.getPool().query('SELECT 1');
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          status: 'healthy',
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
          memory: process.memoryUsage(),
        }));
      } catch (error: any) {
        res.writeHead(503, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          status: 'unhealthy',
          error: error.message,
          timestamp: new Date().toISOString(),
        }));
      }
    } else {
      res.writeHead(404);
      res.end();
    }
  });
  
  server.listen(port, () => {
    logger.info(`Health check server listening on port ${port}`);
  });
}
