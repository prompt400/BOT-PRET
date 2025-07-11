const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

class EmbedAnimator {
    constructor() {
        this.animations = {
            pulse: {
                frames: ['💗', '💖', '💕', '💓', '💞'],
                interval: 500
            },
            fire: {
                frames: ['🔥', '💥', '✨', '⚡', '🌟'],
                interval: 400
            },
            loading: {
                frames: ['⏳', '⌛', '⏳', '⌛'],
                interval: 1000
            },
            crown: {
                frames: ['👑', '✨👑✨', '🔥👑🔥', '⚡👑⚡'],
                interval: 600
            }
        };
        
        this.progressBars = {
            sexy: {
                empty: '🖤',
                full: '❤️',
                length: 10
            },
            fire: {
                empty: '⬜',
                full: '🔥',
                length: 10
            },
            royal: {
                empty: '⬛',
                full: '👑',
                length: 10
            }
        };
    }
    
    createCinematicEmbed(title, description, color = '#FF1493', personality = 'playful') {
        const embed = new EmbedBuilder()
            .setTitle(title)
            .setDescription(description)
            .setColor(color)
            .setTimestamp();
            
        // Ajout d'effets selon la personnalité
        switch(personality) {
            case 'soft':
                embed.setFooter({ text: '💕 Avec amour 💕' });
                break;
            case 'playful':
                embed.setFooter({ text: '😏 Prêt à jouer ? 🔥' });
                break;
            case 'dominant':
                embed.setFooter({ text: '👑 Soumets-toi 🔥' });
                break;
        }
        
        return embed;
    }
    
    createProgressBar(current, total, style = 'sexy') {
        const bar = this.progressBars[style] || this.progressBars.sexy;
        const filled = Math.floor((current / total) * bar.length);
        const empty = bar.length - filled;
        
        return bar.full.repeat(filled) + bar.empty.repeat(empty);
    }
    
    async animateEmbed(message, animation = 'pulse', duration = 5000) {
        const anim = this.animations[animation] || this.animations.pulse;
        const startTime = Date.now();
        let frameIndex = 0;
        
        const interval = setInterval(async () => {
            if (Date.now() - startTime > duration) {
                clearInterval(interval);
                return;
            }
            
            const currentFrame = anim.frames[frameIndex % anim.frames.length];
            const embed = message.embeds[0];
            
            // Mise à jour du titre avec animation
            const newEmbed = EmbedBuilder.from(embed)
                .setTitle(`${currentFrame} ${embed.title} ${currentFrame}`);
                
            await message.edit({ embeds: [newEmbed] });
            frameIndex++;
        }, anim.interval);
    }
    
    createButtonRow(buttons) {
        const row = new ActionRowBuilder();
        
        buttons.forEach(button => {
            const btn = new ButtonBuilder()
                .setCustomId(button.id)
                .setLabel(button.label)
                .setStyle(button.style || ButtonStyle.Primary);
                
            if (button.emoji) {
                btn.setEmoji(button.emoji);
            }
            
            row.addComponents(btn);
        });
        
        return row;
    }
    
    createSexyButtons(personality = 'playful') {
        const buttonConfigs = {
            soft: [
                { id: 'accept', label: 'J\'accepte', emoji: '💕', style: ButtonStyle.Success },
                { id: 'refuse', label: 'Non merci', emoji: '🌸', style: ButtonStyle.Danger }
            ],
            playful: [
                { id: 'accept', label: 'Oh oui !', emoji: '🔥', style: ButtonStyle.Success },
                { id: 'refuse', label: 'Pas maintenant', emoji: '😏', style: ButtonStyle.Danger }
            ],
            dominant: [
                { id: 'accept', label: 'Oui Maître/Maîtresse', emoji: '👑', style: ButtonStyle.Success },
                { id: 'refuse', label: 'Je refuse', emoji: '⛓️', style: ButtonStyle.Danger }
            ]
        };
        
        return this.createButtonRow(buttonConfigs[personality] || buttonConfigs.playful);
    }
}

module.exports = EmbedAnimator;
