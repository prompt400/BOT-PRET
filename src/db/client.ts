import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.js';
import logger from '../utils/logger.js';

// Configuration de la connexion PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test de connexion
pool.on('connect', () => {
  logger.info('Connexion à la base de données établie');
});

pool.on('error', (err) => {
  logger.error('Erreur de base de données inattendue:', err);
  process.exit(-1);
});

// Export du client Drizzle
export const db = drizzle(pool, { schema });

// Helper pour tester la connexion
export async function testConnection(): Promise<boolean> {
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    logger.info('Test de connexion à la base de données réussi');
    return true;
  } catch (error) {
    logger.error('Test de connexion à la base de données échoué:', error);
    return false;
  }
}

// Fonction pour fermer proprement la connexion
export async function closeConnection(): Promise<void> {
  await pool.end();
  logger.info('Connexion à la base de données fermée');
}
