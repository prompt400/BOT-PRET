const { SlashCommandBuilder } = require('@discordjs/builders');
const MetaverseManager = require('../advanced/metaverse/MetaverseManager');

const metaverseManager = new MetaverseManager();

/**
 * Commande /explore - Permet d'explorer un lieu dans le métaverse
 */
module.exports = {
    data: new SlashCommandBuilder()
        .setName('explore')
        .setDescription('Explorer un lieu du métaverse')
        .addStringOption(option => 
            option.setName('lieu')
                .setDescription('Lieu à explorer')
                .setRequired(true)
                .addChoice('Place Centrale', 'centralPlace')
                .addChoice('Jardin des Plaisirs', 'pleasureGarden')
                .addChoice('Casino Érotique', 'eroticCasino')
                .addChoice('Plage Privée', 'privateBeach')
                .addChoice('Villa des Mystères', 'mysteryVilla')
        ),
    async execute(interaction) {
        const member = interaction.member;
        const location = interaction.options.getString('lieu');
        const description = metaverseManager.exploreLocation(member, location);
        await interaction.reply(description);
    }
};
