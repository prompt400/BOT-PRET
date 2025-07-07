import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

// Fichier de stockage des soldes
const CASINO_DATA_PATH = join(process.cwd(), 'data', 'casino.json');

// Charger ou initialiser les données
function loadCasinoData() {
    if (existsSync(CASINO_DATA_PATH)) {
        return JSON.parse(readFileSync(CASINO_DATA_PATH, 'utf8'));
    }
    return { users: {}, jackpot: 10000, lastDaily: {} };
}

// Sauvegarder les données
function saveCasinoData(data) {
    const dir = join(process.cwd(), 'data');
    if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
    }
    writeFileSync(CASINO_DATA_PATH, JSON.stringify(data, null, 2));
}

// Obtenir ou créer le solde d'un utilisateur
function getUserBalance(userId) {
    const data = loadCasinoData();
    if (!data.users[userId]) {
        data.users[userId] = { balance: 1000, wins: 0, losses: 0, biggestWin: 0 };
        saveCasinoData(data);
    }
    return data.users[userId];
}

// Mettre à jour le solde
function updateBalance(userId, amount, isWin = null) {
    const data = loadCasinoData();
    const user = getUserBalance(userId);
    user.balance += amount;
    
    if (isWin === true) {
        user.wins++;
        if (amount > user.biggestWin) user.biggestWin = amount;
    } else if (isWin === false) {
        user.losses++;
    }
    
    data.users[userId] = user;
    saveCasinoData(data);
    return user;
}

export default {
    data: new SlashCommandBuilder()
        .setName('casino')
        .setDescription('Jouer au casino virtuel')
        .addSubcommand(subcommand =>
            subcommand
                .setName('balance')
                .setDescription('Voir votre solde'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('daily')
                .setDescription('Réclamer votre bonus quotidien'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('slot')
                .setDescription('Jouer à la machine à sous')
                .addIntegerOption(option =>
                    option.setName('mise')
                        .setDescription('Combien voulez-vous miser?')
                        .setRequired(true)
                        .setMinValue(10)
                        .setMaxValue(1000)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('blackjack')
                .setDescription('Jouer au blackjack')
                .addIntegerOption(option =>
                    option.setName('mise')
                        .setDescription('Combien voulez-vous miser?')
                        .setRequired(true)
                        .setMinValue(50)
                        .setMaxValue(5000)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('roulette')
                .setDescription('Jouer à la roulette')
                .addStringOption(option =>
                    option.setName('type')
                        .setDescription('Type de pari')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Rouge', value: 'rouge' },
                            { name: 'Noir', value: 'noir' },
                            { name: 'Pair', value: 'pair' },
                            { name: 'Impair', value: 'impair' },
                            { name: 'Numéro (0-36)', value: 'numero' }
                        ))
                .addIntegerOption(option =>
                    option.setName('mise')
                        .setDescription('Combien voulez-vous miser?')
                        .setRequired(true)
                        .setMinValue(25)
                        .setMaxValue(2500))
                .addIntegerOption(option =>
                    option.setName('numero')
                        .setDescription('Si vous pariez sur un numéro, lequel? (0-36)')
                        .setMinValue(0)
                        .setMaxValue(36)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('leaderboard')
                .setDescription('Voir le classement des plus riches')),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        switch (subcommand) {
            case 'balance':
                await this.showBalance(interaction);
                break;
            case 'daily':
                await this.claimDaily(interaction);
                break;
            case 'slot':
                await this.playSlots(interaction);
                break;
            case 'blackjack':
                await this.playBlackjack(interaction);
                break;
            case 'roulette':
                await this.playRoulette(interaction);
                break;
            case 'leaderboard':
                await this.showLeaderboard(interaction);
                break;
        }
    },

    async showBalance(interaction) {
        const user = getUserBalance(interaction.user.id);
        
        const embed = new EmbedBuilder()
            .setTitle('💰 Votre Solde Casino')
            .setColor(0xFFD700)
            .setThumbnail(interaction.user.displayAvatarURL())
            .addFields(
                { name: '💵 Solde', value: `${user.balance} 🪙`, inline: true },
                { name: '✅ Victoires', value: `${user.wins}`, inline: true },
                { name: '❌ Défaites', value: `${user.losses}`, inline: true },
                { name: '🏆 Plus gros gain', value: `${user.biggestWin} 🪙`, inline: true },
                { name: '📊 Ratio V/D', value: user.losses > 0 ? `${(user.wins/user.losses).toFixed(2)}` : 'Parfait!', inline: true }
            )
            .setFooter({ text: 'Utilisez /casino daily pour obtenir des jetons gratuits!' });

        await interaction.reply({ embeds: [embed] });
    },

    async claimDaily(interaction) {
        const data = loadCasinoData();
        const userId = interaction.user.id;
        const now = Date.now();
        const lastClaim = data.lastDaily[userId] || 0;
        const timeSinceLastClaim = now - lastClaim;
        const oneDayInMs = 24 * 60 * 60 * 1000;

        if (timeSinceLastClaim < oneDayInMs) {
            const timeLeft = oneDayInMs - timeSinceLastClaim;
            const hoursLeft = Math.floor(timeLeft / (60 * 60 * 1000));
            const minutesLeft = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));
            
            return interaction.reply({
                content: `❌ Vous avez déjà réclamé votre bonus quotidien! Revenez dans ${hoursLeft}h ${minutesLeft}min.`,
                ephemeral: true
            });
        }

        const dailyAmount = 500 + Math.floor(Math.random() * 500); // 500-1000 jetons
        updateBalance(userId, dailyAmount);
        data.lastDaily[userId] = now;
        saveCasinoData(data);

        const embed = new EmbedBuilder()
            .setTitle('🎁 Bonus Quotidien!')
            .setDescription(`Vous avez reçu **${dailyAmount} 🪙**!`)
            .setColor(0x00FF00)
            .setFooter({ text: 'Revenez demain pour un autre bonus!' });

        await interaction.reply({ embeds: [embed] });
    },

    async playSlots(interaction) {
        const mise = interaction.options.getInteger('mise');
        const user = getUserBalance(interaction.user.id);

        if (user.balance < mise) {
            return interaction.reply({
                content: `❌ Solde insuffisant! Vous avez ${user.balance} 🪙`,
                ephemeral: true
            });
        }

        await interaction.deferReply();

        // Symboles de la machine à sous
        const symbols = ['🍒', '🍋', '🍊', '🍇', '🔔', '💎', '7️⃣'];
        const weights = [30, 25, 20, 15, 7, 2, 1]; // Probabilités

        // Fonction pour obtenir un symbole aléatoire selon les poids
        function getRandomSymbol() {
            const totalWeight = weights.reduce((a, b) => a + b, 0);
            let random = Math.random() * totalWeight;
            
            for (let i = 0; i < symbols.length; i++) {
                random -= weights[i];
                if (random <= 0) return symbols[i];
            }
            return symbols[0];
        }

        // Tirer 3 symboles
        const results = [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()];

        // Animation de la machine à sous
        const frames = 5;
        for (let i = 0; i < frames; i++) {
            const frame = i < frames - 1 
                ? `🎰 ${symbols[Math.floor(Math.random() * symbols.length)]} | ${symbols[Math.floor(Math.random() * symbols.length)]} | ${symbols[Math.floor(Math.random() * symbols.length)]} 🎰`
                : `🎰 ${results[0]} | ${results[1]} | ${results[2]} 🎰`;
            
            await interaction.editReply({ content: frame });
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        // Calculer les gains
        let multiplier = 0;
        const allSame = results[0] === results[1] && results[1] === results[2];
        const twoSame = results[0] === results[1] || results[1] === results[2] || results[0] === results[2];

        if (allSame) {
            switch (results[0]) {
                case '7️⃣': multiplier = 100; break;
                case '💎': multiplier = 50; break;
                case '🔔': multiplier = 20; break;
                case '🍇': multiplier = 10; break;
                case '🍊': multiplier = 5; break;
                case '🍋': multiplier = 3; break;
                case '🍒': multiplier = 2; break;
            }
        } else if (twoSame) {
            multiplier = 1.5;
        }

        const gain = Math.floor(mise * multiplier) - mise;
        updateBalance(interaction.user.id, gain, gain > 0);

        // Vérifier le jackpot
        const data = loadCasinoData();
        let jackpotWon = false;
        if (allSame && results[0] === '7️⃣') {
            updateBalance(interaction.user.id, data.jackpot, true);
            jackpotWon = true;
            data.jackpot = 10000;
            saveCasinoData(data);
        } else {
            data.jackpot += Math.floor(mise * 0.1);
            saveCasinoData(data);
        }

        const embed = new EmbedBuilder()
            .setTitle('🎰 Machine à Sous')
            .setDescription(`${results[0]} | ${results[1]} | ${results[2]}`)
            .setColor(gain > 0 ? 0x00FF00 : 0xFF0000)
            .addFields(
                { name: '💰 Mise', value: `${mise} 🪙`, inline: true },
                { name: gain > 0 ? '✅ Gain' : '❌ Perte', value: `${Math.abs(gain)} 🪙`, inline: true },
                { name: '💵 Nouveau solde', value: `${user.balance + gain} 🪙`, inline: true }
            );

        if (jackpotWon) {
            embed.addFields({ name: '🎊 JACKPOT!', value: `Vous avez gagné le jackpot de ${data.jackpot} 🪙!` });
        } else {
            embed.setFooter({ text: `Jackpot actuel: ${data.jackpot} 🪙` });
        }

        await interaction.editReply({ content: null, embeds: [embed] });
    },

    async playBlackjack(interaction) {
        const mise = interaction.options.getInteger('mise');
        const user = getUserBalance(interaction.user.id);

        if (user.balance < mise) {
            return interaction.reply({
                content: `❌ Solde insuffisant! Vous avez ${user.balance} 🪙`,
                ephemeral: true
            });
        }

        // Créer un deck de cartes
        const suits = ['♠️', '♥️', '♦️', '♣️'];
        const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        
        function createDeck() {
            const deck = [];
            for (const suit of suits) {
                for (const value of values) {
                    deck.push({ suit, value, display: `${value}${suit}` });
                }
            }
            return deck.sort(() => Math.random() - 0.5);
        }

        function getCardValue(card) {
            if (['J', 'Q', 'K'].includes(card.value)) return 10;
            if (card.value === 'A') return 11;
            return parseInt(card.value);
        }

        function calculateHand(cards) {
            let value = 0;
            let aces = 0;
            
            for (const card of cards) {
                if (card.value === 'A') aces++;
                value += getCardValue(card);
            }
            
            while (value > 21 && aces > 0) {
                value -= 10;
                aces--;
            }
            
            return value;
        }

        const deck = createDeck();
        const playerHand = [deck.pop(), deck.pop()];
        const dealerHand = [deck.pop(), deck.pop()];

        const gameState = {
            deck,
            playerHand,
            dealerHand,
            mise,
            status: 'playing'
        };

        const embed = new EmbedBuilder()
            .setTitle('🃏 Blackjack')
            .setColor(0x000000)
            .addFields(
                { 
                    name: 'Votre main', 
                    value: `${playerHand.map(c => c.display).join(' ')} (${calculateHand(playerHand)})`, 
                    inline: true 
                },
                { 
                    name: 'Main du croupier', 
                    value: `${dealerHand[0].display} 🎴`, 
                    inline: true 
                }
            )
            .setFooter({ text: `Mise: ${mise} 🪙` });

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('hit')
                    .setLabel('Tirer')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('🎴'),
                new ButtonBuilder()
                    .setCustomId('stand')
                    .setLabel('Rester')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('✋')
            );

        // Vérifier blackjack immédiat
        if (calculateHand(playerHand) === 21) {
            const gain = Math.floor(mise * 1.5);
            updateBalance(interaction.user.id, gain, true);
            
            embed.setDescription('🎉 BLACKJACK! Vous gagnez!')
                .setColor(0xFFD700)
                .addFields({ name: '💰 Gain', value: `${gain + mise} 🪙` });
            
            return interaction.reply({ embeds: [embed] });
        }

        const message = await interaction.reply({ 
            embeds: [embed], 
            components: [row],
            fetchReply: true 
        });

        const collector = message.createMessageComponentCollector({ 
            filter: i => i.user.id === interaction.user.id,
            time: 60000 
        });

        collector.on('collect', async i => {
            if (i.customId === 'hit') {
                playerHand.push(deck.pop());
                const playerValue = calculateHand(playerHand);

                if (playerValue > 21) {
                    gameState.status = 'bust';
                    updateBalance(interaction.user.id, -mise, false);
                    
                    embed.setDescription('💥 BUST! Vous avez dépassé 21!')
                        .setColor(0xFF0000)
                        .spliceFields(0, 1, {
                            name: 'Votre main',
                            value: `${playerHand.map(c => c.display).join(' ')} (${playerValue})`,
                            inline: true
                        })
                        .addFields({ name: '❌ Perte', value: `${mise} 🪙` });
                    
                    await i.update({ embeds: [embed], components: [] });
                    collector.stop();
                } else {
                    embed.spliceFields(0, 1, {
                        name: 'Votre main',
                        value: `${playerHand.map(c => c.display).join(' ')} (${playerValue})`,
                        inline: true
                    });
                    
                    await i.update({ embeds: [embed] });
                }
            } else if (i.customId === 'stand') {
                gameState.status = 'dealer_turn';
                
                // Tour du croupier
                let dealerValue = calculateHand(dealerHand);
                while (dealerValue < 17) {
                    dealerHand.push(deck.pop());
                    dealerValue = calculateHand(dealerHand);
                }

                const playerValue = calculateHand(playerHand);
                let result, gain;

                if (dealerValue > 21) {
                    result = 'win';
                    gain = mise;
                } else if (dealerValue > playerValue) {
                    result = 'lose';
                    gain = -mise;
                } else if (playerValue > dealerValue) {
                    result = 'win';
                    gain = mise;
                } else {
                    result = 'tie';
                    gain = 0;
                }

                updateBalance(interaction.user.id, gain, gain > 0);

                embed.spliceFields(1, 1, {
                    name: 'Main du croupier',
                    value: `${dealerHand.map(c => c.display).join(' ')} (${dealerValue})`,
                    inline: true
                });

                if (result === 'win') {
                    embed.setDescription('✅ Vous gagnez!')
                        .setColor(0x00FF00)
                        .addFields({ name: '💰 Gain', value: `${mise} 🪙` });
                } else if (result === 'lose') {
                    embed.setDescription('❌ Vous perdez!')
                        .setColor(0xFF0000)
                        .addFields({ name: '💸 Perte', value: `${mise} 🪙` });
                } else {
                    embed.setDescription('🤝 Égalité!')
                        .setColor(0xFFFF00);
                }

                await i.update({ embeds: [embed], components: [] });
                collector.stop();
            }
        });

        collector.on('end', collected => {
            if (collected.size === 0) {
                updateBalance(interaction.user.id, -mise, false);
                interaction.editReply({ 
                    content: '⏰ Temps écoulé! Vous perdez votre mise.', 
                    components: [] 
                });
            }
        });
    },

    async playRoulette(interaction) {
        const type = interaction.options.getString('type');
        const mise = interaction.options.getInteger('mise');
        const numeroChoisi = interaction.options.getInteger('numero');
        const user = getUserBalance(interaction.user.id);

        if (user.balance < mise) {
            return interaction.reply({
                content: `❌ Solde insuffisant! Vous avez ${user.balance} 🪙`,
                ephemeral: true
            });
        }

        if (type === 'numero' && numeroChoisi === undefined) {
            return interaction.reply({
                content: '❌ Vous devez spécifier un numéro entre 0 et 36!',
                ephemeral: true
            });
        }

        await interaction.deferReply();

        // Animation de la roulette
        const animation = ['🎰', '🎯', '🎲', '🎪', '🎨'];
        for (const frame of animation) {
            await interaction.editReply({ content: `${frame} La roulette tourne...` });
            await new Promise(resolve => setTimeout(resolve, 400));
        }

        // Tirer un numéro
        const numero = Math.floor(Math.random() * 37); // 0-36
        const couleur = numero === 0 ? 'vert' : 
                       [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36].includes(numero) ? 'rouge' : 'noir';
        const parite = numero === 0 ? 'zero' : numero % 2 === 0 ? 'pair' : 'impair';

        // Calculer le gain
        let win = false;
        let multiplier = 0;

        switch (type) {
            case 'rouge':
                win = couleur === 'rouge';
                multiplier = 2;
                break;
            case 'noir':
                win = couleur === 'noir';
                multiplier = 2;
                break;
            case 'pair':
                win = parite === 'pair';
                multiplier = 2;
                break;
            case 'impair':
                win = parite === 'impair';
                multiplier = 2;
                break;
            case 'numero':
                win = numero === numeroChoisi;
                multiplier = 36;
                break;
        }

        const gain = win ? mise * (multiplier - 1) : -mise;
        updateBalance(interaction.user.id, gain, win);

        const embed = new EmbedBuilder()
            .setTitle('🎰 Roulette')
            .setDescription(`La bille s'arrête sur le **${numero}** ${couleur === 'rouge' ? '🔴' : couleur === 'noir' ? '⚫' : '🟢'}`)
            .setColor(win ? 0x00FF00 : 0xFF0000)
            .addFields(
                { name: '🎯 Votre pari', value: type === 'numero' ? `Numéro ${numeroChoisi}` : type, inline: true },
                { name: '💰 Mise', value: `${mise} 🪙`, inline: true },
                { name: win ? '✅ Gain' : '❌ Perte', value: `${Math.abs(gain)} 🪙`, inline: true },
                { name: '💵 Nouveau solde', value: `${user.balance + gain} 🪙`, inline: true }
            );

        await interaction.editReply({ content: null, embeds: [embed] });
    },

    async showLeaderboard(interaction) {
        const data = loadCasinoData();
        const users = Object.entries(data.users)
            .map(([id, stats]) => ({ id, ...stats }))
            .sort((a, b) => b.balance - a.balance)
            .slice(0, 10);

        const embed = new EmbedBuilder()
            .setTitle('🏆 Classement Casino')
            .setColor(0xFFD700)
            .setDescription('Les 10 joueurs les plus riches du casino')
            .setFooter({ text: `Jackpot actuel: ${data.jackpot} 🪙` });

        for (let i = 0; i < users.length; i++) {
            const user = users[i];
            const member = await interaction.guild.members.fetch(user.id).catch(() => null);
            const name = member ? member.displayName : 'Utilisateur inconnu';
            const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
            
            embed.addFields({
                name: `${medal} ${name}`,
                value: `💰 ${user.balance} 🪙 | W/L: ${user.wins}/${user.losses}`,
                inline: false
            });
        }

        await interaction.reply({ embeds: [embed] });
    }
};
