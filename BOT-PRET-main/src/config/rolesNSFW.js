/**
 * Configuration complète des rôles NSFW
 * Définit toutes les catégories de rôles, leurs propriétés et conditions
 */

export const CATEGORIES_ROLES = {
    ORIENTATION: 'orientation',
    FUN_IMMEDIAT: 'fun_immediat',
    PROGRESSION: 'progression',
    REPUTATION: 'reputation',
    STATUT: 'statut',
    CLES_UNLOCK: 'cles_unlock',
    BADGES: 'badges'
};

export const ROLES_CONFIG = {
    // Rôles d'orientation et identité sexuelle
    orientation: {
        'libido_libre': {
            nom: 'Libido Libre',
            description: 'Pour les esprits libres et ouverts',
            emoji: '🔥',
            couleur: '#FF69B4',
            salons: ['salon-libido'],
            badges: ['esprit_libre'],
            permanent: true
        },
        'feroce_bi': {
            nom: 'Féroce Bi',
            description: 'La bisexualité assumée et fière',
            emoji: '💜',
            couleur: '#9370DB',
            salons: ['salon-bi'],
            badges: ['double_attirance'],
            permanent: true
        },
        'insatiable_hetero': {
            nom: 'Insatiable Hétéro',
            description: 'L\'hétérosexualité passionnée',
            emoji: '❤️',
            couleur: '#DC143C',
            salons: ['salon-hetero'],
            badges: ['classique_passion'],
            permanent: true
        },
        'creature_curieuse': {
            nom: 'Créature Curieuse',
            description: 'En exploration permanente',
            emoji: '🌈',
            couleur: '#FFD700',
            salons: ['salon-exploration'],
            badges: ['explorateur'],
            permanent: true
        },
        'legende_rainbow': {
            nom: 'Légende du Rainbow',
            description: 'Toutes les couleurs de l\'amour',
            emoji: '🏳️‍🌈',
            couleur: '#FF1493',
            salons: ['salon-rainbow'],
            badges: ['arc_en_ciel'],
            permanent: true
        },
        'explorateur_ombre': {
            nom: 'Explorateur.trice de l\'Ombre',
            description: 'Pour les amateurs de mystère',
            emoji: '🌑',
            couleur: '#4B0082',
            salons: ['salon-ombre', 'salon-mystere'],
            badges: ['mysterieux'],
            permanent: true
        }
    },

    // Rôles fun immédiats
    fun_immediat: {
        'cocu_du_jour': {
            nom: 'Cocu du Jour',
            description: 'Le malchanceux du jour',
            emoji: '🤡',
            couleur: '#00FF00',
            duree: 86400000, // 24h en ms
            commandes: ['!consolation'],
            badge_temporaire: 'cocu_badge'
        },
        'briseur_lit': {
            nom: 'Briseur.se de Lit',
            description: 'Performance légendaire reconnue',
            emoji: '🛏️',
            couleur: '#FF4500',
            message_bienvenue: 'Un.e briseur.se de lit nous rejoint !',
            badges: ['briseur_certifie'],
            permanent: true
        },
        'flirt_legendaire': {
            nom: 'Flirt Légendaire',
            description: 'Maître.sse de la séduction',
            emoji: '😘',
            couleur: '#FF69B4',
            commandes: ['!flirt', '!duel-seduction'],
            classement: true,
            badges: ['seducteur_pro']
        },
        'ambassadeur_sexto': {
            nom: 'Ambassadeur.rice du Sexto',
            description: 'Expert.e en messages coquins',
            emoji: '📱',
            couleur: '#FF1493',
            commandes: ['!sexto-anonyme'],
            fonctionnalites: ['envoi_anonyme'],
            opt_in_requis: true
        },
        'simulateur_jalou': {
            nom: 'Simulateur de Crise de Jalou',
            description: 'Spécialiste des drames',
            emoji: '😤',
            couleur: '#FF0000',
            evenements: ['crise_jalousie'],
            commandes: ['!drama', '!jalousie']
        }
    },

    // Rôles de progression/farming
    progression: {
        'godxplorer': {
            nom: 'GodXPlorer',
            description: 'Expert.e de l\'exploration érotique',
            emoji: '🔞',
            couleur: '#FFD700',
            niveaux: {
                1: { xp: 0, titre: 'Novice', bonus: [] },
                10: { xp: 1000, titre: 'Explorateur', bonus: ['salon-godx-1'] },
                25: { xp: 5000, titre: 'Expert', bonus: ['salon-godx-2', 'badge-godx'] },
                50: { xp: 15000, titre: 'Maître', bonus: ['salon-godx-vip', 'commande-godx'] },
                100: { xp: 50000, titre: 'Légende', bonus: ['titre-custom', 'couleur-custom'] }
            }
        },
        'masturmaster': {
            nom: 'MasturMaster',
            description: 'Vétéran des discussions hot',
            emoji: '🔥',
            couleur: '#FF4500',
            condition: {
                type: 'messages_salon',
                salon: 'hot-talks',
                nombre: 100
            },
            badges: ['veteran_hot']
        },
        'brise_tabou': {
            nom: 'Brise-Tabou',
            description: 'Raconte les anecdotes interdites',
            emoji: '🚫',
            couleur: '#8B0000',
            condition: {
                type: 'anecdotes_validees',
                nombre: 10
            },
            salons: ['tabou-stories'],
            badges: ['sans_tabou']
        },
        'bingo_sexe': {
            nom: 'Bingo Sexe',
            description: 'Collectionneur de défis érotiques',
            emoji: '🎯',
            couleur: '#32CD32',
            defis: {
                facile: 10,
                moyen: 25,
                difficile: 50,
                extreme: 100
            },
            badges_progressifs: true
        },
        'creatif_kama': {
            nom: 'Créatif.ve du Kama',
            description: 'Créateur de contenu érotique',
            emoji: '🎨',
            couleur: '#FF1493',
            condition: {
                type: 'creations',
                nombre: 5,
                types: ['jeu', 'defi', 'histoire']
            },
            outils: ['editeur_jeux', 'createur_badges']
        }
    },

    // Rôles de réputation et événementiels
    reputation: {
        'bombe_semaine': {
            nom: 'Bombe de la Semaine',
            description: 'Élu.e plus sexy de la semaine',
            emoji: '💣',
            couleur: '#FFD700',
            duree: 604800000, // 7 jours
            avantages: ['salon-vip', 'commandes-vip', 'badge-bombe'],
            election: true
        },
        'petit_ange': {
            nom: 'Petit.e Ange du Serveur',
            description: 'Aide et modère avec bienveillance',
            emoji: '😇',
            couleur: '#87CEEB',
            permissions: ['moderation_legere', 'aide_membres'],
            condition: {
                type: 'aide_fournie',
                nombre: 50
            }
        },
        'trophee_embrouille': {
            nom: 'Trophée de l\'Embrouille',
            description: 'Champion.ne des duels',
            emoji: '🏆',
            couleur: '#FFD700',
            condition: {
                type: 'duels_gagnes',
                nombre: 10
            },
            recompenses: ['stickers_exclusifs', 'commandes_duel']
        },
        'maitre_roleplay': {
            nom: 'Maître.sse du Roleplay',
            description: 'Expert.e en jeux de rôle érotiques',
            emoji: '🎭',
            couleur: '#9370DB',
            salons: ['rp-prive', 'rp-scenarios'],
            outils: ['createur_scenarios'],
            condition: {
                type: 'rp_quality',
                evaluations: 20
            }
        },
        'mystere_poil': {
            nom: 'Mystère à Poil',
            description: 'Rôle secret aux features cachées',
            emoji: '❓',
            couleur: '#000000',
            secret: true,
            indices: ['enigme1', 'enigme2', 'enigme3'],
            fonctionnalites_cachees: true
        }
    },

    // Rôles de statut et personnalisation
    statut: {
        'coloriste_desir': {
            nom: 'Coloriste du Désir',
            description: 'Personnalise tes couleurs',
            emoji: '🎨',
            couleur: '#FFFFFF',
            permissions: ['couleur_pseudo', 'couleur_badge'],
            interface_custom: true
        },
        'tatoue_serveur': {
            nom: 'Tatoué.e du Serveur',
            description: 'Arbore un tatouage virtuel',
            emoji: '🖋️',
            couleur: '#000000',
            fonctionnalite: 'tatouage_hebdo',
            galerie: true
        },
        'dresseur_bots': {
            nom: 'Dresseur.se de Bots',
            description: 'Commandes personnalisées exclusives',
            emoji: '🤖',
            couleur: '#4169E1',
            commandes_custom: 5,
            editeur: true
        }
    },

    // Rôles clés pour débloquer des fonctionnalités
    cles_unlock: {
        'voyeur_vip': {
            nom: 'Voyeur.euse VIP',
            description: 'Accès aux salons voyeurs',
            emoji: '👁️',
            couleur: '#8B008B',
            salons: ['voyeur-cam', 'voyeur-stories'],
            condition: {
                type: 'niveau_confiance',
                niveau: 5
            }
        },
        'initiateur_defis': {
            nom: 'Initiateur.rice de Défis',
            description: 'Lance des défis communautaires',
            emoji: '🎲',
            couleur: '#FF4500',
            commandes: ['!creer-defi', '!lancer-defi'],
            cooldown_reduit: true
        },
        'gardien_secrets': {
            nom: 'Gardien.ne des Secrets',
            description: 'Gère les confessions anonymes',
            emoji: '🤐',
            couleur: '#2F4F4F',
            permissions: ['voir_confessions', 'moderer_confessions'],
            salons: ['confessions-privees']
        }
    },

    // Badges de collection
    badges: {
        'collectionneur_kinks': {
            nom: 'Collectionneur.se de Kinks',
            description: 'Collectionne les badges thématiques',
            emoji: '🏅',
            couleur: '#FFD700',
            collection: {
                themes: ['bdsm', 'vanilla', 'fetish', 'romantique'],
                recompenses_paliers: {
                    5: 'titre_kink_explorer',
                    10: 'salon_kink_vip',
                    20: 'createur_kink_badge'
                }
            }
        },
        'legende_consentement': {
            nom: 'Légende du Consentement',
            description: 'Promoteur du consentement',
            emoji: '✅',
            couleur: '#00FF00',
            condition: {
                type: 'formations',
                modules: ['consentement_base', 'communication_saine']
            },
            responsabilites: ['animation_ateliers']
        },
        'pionnier_inedit': {
            nom: 'Pionnier.e de l\'Inédit',
            description: 'Testeur de nouvelles fonctionnalités',
            emoji: '🚀',
            couleur: '#4169E1',
            acces: ['beta_features', 'dev_feedback'],
            avantages: ['preview_updates', 'vote_features']
        }
    }
};

// Configuration des salons associés aux rôles
export const SALONS_ROLES = {
    'salon-libido': {
        nom: 'libido-libre',
        description: 'Espace pour les esprits libres',
        nsfw: true,
        roles_requis: ['libido_libre']
    },
    'salon-bi': {
        nom: 'bi-paradise',
        description: 'Le paradis bisexuel',
        nsfw: true,
        roles_requis: ['feroce_bi']
    },
    'salon-hetero': {
        nom: 'hetero-passion',
        description: 'Passion hétérosexuelle',
        nsfw: true,
        roles_requis: ['insatiable_hetero']
    },
    'salon-exploration': {
        nom: 'exploration-curieuse',
        description: 'Pour les curieux.ses',
        nsfw: true,
        roles_requis: ['creature_curieuse']
    },
    'salon-rainbow': {
        nom: 'rainbow-love',
        description: 'Toutes les couleurs de l\'amour',
        nsfw: true,
        roles_requis: ['legende_rainbow']
    },
    'salon-ombre': {
        nom: 'ombre-mystere',
        description: 'Les mystères de l\'ombre',
        nsfw: true,
        roles_requis: ['explorateur_ombre'],
        cache: true
    },
    'salon-mystere': {
        nom: 'mysteres-interdits',
        description: 'Secrets et mystères',
        nsfw: true,
        roles_requis: ['explorateur_ombre', 'mystere_poil'],
        enigme_acces: true
    },
    'hot-talks': {
        nom: 'discussions-hot',
        description: 'Discussions torrides',
        nsfw: true,
        compteur_messages: true
    },
    'salon-vip': {
        nom: 'vip-lounge',
        description: 'Salon VIP exclusif',
        nsfw: true,
        roles_requis: ['bombe_semaine'],
        temporaire: true
    },
    'voyeur-cam': {
        nom: 'voyeur-cam',
        description: 'Espace voyeur exclusif',
        nsfw: true,
        roles_requis: ['voyeur_vip'],
        verification_age: true
    },
    'confessions-privees': {
        nom: 'confessions',
        description: 'Confessions anonymes',
        nsfw: true,
        roles_requis: ['gardien_secrets'],
        anonyme: true
    }
};

// Configuration des commandes personnalisées
export const COMMANDES_ROLES = {
    '!flirt': {
        roles_requis: ['flirt_legendaire'],
        description: 'Lance un flirt à un membre',
        cooldown: 300000 // 5 minutes
    },
    '!duel-seduction': {
        roles_requis: ['flirt_legendaire'],
        description: 'Défie quelqu\'un en duel de séduction',
        cooldown: 3600000 // 1 heure
    },
    '!sexto-anonyme': {
        roles_requis: ['ambassadeur_sexto'],
        description: 'Envoie un sexto anonyme',
        opt_in_requis: true,
        cooldown: 600000 // 10 minutes
    },
    '!drama': {
        roles_requis: ['simulateur_jalou'],
        description: 'Déclenche un drama',
        cooldown: 1800000 // 30 minutes
    },
    '!creer-defi': {
        roles_requis: ['initiateur_defis'],
        description: 'Crée un nouveau défi',
        cooldown: 86400000 // 24 heures
    }
};

// Système de progression XP
export const SYSTEME_XP = {
    gains: {
        message: 10,
        message_hot: 20,
        reaction: 5,
        participation_event: 50,
        defi_complete: 100,
        vote: 25,
        aide_membre: 30
    },
    multiplicateurs: {
        'bombe_semaine': 2,
        'godxplorer': 1.5,
        'pionnier_inedit': 1.3
    }
};

// Configuration des événements
export const EVENEMENTS = {
    'election_bombe': {
        frequence: 'hebdomadaire',
        jour: 'dimanche',
        heure: '20:00',
        duree_vote: 86400000, // 24h
        role_attribue: 'bombe_semaine'
    },
    'crise_jalousie': {
        declencheur: 'simulateur_jalou',
        probabilite: 0.1,
        effets: ['emojis_jalousie', 'messages_drama']
    }
};

export default {
    CATEGORIES_ROLES,
    ROLES_CONFIG,
    SALONS_ROLES,
    COMMANDES_ROLES,
    SYSTEME_XP,
    EVENEMENTS
};
