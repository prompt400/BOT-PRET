const { Sequelize } = require('sequelize');
const logger = require('../services/logger-cjs');
const config = require('../config/database');

// Déterminer l'environnement
const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

let sequelize = null;

/**
 * Initialise la connexion à la base de données PostgreSQL Railway
 * @returns {Sequelize|null} Instance Sequelize ou null si DATABASE_URL n'est pas définie
 */
function initializeDatabase() {
  // Si DATABASE_URL n'est pas définie, retourner null
  if (!dbConfig.url) {
    logger.warn('DATABASE_URL non définie - La base de données ne sera pas initialisée');
    return null;
  }

  try {
    // Créer l'instance Sequelize avec configuration optimisée pour Railway
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

    logger.info('? Instance Sequelize créée avec succès pour PostgreSQL Railway');
    return sequelize;
  } catch (error) {
    logger.error('? Erreur lors de la création de l\'instance Sequelize:', error);
    return null;
  }
}

/**
 * Teste la connexion à la base de données PostgreSQL Railway
 * @returns {Promise<boolean>} True si la connexion est réussie, false sinon
 */
async function testConnection() {
  if (!sequelize) {
    logger.warn('Impossible de tester la connexion - Instance Sequelize non initialisée');
    return false;
  }

  try {
    await sequelize.authenticate();
    logger.info('? Connexion à PostgreSQL Railway établie avec succès!');
    const dbName = dbConfig.url.split('/').pop().split('?')[0];
    logger.info('?? Base de données: ' + dbName);
    return true;
  } catch (error) {
    logger.error('? Impossible de se connecter à PostgreSQL Railway:', error.message);
    return false;
  }
}

/**
 * Synchronise les modèles avec la base de données
 * @param {Object} options - Options de synchronisation
 * @returns {Promise<boolean>} True si la synchronisation est réussie, false sinon
 */
async function syncDatabase(options = {}) {
  if (!sequelize) {
    logger.warn('Impossible de synchroniser - Instance Sequelize non initialisée');
    return false;
  }

  try {
    // Importer les modèles
    const models = require('./models');
    
    // Synchroniser avec options par défaut pour le développement
    const syncOptions = {
      alter: env === 'development', // Altère les tables en développement
      force: false, // Ne jamais forcer la suppression des tables
      ...options
    };
    
    await sequelize.sync(syncOptions);
    logger.info('? Modèles synchronisés avec PostgreSQL Railway');
    logger.info('?? Tables créées: ' + Object.keys(models).join(', '));
    return true;
  } catch (error) {
    logger.error('? Erreur lors de la synchronisation des modèles:', error.message);
    return false;
  }
}

/**
 * Ferme la connexion à la base de données
 * @returns {Promise<void>}
 */
async function closeConnection() {
  if (!sequelize) {
    return;
  }

  try {
    await sequelize.close();
    logger.info('? Connexion à PostgreSQL Railway fermée');
    sequelize = null;
  } catch (error) {
    logger.error('? Erreur lors de la fermeture de la connexion:', error.message);
  }
}

/**
 * Gestionnaire pour fermer proprement la connexion lors de l'arrêt du processus
 */
process.on('SIGINT', async () => {
  logger.info('?? Signal SIGINT reçu - Fermeture de la connexion PostgreSQL...');
  await closeConnection();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('?? Signal SIGTERM reçu - Fermeture de la connexion PostgreSQL...');
  await closeConnection();
  process.exit(0);
});

// Initialiser la base de données au chargement du module
const instance = initializeDatabase();

module.exports = {
  sequelize: instance,
  Sequelize,
  initializeDatabase,
  testConnection,
  syncDatabase,
  closeConnection
};
