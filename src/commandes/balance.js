// coding: utf-8
/**
 * Commande /balance
 * Affiche le solde des trois monnaies d'un utilisateur
 */

import { SlashCommandBuilder } from 'discord.js';
import EconomySystem from '../modules/economy/EconomySystem.js';
import Logger from '../services/logger.js';

const logger = new Logger('BalanceCommand');

export default {
    data: new SlashCommandBuilder()
        .setName('balance')
        .setDescription('Affiche votre solde ou celui d\'un autre utilisateur')
        .addUserOption(option =>
            option.setName('utilisateur')
                .setDescription('L\'utilisateur dont vous voulez voir le solde')
                .setRequired(false)
        ),

    async execute(interaction) {
        try {
            const targetUser = interaction.options.getUser('utilisateur') || interaction.user;
            const targetDiscordId = targetUser.id;
            
            // Créer ou récupérer l'utilisateur
            const user = await EconomySystem.getOrCreateUser(targetDiscordId, targetUser.username);
            
            // Obtenir le solde
            const balance = await EconomySystem.getBalance(targetDiscordId);
            
            if (!balance) {
                return interaction.reply({
                    content: '❌ Impossible de récupérer le solde.',
                    ephemeral: true
                });
            }

            // Créer l'embed de balance
            const embed = EconomySystem.createBalanceEmbed(user, balance);

            // Ajouter des infos supplémentaires si c'est son propre solde
            if (targetUser.id === interaction.user.id) {
                embed.addFields({
                    name: '💡 Conseil',
                    value: 'Utilisez `/daily` pour obtenir des récompenses quotidiennes!\nUtilisez `/shop` pour dépenser vos monnaies!',
                    inline: false
                });
            }

            await interaction.reply({ embeds: [embed] });
            
        } catch (error) {
            logger.erreur('Erreur lors de l\'exécution de /balance', error);
            await interaction.reply({
                content: '❌ Une erreur s\'est produite lors de la récupération du solde.',
                ephemeral: true
            });
        }
    }
};
