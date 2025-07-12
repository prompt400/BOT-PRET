const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Répond avec Pong! et affiche la latence du bot'),
    
    async execute(interaction) {
        const sent = await interaction.reply({ 
            content: '🏓 Pong!', 
            fetchReply: true 
        });
        
        const latency = sent.createdTimestamp - interaction.createdTimestamp;
        const apiLatency = Math.round(interaction.client.ws.ping);
        
        await interaction.editReply({
            content: `🏓 Pong!\n⏱️ Latence: ${latency}ms\n🌐 API: ${apiLatency}ms`
        });
    }
};
