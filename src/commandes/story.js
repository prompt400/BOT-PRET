import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import Scenariste from '../modules/ai/personalities/Scenariste.js';
import { COULEURS } from '../constantes/theme.js';
import Logger from '../services/logger.js';

const logger = new Logger('StoryCommand');

export default {
    data: new SlashCommandBuilder()
        .setName('story')
        .setDescription('Génère une histoire sensuelle personnalisée')
        .addStringOption(option =>
            option.setName('theme')
                .setDescription('Le thème de l\'histoire')
                .setRequired(false)
                .addChoices(
                    { name: '💕 Romantique', value: 'romantic' },
                    { name: '🔥 Passionné', value: 'passionate' },
                    { name: '🦄 Fantaisie', value: 'fantasy' },
                    { name: '🗺️ Aventure', value: 'adventure' },
                    { name: '🚫 Interdit', value: 'forbidden' }
                )
        )
        .addStringOption(option =>
            option.setName('longueur')
                .setDescription('La longueur de l\'histoire')
                .setRequired(false)
                .addChoices(
                    { name: '📄 Courte (300 mots)', value: 'short' },
                    { name: '📖 Moyenne (500 mots)', value: 'medium' },
                    { name: '📚 Longue (800 mots)', value: 'long' }
                )
        ),

    async execute(interaction) {
        try {
            // Récupérer les options
            const theme = interaction.options.getString('theme') || 'romantic';
            const length = interaction.options.getString('longueur') || 'medium';
            
            // Répondre immédiatement avec un message de chargement
            const loadingEmbed = new EmbedBuilder()
                .setTitle(`${Scenariste.emoji} L'IA Scénariste prépare votre histoire...`)
                .setDescription('✨ Laissez la magie opérer...')
                .setColor(COULEURS.PRIMAIRE)
                .setImage('https://i.imgur.com/writing.gif'); // Animation d'écriture
            
            await interaction.reply({ embeds: [loadingEmbed] });
            
            // Générer l'histoire
            logger.info(`Génération d'histoire - Thème: ${theme}, Longueur: ${length}`);
            
            const result = await Scenariste.generateStory(theme, {
                userId: interaction.user.id,
                username: interaction.user.username
            }, length);
            
            if (!result.success) {
                throw new Error('Échec de la génération');
            }
            
            // Générer un titre
            const title = await Scenariste.generateTitle(result.story);
            
            // Analyser le ton
            const toneAnalysis = await Scenariste.analyzeStoryTone(result.story);
            
            // Créer l'embed avec l'histoire
            const storyEmbed = new EmbedBuilder()
                .setTitle(`📖 ${title}`)
                .setDescription(this.truncateStory(result.story, 4000))
                .setColor(COULEURS.SUCCES)
                .setAuthor({
                    name: `${Scenariste.name}`,
                    iconURL: 'https://i.imgur.com/ai-writer.png'
                })
                .addFields(
                    {
                        name: '🎭 Thème',
                        value: this.formatTheme(theme),
                        inline: true
                    },
                    {
                        name: '📏 Longueur',
                        value: `${result.wordCount} mots`,
                        inline: true
                    },
                    {
                        name: '💫 Ton',
                        value: toneAnalysis.tone,
                        inline: true
                    }
                )
                .setFooter({
                    text: `Généré pour ${interaction.user.username}`,
                    iconURL: interaction.user.displayAvatarURL()
                })
                .setTimestamp();
            
            // Créer les boutons d'action
            const actionRow = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('story_continue')
                        .setLabel('📝 Continuer l\'histoire')
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId('story_new')
                        .setLabel('🔄 Nouvelle histoire')
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId('story_save')
                        .setLabel('💾 Sauvegarder')
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId('story_share')
                        .setLabel('📤 Partager')
                        .setStyle(ButtonStyle.Secondary)
                );
            
            // Mettre à jour le message avec l'histoire
            await interaction.editReply({
                embeds: [storyEmbed],
                components: [actionRow]
            });
            
            // Gérer les interactions des boutons
            const collector = interaction.channel.createMessageComponentCollector({
                filter: i => i.user.id === interaction.user.id,
                time: 300000 // 5 minutes
            });
            
            collector.on('collect', async i => {
                try {
                    if (i.customId === 'story_continue') {
                        await this.handleContinue(i, result.story);
                    } else if (i.customId === 'story_new') {
                        await this.handleNewStory(i);
                    } else if (i.customId === 'story_save') {
                        await this.handleSave(i, result, title);
                    } else if (i.customId === 'story_share') {
                        await this.handleShare(i, result, title);
                    }
                } catch (error) {
                    logger.erreur('Erreur dans le collecteur', error);
                    await i.reply({
                        content: '❌ Une erreur s\'est produite.',
                        ephemeral: true
                    });
                }
            });
            
            collector.on('end', () => {
                interaction.editReply({ components: [] }).catch(() => {});
            });
            
        } catch (error) {
            logger.erreur('Erreur lors de la génération d\'histoire', error);
            
            const errorEmbed = new EmbedBuilder()
                .setTitle('❌ Erreur de génération')
                .setDescription('L\'IA Scénariste a rencontré un problème. Veuillez réessayer.')
                .setColor(COULEURS.ERREUR);
            
            if (interaction.deferred || interaction.replied) {
                await interaction.editReply({ embeds: [errorEmbed], components: [] });
            } else {
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        }
    },

    async handleContinue(interaction, currentStory) {
        const loadingEmbed = new EmbedBuilder()
            .setTitle('✍️ Continuation en cours...')
            .setDescription('L\'IA Scénariste écrit la suite...')
            .setColor(COULEURS.PRIMAIRE);
        
        await interaction.reply({ embeds: [loadingEmbed], ephemeral: true });
        
        const continuation = await Scenariste.continueStory(currentStory);
        
        const continuationEmbed = new EmbedBuilder()
            .setTitle('📝 Suite de l\'histoire')
            .setDescription(continuation.continuation)
            .setColor(COULEURS.SUCCES)
            .setFooter({ text: 'La suite a été ajoutée à votre histoire' });
        
        await interaction.editReply({ embeds: [continuationEmbed] });
    },

    async handleNewStory(interaction) {
        // Créer un menu de sélection pour le nouveau thème
        const themeSelect = new StringSelectMenuBuilder()
            .setCustomId('new_story_theme')
            .setPlaceholder('Choisissez un nouveau thème')
            .addOptions([
                { label: '💕 Romantique', value: 'romantic', emoji: '💕' },
                { label: '🔥 Passionné', value: 'passionate', emoji: '🔥' },
                { label: '🦄 Fantaisie', value: 'fantasy', emoji: '🦄' },
                { label: '🗺️ Aventure', value: 'adventure', emoji: '🗺️' },
                { label: '🚫 Interdit', value: 'forbidden', emoji: '🚫' }
            ]);
        
        const row = new ActionRowBuilder().addComponents(themeSelect);
        
        await interaction.reply({
            content: '🎭 Choisissez le thème de votre nouvelle histoire :',
            components: [row],
            ephemeral: true
        });
    },

    async handleSave(interaction, story, title) {
        // TODO: Implémenter la sauvegarde en base de données
        await interaction.reply({
            content: `✅ Histoire "${title}" sauvegardée avec succès !`,
            ephemeral: true
        });
    },

    async handleShare(interaction, story, title) {
        const shareEmbed = new EmbedBuilder()
            .setTitle(`📚 ${title}`)
            .setDescription(this.truncateStory(story.story, 2000))
            .setColor(COULEURS.PRIMAIRE)
            .setAuthor({
                name: `Partagé par ${interaction.user.username}`,
                iconURL: interaction.user.displayAvatarURL()
            })
            .setFooter({ text: 'Histoire générée par l\'IA Scénariste' });
        
        await interaction.channel.send({ embeds: [shareEmbed] });
        
        await interaction.reply({
            content: '✅ Histoire partagée dans le salon !',
            ephemeral: true
        });
    },

    truncateStory(story, maxLength) {
        if (story.length <= maxLength) return story;
        return story.substring(0, maxLength - 3) + '...';
    },

    formatTheme(theme) {
        const themeMap = {
            'romantic': '💕 Romantique',
            'passionate': '🔥 Passionné',
            'fantasy': '🦄 Fantaisie',
            'adventure': '🗺️ Aventure',
            'forbidden': '🚫 Interdit'
        };
        return themeMap[theme] || theme;
    }
};
