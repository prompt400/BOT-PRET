import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

// Fichier de stockage des défis
const DEFIS_DATA_PATH = join(process.cwd(), 'data', 'defis.json');

// Liste des défis disponibles
const DEFIS_DATABASE = {
    facile: [
        { id: 'msg10', nom: 'Bavard', description: 'Envoyer 10 messages', type: 'messages', target: 10, xp: 50 },
        { id: 'react5', nom: 'Réactif', description: 'Ajouter 5 réactions', type: 'reactions', target: 5, xp: 30 },
        { id: 'voice5', nom: 'Sociable', description: 'Passer 5 minutes en vocal', type: 'voice', target: 5, xp: 40 },
        { id: 'selfie1', nom: 'Photogénique', description: 'Partager un selfie', type: 'media', target: 1, xp: 60 },
        { id: 'game1', nom: 'Joueur', description: 'Jouer à un mini-jeu', type: 'game', target: 1, xp: 40 }
    ],
    moyen: [
        { id: 'msg50', nom: 'Causeur', description: 'Envoyer 50 messages', type: 'messages', target: 50, xp: 150 },
        { id: 'hot10', nom: 'Hot Speaker', description: '10 messages dans hot-talks', type: 'hot_messages', target: 10, xp: 200 },
        { id: 'win3', nom: 'Gagnant', description: 'Gagner 3 parties de jeu', type: 'wins', target: 3, xp: 250 },
        { id: 'help5', nom: 'Serviable', description: 'Aider 5 personnes', type: 'help', target: 5, xp: 300 },
        { id: 'create1', nom: 'Créatif', description: 'Créer du contenu original', type: 'creation', target: 1, xp: 200 }
    ],
    difficile: [
        { id: 'msg100', nom: 'Hyperactif', description: 'Envoyer 100 messages', type: 'messages', target: 100, xp: 500 },
        { id: 'streak7', nom: 'Régulier', description: 'Connexion 7 jours d\'affilée', type: 'streak', target: 7, xp: 700 },
        { id: 'event1', nom: 'Participant', description: 'Participer à un event', type: 'event', target: 1, xp: 600 },
        { id: 'recruit1', nom: 'Recruteur', description: 'Inviter un nouveau membre', type: 'invite', target: 1, xp: 800 },
        { id: 'top3', nom: 'Compétiteur', description: 'Finir top 3 d\'un classement', type: 'ranking', target: 3, xp: 1000 }
    ]
};

// Charger ou initialiser les données
function loadDefisData() {
    if (existsSync(DEFIS_DATA_PATH)) {
        return JSON.parse(readFileSync(DEFIS_DATA_PATH, 'utf8'));
    }
    return { 
        users: {}, 
        dailyDefis: generateDailyDefis(),
        lastReset: new Date().toISOString().split('T')[0],
        globalStats: { totalCompleted: 0, mostPopular: {} }
    };
}

// Sauvegarder les données
function saveDefisData(data) {
    const dir = join(process.cwd(), 'data');
    if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
    }
    writeFileSync(DEFIS_DATA_PATH, JSON.stringify(data, null, 2));
}

// Générer les défis du jour
function generateDailyDefis() {
    const defis = [];
    
    // 1 défi facile
    const facileIndex = Math.floor(Math.random() * DEFIS_DATABASE.facile.length);
    defis.push({ ...DEFIS_DATABASE.facile[facileIndex], difficulty: 'facile' });
    
    // 1 défi moyen
    const moyenIndex = Math.floor(Math.random() * DEFIS_DATABASE.moyen.length);
    defis.push({ ...DEFIS_DATABASE.moyen[moyenIndex], difficulty: 'moyen' });
    
    // 1 défi difficile
    const difficileIndex = Math.floor(Math.random() * DEFIS_DATABASE.difficile.length);
    defis.push({ ...DEFIS_DATABASE.difficile[difficileIndex], difficulty: 'difficile' });
    
    return defis;
}

// Vérifier et effectuer le reset quotidien
function checkDailyReset() {
    const data = loadDefisData();
    const today = new Date().toISOString().split('T')[0];
    
    if (data.lastReset !== today) {
        // Reset les défis
        data.dailyDefis = generateDailyDefis();
        data.lastReset = today;
        
        // Reset la progression des utilisateurs
        for (const userId in data.users) {
            data.users[userId].dailyProgress = {};
            data.users[userId].dailyCompleted = 0;
        }
        
        saveDefisData(data);
    }
    
    return data;
}

// Obtenir ou créer les données utilisateur
function getUserDefisData(userId) {
    const data = checkDailyReset();
    
    if (!data.users[userId]) {
        data.users[userId] = {
            totalCompleted: 0,
            streak: 0,
            lastActive: new Date().toISOString().split('T')[0],
            dailyProgress: {},
            dailyCompleted: 0,
            achievements: []
        };
        saveDefisData(data);
    }
    
    return data.users[userId];
}

// Mettre à jour la progression
function updateProgress(userId, defiId, amount = 1) {
    const data = checkDailyReset();
    const userdata = getUserDefisData(userId);
    
    const defi = data.dailyDefis.find(d => d.id === defiId);
    if (!defi) return null;
    
    if (!userdata.dailyProgress[defiId]) {
        userdata.dailyProgress[defiId] = 0;
    }
    
    userdata.dailyProgress[defiId] += amount;
    
    // Vérifier si le défi est complété
    if (userdata.dailyProgress[defiId] >= defi.target && !userdata.dailyProgress[defiId + '_completed']) {
        userdata.dailyProgress[defiId + '_completed'] = true;
        userdata.dailyCompleted++;
        userdata.totalCompleted++;
        
        // Mise à jour des stats globales
        data.globalStats.totalCompleted++;
        data.globalStats.mostPopular[defiId] = (data.globalStats.mostPopular[defiId] || 0) + 1;
        
        data.users[userId] = userdata;
        saveDefisData(data);
        
        return { completed: true, xp: defi.xp };
    }
    
    data.users[userId] = userdata;
    saveDefisData(data);
    
    return { completed: false, progress: userdata.dailyProgress[defiId], target: defi.target };
}

export default {
    data: new SlashCommandBuilder()
        .setName('defi')
        .setDescription('Système de défis quotidiens')
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('Voir les défis du jour'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('claim')
                .setDescription('Valider un défi complété')
                .addStringOption(option =>
                    option.setName('id')
                        .setDescription('ID du défi à valider')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('progress')
                .setDescription('Voir votre progression'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('streak')
                .setDescription('Voir votre série en cours')),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        switch (subcommand) {
            case 'list':
                await this.showDailyDefis(interaction);
                break;
            case 'claim':
                await this.claimDefi(interaction);
                break;
            case 'progress':
                await this.showProgress(interaction);
                break;
            case 'streak':
                await this.showStreak(interaction);
                break;
        }
    },

    async showDailyDefis(interaction) {
        const data = checkDailyReset();
        const userdata = getUserDefisData(interaction.user.id);
        
        const embed = new EmbedBuilder()
            .setTitle('🏆 Défis Quotidiens')
            .setDescription(`Complétez ces défis pour gagner de l'XP!\n\n**Défis complétés aujourd'hui:** ${userdata.dailyCompleted}/3`)
            .setColor(0x3498DB)
            .setFooter({ text: 'Les défis se réinitialisent chaque jour à minuit' });

        for (const defi of data.dailyDefis) {
            const progress = userdata.dailyProgress[defi.id] || 0;
            const completed = userdata.dailyProgress[defi.id + '_completed'] || false;
            const emoji = completed ? '✅' : progress > 0 ? '🔄' : '⭕';
            const difficultyEmoji = defi.difficulty === 'facile' ? '🟢' : defi.difficulty === 'moyen' ? '🟡' : '🔴';
            
            embed.addFields({
                name: `${emoji} ${defi.nom} ${difficultyEmoji}`,
                value: `${defi.description}\nProgrès: ${progress}/${defi.target} | Récompense: ${defi.xp} XP`,
                inline: false
            });
        }

        if (userdata.dailyCompleted === 3) {
            embed.addFields({
                name: '🎊 Bonus Complet!',
                value: 'Tous les défis complétés! Bonus: 500 XP',
                inline: false
            });
        }

        await interaction.reply({ embeds: [embed] });
    },

    async claimDefi(interaction) {
        const defiId = interaction.options.getString('id');
        const data = checkDailyReset();
        const userdata = getUserDefisData(interaction.user.id);
        
        const defi = data.dailyDefis.find(d => d.id === defiId);
        if (!defi) {
            return interaction.reply({
                content: '❌ Défi invalide! Utilisez `/defi list` pour voir les défis disponibles.',
                ephemeral: true
            });
        }

        if (userdata.dailyProgress[defiId + '_completed']) {
            return interaction.reply({
                content: '❌ Vous avez déjà complété ce défi aujourd\'hui!',
                ephemeral: true
            });
        }

        // Simulation de validation (dans un vrai bot, il faudrait vérifier la progression réelle)
        const result = updateProgress(interaction.user.id, defiId, defi.target);

        if (result.completed) {
            const embed = new EmbedBuilder()
                .setTitle('✅ Défi Complété!')
                .setDescription(`Bravo! Vous avez complété le défi **${defi.nom}**`)
                .setColor(0x00FF00)
                .addFields(
                    { name: '🎁 Récompense', value: `${result.xp} XP`, inline: true },
                    { name: '📊 Défis du jour', value: `${userdata.dailyCompleted + 1}/3`, inline: true }
                );

            await interaction.reply({ embeds: [embed] });
        } else {
            await interaction.reply({
                content: `📊 Progression mise à jour: ${result.progress}/${result.target}`,
                ephemeral: true
            });
        }
    },

    async showProgress(interaction) {
        const userdata = getUserDefisData(interaction.user.id);
        const data = checkDailyReset();
        
        const embed = new EmbedBuilder()
            .setTitle('📊 Votre Progression')
            .setColor(0x9B59B6)
            .setThumbnail(interaction.user.displayAvatarURL())
            .addFields(
                { name: '📅 Défis quotidiens', value: `${userdata.dailyCompleted}/3`, inline: true },
                { name: '🏆 Total complété', value: `${userdata.totalCompleted}`, inline: true },
                { name: '🔥 Série actuelle', value: `${userdata.streak} jours`, inline: true }
            );

        // Détail de la progression du jour
        let progressDetails = '';
        for (const defi of data.dailyDefis) {
            const progress = userdata.dailyProgress[defi.id] || 0;
            const completed = userdata.dailyProgress[defi.id + '_completed'] || false;
            const emoji = completed ? '✅' : '🔄';
            progressDetails += `${emoji} **${defi.nom}**: ${progress}/${defi.target}\n`;
        }

        embed.addFields({
            name: '📈 Progression détaillée',
            value: progressDetails || 'Aucune progression aujourd\'hui',
            inline: false
        });

        // Achievements spéciaux
        const achievements = [];
        if (userdata.totalCompleted >= 10) achievements.push('🏅 Défi Master (10 défis)');
        if (userdata.totalCompleted >= 50) achievements.push('🥇 Défi Champion (50 défis)');
        if (userdata.totalCompleted >= 100) achievements.push('💎 Défi Légende (100 défis)');
        if (userdata.streak >= 7) achievements.push('🔥 Semaine Parfaite (7 jours)');
        if (userdata.streak >= 30) achievements.push('⭐ Mois Parfait (30 jours)');

        if (achievements.length > 0) {
            embed.addFields({
                name: '🏆 Achievements',
                value: achievements.join('\n'),
                inline: false
            });
        }

        await interaction.reply({ embeds: [embed] });
    },

    async showStreak(interaction) {
        const userdata = getUserDefisData(interaction.user.id);
        
        // Calculer la vraie série (vérifier si l'utilisateur était actif hier)
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        
        if (userdata.lastActive !== today && userdata.lastActive !== yesterday) {
            userdata.streak = 0;
            const data = loadDefisData();
            data.users[interaction.user.id] = userdata;
            saveDefisData(data);
        }

        const embed = new EmbedBuilder()
            .setTitle('🔥 Série de Défis')
            .setColor(userdata.streak > 0 ? 0xFF6B6B : 0x95A5A6)
            .setDescription(`Votre série actuelle: **${userdata.streak} jours**`)
            .addFields(
                { name: '📅 Dernière activité', value: userdata.lastActive, inline: true },
                { name: '🎯 Record personnel', value: `${userdata.bestStreak || userdata.streak} jours`, inline: true }
            );

        // Bonus de série
        const streakBonuses = [
            { days: 3, bonus: '🎁 +100 XP bonus', unlocked: userdata.streak >= 3 },
            { days: 7, bonus: '🏅 Badge "Semaine Parfaite"', unlocked: userdata.streak >= 7 },
            { days: 14, bonus: '💰 +500 jetons casino', unlocked: userdata.streak >= 14 },
            { days: 30, bonus: '👑 Rôle "Défi Master"', unlocked: userdata.streak >= 30 },
            { days: 100, bonus: '💎 Titre Légendaire', unlocked: userdata.streak >= 100 }
        ];

        let bonusText = '';
        for (const bonus of streakBonuses) {
            const emoji = bonus.unlocked ? '✅' : '🔒';
            bonusText += `${emoji} **${bonus.days} jours**: ${bonus.bonus}\n`;
        }

        embed.addFields({
            name: '🎁 Récompenses de Série',
            value: bonusText,
            inline: false
        });

        // Encouragements
        if (userdata.streak === 0) {
            embed.setFooter({ text: 'Commencez une nouvelle série en complétant un défi aujourd\'hui!' });
        } else if (userdata.streak < 7) {
            embed.setFooter({ text: `Plus que ${7 - userdata.streak} jours pour la Semaine Parfaite!` });
        } else if (userdata.streak < 30) {
            embed.setFooter({ text: `Continuez! ${30 - userdata.streak} jours avant le Mois Parfait!` });
        } else {
            embed.setFooter({ text: 'Incroyable série! Continuez comme ça! 🔥' });
        }

        await interaction.reply({ embeds: [embed] });
    },

    // Fonction helper pour mettre à jour la progression (à appeler depuis d'autres parties du bot)
    updateUserProgress(userId, type, amount = 1) {
        const data = checkDailyReset();
        const results = [];
        
        // Chercher tous les défis qui correspondent au type
        for (const defi of data.dailyDefis) {
            if (defi.type === type) {
                const result = updateProgress(userId, defi.id, amount);
                if (result && result.completed) {
                    results.push({ defi, xp: result.xp });
                }
            }
        }
        
        return results;
    }
};
