const { Sequelize } = require('sequelize');
const logger = require('../services/logger-cjs');
const config = require('../config/database');

// D�terminer l'environnement
const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

let sequelize = null;

/**
 * Initialise la connexion � la base de donn�es PostgreSQL Railway
 * @returns {Sequelize|null} Instance Sequelize ou null si DATABASE_URL n'est pas d�finie
 */
function initializeDatabase() {
  // Si DATABASE_URL n'est pas d�finie, retourner null
  if (!dbConfig.url) {
    logger.warn('DATABASE_URL non d�finie - La base de donn�es ne sera pas initialis�e');
    return null;
  }

  try {
    // Cr�er l'instance Sequelize avec configuration optimis�e pour Railway
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

    logger.info('? Instance Sequelize cr��e avec succ�s pour PostgreSQL Railway');
    return sequelize;
  } catch (error) {
    logger.error('? Erreur lors de la cr�ation de l\'instance Sequelize:', error);
    return null;
  }
}

/**
 * Teste la connexion � la base de donn�es PostgreSQL Railway
 * @returns {Promise<boolean>} True si la connexion est r�ussie, false sinon
 */
async function testConnection() {
  if (!sequelize) {
    logger.warn('Impossible de tester la connexion - Instance Sequelize non initialis�e');
    return false;
  }

  try {
    await sequelize.authenticate();
    logger.info('? Connexion � PostgreSQL Railway �tablie avec succ�s!');
    const dbName = dbConfig.url.split('/').pop().split('?')[0];
    logger.info('?? Base de donn�es: ' + dbName);
    return true;
  } catch (error) {
    logger.error('? Impossible de se connecter � PostgreSQL Railway:', error.message);
    return false;
  }
}

/**
 * Synchronise les mod�les avec la base de donn�es
 * @param {Object} options - Options de synchronisation
 * @returns {Promise<boolean>} True si la synchronisation est r�ussie, false sinon
 */
async function syncDatabase(options = {}) {
  if (!sequelize) {
    logger.warn('Impossible de synchroniser - Instance Sequelize non initialis�e');
    return false;
  }

  try {
    // Importer les mod�les
    const models = require('./models');
    
    // Synchroniser avec options par d�faut pour le d�veloppement
    const syncOptions = {
      alter: env === 'development', // Alt�re les tables en d�veloppement
      force: false, // Ne jamais forcer la suppression des tables
      ...options
    };
    
    await sequelize.sync(syncOptions);
    logger.info('? Mod�les synchronis�s avec PostgreSQL Railway');
    logger.info('?? Tables cr��es: ' + Object.keys(models).join(', '));
    return true;
  } catch (error) {
    logger.error('? Erreur lors de la synchronisation des mod�les:', error.message);
    return false;
  }
}

/**
 * Ferme la connexion � la base de donn�es
 * @returns {Promise<void>}
 */
async function closeConnection() {
  if (!sequelize) {
    return;
  }

  try {
    await sequelize.close();
    logger.info('? Connexion � PostgreSQL Railway ferm�e');
    sequelize = null;
  } catch (error) {
    logger.error('? Erreur lors de la fermeture de la connexion:', error.message);
  }
}

/**
 * Gestionnaire pour fermer proprement la connexion lors de l'arr�t du processus
 */
process.on('SIGINT', async () => {
  logger.info('?? Signal SIGINT re�u - Fermeture de la connexion PostgreSQL...');
  await closeConnection();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('?? Signal SIGTERM re�u - Fermeture de la connexion PostgreSQL...');
  await closeConnection();
  process.exit(0);
});

// Initialiser la base de donn�es au chargement du module
const instance = initializeDatabase();

module.exports = {
  sequelize: instance,
  Sequelize,
  initializeDatabase,
  testConnection,
  syncDatabase,
  closeConnection
};
