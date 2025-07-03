/**
 * Commande /status
 * Affiche l'état et les informations du bot
 */

import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { COULEURS } from '../constantes/theme.js';
import { formaterDuree } from '../utilitaires/temps.js';

export default {
    data: new SlashCommandBuilder()
        .setName('status')
        .setDescription('Affiche le statut et les informations du bot'),
    
    /**
     * Exécute la commande status
     * @param {import('discord.js').CommandInteraction} interaction 
     */
    async execute(interaction) {
        await interaction.deferReply();
        
        try {
            // Collecte des informations système
            const uptime = formaterDuree(interaction.client.uptime);
            const memoire = process.memoryUsage();
            const memoireUtilisee = Math.round(memoire.heapUsed / 1024 / 1024);
            const memoireTotale = Math.round(memoire.heapTotal / 1024 / 1024);
            
            // Construction de l'embed
            const embed = new EmbedBuilder()
                .setTitle('📊 Statut du Bot')
                .setColor(COULEURS.SUCCES)
                .addFields(
                    {
                        name: '⏱️ Temps de fonctionnement',
                        value: uptime,
                        inline: true
                    },
                    {
                        name: '💾 Utilisation mémoire',
                        value: `${memoireUtilisee} / ${memoireTotale} MB`,
                        inline: true
                    },
                    {
                        name: '📡 Latence',
                        value: `${interaction.client.ws.ping}ms`,
                        inline: true
                    },
                    {
                        name: '🖥️ Serveurs',
                        value: `${interaction.client.guilds.cache.size}`,
                        inline: true
                    },
                    {
                        name: '👥 Utilisateurs',
                        value: `${interaction.client.users.cache.size}`,
                        inline: true
                    },
                    {
                        name: '📌 Version',
                        value: '1.0.0',
                        inline: true
                    }
                )
                .setTimestamp()
                .setFooter({ 
                    text: 'Bot Discord Professionnel',
                    iconURL: interaction.client.user.displayAvatarURL()
                });
            
            await interaction.editReply({ embeds: [embed] });
            
        } catch (erreur) {
            console.error('Erreur dans la commande status:', erreur);
            
            await interaction.editReply({
                content: '❌ Une erreur est survenue lors de l\'exécution de la commande.',
                ephemeral: true
            });
        }
    }
};
