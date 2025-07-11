const { SlashCommandBuilder, StringSelectMenuBuilder, ActionRowBuilder, EmbedBuilder } = require('discord.js');
const AIManager = require('../../services/ai/AIManager');
const MemoryManager = require('../../services/ai/MemoryManager');
const logger = require('../../utils/Logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ai-chat')
        .setDescription('💬 Discute avec une de nos personnalités IA uniques')
        .addStringOption(option =>
            option.setName('message')
                .setDescription('Ton message pour l\'IA')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('personnalite')
                .setDescription('Choisis une personnalité IA spécifique')
                .setRequired(false)
                .addChoices(
                    { name: '📖 Narrateur Scénariste', value: 'narrateur' },
                    { name: '🎭 Maîtresse de Cérémonie', value: 'maitresse' },
                    { name: '🔮 Psychologue Érotique', value: 'psychologue' },
                    { name: '💪 Coach Sensuel', value: 'coach' },
                    { name: '🎧 DJ Ambiance', value: 'dj' }
                )),

    async execute(interaction) {
        await interaction.deferReply();

        try {
            const message = interaction.options.getString('message');
            let personalityChoice = interaction.options.getString('personnalite');

            // Si pas de personnalité choisie, proposer un menu
            if (!personalityChoice) {
                const selectMenu = new StringSelectMenuBuilder()
                    .setCustomId(`ai_select_${interaction.user.id}`)
                    .setPlaceholder('🤖 Choisis une personnalité IA')
                    .addOptions([
                        {
                            label: 'Narrateur Scénariste',
                            description: 'Pour créer des histoires captivantes',
                            value: 'narrateur',
                            emoji: '📖'
                        },
                        {
                            label: 'Maîtresse de Cérémonie',
                            description: 'Pour orchestrer des événements élégants',
                            value: 'maitresse',
                            emoji: '🎭'
                        },
                        {
                            label: 'Psychologue Érotique',
                            description: 'Pour explorer tes désirs en toute sécurité',
                            value: 'psychologue',
                            emoji: '🔮'
                        },
                        {
                            label: 'Coach Sensuel',
                            description: 'Pour booster ta confiance et ton énergie',
                            value: 'coach',
                            emoji: '💪'
                        },
                        {
                            label: 'DJ Ambiance',
                            description: 'Pour créer l\'atmosphère parfaite',
                            value: 'dj',
                            emoji: '🎧'
                        }
                    ]);

                const row = new ActionRowBuilder().addComponents(selectMenu);

                const embed = new EmbedBuilder()
                    .setTitle('🤖 Centre de Chat IA')
                    .setDescription(`**Ton message :** "${message.substring(0, 100)}${message.length > 100 ? '...' : ''}"`)
                    .setColor('#FF69B4')
                    .addFields({
                        name: '✨ Choisis ta personnalité IA',
                        value: 'Chaque IA a sa propre personnalité et expertise unique !'
                    })
                    .setFooter({ text: 'Sélectionne dans le menu ci-dessous' });

                const response = await interaction.editReply({
                    embeds: [embed],
                    components: [row]
                });

                // Attendre la sélection
                const collector = response.createMessageComponentCollector({
                    filter: i => i.customId === `ai_select_${interaction.user.id}` && i.user.id === interaction.user.id,
                    time: 60000,
                    max: 1
                });

                collector.on('collect', async i => {
                    personalityChoice = i.values[0];
                    await i.update({ components: [] });
                    await this.handleAIChat(interaction, message, personalityChoice);
                });

                collector.on('end', collected => {
                    if (collected.size === 0) {
                        interaction.editReply({
                            content: '⏰ Temps écoulé ! Utilise `/ai-chat` à nouveau.',
                            embeds: [],
                            components: []
                        });
                    }
                });

                return;
            }

            // Si personnalité déjà choisie, procéder directement
            await this.handleAIChat(interaction, message, personalityChoice);

        } catch (error) {
            logger.error('Erreur dans ai-chat:', error);
            await interaction.editReply({
                content: '❌ Une erreur s\'est produite lors du chat avec l\'IA.',
                embeds: [],
                components: []
            });
        }
    },

    async handleAIChat(interaction, message, personalityChoice) {
        try {
            // Récupérer le contexte de conversation
            const context = await MemoryManager.getConversationContext(
                interaction.user.id,
                personalityChoice,
                5 // Derniers 5 messages
            );

            // Sauvegarder le message de l'utilisateur
            await MemoryManager.saveMessage(
                interaction.user.id,
                personalityChoice,
                message,
                true
            );

            // Obtenir la réponse de l'IA
            const aiResponse = await AIManager.chat(personalityChoice, message, {
                userId: interaction.user.id,
                username: interaction.user.username,
                conversationContext: context
            });

            if (!aiResponse) {
                throw new Error('Pas de réponse de l\'IA');
            }

            // Sauvegarder la réponse de l'IA
            await MemoryManager.saveMessage(
                interaction.user.id,
                personalityChoice,
                aiResponse,
                false
            );

            // Obtenir les infos de la personnalité
            const personality = AIManager.getPersonality(personalityChoice);
            const personalityInfo = personality ? {
                name: personality.name,
                emoji: personality.emoji,
                color: personality.primaryColor
            } : {
                name: 'IA',
                emoji: '🤖',
                color: '#FF69B4'
            };

            // Créer l'embed de réponse
            const responseEmbed = new EmbedBuilder()
                .setAuthor({
                    name: personalityInfo.name,
                    iconURL: interaction.client.user.displayAvatarURL()
                })
                .setDescription(aiResponse)
                .setColor(personalityInfo.color)
                .setFooter({
                    text: `Réponse à ${interaction.user.username}`,
                    iconURL: interaction.user.displayAvatarURL()
                })
                .setTimestamp();

            // Ajouter des boutons d'action
            const actionRow = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`ai_continue_${personalityChoice}_${interaction.user.id}`)
                        .setLabel('Continuer')
                        .setEmoji('💬')
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId(`ai_new_${interaction.user.id}`)
                        .setLabel('Nouvelle IA')
                        .setEmoji('🔄')
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId(`ai_memory_${interaction.user.id}`)
                        .setLabel('Ma Mémoire')
                        .setEmoji('🧠')
                        .setStyle(ButtonStyle.Success)
                );

            await interaction.editReply({
                content: `${personalityInfo.emoji} **${personalityInfo.name}** te répond :`,
                embeds: [responseEmbed],
                components: [actionRow]
            });

            // Collecter les interactions avec les boutons
            const buttonCollector = interaction.channel.createMessageComponentCollector({
                filter: i => i.user.id === interaction.user.id,
                time: 300000 // 5 minutes
            });

            buttonCollector.on('collect', async i => {
                if (i.customId.startsWith('ai_continue_')) {
                    await i.reply({
                        content: '💬 Utilise `/ai-chat` pour continuer la conversation !',
                        ephemeral: true
                    });
                } else if (i.customId.startsWith('ai_new_')) {
                    await i.reply({
                        content: '🔄 Utilise `/ai-chat` sans spécifier de personnalité pour en choisir une nouvelle !',
                        ephemeral: true
                    });
                } else if (i.customId.startsWith('ai_memory_')) {
                    const memorySummary = await MemoryManager.generateMemorySummary(i.user.id);
                    await i.reply({
                        embeds: memorySummary ? [memorySummary] : [],
                        content: memorySummary ? null : '❌ Impossible de récupérer ta mémoire.',
                        ephemeral: true
                    });
                }
            });

        } catch (error) {
            logger.error('Erreur dans handleAIChat:', error);
            throw error;
        }
    }
};

// Import nécessaire pour ButtonBuilder
const { ButtonBuilder, ButtonStyle } = require('discord.js');
