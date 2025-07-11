// coding: utf-8
/**
 * Commande /change-personality
 * Permet de changer la personnalité du bot
 */

import { SlashCommandBuilder } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('change-personality')
        .setDescription('Change la personnalité du bot (admin only)')
        .addStringOption(option =>
            option.setName('personnalité')
                .setDescription('Sélectionnez la personnalité')
                .setRequired(true)
                .addChoices(
                    { name: 'Douce', value: 'soft' },
                    { name: 'Taquine', value: 'playful' },
                    { name: 'Dominante', value: 'dominant' }
                )
        ),

    async execute(interaction) {
        if (!interaction.member.permissions.has('Administrator')) {
            return interaction.reply({
                content: 'Vous devez être administrateur pour changer la personnalité.',
                ephemeral: true
            });
        }

        const newPersonality = interaction.options.getString('personnalité');
        interaction.client.verificationModule.setPersonality(newPersonality);

        return interaction.reply({
            content: `Personnalité changée en ${newPersonality}.`,
            ephemeral: true
        });
    }
};

