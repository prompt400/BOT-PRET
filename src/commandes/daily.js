// coding: utf-8
/**
 * Commande /daily
 * Réclamer la récompense quotidienne avec système de streak
 */

import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import EconomySystem from '../modules/economy/EconomySystem.js';
import { COULEURS } from '../constantes/theme.js';
import Logger from '../services/logger.js';

const logger = new Logger('DailyCommand');

export default {
    data: new SlashCommandBuilder()
        .setName('daily')
        .setDescription('Réclamez votre récompense quotidienne!'),

    async execute(interaction) {
        try {
            const result = await EconomySystem.claimDaily(
                interaction.user.id,
                interaction.user.username
            );

            if (!result.success) {
                const embed = new EmbedBuilder()
                    .setTitle('⏰ Récompense déjà réclamée!')
                    .setDescription(`Tu as déjà réclamé ta récompense quotidienne!`)
                    .addFields({
                        name: '⏱️ Temps restant',
                        value: `Tu pourras réclamer ta prochaine récompense dans **${result.timeRemaining}**`,
                        inline: false
                    })
                    .setColor(COULEURS.AVERTISSEMENT)
                    .setFooter({ text: 'Reviens demain pour continuer ton streak!' })
                    .setTimestamp();

                return interaction.reply({ embeds: [embed], ephemeral: true });
            }

            // Créer l'embed de succès
            const embed = new EmbedBuilder()
                .setTitle('🎁 Récompense quotidienne réclamée!')
                .setColor(COULEURS.SUCCES)
                .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
                .addFields({
                    name: `📅 Jour ${result.streak}`,
                    value: `Streak actuel: **${result.streak} jour${result.streak > 1 ? 's' : ''}**`,
                    inline: false
                })
                .setTimestamp();

            // Ajouter les récompenses obtenues
            const rewards = [];
            if (result.reward.kissCoins > 0) {
                rewards.push(`💋 **${result.reward.kissCoins}** KissCoins`);
            }
            if (result.reward.flameTokens > 0) {
                rewards.push(`🔥 **${result.reward.flameTokens}** FlameTokens`);
            }
            if (result.reward.gemLust > 0) {
                rewards.push(`💎 **${result.reward.gemLust}** GemLust`);
            }

            embed.addFields({
                name: '🎉 Récompenses obtenues',
                value: rewards.join('\n'),
                inline: false
            });

            // Ajouter un aperçu des prochaines récompenses
            const nextRewards = EconomySystem.DAILY_REWARDS.find(r => r.day > result.streak);
            if (nextRewards) {
                const nextRewardsList = [];
                if (nextRewards.kissCoins > 0) nextRewardsList.push(`💋 ${nextRewards.kissCoins} KC`);
                if (nextRewards.flameTokens > 0) nextRewardsList.push(`🔥 ${nextRewards.flameTokens} FT`);
                if (nextRewards.gemLust > 0) nextRewardsList.push(`💎 ${nextRewards.gemLust} GL`);

                embed.addFields({
                    name: `🔮 Jour ${nextRewards.day}`,
                    value: nextRewardsList.join(' + '),
                    inline: true
                });
            }

            // Messages motivants selon le streak
            let motivationalMessage = '';
            if (result.streak === 1) {
                motivationalMessage = '🌟 Bon début! Reviens demain pour augmenter ton streak!';
            } else if (result.streak === 7) {
                motivationalMessage = '🔥 Une semaine complète! Tu es en feu!';
            } else if (result.streak === 14) {
                motivationalMessage = '💪 Deux semaines! Ta détermination est impressionnante!';
            } else if (result.streak === 30) {
                motivationalMessage = '👑 UN MOIS COMPLET! Tu es une légende!';
            } else if (result.streak > 30) {
                motivationalMessage = '♾️ Streak légendaire! Continue comme ça!';
            } else {
                motivationalMessage = '✨ Continue comme ça! Les meilleures récompenses t\'attendent!';
            }

            embed.setDescription(motivationalMessage);

            await interaction.reply({ embeds: [embed] });

        } catch (error) {
            logger.erreur('Erreur lors de l\'exécution de /daily', error);
            await interaction.reply({
                content: '❌ Une erreur s\'est produite lors de la réclamation de la récompense quotidienne.',
                ephemeral: true
            });
        }
    }
};
