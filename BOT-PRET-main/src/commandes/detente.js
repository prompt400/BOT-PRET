/**
 * @file Commande de gestion des espaces de détente
 * @module commandes/detente
 */

import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import gestionnaireDetente from '../services/gestionnaireDetente.js';

export const data = new SlashCommandBuilder()
    .setName('detente')
    .setDescription('Gestion des espaces de détente')
    .addSubcommand(subcommand =>
        subcommand
            .setName('initialiser')
            .setDescription('Initialiser les salons de détente sur le serveur')
    )
    .addSubcommand(subcommand =>
        subcommand
            .setName('info')
            .setDescription('Afficher les informations sur les espaces de détente')
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels);

export async function execute(interaction) {
    const sousCommande = interaction.options.getSubcommand();

    switch (sousCommande) {
        case 'initialiser':
            await initialiserEspaces(interaction);
            break;
        case 'info':
            await afficherInfo(interaction);
            break;
    }
}

/**
 * Initialise les espaces de détente
 */
async function initialiserEspaces(interaction) {
    await interaction.deferReply();

    try {
        await gestionnaireDetente.initialiserSalons(interaction.guild);
        
        await interaction.editReply({
            content: '✅ Les espaces de détente ont été initialisés avec succès ! 🌸',
            embeds: [{
                title: 'Salons créés',
                description: '• 🌸・détente\n• 🎧・asmr-zone\n• 🛡️・safe-zone\n• 🐌・slow-chat',
                color: 0xFFB6C1,
                footer: {
                    text: 'Les membres peuvent maintenant profiter de ces espaces zen'
                }
            }]
        });
    } catch (erreur) {
        await interaction.editReply({
            content: '❌ Une erreur est survenue lors de l\'initialisation des espaces.',
            ephemeral: true
        });
    }
}

/**
 * Affiche les informations sur les espaces de détente
 */
async function afficherInfo(interaction) {
    const embed = {
        title: '🌸 Espaces de Détente - Informations',
        description: 'Des espaces dédiés au bien-être et à la relaxation',
        fields: [
            {
                name: '🌸・détente',
                value: 'Espace de discussion calme avec cooldown de 5 secondes',
                inline: false
            },
            {
                name: '🎧・asmr-zone',
                value: 'Partage de sons ASMR et textes relaxants (cooldown 10s)',
                inline: false
            },
            {
                name: '🛡️・safe-zone',
                value: 'Espace sécurisé pour s\'exprimer librement (cooldown 3s)',
                inline: false
            },
            {
                name: '🐌・slow-chat',
                value: 'Discussion lente et réfléchie (cooldown 30s)',
                inline: false
            },
            {
                name: '✨ Fonctionnalités',
                value: '• Messages d\'ambiance automatiques\n• Mini-jeux zen (respiration, méditation)\n• Suggestions ASMR\n• Auto-réponses bienveillantes',
                inline: false
            }
        ],
        color: 0xE6E6FA,
        footer: {
            text: 'Utilisez /detente initialiser pour créer ces espaces'
        }
    };

    await interaction.reply({ embeds: [embed] });
}
