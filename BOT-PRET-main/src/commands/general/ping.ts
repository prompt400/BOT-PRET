import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import type { Command } from '../../types/Command.js';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Check the bot\'s latency and response time'),
  
  category: 'general',
  cooldown: 3,

  async execute(interaction) {
    const sent = await interaction.deferReply({ fetchReply: true });
    
    const embed = new EmbedBuilder()
      .setTitle('🏓 Pong!')
      .setColor(0x00aaff)
      .addFields(
        {
          name: 'Roundtrip Latency',
          value: `${sent.createdTimestamp - interaction.createdTimestamp}ms`,
          inline: true,
        },
        {
          name: 'WebSocket Heartbeat',
          value: `${Math.round(interaction.client.ws.ping)}ms`,
          inline: true,
        }
      )
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};

export default command;