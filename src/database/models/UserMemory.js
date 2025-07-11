module.exports = (sequelize, DataTypes) => {
    const UserMemory = sequelize.define('UserMemory', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        userId: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
            field: 'user_id'
        },
        preferences: {
            type: DataTypes.JSONB,
            defaultValue: {},
            comment: 'Préférences utilisateur (thèmes favoris, style de RP, etc.)'
        },
        personalityProfile: {
            type: DataTypes.JSONB,
            defaultValue: {},
            field: 'personality_profile',
            comment: 'Profil de personnalité analysé (style communication, intérêts, etc.)'
        },
        aiInteractions: {
            type: DataTypes.JSONB,
            defaultValue: {
                favoriteAI: null,
                totalInteractions: 0,
                lastInteraction: null,
                stats: {}
            },
            field: 'ai_interactions',
            comment: 'Statistiques d\'interaction avec les IA'
        },
        contextData: {
            type: DataTypes.JSONB,
            defaultValue: {},
            field: 'context_data',
            comment: 'Données contextuelles additionnelles'
        },
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            field: 'created_at'
        },
        updatedAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            field: 'updated_at'
        }
    }, {
        tableName: 'user_memories',
        timestamps: true,
        underscored: true,
        indexes: [
            {
                unique: true,
                fields: ['user_id']
            }
        ]
    });

    return UserMemory;
};
