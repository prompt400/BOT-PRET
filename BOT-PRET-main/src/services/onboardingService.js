/**
 * Service de gestion de l'onboarding
 * Gère l'accueil et l'orientation des nouveaux membres
 */

import { MessageEmbed, MessageActionRow, MessageSelectMenu, MessageButton } from 'discord.js';
import { onboardingConfig, roleMapping, tourSteps } from '../config/onboarding.js';
import Logger from './logger.js';
import GestionnaireBadges from './gestionnaireBadges.js';

const logger = new Logger('OnboardingService');

class OnboardingService {
    constructor(client) {
        this.client = client;
        this.activeTours = new Map(); // Stocke les tours actifs par utilisateur
        this.gestionnaireBadges = new GestionnaireBadges();
    }

    /**
     * Démarre le processus d'onboarding pour un nouveau membre
     * @param {import('discord.js').GuildMember} member 
     */
    async demarrerOnboarding(member) {
        try {
            logger.info(`Démarrage de l'onboarding pour ${member.user.tag}`);
            
            // Créer l'embed de bienvenue
            const embedBienvenue = this.creerEmbedBienvenue(member);
            
            // Créer le menu de sélection des rôles
            const menuRoles = this.creerMenuRoles();
            
            // Créer les boutons d'action
            const boutonsAction = this.creerBoutonsAction();
            
            // Trouver le salon de bienvenue
            const salonBienvenue = member.guild.systemChannel || 
                member.guild.channels.cache.find(ch => ch.name === 'bienvenue' || ch.name === 'welcome');
            
            if (salonBienvenue) {
                // Envoyer le message de bienvenue
                const messageBienvenue = await salonBienvenue.send({
                    content: `${member}`,
                    embeds: [embedBienvenue],
                    components: [boutonsAction, menuRoles]
                });
                
                // Démarrer le timer de rappel
                this.programmerRappel(member, messageBienvenue);
                
                // Attribuer automatiquement le rôle "Nouveau" après un délai
                setTimeout(async () => {
                    await this.attribuerRoleNouveau(member);
                }, onboardingConfig.settings.autoRoleDelay);
            }
            
            // Envoyer un guide privé
            await this.envoyerGuidePrivé(member);
            
        } catch (erreur) {
            logger.erreur('Erreur lors du démarrage de l\'onboarding', erreur);
        }
    }

    /**
     * Crée l'embed de bienvenue personnalisé
     * @param {import('discord.js').GuildMember} member 
     */
    creerEmbedBienvenue(member) {
        const config = onboardingConfig.welcomeChannel.embed;
        const embed = new MessageEmbed()
            .setTitle(config.title)
            .setDescription(config.description)
            .setColor(config.color)
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }));
        
        // Ajouter les champs
        config.fields.forEach(field => {
            embed.addField(field.name, field.value, field.inline);
        });
        
        embed.setFooter({
            text: config.footer.text,
            iconURL: config.footer.icon_url
        });
        
        embed.setTimestamp();
        
        return embed;
    }

    /**
     * Crée le menu de sélection des rôles
     */
    creerMenuRoles() {
        const config = onboardingConfig.roleMenu;
        const selectMenu = new MessageSelectMenu()
            .setCustomId('select_onboarding_roles')
            .setPlaceholder(config.placeholder)
            .setMinValues(config.minValues)
            .setMaxValues(config.maxValues);
        
        // Ajouter les options
        config.options.forEach(option => {
            selectMenu.addOptions({
                label: option.label,
                description: option.description,
                value: option.value,
                emoji: option.emoji
            });
        });
        
        return new MessageActionRow().addComponents(selectMenu);
    }

    /**
     * Crée les boutons d'action
     */
    creerBoutonsAction() {
        const buttons = onboardingConfig.buttons;
        
        return new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId(buttons.startTour.customId)
                    .setLabel(buttons.startTour.label)
                    .setStyle(buttons.startTour.style),
                new MessageButton()
                    .setCustomId(buttons.skipTour.customId)
                    .setLabel(buttons.skipTour.label)
                    .setStyle(buttons.skipTour.style),
                new MessageButton()
                    .setCustomId(buttons.needHelp.customId)
                    .setLabel(buttons.needHelp.label)
                    .setStyle(buttons.needHelp.style)
            );
    }

    /**
     * Gère les interactions de l'onboarding
     * @param {import('discord.js').Interaction} interaction 
     */
    async gererInteraction(interaction) {
        try {
            // Gestion du menu de sélection des rôles
            if (interaction.customId === 'select_onboarding_roles') {
                await this.gererSelectionRoles(interaction);
            }
            // Gestion du bouton de démarrage du tour
            else if (interaction.customId === 'start_onboarding_tour') {
                await this.demarrerTourGuide(interaction);
            }
            // Gestion du bouton skip
            else if (interaction.customId === 'skip_onboarding_tour') {
                await this.terminerOnboarding(interaction.member);
                await interaction.reply({
                    content: onboardingConfig.contextualMessages.allStepsCompleted,
                    ephemeral: true
                });
            }
            // Gestion du bouton d'aide
            else if (interaction.customId === 'onboarding_help') {
                await this.afficherAide(interaction);
            }
        } catch (erreur) {
            logger.erreur('Erreur lors de la gestion de l\'interaction onboarding', erreur);
        }
    }

    /**
     * Gère la sélection des rôles
     * @param {import('discord.js').StringSelectMenuInteraction} interaction 
     */
    async gererSelectionRoles(interaction) {
        const rolesSelectionnes = interaction.values;
        const member = interaction.member;
        const rolesAttribues = [];
        const salonsDebloques = [];
        
        for (const roleValue of rolesSelectionnes) {
            const roleId = roleMapping[roleValue];
            if (roleId) {
                const role = interaction.guild.roles.cache.get(roleId);
                if (role) {
                    await member.roles.add(role);
                    rolesAttribues.push(role.name);
                    
                    // Envoyer le guide spécifique au rôle
                    const guide = onboardingConfig.roleGuides[roleValue];
                    if (guide) {
                        await this.envoyerGuideRole(member, guide);
                    }
                }
            }
        }
        
        // Répondre avec un message de confirmation
        let message = `✅ Rôles attribués : **${rolesAttribues.join(', ')}**\n`;
        
        // Si c'est le premier rôle
        if (member.roles.cache.size === 2) { // @everyone + nouveau rôle
            message = onboardingConfig.contextualMessages.firstRole + '\n' + message;
            
            // Attribuer le badge "Premier pas"
            await this.gestionnaireBadges.attribuerBadge(member.id, 'premier_pas');
        }
        
        await interaction.reply({
            content: message,
            ephemeral: true
        });
    }

    /**
     * Démarre le tour guidé interactif
     * @param {import('discord.js').ButtonInteraction} interaction 
     */
    async demarrerTourGuide(interaction) {
        const member = interaction.member;
        
        // Vérifier si un tour est déjà actif
        if (this.activeTours.has(member.id)) {
            await interaction.reply({
                content: '⚠️ Un tour guidé est déjà en cours !',
                ephemeral: true
            });
            return;
        }
        
        // Démarrer le tour
        this.activeTours.set(member.id, {
            etape: 0,
            canal: interaction.channel,
            termine: false
        });
        
        await interaction.reply({
            content: '🚀 Démarrage du tour guidé...',
            ephemeral: true
        });
        
        // Lancer la première étape
        await this.afficherEtapeTour(member, 0);
    }

    /**
     * Affiche une étape du tour guidé
     * @param {import('discord.js').GuildMember} member 
     * @param {number} etape 
     */
    async afficherEtapeTour(member, etape) {
        const tourData = this.activeTours.get(member.id);
        if (!tourData || tourData.termine) return;
        
        if (etape >= tourSteps.length) {
            // Tour terminé
            await this.terminerTour(member);
            return;
        }
        
        const etapeActuelle = tourSteps[etape];
        const embed = new MessageEmbed()
            .setTitle(etapeActuelle.title)
            .setDescription(etapeActuelle.content)
            .setColor('#00FF00')
            .setFooter({
                text: `Étape ${etape + 1}/${tourSteps.length}`
            });
        
        await tourData.canal.send({
            content: `${member}`,
            embeds: [embed]
        });
        
        // Programmer l'étape suivante
        setTimeout(() => {
            this.afficherEtapeTour(member, etape + 1);
        }, etapeActuelle.duration);
    }

    /**
     * Termine le tour guidé
     * @param {import('discord.js').GuildMember} member 
     */
    async terminerTour(member) {
        const tourData = this.activeTours.get(member.id);
        if (!tourData) return;
        
        tourData.termine = true;
        this.activeTours.delete(member.id);
        
        // Attribuer le badge "Tour complet"
        await this.gestionnaireBadges.attribuerBadge(member.id, 'tour_complet');
        
        const embed = new MessageEmbed()
            .setTitle('🎉 Tour guidé terminé !')
            .setDescription(onboardingConfig.contextualMessages.allStepsCompleted)
            .setColor('#FFD700')
            .addField('🏅 Badge débloqué', 'Tour complet')
            .setTimestamp();
        
        await tourData.canal.send({
            content: `${member}`,
            embeds: [embed]
        });
    }

    /**
     * Envoie un guide privé au nouveau membre
     * @param {import('discord.js').GuildMember} member 
     */
    async envoyerGuidePrivé(member) {
        try {
            const embed = new MessageEmbed()
                .setTitle('📖 Guide personnel')
                .setDescription('Voici votre guide personnel pour bien démarrer !')
                .setColor('#0099FF')
                .addField('💡 Conseils', 
                    '• Prenez le temps de lire les règles\n' +
                    '• Choisissez des rôles qui vous correspondent\n' +
                    '• N\'hésitez pas à poser des questions'
                )
                .addField('🎯 Objectifs', 
                    '• Présenter vous pour débloquer votre premier badge\n' +
                    '• Participez à une conversation\n' +
                    '• Découvrez les différents salons'
                )
                .setFooter({
                    text: 'Ce message est privé et visible uniquement par vous'
                });
            
            await member.send({ embeds: [embed] });
        } catch (erreur) {
            logger.avertissement(`Impossible d'envoyer le guide privé à ${member.user.tag}`);
        }
    }

    /**
     * Envoie un guide spécifique au rôle
     * @param {import('discord.js').GuildMember} member 
     * @param {Object} guide 
     */
    async envoyerGuideRole(member, guide) {
        try {
            const embed = new MessageEmbed()
                .setTitle(guide.title)
                .setDescription(guide.description)
                .setColor('#9B59B6')
                .addField('💡 Conseils', guide.tips.join('\n'))
                .setTimestamp();
            
            await member.send({ embeds: [embed] });
        } catch (erreur) {
            logger.avertissement(`Impossible d'envoyer le guide de rôle à ${member.user.tag}`);
        }
    }

    /**
     * Programme un rappel pour les membres inactifs
     * @param {import('discord.js').GuildMember} member 
     * @param {import('discord.js').Message} message 
     */
    programmerRappel(member, message) {
        setTimeout(async () => {
            // Vérifier si le membre n'a toujours pas de rôle
            if (member.roles.cache.size === 1) { // Seulement @everyone
                await message.reply({
                    content: `${member} 👋 N'oubliez pas de choisir vos rôles pour accéder à tous les salons !`
                });
            }
        }, onboardingConfig.settings.reminderDelay);
    }

    /**
     * Attribue le rôle "Nouveau" automatiquement
     * @param {import('discord.js').GuildMember} member 
     */
    async attribuerRoleNouveau(member) {
        const roleId = roleMapping.role_nouveau;
        if (roleId) {
            const role = member.guild.roles.cache.get(roleId);
            if (role) {
                await member.roles.add(role);
                logger.info(`Rôle "Nouveau" attribué à ${member.user.tag}`);
            }
        }
    }

    /**
     * Affiche l'aide pour l'onboarding
     * @param {import('discord.js').ButtonInteraction} interaction 
     */
    async afficherAide(interaction) {
        const embed = new MessageEmbed()
            .setTitle('❓ Aide - Onboarding')
            .setDescription('Voici comment bien démarrer sur notre serveur')
            .setColor('#3498DB')
            .addField('🎭 Les rôles', 
                'Choisissez jusqu\'à 3 rôles qui correspondent à vos intérêts. ' +
                'Cela vous donnera accès aux salons spécialisés.'
            )
            .addField('🏅 Les badges', 
                'Gagnez des badges en participant aux activités du serveur. ' +
                'Votre premier badge vous attend dans le salon de présentation !'
            )
            .addField('💬 Communication', 
                'N\'hésitez pas à poser des questions dans le salon général. ' +
                'Notre communauté est là pour vous aider !'
            )
            .addField('🚀 Tour guidé', 
                'Le tour guidé vous présente toutes les fonctionnalités en 2 minutes. ' +
                'C\'est le meilleur moyen de découvrir le serveur !'
            );
        
        await interaction.reply({
            embeds: [embed],
            ephemeral: true
        });
    }

    /**
     * Termine le processus d'onboarding
     * @param {import('discord.js').GuildMember} member 
     */
    async terminerOnboarding(member) {
        logger.info(`Onboarding terminé pour ${member.user.tag}`);
        
        // Nettoyer les données temporaires
        this.activeTours.delete(member.id);
        
        // Attribuer le badge de complétion si applicable
        if (member.roles.cache.size > 2) { // Plus que @everyone et Nouveau
            await this.gestionnaireBadges.attribuerBadge(member.id, 'onboarding_complet');
        }
    }
}

export default OnboardingService;
