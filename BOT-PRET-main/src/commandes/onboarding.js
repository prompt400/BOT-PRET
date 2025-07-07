/**
 * Commande pour tester et gérer le système d'onboarding
 */

import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import OnboardingService from '../services/onboardingService.js';
import Logger from '../services/logger.js';

const logger = new Logger('CommandeOnboarding');

export default {
    data: new SlashCommandBuilder()
        .setName('onboarding')
        .setDescription('Gestion du système d\'onboarding')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(subcommand =>
            subcommand
                .setName('test')
                .setDescription('Teste le système d\'onboarding pour vous-même')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('simuler')
                .setDescription('Simule l\'arrivée d\'un nouveau membre')
                .addUserOption(option =>
                    option
                        .setName('membre')
                        .setDescription('Le membre pour qui simuler l\'onboarding')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('configurer')
                .setDescription('Affiche la configuration actuelle de l\'onboarding')
        ),

    async execute(interaction) {
        const onboardingService = new OnboardingService(interaction.client);
        const subcommand = interaction.options.getSubcommand();

        try {
            switch (subcommand) {
                case 'test':
                    await this.testerOnboarding(interaction, onboardingService);
                    break;
                
                case 'simuler':
                    await this.simulerOnboarding(interaction, onboardingService);
                    break;
                
                case 'configurer':
                    await this.afficherConfiguration(interaction);
                    break;
            }
        } catch (erreur) {
            logger.erreur('Erreur dans la commande onboarding', erreur);
            await interaction.reply({
                content: '❌ Une erreur est survenue lors de l\'exécution de la commande.',
                ephemeral: true
            });
        }
    },

    /**
     * Teste l'onboarding pour l'utilisateur actuel
     */
    async testerOnboarding(interaction, onboardingService) {
        await interaction.deferReply({ ephemeral: true });
        
        // Démarrer l'onboarding pour le membre qui exécute la commande
        await onboardingService.demarrerOnboarding(interaction.member);
        
        await interaction.editReply({
            content: '✅ Le processus d\'onboarding a été lancé ! Regardez dans le salon de bienvenue.'
        });
    },

    /**
     * Simule l'onboarding pour un membre spécifique
     */
    async simulerOnboarding(interaction, onboardingService) {
        const utilisateur = interaction.options.getUser('membre');
        const membre = interaction.guild.members.cache.get(utilisateur.id);
        
        if (!membre) {
            await interaction.reply({
                content: '❌ Membre introuvable sur ce serveur.',
                ephemeral: true
            });
            return;
        }
        
        await interaction.deferReply({ ephemeral: true });
        
        // Démarrer l'onboarding pour le membre spécifié
        await onboardingService.demarrerOnboarding(membre);
        
        await interaction.editReply({
            content: `✅ L'onboarding a été lancé pour ${membre.user.tag} !`
        });
    },

    /**
     * Affiche la configuration actuelle
     */
    async afficherConfiguration(interaction) {
        const config = [
            '**📋 Configuration de l\'onboarding**',
            '',
            '**Rôles disponibles:**',
            '• 🎮 Gaming - Accès aux salons de jeux',
            '• 🎨 Art & Créativité - Espace créatif',
            '• 🎵 Musique - Univers musical',
            '• 💻 Tech & Dev - Zone technique',
            '• 📸 Photo/Vidéo - Espace multimédia',
            '',
            '**Paramètres:**',
            '• Durée du tour: 2 minutes',
            '• Attribution auto du rôle "Nouveau": 5 secondes',
            '• Rappel si inactif: 1 minute',
            '',
            '**Badges débloquables:**',
            '• Premier pas - Choix du premier rôle',
            '• Tour complet - Fin du tour guidé',
            '• Onboarding complet - Processus terminé',
            '',
            '⚠️ **Note:** Les IDs des rôles doivent être configurés dans les variables d\'environnement.'
        ];
        
        await interaction.reply({
            content: config.join('\n'),
            ephemeral: true
        });
    }
};
