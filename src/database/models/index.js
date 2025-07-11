import { sequelize } from '../index.js';
import UserModel from './User.js';
import RoleModel from './Role.js';
import VerificationStepModel from './VerificationStep.js';

// Si sequelize est null (pas de DB), exporter des valeurs null
let User = null;
let Role = null;
let VerificationStep = null;
let UserRole = null;

if (sequelize) {
  // Initialiser les modèles
  User = UserModel(sequelize);
  Role = RoleModel(sequelize);
  VerificationStep = VerificationStepModel(sequelize);

  // Créer la table de liaison User-Role
  UserRole = sequelize.define('UserRole', {
  id: {
    type: sequelize.Sequelize.DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: sequelize.Sequelize.DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  roleId: {
    type: sequelize.Sequelize.DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'roles',
      key: 'id'
    }
  },
  assignedAt: {
    type: sequelize.Sequelize.DataTypes.DATE,
    defaultValue: sequelize.Sequelize.NOW
  },
  assignedBy: {
    type: sequelize.Sequelize.DataTypes.STRING,
    allowNull: true
  },
  expiresAt: {
    type: sequelize.Sequelize.DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'user_roles',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['user_id', 'role_id'], unique: true },
    { fields: ['user_id'] },
    { fields: ['role_id'] }
  ]
  });

  // Définir les associations
  // User <-> VerificationStep (Un utilisateur a plusieurs étapes de vérification)
  User.hasMany(VerificationStep, {
    foreignKey: 'userId',
    as: 'verificationSteps',
    onDelete: 'CASCADE'
  });

  VerificationStep.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
  });

  // User <-> Role (Relation many-to-many)
  User.belongsToMany(Role, {
    through: UserRole,
    foreignKey: 'userId',
    otherKey: 'roleId',
    as: 'roles'
  });

  Role.belongsToMany(User, {
    through: UserRole,
    foreignKey: 'roleId',
    otherKey: 'userId',
    as: 'users'
  });

  // Associations directes avec UserRole pour plus de contrôle
  User.hasMany(UserRole, {
    foreignKey: 'userId',
    as: 'userRoles'
  });

  Role.hasMany(UserRole, {
    foreignKey: 'roleId',
    as: 'roleUsers'
  });

  UserRole.belongsTo(User, {
    foreignKey: 'userId'
  });

  UserRole.belongsTo(Role, {
    foreignKey: 'roleId'
  });

  // Méthodes utilitaires pour User
  User.prototype.hasRole = async function(roleName) {
    const roles = await this.getRoles();
    return roles.some(role => role.name === roleName);
  };

  User.prototype.addRoleByName = async function(roleName, assignedBy = 'SYSTEM') {
    const role = await Role.findOne({ where: { name: roleName } });
    if (!role) throw new Error("Rôle '" + roleName + "' introuvable");
    
    const exists = await UserRole.findOne({
      where: { userId: this.id, roleId: role.id }
    });
    
    if (!exists) {
      await UserRole.create({
        userId: this.id,
        roleId: role.id,
        assignedBy
      });
    }
    
    return role;
  };

  User.prototype.removeRoleByName = async function(roleName) {
    const role = await Role.findOne({ where: { name: roleName } });
    if (!role) return false;
    
    const result = await UserRole.destroy({
      where: { userId: this.id, roleId: role.id }
    });
    
    return result > 0;
  };

  // Méthode pour vérifier si l'utilisateur a complété toutes les étapes
  User.prototype.isFullyVerified = async function() {
    const steps = await this.getVerificationSteps();
    return steps.length === 4 && steps.every(step => step.completed);
  };

  // Méthode pour obtenir le prochain rôle recommandé
  User.prototype.getRecommendedRole = async function() {
    const lastStep = await VerificationStep.findOne({
      where: {
        userId: this.id,
        stepName: 'PERSONALITY_TEST',
        completed: true
      }
    });
    
    if (lastStep && lastStep.recommendedRole) {
      return await Role.findOne({ where: { name: lastStep.recommendedRole } });
    }
    
    // Rôle par défaut si pas de recommandation
    return await Role.findOne({ where: { name: 'creature_curieuse' } });
  };
} // Fin du bloc if (sequelize)

// Exporter tous les modèles
export {
  User,
  Role,
  VerificationStep,
  UserRole,
  sequelize
};
