import { SlashCommandBuilder } from 'discord.js';
import UserDashboard from '../modules/analytics/UserDashboard.js';
import AnalyticsManager from '../modules/analytics/AnalyticsManager.js';
import Logger from '../services/logger.js';

const logger = new Logger('StatsCmd');

export default {
    data: new SlashCommandBuilder()
        .setName('stats')
        .setDescription('📊 Afficher vos statistiques personnelles ou celles d\'un membre')
        .addUserOption(option =>
            option
                .setName('membre')
                .setDescription('Le membre dont vous voulez voir les statistiques')
                .setRequired(false)
        ),
    
    async execute(interaction) {
        try {
            // Enregistrer l'utilisation de la commande
            AnalyticsManager.trackCommand('stats', interaction.user.id, interaction.guild.id);
            
            // Récupérer l'utilisateur cible
            const targetUser = interaction.options.getUser('membre') || interaction.user;
            
            // Créer le dashboard
            await UserDashboard.createDashboard(interaction, targetUser);
            
        } catch (error) {
            logger.error('❌ Erreur dans la commande stats:', error);
            
            const errorMessage = {
                content: '❌ Une erreur est survenue lors de l\'affichage des statistiques.',
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
