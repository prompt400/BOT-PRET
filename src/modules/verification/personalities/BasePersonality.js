class BasePersonality {
    constructor() {
        if (new.target === BasePersonality) {
            throw new TypeError("La classe abstraite BasePersonality ne peut pas être instanciée directement");
        }
        
        // Propriétés communes
        this.profileCache = new Map(); // Cache pour les profils analysés
    }
    
    /* Méthodes abstraites à implémenter dans les sous-classes */
    
    getMessage(type, member, nsfw = false) {
        throw new Error("La méthode getMessage() doit être implémentée");
    }

    getEmbed(title, description, color, member) {
        // Analyse complète du profil
        const profile = this.analyzeCompleteProfile(member);
        
        // Adaptation du titre selon le profil
        if (profile.hasCuteElements) {
            title = `✨ ${title} ✨`;
        } else if (profile.hasDominantElements) {
            title = `👑 ${title} 👑`;
        } else if (profile.hasSubmissiveElements) {
            title = `💕 ${title} 💕`;
        }
        
        const embed = {
            title: title,
            description: description,
            color: color || this.getColorFromProfile(profile),
            timestamp: new Date().toISOString(),
            footer: {
                text: `Personnalité : ${this.style} | Profil : ${profile.type}`,
                iconURL: member?.guild?.iconURL({ dynamic: true })
            },
            author: {
                name: member?.user?.username || member?.username || 'Membre',
                iconURL: member?.user?.avatarURL({ dynamic: true }) || member?.avatarURL?.({ dynamic: true })
            }
        };

        // Thumbnail adaptatif
        if (member?.user?.avatarURL()) {
            embed.thumbnail = {
                url: member.user.avatarURL({ dynamic: true, size: 512 })
            };
        }
        
        // Ajout de champs selon le profil
        if (profile.interests.length > 0) {
            embed.fields = [{
                name: '🎭 Profil détecté',
                value: profile.interests.slice(0, 3).join(', '),
                inline: true
            }];
        }

        return embed;
    }
    
    // Obtenir une couleur selon le profil
    getColorFromProfile(profile) {
        const colorMap = {
            'dominant': 0x8B0000,    // Rouge foncé
            'submissive': 0xFF69B4,  // Rose
            'playful': 0xFF4500,     // Orange rouge
            'cute': 0xFFB6C1,        // Rose clair
            'mysterious': 0x4B0082,  // Indigo
            'neutral': 0x2F3136      // Gris Discord
        };
        return colorMap[profile.type] || colorMap.neutral;
    }

    // Méthode pour adapter le message selon le profil
    adaptMessageToProfile(message, member) {
        if (!member) return message;

        const username = member.user?.username || member.username || 'toi';
        const hasAnimeAvatar = this.detectAnimeAvatar(member);
        const hasCuteUsername = this.detectCuteUsername(username);

        // Remplacements basiques
        message = message.replace(/\{username\}/g, username);
        message = message.replace(/\{mention\}/g, `<@${member.id || member.user?.id}>`);

        // Adaptations spéciales selon le profil
        if (hasAnimeAvatar) {
            message = message.replace(/\{anime\}/g, '~ Notice me senpai ~');
        } else {
            message = message.replace(/\{anime\}/g, '');
        }

        if (hasCuteUsername) {
            message = message.replace(/\{cute\}/g, 'petit(e)');
        } else {
            message = message.replace(/\{cute\}/g, '');
        }

        return message.trim();
    }

    // Détection d'avatar anime (simplifiée)
    detectAnimeAvatar(member) {
        // Dans une vraie implémentation, on pourrait utiliser une API de détection
        // Pour l'instant, on se base sur des heuristiques simples
        const avatarURL = member.user?.avatarURL() || member.avatarURL?.();
        return avatarURL && avatarURL.includes('anime');
    }

    // Détection de pseudo mignon
    detectCuteUsername(username) {
        const cutePatterns = [
            /uwu/i, /owo/i, /nya/i, /chan/i, /kun/i, 
            /kawaii/i, /neko/i, /kitty/i, /bunny/i,
            /❤|💕|💖|🌸|🌺|✨|⭐|🌟/
        ];
        return cutePatterns.some(pattern => pattern.test(username));
    }

    // Détection de pseudo dominant
    detectDominantUsername(username) {
        const dominantPatterns = [
            /master/i, /mistress/i, /daddy/i, /mommy/i,
            /alpha/i, /dom/i, /boss/i, /king/i, /queen/i,
            /lord/i, /lady/i, /sir/i, /madam/i
        ];
        return dominantPatterns.some(pattern => pattern.test(username));
    }

    // Détection de pseudo soumis
    detectSubmissiveUsername(username) {
        const submissivePatterns = [
            /sub/i, /slave/i, /pet/i, /kitten/i, /puppy/i,
            /baby/i, /little/i, /toy/i, /doll/i,
            /good\s*(boy|girl)/i
        ];
        return submissivePatterns.some(pattern => pattern.test(username));
    }

    // Détection du genre probable basé sur le pseudo
    detectProbableGender(member) {
        const username = member.user?.username || member.username || '';
        const femalePatterns = /girl|woman|lady|princess|queen|goddess|miss|she|her|femme|fille/i;
        const malePatterns = /boy|man|guy|prince|king|god|mister|he|him|homme|garcon/i;
        
        if (femalePatterns.test(username)) return 'feminine';
        if (malePatterns.test(username)) return 'masculine';
        return 'neutral';
    }

    // Sélection aléatoire d'un message parmi un tableau
    getRandomMessage(messages) {
        return messages[Math.floor(Math.random() * messages.length)];
    }

    getEmojis() {
        throw new Error("La méthode getEmojis() doit être implémentée");
    }
}

module.exports = BasePersonality;
