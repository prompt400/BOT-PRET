const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const logger = require('../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Affiche la latence du bot et de l\'API Discord')
        .setDMPermission(false),
    
    /**
     * Exécute la commande ping
     * @param {import('discord.js').CommandInteraction} interaction L'interaction de la commande
     * @returns {Promise<void>}
     */
    async execute(interaction) {
        // Log de début d'exécution
        logger.debug('Commande ping initiée', {
            userId: interaction.user.id,
            guildId: interaction.guildId
        });

        // Création de l'embed initial
        const initialEmbed = new EmbedBuilder()
            .setColor('#2b2d31')
            .setTitle('🏓 Ping en cours...')
            .setDescription('Calcul de la latence...')
            .setTimestamp();

        // Envoyer la réponse initiale
        const sent = await interaction.reply({
            embeds: [initialEmbed],
            fetchReply: true
        });

        // Calcul des latences
        const latency = sent.createdTimestamp - interaction.createdTimestamp;
        const apiLatency = Math.round(interaction.client.ws.ping);

        // Création de l'embed final avec les résultats
        const resultEmbed = new EmbedBuilder()
            .setColor(latency > 200 ? '#ff0000' : latency > 100 ? '#ffff00' : '#00ff00')
            .setTitle('🏓 Pong!')
            .addFields(
                { name: '⏱️ Latence Bot', value: `${latency}ms`, inline: true },
                { name: '🌐 Latence API', value: `${apiLatency}ms`, inline: true }
            )
            .setFooter({ text: `Demandé par ${interaction.user.tag}` })
            .setTimestamp();

        // Log des résultats
        logger.info('Commande ping complétée', {
            userId: interaction.user.id,
            guildId: interaction.guildId,
            latency,
            apiLatency
        });

        // Mise à jour de la réponse avec les résultats
        await interaction.editReply({
            embeds: [resultEmbed]
        });
    }
};
