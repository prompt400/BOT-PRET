// coding: utf-8
/**
 * Commande /verify-status
 * Affiche l'état de vérification d'un utilisateur
 */

import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { COULEURS } from '../constantes/theme.js';

export default {
    data: new SlashCommandBuilder()
        .setName('verify-status')
        .setDescription('Affiche votre état de vérification')
        .addUserOption(option =>
            option.setName('utilisateur')
                .setDescription('L\'utilisateur dont on veut voir le statut (admin seulement)')
                .setRequired(false)
        ),

    async execute(interaction) {
        const targetUser = interaction.options.getUser('utilisateur');
        const targetMember = targetUser 
            ? await interaction.guild.members.fetch(targetUser.id)
            : interaction.member;

        // Vérifier les permissions pour voir le statut d'un autre utilisateur
        if (targetUser && targetUser.id !== interaction.user.id) {
            if (!interaction.member.permissions.has('Administrator')) {
                return interaction.reply({
                    content: 'Vous devez être administrateur pour voir le statut d\'un autre utilisateur.',
                    ephemeral: true
                });
            }
        }

        // Récupérer les données de vérification depuis la base de données
        const verificationData = await interaction.client.verificationModule.getUserVerificationData(targetMember);

        const embed = new EmbedBuilder()
            .setTitle(`État de vérification de ${targetMember.user.username}`)
            .setColor(verificationData.isVerified ? COULEURS.SUCCES : COULEURS.AVERTISSEMENT)
            .setThumbnail(targetMember.user.displayAvatarURL({ dynamic: true }))
            .addFields(
                { name: 'Statut', value: verificationData.isVerified ? '✅ Vérifié' : '❌ Non vérifié', inline: true },
                { name: 'Date de début', value: verificationData.startDate || 'N/A', inline: true },
                { name: 'Étapes complétées', value: `${verificationData.completedSteps || 0}/4`, inline: true }
            );

        if (verificationData.steps) {
            const stepsStatus = verificationData.steps.map(step => {
                const status = step.completed ? '✅' : '❌';
                return `${status} ${step.name}`;
            }).join('\n');

            embed.addFields({ name: 'Détail des étapes', value: stepsStatus });
        }

        if (verificationData.assignedRole) {
            embed.addFields({ name: 'Rôle assigné', value: verificationData.assignedRole });
        }

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
};
