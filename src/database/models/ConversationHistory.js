module.exports = (sequelize, DataTypes) => {
    const ConversationHistory = sequelize.define('ConversationHistory', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        conversationId: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'conversation_id',
            comment: 'Format: userId_aiPersonality'
        },
        userId: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'user_id'
        },
        aiPersonality: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'ai_personality',
            comment: 'Nom de la personnalité IA (narrateur, maitresse, etc.)'
        },
        message: {
            type: DataTypes.TEXT,
            allowNull: false,
            comment: 'Contenu du message'
        },
        isUserMessage: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            field: 'is_user_message',
            comment: 'true si message de l\'utilisateur, false si réponse IA'
        },
        metadata: {
            type: DataTypes.JSONB,
            defaultValue: {},
            comment: 'Métadonnées du message (longueur, emojis, etc.)'
        },
        timestamp: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            allowNull: false
        },
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            field: 'created_at'
        }
    }, {
        tableName: 'conversation_histories',
        timestamps: false, // On gère manuellement avec timestamp
        underscored: true,
        indexes: [
            {
                fields: ['conversation_id', 'timestamp']
            },
            {
                fields: ['user_id']
            },
            {
                fields: ['ai_personality']
            }
        ]
    });

    return ConversationHistory;
};
