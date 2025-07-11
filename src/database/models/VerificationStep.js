import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const VerificationStep = sequelize.define('VerificationStep', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },
    // Numéro de l'étape (1-4)
    stepNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 4
      }
    },
    // Nom de l'étape
    stepName: {
      type: DataTypes.ENUM(
        'LANGUAGE_TEST',      // Test linguistique français
        'RULES_QUIZ',         // Quiz sur le règlement
        'AGE_VERIFICATION',   // Vérification d'âge 18+
        'PERSONALITY_TEST'    // Test de personnalité érotique
      ),
      allowNull: false
    },
    // Statut de complétion
    completed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    // Date de complétion
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    // Nombre de tentatives
    attempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    // Score obtenu (pour les quiz)
    score: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 0,
        max: 100
      }
    },
    // Données additionnelles (réponses, etc.)
    data: {
      type: DataTypes.JSON,
      defaultValue: {}
    },
    // Personnalité détectée (pour l'étape 4)
    detectedPersonality: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // Rôle recommandé (pour l'étape 4)
    recommendedRole: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'verification_steps',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['user_id', 'step_number'], unique: true },
      { fields: ['user_id'] },
      { fields: ['completed'] },
      { fields: ['step_name'] }
    ]
  });

  // Méthodes de classe
  VerificationStep.getStepsForUser = function(userId) {
    return this.findAll({
      where: { userId },
      order: [['stepNumber', 'ASC']]
    });
  };

  VerificationStep.getUserProgress = async function(userId) {
    const steps = await this.findAll({
      where: { userId },
      order: [['stepNumber', 'ASC']]
    });
    
    const completed = steps.filter(s => s.completed).length;
    const total = 4;
    const percentage = (completed / total) * 100;
    
    return {
      completed,
      total,
      percentage,
      steps: steps.map(s => ({
        number: s.stepNumber,
        name: s.stepName,
        completed: s.completed,
        score: s.score,
        attempts: s.attempts
      }))
    };
  };

  // Méthodes d'instance
  VerificationStep.prototype.complete = async function(score = null, data = {}) {
    this.completed = true;
    this.completedAt = new Date();
    this.attempts += 1;
    
    if (score !== null) {
      this.score = score;
    }
    
    if (data) {
      this.data = { ...this.data, ...data };
    }
    
    return await this.save();
  };

  VerificationStep.prototype.reset = async function() {
    this.completed = false;
    this.completedAt = null;
    this.score = null;
    this.attempts = 0;
    this.data = {};
    
    return await this.save();
  };

  return VerificationStep;
};
