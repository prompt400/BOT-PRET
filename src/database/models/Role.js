const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Role = sequelize.define('Role', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true
      }
    },
    displayName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    emoji: {
      type: DataTypes.STRING,
      allowNull: false
    },
    color: {
      type: DataTypes.STRING,
      defaultValue: '#FF69B4', // Rose sensuel par défaut
      validate: {
        is: /^#[0-9A-F]{6}$/i
      }
    },
    // Niveau de sensualité (1-7)
    nsfw_level: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      validate: {
        min: 1,
        max: 7
      }
    },
    // Configuration des permissions
    permissions: {
      type: DataTypes.JSON,
      defaultValue: {
        canAccessPrivateRooms: false,
        canCreateEvents: false,
        canModerateContent: false,
        canAccessPremiumFeatures: false,
        canUseSpecialCommands: false,
        maxPrivateChannels: 0
      }
    },
    // Salons privés associés
    privateChannels: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    // Conditions d'obtention
    requirements: {
      type: DataTypes.JSON,
      defaultValue: {
        level: 1,
        kissCoins: 0,
        flameTokens: 0,
        achievements: [],
        verificationComplete: true
      }
    },
    // Récompenses associées
    rewards: {
      type: DataTypes.JSON,
      defaultValue: {
        dailyKissCoins: 0,
        weeklyFlameTokens: 0,
        experienceBonus: 1.0,
        exclusiveItems: []
      }
    },
    // Priorité d'affichage (ordre dans la liste)
    priority: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    // Le rôle peut-il être acheté dans la boutique ?
    purchasable: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    price: {
      type: DataTypes.JSON,
      defaultValue: {
        kissCoins: 0,
        flameTokens: 0,
        gemLust: 0
      }
    },
    // Nombre maximum de membres ayant ce rôle (0 = illimité)
    maxMembers: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'roles',
    timestamps: true,
    underscored: true,
    indexes: [
      { unique: true, fields: ['name'] },
      { fields: ['priority'] },
      { fields: ['is_active'] }
    ]
  });

  // Méthodes de classe
  Role.getActiveRoles = function() {
    return this.findAll({
      where: { isActive: true },
      order: [['priority', 'ASC']]
    });
  };

  Role.getPurchasableRoles = function() {
    return this.findAll({
      where: {
        isActive: true,
        purchasable: true
      },
      order: [['priority', 'ASC']]
    });
  };

  // Méthodes d'instance
  Role.prototype.canUserPurchase = function(user) {
    if (!this.purchasable) return false;
    
    const price = this.price;
    return user.kissCoins >= price.kissCoins &&
           user.flameTokens >= price.flameTokens &&
           user.gemLust >= price.gemLust;
  };

  Role.prototype.meetsRequirements = function(user) {
    const req = this.requirements;
    
    // Vérifier le niveau
    if (user.level < req.level) return false;
    
    // Vérifier les monnaies
    if (user.kissCoins < req.kissCoins) return false;
    if (user.flameTokens < req.flameTokens) return false;
    
    // Vérifier la vérification
    if (req.verificationComplete && !user.isVerified) return false;
    
    return true;
  };

  return Role;
};
