import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import MissionSystem from '../modules/economy/MissionSystem.js';
import { COULEURS } from '../constantes/theme.js';
import Logger from '../services/logger.js';

const logger = new Logger('MissionsCommand');

export default {
    data: new SlashCommandBuilder()
        .setName('missions')
        .setDescription('Affiche tes missions actives et leurs récompenses'),

    async execute(interaction) {
        try {
            await interaction.deferReply();

            // Récupérer les missions de l'utilisateur
            const missions = await MissionSystem.getUserMissions(interaction.user.id);
            
            // Créer l'embed principal
            const embed = new EmbedBuilder()
                .setTitle('📋 Tes Missions')
                .setDescription('Complète des missions pour gagner des récompenses !')
                .setColor(COULEURS.PRIMAIRE)
                .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
                .setTimestamp();

            // Ajouter les missions quotidiennes
            if (missions.daily.length > 0) {
                const dailyField = missions.daily.map(mission => {
                    const progress = mission.completed ? '✅' : `${mission.currentProgress}/${mission.target}`;
                    const progressBar = this.createProgressBar(mission.percentage);
                    return `${mission.emoji} **${mission.name}**\n${mission.description}\n${progressBar} ${progress}`;
                }).join('\n\n');

                embed.addFields({
                    name: '🌅 Missions Quotidiennes',
                    value: dailyField || 'Aucune mission disponible',
                    inline: false
                });
            }

            // Ajouter les missions hebdomadaires
            if (missions.weekly.length > 0) {
                const weeklyField = missions.weekly.map(mission => {
                    const progress = mission.completed ? '✅' : `${mission.currentProgress}/${mission.target}`;
                    const progressBar = this.createProgressBar(mission.percentage);
                    return `${mission.emoji} **${mission.name}**\n${mission.description}\n${progressBar} ${progress}`;
                }).join('\n\n');

                embed.addFields({
                    name: '📅 Missions Hebdomadaires',
                    value: weeklyField || 'Aucune mission disponible',
                    inline: false
                });
            }

            // Ajouter les missions spéciales
            if (missions.special.length > 0) {
                const specialField = missions.special.map(mission => {
                    const progress = mission.completed ? '✅' : `${mission.currentProgress}/${mission.target}`;
                    const progressBar = this.createProgressBar(mission.percentage);
                    return `${mission.emoji} **${mission.name}**\n${mission.description}\n${progressBar} ${progress}`;
                }).join('\n\n');

                embed.addFields({
                    name: '⭐ Missions Spéciales',
                    value: specialField || 'Aucune mission disponible',
                    inline: false
                });
            }

            // Ajouter le temps avant reset
            const dailyReset = MissionSystem.getTimeUntilReset('daily');
            const weeklyReset = MissionSystem.getTimeUntilReset('weekly');

            embed.addFields({
                name: '⏰ Prochains resets',
                value: `Quotidien: ${dailyReset.hours}h ${dailyReset.minutes}m\nHebdomadaire: ${Math.floor(weeklyReset.hours / 24)}j ${weeklyReset.hours % 24}h`,
                inline: true
            });

            // Créer les boutons de navigation
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('missions_rewards')
                        .setLabel('🎁 Voir les récompenses')
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId('missions_refresh')
                        .setLabel('🔄 Rafraîchir')
                        .setStyle(ButtonStyle.Secondary)
                );

            await interaction.editReply({ embeds: [embed], components: [row] });

            // Collecter les interactions boutons
            const collector = interaction.channel.createMessageComponentCollector({
                filter: i => i.user.id === interaction.user.id,
                time: 60000
            });

            collector.on('collect', async i => {
                if (i.customId === 'missions_rewards') {
                    await this.showRewardsEmbed(i);
                } else if (i.customId === 'missions_refresh') {
                    // Rafraîchir les missions
                    const refreshedMissions = await MissionSystem.getUserMissions(interaction.user.id);
                    // Recréer l'embed avec les nouvelles données
                    await i.update({ content: '✅ Missions rafraîchies !', embeds: [embed], components: [row] });
                }
            });

        } catch (error) {
            logger.erreur('Erreur lors de l\'affichage des missions', error);
            
            const errorEmbed = new EmbedBuilder()
                .setTitle('❌ Erreur')
                .setDescription('Une erreur s\'est produite lors de l\'affichage des missions.')
                .setColor(COULEURS.ERREUR);

            if (interaction.deferred) {
                await interaction.editReply({ embeds: [errorEmbed] });
            } else {
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        }
    },

    createProgressBar(percentage) {
        const filled = Math.floor(percentage / 10);
        const empty = 10 - filled;
        const bar = '█'.repeat(filled) + '░'.repeat(empty);
        return `\`[${bar}]\` ${percentage}%`;
    },

    async showRewardsEmbed(interaction) {
        const rewardsEmbed = new EmbedBuilder()
            .setTitle('🎁 Récompenses des Missions')
            .setDescription('Voici ce que tu peux gagner en complétant les missions !')
            .setColor(COULEURS.SUCCES)
            .addFields(
                {
                    name: '🌅 Récompenses Quotidiennes',
                    value: '💋 30-75 KissCoins\n🔥 0-1 FlameTokens\n💎 0 GemLust',
                    inline: true
                },
                {
                    name: '📅 Récompenses Hebdomadaires',
                    value: '💋 300-500 KissCoins\n🔥 3-5 FlameTokens\n💎 0 GemLust',
                    inline: true
                },
                {
                    name: '⭐ Récompenses Spéciales',
                    value: '💋 100-2000 KissCoins\n🔥 1-20 FlameTokens\n💎 0-1 GemLust',
                    inline: true
                }
            )
            .setFooter({ text: 'Les missions spéciales ne peuvent être complétées qu\'une fois !' });

        await interaction.reply({ embeds: [rewardsEmbed], ephemeral: true });
    }
};
