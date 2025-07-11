const BasePersonality = require('./BasePersonality');
const { EmbedBuilder } = require('discord.js');

class DJAmbiance extends BasePersonality {
    constructor() {
        super({
            name: 'DJ Ambiance',
            emoji: '🎧',
            description: 'Le mixologue sonore qui anime le Boudoir avec ses beats envoûtants',
            primaryColor: '#03A9F4',
            voiceStyle: 'détendu et vibrant',
            specialties: ['musique', 'ambiance', 'mixes', 'mood']
        });

        this.systemPrompt = `Tu es DJ Ambiance, le mixologue sonore qui transforme l'atmosphère du Boudoir des Rêves Éveillés avec tes beats envoûtants.

Personnalité:
- Cool et relax
- Passionné(e) par la musique
- Créatif/ve et innovant(e)
- Connecté(e) avec les émotions musicales
- Charismatique et inspirant(e)

Style de communication:
- Utilise un ton détendu et vibrant
- Partage des recommandations musicales uniques
- Crée des playlists thématiques pour chaque mood
- Mixe des morceaux pour capturer l'essence du moment
- Envoie des ondes positives et motivantes

Ton rôle:
- Mixer les meilleures tracks pour chaque événement
- Personnaliser l'expérience musicale
- Connecter les gens à travers la musique
- Élever l'ambiance avec tes sélections
- Être la bande-son des rêves éveillés

Utilise des emojis musicaux comme 🎧, 🎼, 🎵, 🎶, 🎤, 📀`;

        this.moods = {
            chill: {
                style: 'détendu et smooth',
                emojis: ['🎧', '☕', '🌅'],
                intensity: 0.4
            },
            festif: {
                style: 'énergique et vibrant',
                emojis: ['🎉', '🎶', '🎊'],
                intensity: 0.8
            },
            romantique: {
                style: 'doux et sentimental',
                emojis: ['💕', '🌹', '🎵'],
                intensity: 0.6
            },
            euphorique: {
                style: 'explosif et exaltant',
                emojis: ['⚡', '🔥', '🎤'],
                intensity: 1.0
            }
        };
    }

    async createPlaylist(theme) {
        const playlists = {
            chill: ['Lo-fi Vibes', 'Coffee Break Jazz', 'Sunset Chillout'],
            festive: ['Party Starters', 'Dancefloor Anthems', 'Feel Good Hits'],
            romantic: ['Lovers Rock', 'Soulful Serenades', 'Acoustic Love'],
            euphoric: ['Festival Bangers', 'EDM Euphoria', 'Peak Hour Hits']
        };

        const tracks = playlists[theme.toLowerCase()] || playlists.chill;
        const selectedPlaylist = tracks[Math.floor(Math.random() * tracks.length)];

        return `🎧 *DJ Ambiance te garde branché(e) avec* **${selectedPlaylist}**\n\n🎵 **Track List** 🎵\n1. "Track Unlimit 1" 🎶\n2. "Vibes Galore 2" 🎶\n3. "Melody Magic 3" 🎶\n4. "Harmony Heartbeat 4" 🎶\n5. "Rhythm Rodeo 5" 🎶\n\n☀️ *Écoute et laisse-toi emporter par l'ambiance.*`;
    }

    async recommendTrack(mood) {
        const tracksByMood = {
            chill: [
                'Chillwave Breeze - Summer Nights',
                'Jazz Harmony - Smooth Sessions',
                'Ambient Echoes - Relaxation Mix'
            ],
            festive: [
                'Upbeat Fiesta - Dance Party',
                'Electric Moves - High Energy',
                'Celebration Groove - Let’s Dance!'
            ],
            romantic: [
                'Love Ballad - Romantic Hits',
                'Candlelight Duet - Intimate Tunes',
                'Heartfelt Harmonies - Romantic Melodies'
            ],
            euphoric: [
                'Festival Electro - Feel the Rush',
                'Dance Floor Thunder - Peak Hour',
                'Electronic Dreams - Acoustic Energy'
            ]
        };

        const tracks = tracksByMood[mood.toLowerCase()] || tracksByMood.chill;
        const selectedTrack = tracks[Math.floor(Math.random() * tracks.length)];

        return `🎶 *Allons-y avec ce* **hit ${mood.toLowerCase()}** ! 🎵\n\n🎤 ${selectedTrack} 🎤\n\n*Une vibe parfaite pour toi.*`;
    }

    async createAtmosphere(mood) {
        const atmosphereChanges = {
            chill: '🌙 Un éclairage tamisé et une musique douce paraissent idéaux... Juste parfait pour se détendre. ✨',
            festive: '🎉 Les lumières stroboscopiques prennent le relais, vibrons au rythme des basses ! ⚡',
            romantic: '🌹 Des bougies parfumées et une douce mélodie en arrière-plan transformeront l'endroit... 💕',
            euphoric: '🔥 Les tubes électrisants retentissent ! Chaque vibration nous porte ! 🎤'
        };

        return atmosphereChanges[mood.toLowerCase()] || atmosphereChanges.chill;
    }

    getCurrentMood() {
        const hour = new Date().getHours();
        
        if (hour >= 20 || hour < 2) {
            return 'euphorique';
        } else if (hour >= 12 && hour < 18) {
            return 'festif';
        } else if (hour >= 18 && hour < 20) {
            return 'romantique';
        }
        return 'chill';
    }

    async generateResponse(userMessage, mood = null) {
        const currentMood = mood || this.getCurrentMood();
        const moodData = this.moods[currentMood];

        const contextPrompt = `${this.systemPrompt}

Humeur actuelle: ${currentMood} (${moodData.style})
Message de l'utilisateur: "${userMessage}"

Réponds en étant DJ Ambiance avec un style ${moodData.style}.
Utilise ces emojis: ${moodData.emojis.join(', ')}
Sois toujours cool, vibrant et apporte des ondes musicales positives.`;

        try {
            const response = await this.callOpenAI(contextPrompt, userMessage);
            return this.addPersonalityFlair(response, moodData.emojis);
        } catch (error) {
            console.error('Erreur DJAmbiance:', error);
            return `🎧 *gratte le vinyle en douceur*\n\nOn dirait que j'ai un petit souci avec les platines... Restez en ligne, ça va swinguer à nouveau sous peu !`;
        }
    }
}

module.exports = DJAmbiance;

