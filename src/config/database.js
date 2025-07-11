const logger = require('../services/logger-cjs');

/**
 * Configuration de la base de données PostgreSQL
 * Utilise DATABASE_URL de Railway en production
 */
const config = {
  development: {
    url: process.env.DATABASE_URL || 'postgres://localhost:5432/bot_pret_dev',
    dialect: 'postgres',
    logging: (msg) => logger.debug('[Sequelize]', msg),
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  },
  test: {
    url: process.env.DATABASE_URL || 'postgres://localhost:5432/bot_pret_test',
    dialect: 'postgres',
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  },
  production: {
    url: process.env.DATABASE_URL,
    dialect: 'postgres',
    logging: false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }
};

// Vérification de DATABASE_URL en production
if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
  logger.warn('DATABASE_URL non définie en production - La base de données ne sera pas disponible');
}

module.exports = config;
