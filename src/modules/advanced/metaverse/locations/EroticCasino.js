/**
 * Casino Érotique - Temple du jeu et de la séduction
 */
class EroticCasino {
    constructor() {
        this.name = 'Casino Érotique';
        this.emoji = '🎰';
        this.description = `
🎰 **CASINO ÉROTIQUE** 🎰

Les lumières tamisées révèlent des tables de jeu sensuelles.
Les croupières en tenue suggestive vous accueillent avec des sourires enjôleurs.
L'air est chargé d'excitation, de parfum et de promesses...

🎲 **Jeux disponibles :**
• Roulette du Désir 🎡
• Machines à Sous Coquines 🎰
• Poker Strip VIP 🃏
• Dés de la Passion 🎲

💰 **Zones spéciales :**
• Salon VIP (accès 10,000 💋)
• Bar à Champagne 🥂
• Scène de Spectacles 💃

🗺️ **Directions :**
→ **Ouest** : Place Centrale 🏛️
→ **Nord** : Salle VIP Secrète 🔒

🏢 *Propriété disponible* : Table de Jeu Privée (100,000 💋)
        `;
        this.connections = {
            ouest: 'centralPlace',
            nord: null // Accès VIP uniquement
        };
        this.propertyPrice = 100000;
        this.propertyName = 'Table de Jeu Privée';
        this.hasProperty = false;
        this.games = {
            roulette: { minBet: 100, maxBet: 5000 },
            slots: { cost: 50, jackpot: 10000 },
            poker: { buyIn: 1000, vipOnly: false },
            dice: { bet: 200 }
        };
        this.vipAccess = false;
    }

    getDescription() {
        let desc = this.description;
        if (this.hasProperty) {
            desc += `\n🏢 *Vous possédez une ${this.propertyName} !*`;
            desc += '\n💰 *Commission sur les jeux : 1000 💋/jour*';
        }
        if (this.vipAccess) {
            desc += '\n🔑 *Accès VIP débloqué !*';
        }
        return desc;
    }

    move(direction) {
        const normalizedDirection = direction.toLowerCase();
        if (normalizedDirection === 'nord' && !this.vipAccess) {
            return null; // Bloqué sans accès VIP
        }
        return this.connections[normalizedDirection] || null;
    }

    buyProperty() {
        if (this.hasProperty) {
            return `❌ Vous possédez déjà une ${this.propertyName} !`;
        }
        this.hasProperty = true;
        return `✅ Félicitations ! Vous possédez maintenant une **${this.propertyName}** ! 🎉\n` +
               `🎰 Les joueurs affluent à votre table exclusive !\n` +
               `💸 Commission quotidienne : 1000 💋`;
    }

    /**
     * Joue à un jeu du casino
     * @param {string} gameName - Nom du jeu
     * @param {number} bet - Mise du joueur
     * @returns {Object} Résultat du jeu
     */
    playGame(gameName, bet) {
        switch(gameName.toLowerCase()) {
            case 'roulette':
                return this.playRoulette(bet);
            case 'slots':
                return this.playSlots();
            case 'poker':
                return this.playPoker(bet);
            case 'dice':
                return this.playDice(bet);
            default:
                return { success: false, message: 'Ce jeu n\'existe pas !' };
        }
    }

    playRoulette(bet) {
        if (bet < this.games.roulette.minBet || bet > this.games.roulette.maxBet) {
            return { 
                success: false, 
                message: `❌ Mise entre ${this.games.roulette.minBet} et ${this.games.roulette.maxBet} 💋 !` 
            };
        }

        const number = Math.floor(Math.random() * 37); // 0-36
        const color = number === 0 ? 'vert' : (number % 2 === 0 ? 'noir' : 'rouge');
        const win = Math.random() < 0.48; // ~48% de chance

        if (win) {
            const winAmount = bet * 2;
            return {
                success: true,
                message: `🎡 La bille s'arrête sur **${number} ${color}** !\n` +
                        `✅ GAGNÉ ! Vous remportez ${winAmount} 💋 !`,
                reward: { coins: winAmount },
                animation: '🎡 La roulette tourne... 🔴⚫🔴⚫🔴'
            };
        } else {
            return {
                success: true,
                message: `🎡 La bille s'arrête sur **${number} ${color}**...\n` +
                        `❌ Perdu ! Meilleure chance la prochaine fois !`,
                reward: { coins: -bet },
                animation: '🎡 La roulette tourne... 🔴⚫🔴⚫🔴'
            };
        }
    }

    playSlots() {
        const symbols = ['🍒', '🍑', '💋', '🔥', '💎', '7️⃣'];
        const reel1 = symbols[Math.floor(Math.random() * symbols.length)];
        const reel2 = symbols[Math.floor(Math.random() * symbols.length)];
        const reel3 = symbols[Math.floor(Math.random() * symbols.length)];
        
        let winAmount = 0;
        let message = `🎰 | ${reel1} | ${reel2} | ${reel3} |\n\n`;

        // Jackpot
        if (reel1 === '7️⃣' && reel2 === '7️⃣' && reel3 === '7️⃣') {
            winAmount = this.games.slots.jackpot;
            message += `🎉 **JACKPOT ÉROTIQUE !** 🎉\n`;
            message += `💰 Vous gagnez ${winAmount} 💋 !`;
        }
        // Triple match
        else if (reel1 === reel2 && reel2 === reel3) {
            winAmount = 1000;
            message += `✨ **TRIPLE !** Vous gagnez ${winAmount} 💋 !`;
        }
        // Double match
        else if (reel1 === reel2 || reel2 === reel3 || reel1 === reel3) {
            winAmount = 100;
            message += `✅ Double match ! Vous gagnez ${winAmount} 💋 !`;
        }
        // Aucun match
        else {
            winAmount = -this.games.slots.cost;
            message += `❌ Pas de chance cette fois...`;
        }

        return {
            success: true,
            message: message,
            reward: { coins: winAmount },
            special: winAmount >= 1000 ? 'BigWin' : null
        };
    }

    playPoker(buyIn) {
        if (buyIn < this.games.poker.buyIn) {
            return { 
                success: false, 
                message: `❌ Buy-in minimum : ${this.games.poker.buyIn} 💋` 
            };
        }

        const hands = [
            { name: 'Royal Flush Sensuel', chance: 0.01, multiplier: 50 },
            { name: 'Quinte Flush Érotique', chance: 0.02, multiplier: 20 },
            { name: 'Carré de Dames', chance: 0.05, multiplier: 10 },
            { name: 'Full aux Cœurs', chance: 0.10, multiplier: 5 },
            { name: 'Couleur Rouge Passion', chance: 0.15, multiplier: 3 },
            { name: 'Suite Montante', chance: 0.20, multiplier: 2 },
            { name: 'Paire d\'As', chance: 0.30, multiplier: 1.5 }
        ];

        const roll = Math.random();
        let totalChance = 0;
        
        for (const hand of hands) {
            totalChance += hand.chance;
            if (roll < totalChance) {
                const winAmount = Math.floor(buyIn * hand.multiplier);
                return {
                    success: true,
                    message: `🃏 Vous révélez : **${hand.name}** !\n` +
                            `💰 Vous remportez ${winAmount} 💋 !`,
                    reward: { coins: winAmount - buyIn }
                };
            }
        }

        // Perte
        return {
            success: true,
            message: `🃏 Carte haute seulement... La croupière remporte le pot avec un sourire coquin.`,
            reward: { coins: -buyIn }
        };
    }

    playDice(bet) {
        const dice1 = Math.floor(Math.random() * 6) + 1;
        const dice2 = Math.floor(Math.random() * 6) + 1;
        const total = dice1 + dice2;

        let winAmount = 0;
        let message = `🎲 Vous lancez les dés : **${dice1}** et **${dice2}** = **${total}**\n\n`;

        if (total === 12) {
            winAmount = bet * 10;
            message += `🔥 **DOUBLE SIX !** La table s'enflamme !\n`;
            message += `💰 Gain exceptionnel : ${winAmount} 💋 !`;
        } else if (total >= 10) {
            winAmount = bet * 3;
            message += `✨ Excellent lancer ! Vous gagnez ${winAmount} 💋 !`;
        } else if (total >= 7) {
            winAmount = bet * 1.5;
            message += `✅ Pas mal ! Vous gagnez ${Math.floor(winAmount)} 💋 !`;
        } else {
            winAmount = -bet;
            message += `❌ Trop bas... La maison gagne.`;
        }

        return {
            success: true,
            message: message,
            reward: { coins: Math.floor(winAmount) },
            dice: [dice1, dice2]
        };
    }

    /**
     * Achète l'accès VIP
     * @param {number} playerCoins - Argent du joueur
     * @returns {Object} Résultat de l'achat
     */
    buyVIPAccess(playerCoins) {
        if (this.vipAccess) {
            return { success: false, message: '❌ Vous avez déjà l\'accès VIP !' };
        }
        
        const vipCost = 10000;
        if (playerCoins < vipCost) {
            return { 
                success: false, 
                message: `❌ L'accès VIP coûte ${vipCost} 💋. Il vous manque ${vipCost - playerCoins} 💋.` 
            };
        }

        this.vipAccess = true;
        return {
            success: true,
            message: '🔑 **Accès VIP débloqué !**\n' +
                    '✨ Vous pouvez maintenant accéder à la Salle VIP Secrète au Nord !\n' +
                    '🥂 Champagne offert à vie !',
            reward: { coins: -vipCost },
            achievement: 'High Roller'
        };
    }

    getRandomEvent() {
        const events = [
            '🎰 Une machine sonne ! Quelqu\'un vient de gagner le jackpot !',
            '💃 Un spectacle sensuel commence sur la scène principale...',
            '🥂 Une serveuse vous offre une coupe de champagne avec un clin d\'œil.',
            '🎲 Un high roller vous défie à une partie privée...',
            '💋 Une mystérieuse joueuse vous glisse un jeton porte-bonheur.'
        ];

        if (Math.random() < 0.3) {
            return events[Math.floor(Math.random() * events.length)];
        }
        return null;
    }
}

module.exports = EroticCasino;
