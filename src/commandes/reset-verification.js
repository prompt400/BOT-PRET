// coding: utf-8
/**
 * Commande /reset-verification
 * Réinitialise la vérification d'un membre
 */

import { SlashCommandBuilder } from 'discord.js';
import Logger from '../services/logger.js';

const logger = new Logger('ResetVerification');

export default {
    data: new SlashCommandBuilder()
        .setName('reset-verification')
        .setDescription('Réinitialise la vérification d\'un membre (admin only)')
        .addUserOption(option =>
            option.setName('membre')
                .setDescription('Le membre dont on veut réinitialiser la vérification')
                .setRequired(true)
        ),

    async execute(interaction) {
        if (!interaction.member.permissions.has('Administrator')) {
            return interaction.reply({
                content: 'Vous devez être administrateur pour réinitialiser la vérification.',
                ephemeral: true
            });
        }

        const targetUser = interaction.options.getUser('membre');
        const targetMember = await interaction.guild.members.fetch(targetUser.id);

        try {
            // Réinitialiser la vérification via le module
            await interaction.client.verificationModule.resetUserVerification(targetMember);

            // Supprimer les rôles NSFW si présents
            const nsfwRoles = ['Soft', 'Playful', 'Dominant'];
            for (const roleName of nsfwRoles) {
                const role = interaction.guild.roles.cache.find(r => r.name === roleName);
                if (role && targetMember.roles.cache.has(role.id)) {
                    await targetMember.roles.remove(role);
                }
            }

            // Supprimer le badge "Nouveau Libertin"
            const libertinRole = interaction.guild.roles.cache.find(r => r.name === 'Nouveau Libertin');
            if (libertinRole && targetMember.roles.cache.has(libertinRole.id)) {
                await targetMember.roles.remove(libertinRole);
            }

            logger.info(`Vérification réinitialisée pour ${targetMember.user.tag}`);

            return interaction.reply({
                content: `La vérification de ${targetMember.user.tag} a été réinitialisée avec succès.`,
                ephemeral: true
            });

        } catch (error) {
            logger.erreur('Erreur lors de la réinitialisation', error);
            return interaction.reply({
                content: 'Une erreur s\'est produite lors de la réinitialisation.',
                ephemeral: true
            });
        }
    }
};
