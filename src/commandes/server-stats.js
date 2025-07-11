const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const ServerStats = require('../modules/analytics/ServerStats');
const AnalyticsManager = require('../modules/analytics/AnalyticsManager');
const logger = require('../services/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('server-stats')
        .setDescription('📊 Afficher les statistiques détaillées du serveur')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
    
    async execute(interaction) {
        try {
            // Enregistrer l'utilisation de la commande
            AnalyticsManager.trackCommand('server-stats', interaction.user.id, interaction.guild.id);
            
            // Créer le dashboard serveur
            await ServerStats.createServerDashboard(interaction);
            
        } catch (error) {
            logger.error('❌ Erreur dans la commande server-stats:', error);
            
            const errorMessage = {
                content: '❌ Une erreur est survenue lors de l\'affichage des statistiques du serveur.',
                ephemeral: true
            };
            
            if (interaction.replied || interaction.deferred) {
                await interaction.editReply(errorMessage);
            } else {
                await interaction.reply(errorMessage);
            }
        }
    }
};
