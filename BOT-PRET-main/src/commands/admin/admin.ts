import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import type { Command } from '../../types/Command.js';
import { databaseManager } from '../../managers/DatabaseManager.js';
import { Constants } from '../../utils/constants.js';
import { logger } from '../../utils/logger.js';
import { ticketService } from '../../services/TicketService.js';
import { getMemoryUsage } from '../../utils/performance.js';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('admin')
    .setDescription('Administrator commands')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(subcommand =>
      subcommand
        .setName('dbstatus')
        .setDescription('Check database connection status')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('cleanup')
        .setDescription('Clean up inactive tickets')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('reload')
        .setDescription('Reload a command')
        .addStringOption(option =>
          option
            .setName('command')
            .setDescription('The command to reload')
            .setRequired(true)
            .setAutocomplete(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('stats')
        .setDescription('View bot statistics')
    ),

  category: 'admin',
  cooldown: 5,
  permissions: ['Administrator'],

  async autocomplete(interaction) {
    const focusedOption = interaction.options.getFocused(true);

    if (focusedOption.name === 'command') {
      const commands = interaction.client.commands
        .map(cmd => ({ name: cmd.data.name, value: cmd.data.name }))
        .filter(cmd => cmd.name.toLowerCase().includes(focusedOption.value.toLowerCase()));

      await interaction.respond(commands.slice(0, 25));
    }
  },

  async execute(interaction) {
    if (!interaction.guild) {
      await interaction.reply({
        content: '❌ This command can only be used in a server!',
        ephemeral: true,
      });
      return;
    }

    const subcommand = interaction.options.getSubcommand();

    switch (subcommand) {
      case 'dbstatus': {
        await interaction.deferReply({ ephemeral: true });

        try {
          const startTime = Date.now();
          const result = await databaseManager.getPool().query('SELECT NOW() as time, version() as version');
          const endTime = Date.now();
          const latency = endTime - startTime;

          const dbInfo = result.rows[0];
          const poolConfig = databaseManager.getPoolConfig();

          const embed = new EmbedBuilder()
            .setTitle('🗄️ Database Status')
            .setDescription('Database connection is healthy')
            .addFields(
              { name: 'Latency', value: `${latency}ms`, inline: true },
              { name: 'Version', value: dbInfo.version.split(' ')[0], inline: true },
              { name: 'Time', value: new Date(dbInfo.time).toUTCString(), inline: true },
              { name: 'Pool Size', value: (poolConfig.max || 10).toString(), inline: true },
              { name: 'Database', value: dbInfo.version.includes('PostgreSQL') ? 'PostgreSQL' : 'Unknown', inline: true },
              { name: 'Connection Health', value: '🟢 Healthy', inline: true }
            )
            .setColor(Constants.Colors.Success)
            .setTimestamp();

          await interaction.editReply({ embeds: [embed] });
        } catch (error) {
          logger.error('Error checking database status:', error);

          const embed = new EmbedBuilder()
            .setTitle('❌ Database Error')
            .setDescription('Failed to connect to database')
            .addFields({ name: 'Error', value: error instanceof Error ? error.message : 'Database connection failed' })
            .setColor(Constants.Colors.Error)
            .setTimestamp();

          await interaction.editReply({ embeds: [embed] });
        }
        break;
      }

      case 'cleanup': {
        await interaction.deferReply({ ephemeral: true });

        try {
          const closedCount = await ticketService.cleanupInactiveTickets(interaction.guild);

          const embed = new EmbedBuilder()
            .setTitle('🧹 Cleanup Complete')
            .setDescription(`Successfully closed ${closedCount} inactive ticket(s)`)
            .setColor(Constants.Colors.Success)
            .setTimestamp();

          await interaction.editReply({ embeds: [embed] });
        } catch (error) {
          logger.error('Error cleaning up tickets:', error);

          const embed = new EmbedBuilder()
            .setTitle('❌ Cleanup Error')
            .setDescription('Failed to cleanup inactive tickets')
            .addFields({ name: 'Error', value: error instanceof Error ? error.message : 'Cleanup failed' })
            .setColor(Constants.Colors.Error)
            .setTimestamp();

          await interaction.editReply({ embeds: [embed] });
        }
        break;
      }

      case 'reload': {
        await interaction.deferReply({ ephemeral: true });

        try {
          const commandName = interaction.options.getString('command', true);
          const command = interaction.client.commands.get(commandName);

          if (!command) {
            await interaction.editReply({
              content: `❌ Command \`${commandName}\` not found!`,
            });
            return;
          }

          // For ES modules, we can't reliably hot reload
          // Instead, provide user feedback about manual restart requirement
          const embed = new EmbedBuilder()
            .setTitle('ℹ️ Command Reload')
            .setDescription(
              `Command reloading is not available in production mode.\n\n` +
              `To apply changes to \`${commandName}\`, please restart the bot.`
            )
            .setColor(Constants.Colors.Info)
            .setFooter({ text: 'This is a limitation of ES modules in production' })
            .setTimestamp();

          await interaction.editReply({ embeds: [embed] });
        } catch (error) {
          logger.error('Error in reload command:', error);

          const embed = new EmbedBuilder()
            .setTitle('❌ Error')
            .setDescription('An error occurred while processing the reload command')
            .addFields({ 
              name: 'Error', 
              value: error instanceof Error ? error.message : 'Unknown error' 
            })
            .setColor(Constants.Colors.Error)
            .setTimestamp();

          await interaction.editReply({ embeds: [embed] });
        }
        break;
      }

      case 'stats': {
        await interaction.deferReply({ ephemeral: true });

        try {
          const client = interaction.client;
          const memoryUsage = process.memoryUsage();
          const uptime = process.uptime();

          // Calculate uptime
          const days = Math.floor(uptime / 86400);
          const hours = Math.floor((uptime % 86400) / 3600);
          const minutes = Math.floor((uptime % 3600) / 60);
          const seconds = Math.floor(uptime % 60);
          const uptimeString = `${days}d ${hours}h ${minutes}m ${seconds}s`;

          const embed = new EmbedBuilder()
            .setTitle('📊 Bot Statistics')
            .setDescription(`Bot statistics for ${client.user?.tag}`)
            .addFields(
              { name: 'Uptime', value: uptimeString, inline: true },
              { name: 'Memory Usage', value: `${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`, inline: true },
              { name: 'Total Memory', value: `${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`, inline: true },
              { name: 'Servers', value: client.guilds.cache.size.toString(), inline: true },
              { name: 'Users', value: client.users.cache.size.toString(), inline: true },
              { name: 'Commands', value: client.commands.size.toString(), inline: true },
              { name: 'Node Version', value: process.version, inline: true },
              { name: 'Discord.js', value: '14.14.1', inline: true },
              { name: 'Platform', value: process.platform, inline: true }
            )
            .setColor(Constants.Colors.Primary)
            .setTimestamp();

          await interaction.editReply({ embeds: [embed] });
        } catch (error) {
          logger.error('Error getting bot stats:', error);

          const embed = new EmbedBuilder()
            .setTitle('❌ Stats Error')
            .setDescription('Failed to fetch bot statistics')
            .addFields({ name: 'Error', value: error instanceof Error ? error.message : 'Failed to fetch statistics' })
            .setColor(Constants.Colors.Error)
            .setTimestamp();

          await interaction.editReply({ embeds: [embed] });
        }
        break;
      }
    }
  },
};

export default command;
