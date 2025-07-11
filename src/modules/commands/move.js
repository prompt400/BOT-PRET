const { SlashCommandBuilder } = require('@discordjs/builders');
const MetaverseManager = require('../advanced/metaverse/MetaverseManager');

const metaverseManager = new MetaverseManager();

/**
 * Commande /move - Se déplacer dans le métaverse
 */
module.exports = {
    data: new SlashCommandBuilder()
        .setName('move')
        .setDescription('Se déplacer dans le métaverse')
        .addStringOption(option => 
            option.setName('direction')
                .setDescription('Direction de déplacement')
                .setRequired(true)
                .addChoice('Nord', 'nord')
                .addChoice('Sud', 'sud')
                .addChoice('Est', 'est')
                .addChoice('Ouest', 'ouest')
        ),
    async execute(interaction) {
        const direction = interaction.options.getString('direction');
        const result = metaverseManager.move(direction);
        await interaction.reply(result);
    }
};
