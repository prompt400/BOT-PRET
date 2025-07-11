// coding: utf-8
/**
 * Commande /verify
 * Lance manuellement la vérification
 */

import { SlashCommandBuilder } from 'discord.js';
import VerificationModule from '../modules/verification/VerificationModule.js';

export default {
    data: new SlashCommandBuilder()
        .setName('verify')
        .setDescription('Lance manuellement la vérification'),

    async execute(interaction) {
        const { member } = interaction;

        if (VerificationModule.isVerified(member)) {
            return interaction.reply({
                content: 'Vous êtes déjà vérifié !',
                ephemeral: true
            });
        }

        await VerificationModule.startVerification(member);
        return interaction.reply({
            content: 'Vérification en cours... Vérifiez votre DM.',
            ephemeral: true
        });
    }
};

