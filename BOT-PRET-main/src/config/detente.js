/**
 * @file Configuration des espaces de détente et zones soft
 * @module config/detente
 */

export const CONFIG_DETENTE = {
    // Salons de détente
    SALONS: {
        DETENTE: {
            nom: '🌸・détente',
            description: 'Un espace pour se relaxer et discuter calmement',
            cooldown: 5000, // 5 secondes entre messages
            permissions: {
                rateLimitPerUser: 5,
                defaultAutoArchiveDuration: 1440 // 24h
            }
        },
        ASMR: {
            nom: '🎧・asmr-zone',
            description: 'Partagez vos sons ASMR et textes relaxants',
            cooldown: 10000,
            permissions: {
                rateLimitPerUser: 10,
                defaultAutoArchiveDuration: 4320 // 3 jours
            }
        },
        SAFE_ZONE: {
            nom: '🛡️・safe-zone',
            description: 'Un espace sécurisé pour s\'exprimer librement',
            cooldown: 3000,
            permissions: {
                rateLimitPerUser: 3,
                defaultAutoArchiveDuration: 10080 // 7 jours
            }
        },
        SLOW_CHAT: {
            nom: '🐌・slow-chat',
            description: 'Prenez votre temps pour discuter',
            cooldown: 30000, // 30 secondes entre messages
            permissions: {
                rateLimitPerUser: 30,
                defaultAutoArchiveDuration: 1440
            }
        }
    },

    // Messages d'ambiance
    MESSAGES_AMBIANCE: [
        "✨ Prenez une profonde respiration...",
        "🌙 La détente est un art de vivre",
        "🍃 Laissez-vous porter par la tranquillité",
        "💫 Chaque moment de calme est précieux",
        "🌊 Comme les vagues, laissez vos pensées aller et venir",
        "🕊️ La paix intérieure commence ici",
        "🌸 Votre bien-être est notre priorité"
    ],

    // Réponses automatiques zen
    AUTO_REPONSES: {
        // Mots-clés et leurs réponses
        stress: [
            "Je sens que vous avez besoin de vous détendre. Prenez quelques respirations profondes 🌬️",
            "Le stress peut être géré. Voulez-vous essayer un mini-exercice de relaxation? 🧘"
        ],
        fatigue: [
            "Reposez-vous bien. Votre corps et votre esprit en ont besoin 💤",
            "La fatigue est le signal de votre corps. Écoutez-le avec bienveillance 🌙"
        ],
        anxiete: [
            "Vous n'êtes pas seul(e). Respirez profondément et ancrez-vous dans le moment présent 🌿",
            "L'anxiété est temporaire. Concentrez-vous sur votre respiration 🫧"
        ],
        content: [
            "Votre joie illumine cet espace! 🌟",
            "C'est merveilleux de vous voir heureux(se)! ✨"
        ]
    },

    // Sons ASMR recommandés
    ASMR_SUGGESTIONS: [
        {
            nom: "Pluie douce",
            emoji: "🌧️",
            description: "Le son apaisant de la pluie"
        },
        {
            nom: "Vagues océan",
            emoji: "🌊",
            description: "Les vagues qui caressent le rivage"
        },
        {
            nom: "Feu de cheminée",
            emoji: "🔥",
            description: "Le crépitement d'un feu chaleureux"
        },
        {
            nom: "Forêt profonde",
            emoji: "🌲",
            description: "Les sons de la nature en forêt"
        },
        {
            nom: "Chuchotements",
            emoji: "🤫",
            description: "Des murmures apaisants"
        }
    ],

    // Mini-jeux zen
    MINI_JEUX: {
        RESPIRATION: {
            nom: "Exercice de respiration",
            duree: 60000, // 1 minute
            etapes: [
                "Inspirez pendant 4 secondes... 🫁",
                "Retenez votre souffle 4 secondes... ⏸️",
                "Expirez pendant 4 secondes... 💨",
                "Pause de 4 secondes... ⏱️"
            ]
        },
        MEDITATION_GUIDEE: {
            nom: "Mini méditation",
            duree: 180000, // 3 minutes
            etapes: [
                "Fermez les yeux et détendez-vous... 👁️",
                "Concentrez-vous sur votre respiration... 🌬️",
                "Laissez vos pensées passer comme des nuages... ☁️",
                "Revenez doucement à l'instant présent... 🌅"
            ]
        },
        GRATITUDE: {
            nom: "Journal de gratitude",
            prompt: "Nommez 3 choses pour lesquelles vous êtes reconnaissant(e) aujourd'hui 🙏"
        }
    },

    // Emojis d'ambiance
    EMOJIS_DETENTE: [
        "🌸", "🌙", "✨", "🍃", "🌊", "🕊️", "💫", "🧘",
        "🌺", "🦋", "🌈", "☁️", "🌟", "🎋", "🍂", "🌷"
    ],

    // Cooldowns et limites
    LIMITES: {
        MESSAGES_PAR_HEURE: 20,
        REACTIONS_PAR_MESSAGE: 5,
        DUREE_SESSION_MAX: 7200000 // 2 heures
    }
};
