const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

/**
 * WeeklyParty - Soirée hebdomadaire du vendredi soir
 */
class WeeklyParty {
    constructor(client) {
        this.client = client;
        this.participants = new Set();
        this.activities = [
            { name: 'Danse Sensuelle', emoji: '💃', xp: 100 },
            { name: 'Karaoké Coquin', emoji: '🎤', xp: 150 },
            { name: 'Jeux de Séduction', emoji: '😘', xp: 200 },
            { name: 'Concours de Strip', emoji: '👗', xp: 300 }
        ];
        this.isActive = false;
    }

    /**
     * Démarre la soirée
     * @param {TextChannel} channel - Le channel où annoncer la soirée
     */
    async start(channel) {
        this.isActive = true;
        this.participants.clear();

        const embed = new EmbedBuilder()
            .setColor(0xFF1493)
            .setTitle('🎉 SOIRÉE ÉROTIQUE DU VENDREDI ! 🎉')
            .setDescription(
                '**La soirée la plus chaude de la semaine commence !**\n\n' +
                '🔥 Ambiance torride garantie\n' +
                '💋 Rencontres sensuelles\n' +
                '🍾 Champagne à volonté\n' +
                '🎵 Musique enivrante\n\n' +
                '**Bonus actifs :**\n' +
                '• XP x1.5\n' +
                '• KissCoins x1.5\n' +
                '• Drops exclusifs !'
            )
            .addFields(
                { name: '📍 Lieu', value: 'Casino Érotique - Salle VIP', inline: true },
                { name: '⏰ Durée', value: '2 heures', inline: true },
                { name: '👥 Participants', value: '0', inline: true }
            )
            .setImage('https://example.com/party-banner.gif') // Remplacer par une vraie image
            .setTimestamp()
            .setFooter({ text: 'Cliquez sur Participer pour rejoindre !' });

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('join_party')
                    .setLabel('Participer')
                    .setEmoji('🎉')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('party_activities')
                    .setLabel('Activités')
                    .setEmoji('🎭')
                    .setStyle(ButtonStyle.Primary)
            );

        const message = await channel.send({ embeds: [embed], components: [row] });
        
        // Collecter les interactions
        const collector = message.createMessageComponentCollector({ time: 7200000 }); // 2 heures

        collector.on('collect', async (interaction) => {
            if (interaction.customId === 'join_party') {
                await this.handleJoin(interaction);
            } else if (interaction.customId === 'party_activities') {
                await this.showActivities(interaction);
            }
        });

        collector.on('end', () => {
            this.end(channel);
        });

        // Événements aléatoires toutes les 10 minutes
        this.eventInterval = setInterval(() => {
            this.triggerRandomEvent(channel);
        }, 600000);
    }

    /**
     * Gère la participation d'un membre
     * @param {ButtonInteraction} interaction - L'interaction du bouton
     */
    async handleJoin(interaction) {
        const userId = interaction.user.id;
        
        if (this.participants.has(userId)) {
            await interaction.reply({ 
                content: '❌ Vous participez déjà à la soirée !', 
                ephemeral: true 
            });
            return;
        }

        this.participants.add(userId);

        const welcomeMessages = [
            `🔥 ${interaction.user} entre dans la soirée avec style !`,
            `💋 Bienvenue ${interaction.user} ! L'ambiance monte d'un cran !`,
            `🎉 ${interaction.user} rejoint la fête ! Que la soirée commence !`,
            `😘 ${interaction.user} arrive... Les regards se tournent !`
        ];

        await interaction.reply({
            content: welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)]
        });

        // Mettre à jour le compteur
        const embed = interaction.message.embeds[0];
        const updatedEmbed = EmbedBuilder.from(embed)
            .spliceFields(2, 1, { 
                name: '👥 Participants', 
                value: this.participants.size.toString(), 
                inline: true 
            });

        await interaction.message.edit({ embeds: [updatedEmbed] });

        // Récompense de participation
        // TODO: Ajouter XP et coins au profil
    }

    /**
     * Affiche les activités disponibles
     * @param {ButtonInteraction} interaction - L'interaction du bouton
     */
    async showActivities(interaction) {
        if (!this.participants.has(interaction.user.id)) {
            await interaction.reply({ 
                content: '❌ Vous devez d\'abord participer à la soirée !', 
                ephemeral: true 
            });
            return;
        }

        const activityButtons = this.activities.map((activity, index) => 
            new ButtonBuilder()
                .setCustomId(`activity_${index}`)
                .setLabel(activity.name)
                .setEmoji(activity.emoji)
                .setStyle(ButtonStyle.Secondary)
        );

        const rows = [];
        for (let i = 0; i < activityButtons.length; i += 5) {
            rows.push(new ActionRowBuilder().addComponents(activityButtons.slice(i, i + 5)));
        }

        const embed = new EmbedBuilder()
            .setColor(0xFF69B4)
            .setTitle('🎭 Activités de la Soirée')
            .setDescription('Choisissez une activité pour gagner de l\'XP bonus !')
            .addFields(
                this.activities.map(a => ({
                    name: `${a.emoji} ${a.name}`,
                    value: `+${a.xp} XP`,
                    inline: true
                }))
            );

        await interaction.reply({ 
            embeds: [embed], 
            components: rows, 
            ephemeral: true 
        });
    }

    /**
     * Déclenche un événement aléatoire
     * @param {TextChannel} channel - Le channel de la soirée
     */
    async triggerRandomEvent(channel) {
        const events = [
            {
                title: '💃 DANCE BATTLE !',
                description: 'Un battle de danse sensuelle commence ! Les meilleurs danseurs gagnent 500 XP !',
                emoji: '💃'
            },
            {
                title: '🍾 CHAMPAGNE SHOWER !',
                description: 'Une pluie de champagne ! Tous les participants reçoivent 100 💋 !',
                emoji: '🍾'
            },
            {
                title: '😘 KISSING CONTEST !',
                description: 'Concours de baisers ! Votez pour le couple le plus passionné !',
                emoji: '😘'
            },
            {
                title: '🎭 MASQUERADE TIME !',
                description: 'Distribution de masques mystérieux ! Qui se cache derrière ?',
                emoji: '🎭'
            }
        ];

        const event = events[Math.floor(Math.random() * events.length)];

        const embed = new EmbedBuilder()
            .setColor(0xFFD700)
            .setTitle(`${event.emoji} ${event.title}`)
            .setDescription(event.description)
            .setTimestamp();

        await channel.send({ embeds: [embed] });

        // Distribuer les récompenses aux participants
        // TODO: Implémenter la distribution des récompenses
    }

    /**
     * Termine la soirée
     * @param {TextChannel} channel - Le channel de la soirée
     */
    async end(channel) {
        this.isActive = false;
        clearInterval(this.eventInterval);

        const topParticipants = Array.from(this.participants).slice(0, 3);

        const embed = new EmbedBuilder()
            .setColor(0x800080)
            .setTitle('🌙 Fin de la Soirée Érotique')
            .setDescription(
                'La soirée touche à sa fin... Mais les souvenirs restent ! 💫\n\n' +
                `**Total de participants :** ${this.participants.size}\n\n` +
                '**Jusqu\'à la prochaine fois !** 😘'
            )
            .addFields({
                name: '🏆 Meilleurs Fêtards',
                value: topParticipants.length > 0 
                    ? topParticipants.map((id, i) => `${i + 1}. <@${id}>`).join('\n')
                    : 'Aucun participant'
            })
            .setTimestamp();

        await channel.send({ embeds: [embed] });

        // Bonus final pour tous les participants
        // TODO: Distribuer les récompenses finales
    }

    /**
     * Vérifie si la soirée est active
     * @returns {boolean} État de la soirée
     */
    isPartyActive() {
        return this.isActive;
    }

    /**
     * Obtient le nombre de participants
     * @returns {number} Nombre de participants
     */
    getParticipantCount() {
        return this.participants.size;
    }
}

module.exports = WeeklyParty;
