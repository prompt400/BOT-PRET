const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../../.env') });

// Configuration de la base de données
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  logging: false,
  dialectOptions: {
    ssl: process.env.NODE_ENV === 'production' ? {
      require: true,
      rejectUnauthorized: false
    } : false
  }
});

// Import du modèle Role
const Role = require('../models/Role')(sequelize, Sequelize.DataTypes);

// Import du seed
const rolesSeed = require('./roles');

async function runSeed() {
  try {
    console.log('🔄 Connexion à la base de données...');
    await sequelize.authenticate();
    console.log('✅ Connexion établie');

    console.log('🌱 Exécution du seed des rôles...');
    
    // Supprimer tous les rôles existants pour avoir des données propres
    console.log('🧹 Suppression des rôles existants...');
    await Role.destroy({ where: {} });
    
    // Créer un objet queryInterface minimal
    const queryInterface = {
      bulkInsert: async (tableName, records, options) => {
        // Pas besoin de convertir car Sequelize gère automatiquement avec underscored: true
        await Role.bulkCreate(records, {
          updateOnDuplicate: options ? options.updateOnDuplicate : undefined
        });
      },
      bulkDelete: async (tableName, where) => {
        await Role.destroy({ where: where || {} });
      }
    };

    // Exécuter le seed
    await rolesSeed.up(queryInterface, Sequelize);
    
    console.log('✅ Seed des rôles exécuté avec succès !');
    
    // Afficher les rôles créés
    const roles = await Role.findAll({
      attributes: ['name', 'emoji', 'color', 'nsfw_level']
    });
    
    console.log('\n📋 Rôles créés :');
    roles.forEach(role => {
      console.log(`  ${role.emoji} ${role.name} - Niveau NSFW: ${role.nsfw_level} - Couleur: ${role.color}`);
    });
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'exécution du seed :', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Exécuter le seed
runSeed();
