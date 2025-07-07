/**
 * Configuration pour le système d'onboarding
 * Contient les guides visuels et contenus dynamiques
 */

export const onboardingConfig = {
    // Configuration du salon d'introduction
    welcomeChannel: {
        embed: {
            title: "🎉 Bienvenue dans notre communauté !",
            description: "Suivez ce guide rapide pour découvrir notre serveur en moins de 2 minutes !",
            color: "#FF5733",
            thumbnail: "URL_DE_VOTRE_LOGO",
            fields: [
                {
                    name: "📚 Étape 1 : Lisez les règles",
                    value: "Consultez <#ID_SALON_REGLES> pour connaître nos règles de base.",
                    inline: false
                },
                {
                    name: "🎭 Étape 2 : Choisissez vos rôles",
                    value: "Utilisez le menu ci-dessous pour sélectionner vos centres d'intérêt.",
                    inline: false
                },
                {
                    name: "🏅 Étape 3 : Débloquez votre premier badge",
                    value: "Présentez-vous dans <#ID_SALON_PRESENTATION> pour obtenir le badge 'Nouveau membre' !",
                    inline: false
                },
                {
                    name: "💬 Étape 4 : Commencez à discuter",
                    value: "Rejoignez <#ID_SALON_GENERAL> pour rencontrer la communauté !",
                    inline: false
                }
            ],
            footer: {
                text: "Besoin d'aide ? Contactez un modérateur !",
                icon_url: "URL_ICONE_AIDE"
            }
        }
    },
    
    // Menu de sélection des rôles
    roleMenu: {
        placeholder: "Choisissez vos centres d'intérêt",
        minValues: 1,
        maxValues: 3,
        options: [
            {
                label: "🎮 Gaming",
                description: "Accès aux salons de jeux et événements gaming",
                value: "role_gaming",
                emoji: "🎮"
            },
            {
                label: "🎨 Art & Créativité",
                description: "Partagez vos créations et découvrez celles des autres",
                value: "role_art",
                emoji: "🎨"
            },
            {
                label: "🎵 Musique",
                description: "Écoutez et partagez vos morceaux favoris",
                value: "role_music",
                emoji: "🎵"
            },
            {
                label: "💻 Tech & Dev",
                description: "Discussions techniques et entraide programmation",
                value: "role_tech",
                emoji: "💻"
            },
            {
                label: "📸 Photo/Vidéo",
                description: "Partagez vos photos et vidéos",
                value: "role_media",
                emoji: "📸"
            }
        ]
    },
    
    // Messages contextualisés
    contextualMessages: {
        firstRole: "🎉 Bravo ! Vous venez de débloquer votre premier rôle !",
        allStepsCompleted: "✨ Félicitations ! Vous avez terminé l'onboarding. Bienvenue dans la communauté !",
        badgeUnlocked: "🏅 Nouveau badge débloqué : **{badgeName}** !",
        channelAccess: "🔓 Vous avez maintenant accès aux salons : {channels}"
    },
    
    // Guides dynamiques par rôle
    roleGuides: {
        role_gaming: {
            title: "🎮 Guide du Gamer",
            description: "Bienvenue dans la section gaming !",
            tips: [
                "Rejoignez les événements gaming hebdomadaires",
                "Créez votre équipe pour les tournois",
                "Partagez vos clips épiques dans #gaming-clips"
            ]
        },
        role_art: {
            title: "🎨 Guide de l'Artiste",
            description: "Bienvenue dans l'espace créatif !",
            tips: [
                "Participez aux défis artistiques mensuels",
                "Demandez des critiques constructives",
                "Exposez vos œuvres dans #galerie"
            ]
        },
        role_music: {
            title: "🎵 Guide du Mélomane",
            description: "Bienvenue dans l'univers musical !",
            tips: [
                "Partagez vos playlists",
                "Découvrez de nouveaux artistes",
                "Participez aux sessions d'écoute collective"
            ]
        },
        role_tech: {
            title: "💻 Guide du Développeur",
            description: "Bienvenue dans la tech zone !",
            tips: [
                "Posez vos questions techniques",
                "Partagez vos projets open source",
                "Participez aux hackathons du serveur"
            ]
        },
        role_media: {
            title: "📸 Guide du Créateur de Contenu",
            description: "Bienvenue dans l'espace multimédia !",
            tips: [
                "Partagez vos meilleures prises",
                "Obtenez des conseils sur le matériel",
                "Collaborez sur des projets vidéo"
            ]
        }
    },
    
    // Boutons interactifs
    buttons: {
        startTour: {
            label: "🚀 Commencer la visite",
            style: "PRIMARY",
            customId: "start_onboarding_tour"
        },
        skipTour: {
            label: "⏭️ Passer",
            style: "SECONDARY",
            customId: "skip_onboarding_tour"
        },
        needHelp: {
            label: "❓ Besoin d'aide",
            style: "SECONDARY",
            customId: "onboarding_help"
        }
    },
    
    // Timings et paramètres
    settings: {
        tourDuration: 120000, // 2 minutes en ms
        autoRoleDelay: 5000, // Délai avant attribution automatique du rôle "Nouveau"
        reminderDelay: 60000 // Rappel après 1 minute si pas d'action
    }
};

// Mapping des rôles vers leurs IDs Discord (à configurer)
export const roleMapping = {
    'role_gaming': process.env.ROLE_GAMING_ID || '',
    'role_art': process.env.ROLE_ART_ID || '',
    'role_music': process.env.ROLE_MUSIC_ID || '',
    'role_tech': process.env.ROLE_TECH_ID || '',
    'role_media': process.env.ROLE_MEDIA_ID || '',
    'role_nouveau': process.env.ROLE_NOUVEAU_ID || ''
};

// Messages d'étapes pour le tour guidé
export const tourSteps = [
    {
        title: "👋 Bienvenue !",
        content: "Je suis votre guide pour découvrir notre serveur. Cette visite prend moins de 2 minutes !",
        duration: 5000
    },
    {
        title: "📋 Les règles",
        content: "D'abord, prenez connaissance de nos règles dans <#ID_SALON_REGLES>. C'est important pour une bonne ambiance !",
        duration: 8000
    },
    {
        title: "🎭 Vos rôles",
        content: "Choisissez vos centres d'intérêt pour accéder aux salons spécialisés. Vous pouvez en choisir jusqu'à 3 !",
        duration: 10000
    },
    {
        title: "🏅 Les badges",
        content: "Gagnez des badges en participant ! Votre premier : présentez-vous dans <#ID_SALON_PRESENTATION>.",
        duration: 8000
    },
    {
        title: "✨ C'est parti !",
        content: "Vous êtes prêt ! Explorez, participez et amusez-vous. N'hésitez pas à demander de l'aide si besoin !",
        duration: 5000
    }
];

export default {
    onboardingConfig,
    roleMapping,
    tourSteps
};
