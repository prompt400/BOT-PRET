import { SlashCommandBuilder } from 'discord.js';
export default {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Affiche la latence du bot')
        .setDMPermission(false),
    async execute(interaction) {
        const sent = await interaction.reply({ content: '🏓 Calcul...', fetchReply: true });
        const latency = sent.createdTimestamp - interaction.createdTimestamp;
        await interaction.editReply(`🏓 Pong!\n⏱️ Latence: ${latency}ms\n🌐 API: ${Math.round(interaction.client.ws.ping)}ms`);
    }
};
//# sourceMappingURL=ping.js.map