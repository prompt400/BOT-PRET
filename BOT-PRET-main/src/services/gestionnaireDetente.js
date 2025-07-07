/**
 * @file Service de gestion des espaces de détente
 * @module services/gestionnaireDetente
 */

import { 
    ChannelType, 
    EmbedBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle,
    StringSelectMenuBuilder,
    PermissionFlagsBits
} from 'discord.js';
import { CONFIG_DETENTE } from '../config/detente.js';
import Logger from './logger.js';

class GestionnaireDetente {
    constructor() {
        this.logger = new Logger('GestionnaireDetente');
        this.sessionsActives = new Map();
        this.cooldowns = new Map();
        this.salonsDetente = new Map();
    }

    /**
     * Initialise les salons de détente sur le serveur
     */
    async initialiserSalons(guild) {
        try {
            this.logger.info(`Initialisation des salons de détente pour ${guild.name}`);
            
            // Créer une catégorie pour les espaces de détente
            const categorie = await this.creerOuTrouverCategorie(guild, '🌸 ESPACES DÉTENTE');
            
            // Créer chaque salon défini dans la configuration
            for (const [key, config] of Object.entries(CONFIG_DETENTE.SALONS)) {
                const salon = await this.creerOuTrouverSalon(guild, config, categorie);
                this.salonsDetente.set(`${guild.id}-${key}`, salon.id);
                
                // Envoyer un message de bienvenue avec embed
                await this.envoyerMessageBienvenue(salon, config);
            }
            
            this.logger.info('Salons de détente initialisés avec succès');
        } catch (erreur) {
            this.logger.erreur('Erreur lors de l\'initialisation des salons', erreur);
        }
    }

    /**
     * Crée ou trouve une catégorie
     */
    async creerOuTrouverCategorie(guild, nom) {
        let categorie = guild.channels.cache.find(
            c => c.type === ChannelType.GuildCategory && c.name === nom
        );
        
        if (!categorie) {
            categorie = await guild.channels.create({
                name: nom,
                type: ChannelType.GuildCategory,
                position: 5,
                permissionOverwrites: [
                    {
                        id: guild.id,
                        allow: [PermissionFlagsBits.ViewChannel],
                        deny: [PermissionFlagsBits.SendMessages]
                    }
                ]
            });
        }
        
        return categorie;
    }

    /**
     * Crée ou trouve un salon de détente
     */
    async creerOuTrouverSalon(guild, config, categorie) {
        let salon = guild.channels.cache.find(
            c => c.name === config.nom && c.parentId === categorie.id
        );
        
        if (!salon) {
            salon = await guild.channels.create({
                name: config.nom,
                type: ChannelType.GuildText,
                parent: categorie.id,
                topic: config.description,
                rateLimitPerUser: config.permissions.rateLimitPerUser,
                defaultAutoArchiveDuration: config.permissions.defaultAutoArchiveDuration,
                permissionOverwrites: [
                    {
                        id: guild.id,
                        allow: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.SendMessages,
                            PermissionFlagsBits.ReadMessageHistory,
                            PermissionFlagsBits.AddReactions
                        ]
                    }
                ]
            });
        }
        
        return salon;
    }

    /**
     * Envoie un message de bienvenue avec embed
     */
    async envoyerMessageBienvenue(salon, config) {
        const embed = new EmbedBuilder()
            .setTitle(`Bienvenue dans ${config.nom}`)
            .setDescription(config.description)
            .setColor(0xFFB6C1) // Rose clair apaisant
            .addFields(
                { 
                    name: '🌟 Règles de l\'espace', 
                    value: `• Respectez le rythme de chacun\n• Favorisez la bienveillance\n• Prenez soin de vous et des autres`,
                    inline: false
                },
                {
                    name: '⏱️ Cooldown',
                    value: `${config.cooldown / 1000} secondes entre chaque message`,
                    inline: true
                }
            )
            .setFooter({ text: 'Un espace créé pour votre bien-être' })
            .setTimestamp();

        // Créer les boutons d'interaction
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('detente_ambiance')
                    .setLabel('Message d\'ambiance')
                    .setEmoji('✨')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('detente_minijeu')
                    .setLabel('Mini-jeu zen')
                    .setEmoji('🧘')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('detente_asmr')
                    .setLabel('Suggestion ASMR')
                    .setEmoji('🎧')
                    .setStyle(ButtonStyle.Secondary)
            );

        // Vérifier si le salon a déjà un message épinglé
        const messages = await salon.messages.fetchPinned().catch(() => null);
        if (!messages || messages.size === 0) {
            const message = await salon.send({ embeds: [embed], components: [row] });
            await message.pin();
        }
    }

    /**
     * Gère les interactions avec les boutons
     */
    async gererInteraction(interaction) {
        if (!interaction.isButton() && !interaction.isStringSelectMenu()) return;

        switch (interaction.customId) {
            case 'detente_ambiance':
                await this.envoyerMessageAmbiance(interaction);
                break;
            case 'detente_minijeu':
                await this.proposerMiniJeu(interaction);
                break;
            case 'detente_asmr':
                await this.suggererASMR(interaction);
                break;
            case 'detente_minijeu_select':
                await this.lancerMiniJeu(interaction);
                break;
        }
    }

    /**
     * Envoie un message d'ambiance aléatoire
     */
    async envoyerMessageAmbiance(interaction) {
        const message = CONFIG_DETENTE.MESSAGES_AMBIANCE[
            Math.floor(Math.random() * CONFIG_DETENTE.MESSAGES_AMBIANCE.length)
        ];
        
        const embed = new EmbedBuilder()
            .setDescription(message)
            .setColor(0xE6E6FA) // Lavande
            .setFooter({ text: `Pour ${interaction.user.username}` });

        await interaction.reply({ embeds: [embed], ephemeral: false });
    }

    /**
     * Propose un mini-jeu zen
     */
    async proposerMiniJeu(interaction) {
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('detente_minijeu_select')
            .setPlaceholder('Choisissez un mini-jeu zen')
            .addOptions(
                Object.entries(CONFIG_DETENTE.MINI_JEUX).map(([key, jeu]) => ({
                    label: jeu.nom,
                    value: key,
                    emoji: key === 'RESPIRATION' ? '🫁' : key === 'MEDITATION_GUIDEE' ? '🧘' : '🙏'
                }))
            );

        const row = new ActionRowBuilder().addComponents(selectMenu);

        await interaction.reply({
            content: 'Quel exercice souhaitez-vous faire ? 🌟',
            components: [row],
            ephemeral: true
        });
    }

    /**
     * Lance un mini-jeu zen
     */
    async lancerMiniJeu(interaction) {
        const jeuId = interaction.values[0];
        const jeu = CONFIG_DETENTE.MINI_JEUX[jeuId];

        if (jeuId === 'GRATITUDE') {
            const embed = new EmbedBuilder()
                .setTitle('📔 Journal de Gratitude')
                .setDescription(jeu.prompt)
                .setColor(0xFFD700) // Or
                .setFooter({ text: 'Prenez un moment pour réfléchir...' });

            await interaction.update({ 
                embeds: [embed], 
                components: [],
                content: null 
            });
        } else {
            // Pour les exercices guidés
            await interaction.update({ 
                content: `🌟 Début de l'exercice : **${jeu.nom}**`, 
                components: [] 
            });

            const canal = interaction.channel;
            const userId = interaction.user.id;
            
            // Éviter les sessions multiples
            if (this.sessionsActives.has(userId)) {
                await interaction.followUp({
                    content: 'Vous avez déjà une session en cours !',
                    ephemeral: true
                });
                return;
            }

            this.sessionsActives.set(userId, true);

            // Exécuter les étapes
            for (let i = 0; i < jeu.etapes.length; i++) {
                const embed = new EmbedBuilder()
                    .setDescription(jeu.etapes[i])
                    .setColor(0x87CEEB) // Sky blue
                    .setFooter({ text: `Étape ${i + 1}/${jeu.etapes.length}` });

                await canal.send({ embeds: [embed] });
                
                // Attendre entre chaque étape
                await new Promise(resolve => setTimeout(resolve, jeu.duree / jeu.etapes.length));
            }

            // Fin de l'exercice
            const embedFin = new EmbedBuilder()
                .setTitle('✅ Exercice terminé')
                .setDescription('Bravo ! Vous avez complété l\'exercice. Comment vous sentez-vous ?')
                .setColor(0x90EE90) // Light green
                .setTimestamp();

            await canal.send({ embeds: [embedFin] });
            this.sessionsActives.delete(userId);
        }
    }

    /**
     * Suggère un son ASMR
     */
    async suggererASMR(interaction) {
        const suggestion = CONFIG_DETENTE.ASMR_SUGGESTIONS[
            Math.floor(Math.random() * CONFIG_DETENTE.ASMR_SUGGESTIONS.length)
        ];

        const embed = new EmbedBuilder()
            .setTitle(`${suggestion.emoji} ${suggestion.nom}`)
            .setDescription(suggestion.description)
            .setColor(0xDDA0DD) // Plum
            .addFields({
                name: '💡 Conseil',
                value: 'Utilisez des écouteurs pour une meilleure expérience'
            })
            .setFooter({ text: 'Recherchez ce son sur votre plateforme préférée' });

        await interaction.reply({ embeds: [embed], ephemeral: false });
    }

    /**
     * Vérifie les mots-clés pour les auto-réponses
     */
    async verifierAutoReponse(message) {
        if (message.author.bot) return;

        const contenu = message.content.toLowerCase();
        
        for (const [motCle, reponses] of Object.entries(CONFIG_DETENTE.AUTO_REPONSES)) {
            if (contenu.includes(motCle)) {
                const reponse = reponses[Math.floor(Math.random() * reponses.length)];
                
                // Ajouter un délai pour paraître plus naturel
                await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
                
                const embed = new EmbedBuilder()
                    .setDescription(reponse)
                    .setColor(0xF0E68C) // Khaki
                    .setFooter({ text: 'Message automatique de soutien' });

                await message.reply({ embeds: [embed] });
                
                // Ajouter une réaction zen
                const emoji = CONFIG_DETENTE.EMOJIS_DETENTE[
                    Math.floor(Math.random() * CONFIG_DETENTE.EMOJIS_DETENTE.length)
                ];
                await message.react(emoji).catch(() => {});
                
                break; // Une seule réponse par message
            }
        }
    }

    /**
     * Vérifie et applique le cooldown
     */
    verifierCooldown(userId, salonId, cooldownMs) {
        const key = `${userId}-${salonId}`;
        const maintenant = Date.now();
        
        if (this.cooldowns.has(key)) {
            const expiration = this.cooldowns.get(key);
            if (maintenant < expiration) {
                const tempsRestant = (expiration - maintenant) / 1000;
                return { enCooldown: true, tempsRestant };
            }
        }
        
        this.cooldowns.set(key, maintenant + cooldownMs);
        return { enCooldown: false };
    }

    /**
     * Nettoie les cooldowns expirés
     */
    nettoyerCooldowns() {
        const maintenant = Date.now();
        for (const [key, expiration] of this.cooldowns) {
            if (expiration < maintenant) {
                this.cooldowns.delete(key);
            }
        }
    }
}

export default new GestionnaireDetente();
