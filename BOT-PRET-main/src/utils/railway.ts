import { logger } from './logger.js';

/**
 * Railway-specific utilities and optimizations
 */

export interface RailwayConfig {
  isRailway: boolean;
  environment?: string;
  region?: string;
  projectId?: string;
  deploymentId?: string;
}

/**
 * Detect if running on Railway platform
 */
export function getRailwayConfig(): RailwayConfig {
  const isRailway = !!process.env.RAILWAY_ENVIRONMENT;
  
  return {
    isRailway,
    environment: process.env.RAILWAY_ENVIRONMENT,
    region: process.env.RAILWAY_REGION,
    projectId: process.env.RAILWAY_PROJECT_ID,
    deploymentId: process.env.RAILWAY_DEPLOYMENT_ID,
  };
}

/**
 * Get optimized database configuration for Railway
 */
export function getRailwayDatabaseConfig(): Record<string, unknown> {
  const railwayConfig = getRailwayConfig();
  
  if (!railwayConfig.isRailway) {
    return {};
  }
  
  logger.info('Detected Railway environment, applying optimizations');
  
  return {
    // Railway uses self-signed certificates
    ssl: {
      rejectUnauthorized: false,
    },
    // Connection pooling optimizations
    max: 10, // Railway has connection limits
    min: 2,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
    // Keep connections alive
    keepAlive: true,
    keepAliveInitialDelayMillis: 10000,
  };
}

/**
 * Log Railway deployment information
 */
export function logRailwayInfo(): void {
  const config = getRailwayConfig();
  
  if (!config.isRailway) {
    return;
  }
  
  logger.info('Railway deployment information:', {
    environment: config.environment,
    region: config.region,
    projectId: config.projectId,
    deploymentId: config.deploymentId,
  });
}

/**
 * Get Railway-specific environment variables
 */
export function getRailwayEnvVars(): Record<string, string | undefined> {
  return {
    port: process.env.PORT || '3000',
    railwayStaticUrl: process.env.RAILWAY_STATIC_URL,
    railwayPublicDomain: process.env.RAILWAY_PUBLIC_DOMAIN,
  };
}
