const { Sequelize } = require('sequelize');
const logger = require('../services/logger-cjs');
const config = require('../config/database');

// Determiner l'environnement
const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

let sequelize = null;

/**
 * Initialise la connexion a la base de donnees PostgreSQL Railway
 * @returns {Sequelize|null} Instance Sequelize ou null si DATABASE_URL n'est pas definie
 */
function initializeDatabase() {
  // Si DATABASE_URL n'est pas definie, retourner null
  if (!dbConfig.url) {
    logger.warn('DATABASE_URL non definie - La base de donnees ne sera pas initialisee');
    return null;
  }

  try {
    // Creer l'instance Sequelize avec configuration optimisee pour Railway
    sequelize = new Sequelize(dbConfig.url, {
      dialect: dbConfig.dialect,
      logging: dbConfig.logging,
      pool: dbConfig.pool,
      dialectOptions: dbConfig.dialectOptions,
      define: {
        timestamps: true,
        underscored: true,
        freezeTableName: true
      }
    });

    logger.info('[DB] Instance Sequelize creee avec succes pour PostgreSQL Railway');
    return sequelize;
  } catch (error) {
    logger.error('[DB] Erreur lors de la creation de l\'instance Sequelize:', error);
    return null;
  }
}

/**
 * Teste la connexion a la base de donnees PostgreSQL Railway
 * @returns {Promise<boolean>} True si la connexion est reussie, false sinon
 */
async function testConnection() {
  if (!sequelize) {
    logger.warn('Impossible de tester la connexion - Instance Sequelize non initialisee');
    return false;
  }

  try {
    await sequelize.authenticate();
    logger.info('[DB] Connexion a PostgreSQL Railway etablie avec succes!');
    const dbName = dbConfig.url.split('/').pop().split('?')[0];
    logger.info('[DB] Base de donnees: ' + dbName);
    return true;
  } catch (error) {
    logger.error('[DB] Impossible de se connecter a PostgreSQL Railway:', error.message);
    return false;
  }
}

/**
 * Synchronise les modeles avec la base de donnees
 * @param {Object} options - Options de synchronisation
 * @returns {Promise<boolean>} True si la synchronisation est reussie, false sinon
 */
async function syncDatabase(options = {}) {
  if (!sequelize) {
    logger.warn('Impossible de synchroniser - Instance Sequelize non initialisee');
    return false;
  }

  try {
    // Importer les modeles
    const models = require('./models');
    
    // Synchroniser avec options par defaut pour le developpement
    const syncOptions = {
      alter: env === 'development', // Altere les tables en developpement
      force: false, // Ne jamais forcer la suppression des tables
      ...options
    };
    
    await sequelize.sync(syncOptions);
    logger.info('[DB] Modeles synchronises avec PostgreSQL Railway');
    logger.info('[DB] Tables creees: ' + Object.keys(models).join(', '));
    return true;
  } catch (error) {
    logger.error('[DB] Erreur lors de la synchronisation des modeles:', error.message);
    return false;
  }
}

/**
 * Ferme la connexion a la base de donnees
 * @returns {Promise<void>}
 */
async function closeConnection() {
  if (!sequelize) {
    return;
  }

  try {
    await sequelize.close();
    logger.info('[DB] Connexion a PostgreSQL Railway fermee');
    sequelize = null;
  } catch (error) {
    logger.error('[DB] Erreur lors de la fermeture de la connexion:', error.message);
  }
}

/**
 * Gestionnaire pour fermer proprement la connexion lors de l'arret du processus
 */
process.on('SIGINT', async () => {
  logger.info('[DB] Signal SIGINT recu - Fermeture de la connexion PostgreSQL...');
  await closeConnection();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('[DB] Signal SIGTERM recu - Fermeture de la connexion PostgreSQL...');
  await closeConnection();
  process.exit(0);
});

// Initialiser la base de donnees au chargement du module
const instance = initializeDatabase();

module.exports = {
  sequelize: instance,
  Sequelize,
  initializeDatabase,
  testConnection,
  syncDatabase,
  closeConnection
};
