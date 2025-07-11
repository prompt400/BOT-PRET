// Charger les variables d'environnement
require('dotenv').config();

// Forcer l'utilisation de l'URL publique pour le développement local
const DATABASE_URL = 'postgresql://postgres:iUiCLRMmcMcrECOnlyoOMjWksKWlmOKl@caboose.proxy.rlwy.net:46950/railway';
process.env.DATABASE_URL = DATABASE_URL;

// Importer les dépendances
const { testConnection, syncDatabase, sequelize } = require('./index.js');
const logger = require('../services/logger-cjs.js');

async function testDatabaseConnection() {
  try {
    logger.info('🚀 Démarrage du test de connexion à PostgreSQL Railway...');
    logger.info('📍 URL utilisée : ' + DATABASE_URL.replace(/:[^:@]+@/, ':****@'));
    
    // Test de connexion
    const connectionSuccess = await testConnection();
    if (!connectionSuccess) {
      throw new Error('Impossible de se connecter à la base de données');
    }
    
    // Synchronisation des modèles
    logger.info('📊 Synchronisation des modèles...');
    const syncSuccess = await syncDatabase({ alter: true });
    if (!syncSuccess) {
      throw new Error('Impossible de synchroniser les modèles');
    }
    
    // Importer les modèles après synchronisation
    const { User, Role, VerificationStep, UserRole } = require('./models/index.js');
    
    logger.info('🧪 Création des données de test...');
    
    // Créer un utilisateur de test
    const testUser = await User.create({
      discordId: '123456789012345678',
      username: 'TestUser',
      discriminator: '0001',
      avatar: 'test_avatar_hash',
      kissCoins: 100,
      flameTokens: 0,
      gemLust: 0
    });
    logger.info(`✅ Utilisateur de test créé : ${testUser.username} (ID: ${testUser.id})`);
    logger.info(`💰 Wallet initial : ${testUser.kissCoins} KissCoins, ${testUser.flameTokens} FlameTokens, ${testUser.gemLust} GemLust`);
    
    // Créer un rôle de test
    const testRole = await Role.create({
      name: 'test_role',
      displayName: 'Rôle de Test',
      emoji: '🧪',
      description: 'Rôle utilisé pour les tests de la base de données',
      color: '#00FF00',
      nsfw_level: 1,
      priority: 99
    });
    logger.info(`✅ Rôle de test créé : ${testRole.displayName}`);
    
    // Créer les étapes de vérification
    const verificationSteps = [
      { stepNumber: 1, stepName: 'LANGUAGE_TEST', completed: true, score: 100 },
      { stepNumber: 2, stepName: 'RULES_QUIZ', completed: true, score: 90 },
      { stepNumber: 3, stepName: 'AGE_VERIFICATION', completed: true },
      { stepNumber: 4, stepName: 'PERSONALITY_TEST', completed: false }
    ];
    
    for (const stepData of verificationSteps) {
      const step = await VerificationStep.create({
        userId: testUser.id,
        ...stepData
      });
      logger.info(`✅ Étape ${step.stepNumber} créée : ${step.stepName} (Complétée: ${step.completed})`);
    }
    
    // Tester les associations
    logger.info('🔗 Test des associations...');
    
    // Ajouter le rôle à l'utilisateur
    await testUser.addRoleByName('test_role', 'SYSTEM');
    logger.info('✅ Rôle associé à l\'utilisateur');
    
    // Vérifier les associations
    const userRoles = await testUser.getRoles();
    logger.info(`✅ L'utilisateur a ${userRoles.length} rôle(s)`);
    
    const userSteps = await testUser.getVerificationSteps();
    logger.info(`✅ L'utilisateur a ${userSteps.length} étape(s) de vérification`);
    
    const isVerified = await testUser.isFullyVerified();
    logger.info(`✅ Statut de vérification complète : ${isVerified}`);
    
    // Tester les méthodes du wallet
    logger.info('💰 Test des méthodes du wallet...');
    await testUser.addCoins('kiss', 50);
    logger.info(`✅ Ajout de 50 KissCoins - Nouveau solde : ${testUser.kissCoins}`);
    
    await testUser.removeCoins('kiss', 25);
    logger.info(`✅ Retrait de 25 KissCoins - Nouveau solde : ${testUser.kissCoins}`);
    
    // Compter les tables créées
    const tables = await sequelize.getQueryInterface().showAllTables();
    logger.info(`📋 Tables créées : ${tables.join(', ')}`);
    
    logger.info('\n✨ === TOUS LES TESTS SONT PASSÉS AVEC SUCCÈS === ✨\n');
    
    // Nettoyage
    logger.info('🧹 Nettoyage des données de test...');
    await VerificationStep.destroy({ where: { userId: testUser.id } });
    await UserRole.destroy({ where: { userId: testUser.id } });
    await testUser.destroy();
    await testRole.destroy();
    logger.info('✅ Données de test supprimées');
    
  } catch (error) {
    logger.error('❌ ERREUR lors du test de la base de données :', error);
    process.exit(1);
  } finally {
    await sequelize.close();
    logger.info('👋 Connexion à la base de données fermée');
  }
}

// Lancer le test
testDatabaseConnection();
