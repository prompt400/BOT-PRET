import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    discordId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true
      }
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false
    },
    discriminator: {
      type: DataTypes.STRING,
      allowNull: true
    },
    avatar: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // Économie du bot - Les 3 monnaies virtuelles
    kissCoins: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
      validate: {
        min: 0
      }
    },
    flameTokens: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
      validate: {
        min: 0
      }
    },
    gemLust: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
      validate: {
        min: 0
      }
    },
    // Statistiques du joueur
    level: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      allowNull: false
    },
    experience: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false
    },
    // Données additionnelles
    stats: {
      type: DataTypes.JSON,
      defaultValue: {
        messagesEnvoyes: 0,
        reactionsRecues: 0,
        tempsActif: 0,
        derniereActivite: null
      }
    },
    preferences: {
      type: DataTypes.JSON,
      defaultValue: {
        theme: 'sensuel',
        notifications: true,
        langue: 'fr'
      }
    },
    achievements: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    // Système de missions
    missions: {
      type: DataTypes.JSON,
      defaultValue: {
        daily: {},
        weekly: {},
        special: {},
        completedMissions: [],
        lastDailyReset: null,
        lastWeeklyReset: null
      }
    },
    // Daily rewards
    dailyStreak: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false
    },
    lastDailyClaim: {
      type: DataTypes.DATE,
      allowNull: true
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isPremium: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    premiumUntil: {
      type: DataTypes.DATE,
      allowNull: true
    },
    bannedUntil: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'users',
    timestamps: true,
    underscored: true,
    indexes: [
      { unique: true, fields: ['discord_id'] },
      { fields: ['level'] },
      { fields: ['is_verified'] }
    ]
  });

  // Méthodes d'instance
  User.prototype.addCoins = async function(type, amount) {
    if (type === 'kiss') {
      this.kissCoins += amount;
    } else if (type === 'flame') {
      this.flameTokens += amount;
    } else if (type === 'gem') {
      this.gemLust += amount;
    }
    return await this.save();
  };

  User.prototype.removeCoins = async function(type, amount) {
    if (type === 'kiss' && this.kissCoins >= amount) {
      this.kissCoins -= amount;
    } else if (type === 'flame' && this.flameTokens >= amount) {
      this.flameTokens -= amount;
    } else if (type === 'gem' && this.gemLust >= amount) {
      this.gemLust -= amount;
    } else {
      throw new Error('Solde insuffisant');
    }
    return await this.save();
  };

  User.prototype.addExperience = async function(amount) {
    this.experience += amount;
    
    // Calcul du niveau (100 XP par niveau, progression exponentielle)
    const requiredXP = this.level * 100 * Math.pow(1.1, this.level - 1);
    if (this.experience >= requiredXP) {
      this.level += 1;
      this.experience = this.experience - requiredXP;
      // Récompense de niveau
      this.kissCoins += 50 * this.level;
    }
    
    return await this.save();
  };

  return User;
};
