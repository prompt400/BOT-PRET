import { SlashCommandBuilder, EmbedBuilder, ChannelType, PermissionFlagsBits } from 'discord.js';

// Stockage des salons temporaires actifs
const temporaryChannels = new Map();

// Fonction pour nettoyer les salons expirés
function cleanupExpiredChannels(guild) {
    const now = Date.now();
    const toDelete = [];
    
    for (const [channelId, data] of temporaryChannels.entries()) {
        if (data.guildId === guild.id && data.expiresAt <= now) {
            toDelete.push(channelId);
        }
    }
    
    for (const channelId of toDelete) {
        const channel = guild.channels.cache.get(channelId);
        if (channel) {
            channel.delete('Salon temporaire expiré').catch(console.error);
        }
        temporaryChannels.delete(channelId);
    }
}

export default {
    data: new SlashCommandBuilder()
        .setName('salon-temp')
        .setDescription('Gérer les salons temporaires')
        .addSubcommand(subcommand =>
            subcommand
                .setName('creer')
                .setDescription('Créer un salon temporaire')
                .addStringOption(option =>
                    option.setName('nom')
                        .setDescription('Nom du salon')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('type')
                        .setDescription('Type de salon')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Texte', value: 'text' },
                            { name: 'Vocal', value: 'voice' }
                        ))
                .addIntegerOption(option =>
                    option.setName('duree')
                        .setDescription('Durée en heures (max 72h)')
                        .setRequired(true)
                        .setMinValue(1)
                        .setMaxValue(72))
                .addBooleanOption(option =>
                    option.setName('prive')
                        .setDescription('Salon privé?')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('popup')
                .setDescription('Créer un salon vocal instantané')
                .addStringOption(option =>
                    option.setName('nom')
                        .setDescription('Nom du salon (optionnel)')
                        .setRequired(false))
                .addIntegerOption(option =>
                    option.setName('limite')
                        .setDescription('Limite d\'utilisateurs')
                        .setMinValue(2)
                        .setMaxValue(99)
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('ephemere')
                .setDescription('Créer un salon éphémère (auto-suppression)')
                .addIntegerOption(option =>
                    option.setName('inactivite')
                        .setDescription('Minutes d\'inactivité avant suppression')
                        .setRequired(true)
                        .setMinValue(5)
                        .setMaxValue(60)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('inviter')
                .setDescription('Inviter quelqu\'un dans votre salon temporaire')
                .addUserOption(option =>
                    option.setName('utilisateur')
                        .setDescription('Utilisateur à inviter')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('fermer')
                .setDescription('Fermer votre salon temporaire')),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        // Nettoyer les salons expirés
        cleanupExpiredChannels(interaction.guild);

        switch (subcommand) {
            case 'creer':
                await this.createTemporaryChannel(interaction);
                break;
            case 'popup':
                await this.createPopupRoom(interaction);
                break;
            case 'ephemere':
                await this.createEphemeralChannel(interaction);
                break;
            case 'inviter':
                await this.inviteToChannel(interaction);
                break;
            case 'fermer':
                await this.closeChannel(interaction);
                break;
        }
    },

    async createTemporaryChannel(interaction) {
        const nom = interaction.options.getString('nom');
        const type = interaction.options.getString('type');
        const duree = interaction.options.getInteger('duree');
        const prive = interaction.options.getBoolean('prive') || false;

        // Vérifier les limites de salons temporaires
        const userChannels = Array.from(temporaryChannels.values())
            .filter(data => data.ownerId === interaction.user.id && data.guildId === interaction.guild.id);
        
        if (userChannels.length >= 3) {
            return interaction.reply({
                content: '❌ Vous avez déjà 3 salons temporaires actifs! Fermez-en un avant d\'en créer un nouveau.',
                ephemeral: true
            });
        }

        // Créer le salon
        const channelOptions = {
            name: `🕐 ${nom}`,
            type: type === 'voice' ? ChannelType.GuildVoice : ChannelType.GuildText,
            parent: interaction.channel.parent, // Même catégorie
            permissionOverwrites: [
                {
                    id: interaction.guild.id,
                    deny: prive ? [PermissionFlagsBits.ViewChannel] : [],
                },
                {
                    id: interaction.user.id,
                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.ManageChannels,
                        PermissionFlagsBits.ManageMessages
                    ],
                }
            ]
        };

        if (type === 'voice') {
            channelOptions.userLimit = 10;
        }

        const channel = await interaction.guild.channels.create(channelOptions);

        // Enregistrer le salon
        const expiresAt = Date.now() + (duree * 60 * 60 * 1000);
        temporaryChannels.set(channel.id, {
            ownerId: interaction.user.id,
            guildId: interaction.guild.id,
            type: 'temporary',
            expiresAt,
            created: Date.now()
        });

        // Programmer la suppression
        setTimeout(() => {
            if (channel && !channel.deleted) {
                channel.delete('Salon temporaire expiré').catch(console.error);
                temporaryChannels.delete(channel.id);
            }
        }, duree * 60 * 60 * 1000);

        const embed = new EmbedBuilder()
            .setTitle('🕐 Salon Temporaire Créé')
            .setColor(0x00AE86)
            .setDescription(`${channel} a été créé avec succès!`)
            .addFields(
                { name: '⏱️ Durée', value: `${duree} heures`, inline: true },
                { name: '🔒 Type', value: prive ? 'Privé' : 'Public', inline: true },
                { name: '📅 Expire', value: `<t:${Math.floor(expiresAt / 1000)}:R>`, inline: true }
            )
            .setFooter({ text: 'Utilisez /salon-temp inviter pour ajouter des membres' });

        await interaction.reply({ embeds: [embed], ephemeral: true });
    },

    async createPopupRoom(interaction) {
        const nom = interaction.options.getString('nom');
        const limite = interaction.options.getInteger('limite') || 0;

        // Vérifier la limite de pop-up rooms
        const popupRooms = Array.from(temporaryChannels.values())
            .filter(data => data.type === 'popup' && data.guildId === interaction.guild.id);
        
        if (popupRooms.length >= 5) {
            return interaction.reply({
                content: '❌ Limite de 5 pop-up rooms atteinte sur le serveur!',
                ephemeral: true
            });
        }

        // Nom par défaut
        const channelName = nom || `💫 Room #${Math.floor(Math.random() * 999) + 1}`;

        // Créer le salon vocal
        const channel = await interaction.guild.channels.create({
            name: channelName,
            type: ChannelType.GuildVoice,
            parent: interaction.channel.parent,
            userLimit: limite,
            permissionOverwrites: [
                {
                    id: interaction.user.id,
                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.Connect,
                        PermissionFlagsBits.ManageChannels,
                        PermissionFlagsBits.MoveMembers
                    ],
                }
            ]
        });

        // Enregistrer le salon
        temporaryChannels.set(channel.id, {
            ownerId: interaction.user.id,
            guildId: interaction.guild.id,
            type: 'popup',
            created: Date.now()
        });

        // Auto-suppression après 5 minutes si vide
        let checkInterval = setInterval(() => {
            if (!channel || channel.deleted) {
                clearInterval(checkInterval);
                temporaryChannels.delete(channel.id);
                return;
            }

            if (channel.members.size === 0) {
                channel.delete('Pop-up room vide').catch(console.error);
                temporaryChannels.delete(channel.id);
                clearInterval(checkInterval);
            }
        }, 5 * 60 * 1000); // Vérifier toutes les 5 minutes

        const embed = new EmbedBuilder()
            .setTitle('💫 Pop-up Room Créée')
            .setColor(0xFF6B6B)
            .setDescription(`${channel} est prêt!`)
            .addFields(
                { name: '👥 Limite', value: limite > 0 ? `${limite} personnes` : 'Illimité', inline: true },
                { name: '⚡ Type', value: 'Auto-suppression si vide', inline: true }
            )
            .setFooter({ text: 'Le salon sera supprimé après 5 minutes d\'inactivité' });

        await interaction.reply({ embeds: [embed] });
    },

    async createEphemeralChannel(interaction) {
        const inactivite = interaction.options.getInteger('inactivite');

        // Créer le salon éphémère
        const themes = ['🌠 Discussions Nocturnes', '🌠 Confessions', '🌠 Débats', '🌠 Chill Zone', '🌠 Deep Talks'];
        const theme = themes[Math.floor(Math.random() * themes.length)];

        const channel = await interaction.guild.channels.create({
            name: theme,
            type: ChannelType.GuildText,
            parent: interaction.channel.parent,
            topic: `Salon éphémère - Autodestruction après ${inactivite} minutes d'inactivité`,
            permissionOverwrites: [
                {
                    id: interaction.guild.id,
                    allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
                }
            ]
        });

        // Enregistrer le salon
        temporaryChannels.set(channel.id, {
            ownerId: interaction.user.id,
            guildId: interaction.guild.id,
            type: 'ephemeral',
            inactivityTimeout: inactivite * 60 * 1000,
            lastActivity: Date.now(),
            created: Date.now()
        });

        // Message de bienvenue
        await channel.send({
            embeds: [
                new EmbedBuilder()
                    .setTitle('🌠 Salon Éphémère')
                    .setDescription(`Bienvenue dans ce salon temporaire!\n\nCe salon s'autodétruira après **${inactivite} minutes** sans activité.`)
                    .setColor(0x9B59B6)
                    .setFooter({ text: 'Profitez de ce moment unique!' })
            ]
        });

        // Monitorer l'activité
        let inactivityTimer;
        
        const resetTimer = () => {
            if (inactivityTimer) clearTimeout(inactivityTimer);
            
            const channelData = temporaryChannels.get(channel.id);
            if (channelData) {
                channelData.lastActivity = Date.now();
            }
            
            inactivityTimer = setTimeout(async () => {
                if (!channel.deleted) {
                    // Avertissement 1 minute avant
                    await channel.send({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle('⏰ Avertissement')
                                .setDescription('Ce salon sera supprimé dans 1 minute pour cause d\'inactivité!')
                                .setColor(0xE74C3C)
                        ]
                    });

                    setTimeout(() => {
                        if (!channel.deleted) {
                            channel.delete('Salon éphémère - Inactivité').catch(console.error);
                            temporaryChannels.delete(channel.id);
                        }
                    }, 60000);
                }
            }, (inactivite - 1) * 60 * 1000);
        };

        // Écouter les messages pour reset le timer
        const collector = channel.createMessageCollector({ 
            filter: m => !m.author.bot,
            time: 24 * 60 * 60 * 1000 // Max 24h
        });

        collector.on('collect', () => {
            resetTimer();
        });

        resetTimer();

        const embed = new EmbedBuilder()
            .setTitle('🌠 Salon Éphémère Créé')
            .setColor(0x9B59B6)
            .setDescription(`${channel} a été créé!`)
            .addFields(
                { name: '⏱️ Inactivité', value: `${inactivite} minutes`, inline: true },
                { name: '🎭 Thème', value: theme.replace('🌠 ', ''), inline: true }
            )
            .setFooter({ text: 'Le compteur se réinitialise à chaque message' });

        await interaction.reply({ embeds: [embed] });
    },

    async inviteToChannel(interaction) {
        const utilisateur = interaction.options.getUser('utilisateur');
        
        // Trouver le salon de l'utilisateur
        const userChannel = Array.from(temporaryChannels.entries())
            .find(([_, data]) => data.ownerId === interaction.user.id && data.guildId === interaction.guild.id);
        
        if (!userChannel) {
            return interaction.reply({
                content: '❌ Vous n\'avez pas de salon temporaire actif!',
                ephemeral: true
            });
        }

        const channel = interaction.guild.channels.cache.get(userChannel[0]);
        if (!channel) {
            temporaryChannels.delete(userChannel[0]);
            return interaction.reply({
                content: '❌ Votre salon temporaire n\'existe plus!',
                ephemeral: true
            });
        }

        // Ajouter les permissions
        await channel.permissionOverwrites.create(utilisateur.id, {
            ViewChannel: true,
            SendMessages: true,
            Connect: true,
            Speak: true
        });

        await interaction.reply({
            content: `✅ ${utilisateur} a été invité dans ${channel}!`,
            ephemeral: true
        });

        // Notifier l'utilisateur invité
        try {
            await utilisateur.send({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('📨 Invitation Salon Temporaire')
                        .setDescription(`${interaction.user} vous a invité dans un salon temporaire!`)
                        .addFields({ name: '📍 Salon', value: `${channel}` })
                        .setColor(0x00AE86)
                ]
            });
        } catch (error) {
            // L'utilisateur a peut-être désactivé les DMs
        }
    },

    async closeChannel(interaction) {
        // Trouver le salon de l'utilisateur
        const userChannel = Array.from(temporaryChannels.entries())
            .find(([_, data]) => data.ownerId === interaction.user.id && data.guildId === interaction.guild.id);
        
        if (!userChannel) {
            return interaction.reply({
                content: '❌ Vous n\'avez pas de salon temporaire actif!',
                ephemeral: true
            });
        }

        const channel = interaction.guild.channels.cache.get(userChannel[0]);
        if (!channel) {
            temporaryChannels.delete(userChannel[0]);
            return interaction.reply({
                content: '❌ Votre salon temporaire n\'existe plus!',
                ephemeral: true
            });
        }

        await interaction.reply({
            content: `✅ Le salon ${channel.name} va être fermé dans 5 secondes...`,
            ephemeral: true
        });

        setTimeout(() => {
            channel.delete('Fermé par le propriétaire').catch(console.error);
            temporaryChannels.delete(userChannel[0]);
        }, 5000);
    }
};
