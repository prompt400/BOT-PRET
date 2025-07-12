const { SlashCommandBuilder } = require('discord.js');

/**
 * Commande Ping - Vérifie la latence du bot et de l'API Discord
 * @module commands/ping
 */
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
        const sent = await interaction.reply({ 
            content: '🏓 Pong!' 
        }).then(response => response);
        
        const latency = sent.createdTimestamp - interaction.createdTimestamp;
        const apiLatency = Math.round(interaction.client.ws.ping);
        
        const responseContent = `🏓 Pong!
⏱️ Latence: ${latency}ms
🌐 API: ${apiLatency}ms
🔄 Mise à jour: ${new Date().toLocaleTimeString()}`;

        await interaction.editReply({
            content: responseContent,
            components: []
        });
    }
};
