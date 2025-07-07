import { SlashCommandBuilder } from 'discord.js';
import gestionnaireBadges from '../services/gestionnaireBadges.js';

export default {
    data: new SlashCommandBuilder()
        .setName('badges')
        .setDescription('Affiche tes badges ou ceux d\'un autre membre')
        .setNSFW(true)
        .addUserOption(option =>
            option.setName('membre')
                .setDescription('Le membre dont tu veux voir les badges')
                .setRequired(false)
        ),

    async execute(interaction) {
        const targetUser = interaction.options.getUser('membre') || interaction.user;
        
        // Créer l'embed des badges
        const embedBadges = gestionnaireBadges.creerEmbedBadges(targetUser);
        
        await interaction.reply({ 
            embeds: [embedBadges],
            ephemeral: targetUser.id === interaction.user.id // Privé seulement si c'est ses propres badges
        });
    }
};
