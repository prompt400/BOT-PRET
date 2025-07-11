// Fichier de jeu de dés
// À compléter avec la logique nécessaire
import { SlashCommandBuilder } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('dice')
        .setDescription('Lancez les dés érotiques'),

    async execute(interaction) {
        const maxRoll = 6;
        const rollResult = Math.floor(Math.random() * maxRoll) + 1;

        // Exemple de réponse en fonction du résultat
        const diceResults = [
            "Faites un massage à la personne à votre gauche",
            "Donnez un bisou à celui en face de vous",
            "Offrez un compliment sincère",
            "Chantez une chanson d'amour",
            "Faites une danse sensuelle",
            "Chuchotez un secret coquin"
        ];
        
        const resultMessage = diceResults[rollResult - 1];

        await interaction.reply({
            content: `🎲 Vous avez lancé un **${rollResult}** ! ${resultMessage} 💋`,
            ephemeral: false
        });
    }
};
