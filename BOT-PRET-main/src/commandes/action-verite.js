import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

// Base de données des actions et vérités
const database = {
    actions: {
        soft: [
            "Fais 10 pompes",
            "Chante une chanson pendant 30 secondes",
            "Imite un animal pendant 1 minute",
            "Raconte une blague",
            "Fais un compliment à 3 personnes du salon"
        ],
        medium: [
            "Envoie un selfie rigolo",
            "Change ton pseudo Discord pour 24h",
            "Mets une photo de profil choisie par les autres pour 1h",
            "Écris un poème sur le dernier qui a parlé",
            "Fais une déclaration d'amour à ton ordinateur"
        ],
        hard: [
            "Partage ton dernier screenshot embarrassant",
            "Laisse quelqu'un écrire ton prochain statut",
            "Envoie un message vocal en chantant",
            "Fais un dessin en 30 secondes sur un thème imposé",
            "Raconte ta pire histoire de date"
        ],
        extreme: [
            "Révèle ton plus grand secret Discord",
            "Partage ton historique de recherche le plus gênant",
            "Laisse quelqu'un choisir ton avatar pour 1 semaine",
            "Fais une confession embarrassante",
            "Montre ta dernière conversation privée (avec accord)"
        ]
    },
    verites: {
        soft: [
            "Quel est ton emoji préféré ?",
            "Quelle est ta plus grande peur ?",
            "Quel est ton plus grand rêve ?",
            "Si tu pouvais avoir un super pouvoir, lequel ?",
            "Quelle est ta chanson guilty pleasure ?"
        ],
        medium: [
            "As-tu déjà menti sur Discord ?",
            "Quel membre du serveur aimerais-tu mieux connaître ?",
            "Quelle est ta plus grosse bêtise ?",
            "As-tu déjà eu le béguin pour quelqu'un en ligne ?",
            "Quel est ton plus gros regret ?"
        ],
        hard: [
            "As-tu déjà stalké quelqu'un sur les réseaux ?",
            "Quelle est ta plus grande insécurité ?",
            "As-tu déjà trahi la confiance de quelqu'un ?",
            "Quel est ton fantasme le plus fou ?",
            "Quelle est la chose la plus illégale que tu aies faite ?"
        ],
        extreme: [
            "Décris ton pire cauchemar relationnel",
            "Quelle est ta pensée la plus sombre ?",
            "As-tu déjà fantasmé sur quelqu'un du serveur ?",
            "Quel est ton plus grand secret ?",
            "Quelle est la chose que personne ne sait sur toi ?"
        ]
    }
};

// Stockage des parties actives
const activeGames = new Map();

export default {
    data: new SlashCommandBuilder()
        .setName('aov')
        .setDescription('Jouer à Action ou Vérité')
        .addSubcommand(subcommand =>
            subcommand
                .setName('start')
                .setDescription('Démarrer une nouvelle partie'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('join')
                .setDescription('Rejoindre la partie en cours'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('spin')
                .setDescription('Faire tourner la bouteille'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('dare')
                .setDescription('Proposer une action')
                .addStringOption(option =>
                    option.setName('niveau')
                        .setDescription('Niveau de difficulté')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Soft', value: 'soft' },
                            { name: 'Medium', value: 'medium' },
                            { name: 'Hard', value: 'hard' },
                            { name: 'Extreme', value: 'extreme' }
                        )))
        .addSubcommand(subcommand =>
            subcommand
                .setName('truth')
                .setDescription('Proposer une vérité')
                .addStringOption(option =>
                    option.setName('niveau')
                        .setDescription('Niveau de difficulté')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Soft', value: 'soft' },
                            { name: 'Medium', value: 'medium' },
                            { name: 'Hard', value: 'hard' },
                            { name: 'Extreme', value: 'extreme' }
                        ))),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const channelId = interaction.channelId;

        switch (subcommand) {
            case 'start':
                await this.startGame(interaction);
                break;
            case 'join':
                await this.joinGame(interaction);
                break;
            case 'spin':
                await this.spinBottle(interaction);
                break;
            case 'dare':
                await this.proposeDare(interaction);
                break;
            case 'truth':
                await this.proposeTruth(interaction);
                break;
        }
    },

    async startGame(interaction) {
        const channelId = interaction.channelId;
        
        if (activeGames.has(channelId)) {
            return interaction.reply({ 
                content: '❌ Une partie est déjà en cours dans ce salon!', 
                ephemeral: true 
            });
        }

        const game = {
            host: interaction.user,
            players: [interaction.user],
            currentPlayer: null,
            target: null,
            state: 'waiting', // waiting, spinning, choosing, answering
            scores: new Map([[interaction.user.id, 0]])
        };

        activeGames.set(channelId, game);

        const embed = new EmbedBuilder()
            .setTitle('🎯 Action ou Vérité')
            .setDescription(`${interaction.user} a démarré une nouvelle partie!\n\nUtilisez \`/aov join\` pour rejoindre la partie.`)
            .setColor(0xFF1493)
            .addFields(
                { name: '👥 Joueurs', value: game.players.map(p => p.toString()).join('\n'), inline: true },
                { name: '📊 Statut', value: 'En attente de joueurs...', inline: true }
            )
            .setFooter({ text: 'Minimum 2 joueurs pour commencer' });

        await interaction.reply({ embeds: [embed] });
    },

    async joinGame(interaction) {
        const channelId = interaction.channelId;
        const game = activeGames.get(channelId);

        if (!game) {
            return interaction.reply({ 
                content: '❌ Aucune partie en cours! Utilisez `/aov start` pour en créer une.', 
                ephemeral: true 
            });
        }

        if (game.players.find(p => p.id === interaction.user.id)) {
            return interaction.reply({ 
                content: '❌ Vous êtes déjà dans la partie!', 
                ephemeral: true 
            });
        }

        game.players.push(interaction.user);
        game.scores.set(interaction.user.id, 0);

        const embed = new EmbedBuilder()
            .setTitle('🎯 Action ou Vérité')
            .setDescription(`${interaction.user} a rejoint la partie!`)
            .setColor(0x00FF00)
            .addFields(
                { name: '👥 Joueurs', value: game.players.map(p => p.toString()).join('\n'), inline: true },
                { name: '📊 Nombre', value: `${game.players.length} joueurs`, inline: true }
            );

        await interaction.reply({ embeds: [embed] });
    },

    async spinBottle(interaction) {
        const channelId = interaction.channelId;
        const game = activeGames.get(channelId);

        if (!game) {
            return interaction.reply({ 
                content: '❌ Aucune partie en cours!', 
                ephemeral: true 
            });
        }

        if (game.players.length < 2) {
            return interaction.reply({ 
                content: '❌ Il faut au moins 2 joueurs pour jouer!', 
                ephemeral: true 
            });
        }

        if (game.state !== 'waiting' && game.state !== 'answered') {
            return interaction.reply({ 
                content: '❌ Une action est déjà en cours!', 
                ephemeral: true 
            });
        }

        // Animation de la bouteille
        await interaction.deferReply();
        
        const spinner = game.players[Math.floor(Math.random() * game.players.length)];
        let target;
        do {
            target = game.players[Math.floor(Math.random() * game.players.length)];
        } while (target.id === spinner.id && game.players.length > 1);

        game.currentPlayer = spinner;
        game.target = target;
        game.state = 'choosing';

        // Animation
        const frames = ['🔄', '🔃', '🔄', '🔃', '🎯'];
        for (const frame of frames) {
            await interaction.editReply({ content: `${frame} La bouteille tourne...` });
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        const embed = new EmbedBuilder()
            .setTitle('🎯 La bouteille s\'est arrêtée!')
            .setDescription(`${spinner} doit choisir pour ${target}`)
            .setColor(0xFFD700)
            .setFooter({ text: 'Choisissez Action ou Vérité avec les boutons ci-dessous' });

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('action')
                    .setLabel('Action')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('💪'),
                new ButtonBuilder()
                    .setCustomId('verite')
                    .setLabel('Vérité')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('🤔')
            );

        await interaction.editReply({ 
            content: null,
            embeds: [embed], 
            components: [row] 
        });

        // Collector pour les boutons
        const collector = interaction.channel.createMessageComponentCollector({ 
            time: 30000 
        });

        collector.on('collect', async i => {
            if (i.user.id !== spinner.id) {
                return i.reply({ 
                    content: `Seul ${spinner} peut choisir!`, 
                    ephemeral: true 
                });
            }

            game.state = i.customId === 'action' ? 'action' : 'verite';
            
            const niveauRow = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('soft')
                        .setLabel('Soft')
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId('medium')
                        .setLabel('Medium')
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId('hard')
                        .setLabel('Hard')
                        .setStyle(ButtonStyle.Danger),
                    new ButtonBuilder()
                        .setCustomId('extreme')
                        .setLabel('Extreme')
                        .setStyle(ButtonStyle.Danger)
                        .setEmoji('🔥')
                );

            await i.update({ 
                content: `Choisissez le niveau de difficulté:`,
                embeds: [],
                components: [niveauRow] 
            });

            collector.stop();
        });

        collector.on('end', collected => {
            if (collected.size === 0) {
                interaction.editReply({ 
                    content: '⏰ Temps écoulé!', 
                    components: [] 
                });
                game.state = 'waiting';
            }
        });
    },

    async proposeDare(interaction) {
        const niveau = interaction.options.getString('niveau');
        const channelId = interaction.channelId;
        const game = activeGames.get(channelId);

        if (!game || game.state !== 'choosing') {
            return interaction.reply({ 
                content: '❌ Pas de choix en cours!', 
                ephemeral: true 
            });
        }

        const actions = database.actions[niveau];
        const action = actions[Math.floor(Math.random() * actions.length)];

        const embed = new EmbedBuilder()
            .setTitle(`💪 Action ${niveau.toUpperCase()}`)
            .setDescription(`${game.target} doit:\n\n**${action}**`)
            .setColor(niveau === 'extreme' ? 0xFF0000 : niveau === 'hard' ? 0xFF6B6B : 0x3498DB)
            .addFields(
                { name: 'Choisi par', value: game.currentPlayer.toString(), inline: true },
                { name: 'Pour', value: game.target.toString(), inline: true }
            )
            .setFooter({ text: 'Réagissez avec ✅ si complété, ❌ si refusé' });

        const message = await interaction.reply({ embeds: [embed], fetchReply: true });
        await message.react('✅');
        await message.react('❌');

        // Gestion des points
        const filter = (reaction, user) => ['✅', '❌'].includes(reaction.emoji.name) && user.id === game.target.id;
        const collected = await message.awaitReactions({ filter, max: 1, time: 300000 });
        
        if (collected.first()?.emoji.name === '✅') {
            const points = { soft: 10, medium: 20, hard: 30, extreme: 50 }[niveau];
            game.scores.set(game.target.id, (game.scores.get(game.target.id) || 0) + points);
            
            await interaction.followUp(`✅ ${game.target} a complété l'action et gagne **${points} points**!`);
        } else {
            await interaction.followUp(`❌ ${game.target} a refusé l'action!`);
        }

        game.state = 'answered';
    },

    async proposeTruth(interaction) {
        const niveau = interaction.options.getString('niveau');
        const channelId = interaction.channelId;
        const game = activeGames.get(channelId);

        if (!game || game.state !== 'choosing') {
            return interaction.reply({ 
                content: '❌ Pas de choix en cours!', 
                ephemeral: true 
            });
        }

        const verites = database.verites[niveau];
        const verite = verites[Math.floor(Math.random() * verites.length)];

        const embed = new EmbedBuilder()
            .setTitle(`🤔 Vérité ${niveau.toUpperCase()}`)
            .setDescription(`${game.target} doit répondre à:\n\n**${verite}**`)
            .setColor(niveau === 'extreme' ? 0xFF0000 : niveau === 'hard' ? 0xFF6B6B : 0x2ECC71)
            .addFields(
                { name: 'Choisi par', value: game.currentPlayer.toString(), inline: true },
                { name: 'Pour', value: game.target.toString(), inline: true }
            )
            .setFooter({ text: 'Répondez dans le chat!' });

        await interaction.reply({ embeds: [embed] });

        // Attendre la réponse
        const filter = m => m.author.id === game.target.id;
        const collected = await interaction.channel.awaitMessages({ filter, max: 1, time: 120000 });
        
        if (collected.size > 0) {
            const points = { soft: 10, medium: 20, hard: 30, extreme: 50 }[niveau];
            game.scores.set(game.target.id, (game.scores.get(game.target.id) || 0) + points);
            
            await interaction.followUp(`✅ ${game.target} a répondu et gagne **${points} points**!`);
        } else {
            await interaction.followUp(`⏰ ${game.target} n'a pas répondu à temps!`);
        }

        game.state = 'answered';
    }
};
