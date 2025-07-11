// Configuration complète des 30+ salons du serveur
import { ChannelType } from 'discord.js';

export const CHANNEL_CONFIGS = {
    // Catégorie: Informations
    INFO: {
        name: '📋 INFORMATIONS',
        type: 'category',
        channels: [
            {
                name: '📢・annonces',
                type: ChannelType.GuildText,
                topic: 'Annonces importantes du serveur',
                nsfw: false,
                permissions: {
                    everyone: { view: true, send: false },
                    admin: { view: true, send: true, manage: true }
                }
            },
            {
                name: '📜・règlement',
                type: ChannelType.GuildText,
                topic: 'Règles du serveur - À lire obligatoirement',
                nsfw: false,
                permissions: {
                    everyone: { view: true, send: false },
                    admin: { view: true, send: true, manage: true }
                }
            },
            {
                name: '🎉・événements',
                type: ChannelType.GuildText,
                topic: 'Événements et soirées spéciales',
                nsfw: false,
                permissions: {
                    everyone: { view: true, send: false },
                    verified: { view: true, send: true }
                }
            }
        ]
    },

    // Catégorie: Communauté
    COMMUNITY: {
        name: '💬 COMMUNAUTÉ',
        type: 'category',
        channels: [
            {
                name: '✨・présentations',
                type: ChannelType.GuildText,
                topic: 'Présentez-vous à la communauté',
                nsfw: false,
                permissions: {
                    everyone: { view: false },
                    verified: { view: true, send: true }
                }
            },
            {
                name: '💬・discussion-générale',
                type: ChannelType.GuildText,
                topic: 'Discussions libres et conviviales',
                nsfw: false,
                permissions: {
                    everyone: { view: false },
                    verified: { view: true, send: true }
                }
            },
            {
                name: '💋・chuchotements-coquins',
                type: ChannelType.GuildText,
                topic: 'Discussions plus intimes et suggestives',
                nsfw: true,
                permissions: {
                    everyone: { view: false },
                    verified: { view: true, send: true }
                }
            },
            {
                name: '🎲・jeux-coquins',
                type: ChannelType.GuildText,
                topic: 'Jeux et défis sensuels - Utilisez /dice',
                nsfw: true,
                permissions: {
                    everyone: { view: false },
                    verified: { view: true, send: true }
                },
                features: ['diceGame']
            }
        ]
    },

    // Catégorie: Créations
    CREATIONS: {
        name: '🎨 CRÉATIONS',
        type: 'category',
        channels: [
            {
                name: '🖼️・galerie-des-merveilles',
                type: ChannelType.GuildText,
                topic: 'Partagez vos photos et créations (NSFW autorisé)',
                nsfw: true,
                permissions: {
                    everyone: { view: false },
                    verified: { view: true, send: true }
                }
            },
            {
                name: '🎨・art-et-créations',
                type: ChannelType.GuildText,
                topic: 'Art érotique et créations sensuelles',
                nsfw: true,
                permissions: {
                    everyone: { view: false },
                    verified: { view: true, send: true }
                }
            },
            {
                name: '📚・histoires-érotiques-ia',
                type: ChannelType.GuildText,
                topic: 'Histoires générées par IA - Commande /story',
                nsfw: true,
                permissions: {
                    everyone: { view: false },
                    verified: { view: true, send: true }
                },
                features: ['storyGenerator']
            }
        ]
    },

    // Catégorie: Expériences Immersives
    IMMERSIVE: {
        name: '🌟 EXPÉRIENCES IMMERSIVES',
        type: 'category',
        channels: [
            {
                name: '🎬・cinéma-4dx',
                type: ChannelType.GuildText,
                topic: 'Séances cinéma avec effets sensoriels - Vote avec /vote-film',
                nsfw: true,
                permissions: {
                    everyone: { view: false },
                    roles: ['Cinéphile Érotique', 'VIP', 'Membre Premium'],
                    verified: { view: true, send: true }
                },
                features: ['cinemaVoting', 'sensoryEffects']
            },
            {
                name: '🏊・spa-virtuel',
                type: ChannelType.GuildText,
                topic: 'Détente et relaxation avec sons ASMR automatiques',
                nsfw: true,
                permissions: {
                    everyone: { view: false },
                    verified: { view: true, send: true }
                },
                features: ['asmrSounds', 'relaxationMode']
            },
            {
                name: '🎪・cirque-des-sens',
                type: ChannelType.GuildText,
                topic: 'Spectacles sensuels et performances érotiques',
                nsfw: true,
                permissions: {
                    everyone: { view: false },
                    roles: ['Performeur Érotique', 'VIP'],
                    verified: { view: true, send: true }
                }
            },
            {
                name: '🌃・ville-nocturne',
                type: ChannelType.GuildText,
                topic: 'Explorez la ville la nuit - Ambiance urbaine sensuelle',
                nsfw: true,
                permissions: {
                    everyone: { view: false },
                    verified: { view: true, send: true }
                },
                features: ['ambientSounds', 'roleplayZone']
            }
        ]
    },

    // Catégorie: Zones Expérimentales
    EXPERIMENTAL: {
        name: '🔬 ZONES EXPÉRIMENTALES',
        type: 'category',
        channels: [
            {
                name: '🧬・labo-génétique',
                type: ChannelType.GuildText,
                topic: 'Expériences de transformation et métamorphose',
                nsfw: true,
                permissions: {
                    everyone: { view: false },
                    roles: ['Savant Fou', 'VIP'],
                    verified: { view: true, send: true }
                },
                features: ['transformationGame']
            },
            {
                name: '🎮・arcade-érotique',
                type: ChannelType.GuildText,
                topic: 'Mini-jeux sensuels avec leaderboard - /play',
                nsfw: true,
                permissions: {
                    everyone: { view: false },
                    verified: { view: true, send: true }
                },
                features: ['miniGames', 'leaderboard']
            },
            {
                name: '📡・station-spatiale',
                type: ChannelType.GuildText,
                topic: 'Aventures cosmiques et rencontres extraterrestres',
                nsfw: true,
                permissions: {
                    everyone: { view: false },
                    roles: ['Astronaute du Plaisir', 'VIP'],
                    verified: { view: true, send: true }
                }
            },
            {
                name: '🏝️・île-privée',
                type: ChannelType.GuildText,
                topic: 'Paradis tropical pour moments intimes',
                nsfw: true,
                permissions: {
                    everyone: { view: false },
                    roles: ['VIP', 'Membre Premium'],
                    verified: { view: true, send: true }
                },
                features: ['privateRooms']
            },
            {
                name: '🎭・cabaret-quantique',
                type: ChannelType.GuildText,
                topic: 'Spectacles multidimensionnels et expériences uniques',
                nsfw: true,
                permissions: {
                    everyone: { view: false },
                    roles: ['Maître de Cérémonie', 'VIP'],
                    verified: { view: true, send: true }
                },
                features: ['quantumShow']
            }
        ]
    },

    // Catégorie: Salons Privés par Rôle
    ROLE_EXCLUSIVE: {
        name: '🔐 SALONS EXCLUSIFS',
        type: 'category',
        channels: [
            // Rôles de base (3)
            {
                name: '🌸・jardin-soft',
                type: ChannelType.GuildText,
                topic: 'Salon exclusif pour les personnalités Soft',
                nsfw: true,
                permissions: {
                    everyone: { view: false },
                    roles: ['Soft']
                }
            },
            {
                name: '🔥・terrain-playful',
                type: ChannelType.GuildText,
                topic: 'Salon exclusif pour les personnalités Playful',
                nsfw: true,
                permissions: {
                    everyone: { view: false },
                    roles: ['Playful']
                }
            },
            {
                name: '⛓️・donjon-dominant',
                type: ChannelType.GuildText,
                topic: 'Salon exclusif pour les personnalités Dominant',
                nsfw: true,
                permissions: {
                    everyone: { view: false },
                    roles: ['Dominant']
                }
            },

            // Rôles de progression (15)
            {
                name: '🦋・nid-creature-curieuse',
                type: ChannelType.GuildText,
                topic: 'Salon privé des Créatures Curieuses',
                nsfw: true,
                permissions: {
                    everyone: { view: false },
                    roles: ['Créature Curieuse']
                }
            },
            {
                name: '🔥・sanctuaire-libido',
                type: ChannelType.GuildText,
                topic: 'Salon privé des Libido Libre',
                nsfw: true,
                permissions: {
                    everyone: { view: false },
                    roles: ['Libido Libre']
                }
            },
            {
                name: '🎪・coulisses-insatiable',
                type: ChannelType.GuildText,
                topic: 'Salon privé des Insatiable RP',
                nsfw: true,
                permissions: {
                    everyone: { view: false },
                    roles: ['Insatiable RP']
                }
            },
            {
                name: '👁️・observatoire-voyeur',
                type: ChannelType.GuildText,
                topic: 'Salon privé des Voyageurs Voyeurs',
                nsfw: true,
                permissions: {
                    everyone: { view: false },
                    roles: ['Voyageur Voyeur']
                }
            },
            {
                name: '⭐・constellation-sensuelle',
                type: ChannelType.GuildText,
                topic: 'Salon privé des Étoiles Sensuelles',
                nsfw: true,
                permissions: {
                    everyone: { view: false },
                    roles: ['Étoile Sensuelle']
                }
            },
            {
                name: '🎭・loge-performeur',
                type: ChannelType.GuildText,
                topic: 'Salon privé des Performeurs Érotiques',
                nsfw: true,
                permissions: {
                    everyone: { view: false },
                    roles: ['Performeur Érotique']
                }
            },
            {
                name: '🌹・boudoir-romantique',
                type: ChannelType.GuildText,
                topic: 'Salon privé des Amoureux Torrides',
                nsfw: true,
                permissions: {
                    everyone: { view: false },
                    roles: ['Amoureux Torride']
                }
            },
            {
                name: '🗡️・arène-gladiateur',
                type: ChannelType.GuildText,
                topic: 'Salon privé des Gladiateurs Sensuels',
                nsfw: true,
                permissions: {
                    everyone: { view: false },
                    roles: ['Gladiateur Sensuel']
                }
            },
            {
                name: '🧪・laboratoire-savant',
                type: ChannelType.GuildText,
                topic: 'Salon privé des Savants Fous',
                nsfw: true,
                permissions: {
                    everyone: { view: false },
                    roles: ['Savant Fou']
                }
            },
            {
                name: '🌙・temple-prêtresse',
                type: ChannelType.GuildText,
                topic: 'Salon privé des Prêtresses du Désir',
                nsfw: true,
                permissions: {
                    everyone: { view: false },
                    roles: ['Prêtresse du Désir']
                }
            },
            {
                name: '🚀・navette-astronaute',
                type: ChannelType.GuildText,
                topic: 'Salon privé des Astronautes du Plaisir',
                nsfw: true,
                permissions: {
                    everyone: { view: false },
                    roles: ['Astronaute du Plaisir']
                }
            },
            {
                name: '🎬・studio-cinéphile',
                type: ChannelType.GuildText,
                topic: 'Salon privé des Cinéphiles Érotiques',
                nsfw: true,
                permissions: {
                    everyone: { view: false },
                    roles: ['Cinéphile Érotique']
                }
            },
            {
                name: '🎵・scène-rockstar',
                type: ChannelType.GuildText,
                topic: 'Salon privé des Rockstars du Vice',
                nsfw: true,
                permissions: {
                    everyone: { view: false },
                    roles: ['Rockstar du Vice']
                }
            },
            {
                name: '🎪・chapiteau-maître',
                type: ChannelType.GuildText,
                topic: 'Salon privé des Maîtres de Cérémonie',
                nsfw: true,
                permissions: {
                    everyone: { view: false },
                    roles: ['Maître de Cérémonie']
                }
            },
            {
                name: '♾️・dimension-légende',
                type: ChannelType.GuildText,
                topic: 'Salon privé des Légendes Infinies',
                nsfw: true,
                permissions: {
                    everyone: { view: false },
                    roles: ['Légende Infinie']
                }
            }
        ]
    },

    // Catégorie: VIP & Premium
    VIP: {
        name: '👑 ZONE VIP',
        type: 'category',
        channels: [
            {
                name: '💎・salon-vip',
                type: ChannelType.GuildText,
                topic: 'Salon exclusif pour les membres VIP',
                nsfw: true,
                permissions: {
                    everyone: { view: false },
                    roles: ['VIP', 'Membre Premium']
                }
            },
            {
                name: '🥂・lounge-premium',
                type: ChannelType.GuildText,
                topic: 'Espace premium avec avantages exclusifs',
                nsfw: true,
                permissions: {
                    everyone: { view: false },
                    roles: ['Membre Premium']
                }
            }
        ]
    }
};

// Export des noms de rôles nécessaires
export const REQUIRED_ROLES = [
    // Rôles de base
    'Soft', 'Playful', 'Dominant',
    
    // Rôles de progression
    'Créature Curieuse', 'Libido Libre', 'Insatiable RP',
    'Voyageur Voyeur', 'Étoile Sensuelle', 'Performeur Érotique',
    'Amoureux Torride', 'Gladiateur Sensuel', 'Savant Fou',
    'Prêtresse du Désir', 'Astronaute du Plaisir', 'Cinéphile Érotique',
    'Rockstar du Vice', 'Maître de Cérémonie', 'Légende Infinie',
    
    // Rôles spéciaux
    'VIP', 'Membre Premium', 'Vérifié', 'Nouveau Libertin',
    
    // Rôles staff
    'Admin', 'Modérateur'
];
