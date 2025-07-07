/**
 * Configuration des espaces de jeux interactifs
 * Système de progression avec XP, niveaux et zones restreintes
 */

export const ESPACES_JEUX = {
  // Configuration générale du système de progression
  PROGRESSION: {
    XP_PAR_MESSAGE: 5,
    XP_PAR_REACTION: 2,
    XP_PAR_PARTICIPATION: 25,
    XP_PAR_VICTOIRE: 50,
    XP_PAR_CREATION: 100,
    
    // Niveaux et XP requis
    NIVEAUX: [
      { niveau: 1, xpRequis: 0, titre: 'Novice', couleur: '#808080' },
      { niveau: 5, xpRequis: 500, titre: 'Initié', couleur: '#00FF00' },
      { niveau: 10, xpRequis: 1500, titre: 'Explorateur', couleur: '#0080FF' },
      { niveau: 15, xpRequis: 3000, titre: 'Aventurier', couleur: '#FF00FF' },
      { niveau: 20, xpRequis: 5000, titre: 'Expert', couleur: '#FF8000' },
      { niveau: 25, xpRequis: 8000, titre: 'Maître', couleur: '#FF0000' },
      { niveau: 30, xpRequis: 12000, titre: 'Légende', couleur: '#FFD700' },
      { niveau: 40, xpRequis: 20000, titre: 'Mythique', couleur: '#E5E5E5' },
      { niveau: 50, xpRequis: 35000, titre: 'Divin', couleur: '#00FFFF' }
    ],
    
    // Bonus d'XP
    BONUS: {
      STREAK_3_JOURS: 1.2,
      STREAK_7_JOURS: 1.5,
      STREAK_30_JOURS: 2.0,
      HEURE_BONUS: { start: 20, end: 23, multiplicateur: 1.5 },
      WEEKEND: 1.3
    }
  },

  // Salons RP avec scenarios
  SALONS_RP: {
    // Scenarios publics (accessibles à tous)
    PUBLICS: [
      {
        id: 'cafe-rencontres',
        nom: '☕ Café des Rencontres',
        description: 'Un café cozy pour des rencontres casual',
        niveauRequis: 1,
        tags: ['social', 'debutant', 'safe'],
        regles: [
          'Restez dans le thème du café',
          'Interactions respectueuses',
          'Pas de contenu NSFW'
        ],
        xpMultiplicateur: 1.0
      },
      {
        id: 'plage-paradis',
        nom: '🏖️ Plage Paradisiaque',
        description: 'Une plage ensoleillée pour se détendre',
        niveauRequis: 5,
        tags: ['vacances', 'detente', 'flirt-leger'],
        regles: [
          'Ambiance vacances et détente',
          'Flirt léger autorisé',
          'Respect des limites'
        ],
        xpMultiplicateur: 1.2
      },
      {
        id: 'boite-nuit',
        nom: '🎉 Club Nocturne',
        description: 'Dansez et socialisez dans une ambiance festive',
        niveauRequis: 10,
        tags: ['fete', 'musique', 'rencontres'],
        regles: [
          'Ambiance festive et décontractée',
          'Interactions adultes autorisées',
          'Pas de spam musical'
        ],
        xpMultiplicateur: 1.3
      }
    ],
    
    // Scenarios privés (niveaux élevés)
    PRIVES: [
      {
        id: 'suite-luxe',
        nom: '🥂 Suite de Luxe',
        description: 'Une suite privée pour des moments intimes',
        niveauRequis: 15,
        tags: ['prive', 'intime', 'romantique'],
        regles: [
          'Consentement mutuel requis',
          'Scénarios adultes autorisés',
          'Respect absolu des limites'
        ],
        xpMultiplicateur: 1.5,
        maxParticipants: 4
      },
      {
        id: 'donjon-mystere',
        nom: '🔗 Donjon Mystérieux',
        description: 'Explorez vos côtés les plus sombres',
        niveauRequis: 20,
        tags: ['bdsm', 'exploration', 'confiance'],
        regles: [
          'Safewords obligatoires',
          'Limites définies avant de commencer',
          'Aftercare inclus'
        ],
        xpMultiplicateur: 2.0,
        maxParticipants: 3,
        rolesRequis: ['BDSM_VERIFIE']
      },
      {
        id: 'paradis-interdit',
        nom: '🌺 Paradis Interdit',
        description: 'Zone sans tabou pour explorateurs confirmés',
        niveauRequis: 30,
        tags: ['extreme', 'fantasmes', 'liberation'],
        regles: [
          'Vérification d\'âge stricte',
          'Accord explicite pour tout',
          'Modération active'
        ],
        xpMultiplicateur: 3.0,
        maxParticipants: 6,
        rolesRequis: ['ADULTE_VERIFIE', 'MEMBRE_CONFIANCE']
      }
    ]
  },

  // Défis hebdomadaires
  DEFIS_HEBDO: {
    TYPES: [
      {
        id: 'defi-social',
        nom: 'Défi Social',
        description: 'Rencontrez X nouvelles personnes',
        objectifs: [
          { niveau: 1, cible: 5, xpRecompense: 100 },
          { niveau: 2, cible: 10, xpRecompense: 250 },
          { niveau: 3, cible: 20, xpRecompense: 500 }
        ],
        recurrence: 'hebdomadaire'
      },
      {
        id: 'defi-creatif',
        nom: 'Défi Créatif',
        description: 'Créez du contenu original',
        objectifs: [
          { niveau: 1, cible: 1, xpRecompense: 200 },
          { niveau: 2, cible: 3, xpRecompense: 600 },
          { niveau: 3, cible: 5, xpRecompense: 1200 }
        ],
        recurrence: 'hebdomadaire'
      },
      {
        id: 'defi-rp',
        nom: 'Défi Roleplay',
        description: 'Participez à X scénarios RP',
        objectifs: [
          { niveau: 1, cible: 3, xpRecompense: 150 },
          { niveau: 2, cible: 7, xpRecompense: 400 },
          { niveau: 3, cible: 15, xpRecompense: 1000 }
        ],
        recurrence: 'hebdomadaire'
      },
      {
        id: 'defi-equipe',
        nom: 'Défi d\'Équipe',
        description: 'Accomplissez des objectifs en groupe',
        objectifs: [
          { niveau: 1, cible: 1, xpRecompense: 300 },
          { niveau: 2, cible: 3, xpRecompense: 900 },
          { niveau: 3, cible: 5, xpRecompense: 2000 }
        ],
        recurrence: 'hebdomadaire',
        requireEquipe: true
      }
    ],
    
    // Récompenses spéciales
    RECOMPENSES_SPECIALES: [
      {
        id: 'perfect-week',
        nom: 'Semaine Parfaite',
        condition: 'Complétez tous les défis de la semaine',
        recompenses: {
          xp: 1000,
          badge: 'PERFECT_WEEK',
          titre: 'Perfectionniste'
        }
      },
      {
        id: 'streak-master',
        nom: 'Maître des Séries',
        condition: '4 semaines consécutives de défis',
        recompenses: {
          xp: 5000,
          badge: 'STREAK_MASTER',
          titre: 'Implacable',
          acces: ['salon-vip']
        }
      }
    ]
  },

  // Salons d'équipe
  SALONS_EQUIPE: {
    TYPES: [
      {
        id: 'qg-equipe',
        nom: '🏠 QG d\'Équipe',
        description: 'Espace privé pour votre équipe',
        fonctionnalites: [
          'Chat textuel privé',
          'Salon vocal',
          'Tableau des scores',
          'Plannification d\'événements'
        ],
        niveauRequis: 5,
        tailleMin: 3,
        tailleMax: 10
      },
      {
        id: 'arene-competition',
        nom: '⚔️ Arène de Compétition',
        description: 'Affrontez d\'autres équipes',
        fonctionnalites: [
          'Matchmaking équilibré',
          'Tournois hebdomadaires',
          'Classements',
          'Récompenses exclusives'
        ],
        niveauRequis: 10,
        tailleMin: 5,
        tailleMax: 15
      },
      {
        id: 'studio-creation',
        nom: '🎨 Studio de Création',
        description: 'Créez du contenu en équipe',
        fonctionnalites: [
          'Outils collaboratifs',
          'Galerie privée',
          'Votes internes',
          'Showcase public'
        ],
        niveauRequis: 15,
        tailleMin: 2,
        tailleMax: 8
      }
    ],
    
    // Système de niveau d'équipe
    PROGRESSION_EQUIPE: {
      XP_PARTAGE: 0.3, // 30% de l'XP individuel va à l'équipe
      BONUS_SYNERGIE: {
        3: 1.1,
        5: 1.2,
        10: 1.5
      },
      RANGS: [
        { rang: 'Bronze', xpRequis: 0, avantages: ['qg-basique'] },
        { rang: 'Argent', xpRequis: 5000, avantages: ['qg-ameliore', 'tournois'] },
        { rang: 'Or', xpRequis: 15000, avantages: ['qg-premium', 'sponsor'] },
        { rang: 'Platine', xpRequis: 30000, avantages: ['qg-elite', 'events-prives'] },
        { rang: 'Diamant', xpRequis: 60000, avantages: ['qg-legendaire', 'createur-tournoi'] }
      ]
    }
  },

  // Créations érotiques
  CREATIONS_EROTIQUES: {
    CATEGORIES: [
      {
        id: 'histoires',
        nom: '📖 Histoires Érotiques',
        description: 'Partagez vos récits sensuels',
        niveauRequis: 10,
        moderation: 'post',
        tags: ['ecriture', 'fiction', 'sensuel'],
        xpParCreation: 200,
        xpParVote: 5
      },
      {
        id: 'audio',
        nom: '🎧 Audio Érotique',
        description: 'ASMR et contenus audio sensuels',
        niveauRequis: 15,
        moderation: 'pre',
        tags: ['audio', 'asmr', 'voix'],
        xpParCreation: 300,
        xpParVote: 10,
        rolesRequis: ['CREATEUR_AUDIO']
      },
      {
        id: 'art-visuel',
        nom: '🎨 Art Érotique',
        description: 'Illustrations et créations visuelles',
        niveauRequis: 20,
        moderation: 'strict',
        tags: ['art', 'visuel', 'esthetique'],
        xpParCreation: 400,
        xpParVote: 15,
        rolesRequis: ['ARTISTE_VERIFIE']
      },
      {
        id: 'performances',
        nom: '💃 Performances Live',
        description: 'Shows et performances en direct',
        niveauRequis: 25,
        moderation: 'live',
        tags: ['live', 'performance', 'interactif'],
        xpParCreation: 500,
        xpParVote: 20,
        rolesRequis: ['PERFORMER', 'ADULTE_VERIFIE'],
        fonctionnalites: [
          'Streaming privé',
          'Pourboires virtuels',
          'Interactions live',
          'Replays VIP'
        ]
      }
    ],
    
    // Système de validation et récompenses
    VALIDATION: {
      VOTES_REQUIS: 10,
      RATIO_APPROBATION: 0.7,
      DUREE_VOTE: 72, // heures
      RECOMPENSES_QUALITE: {
        'coup-de-coeur': { xp: 1000, badge: 'COUP_DE_COEUR' },
        'chef-oeuvre': { xp: 2500, badge: 'CHEF_OEUVRE', titre: 'Artiste' },
        'legendaire': { xp: 5000, badge: 'LEGENDAIRE', titre: 'Maître Créateur', acces: ['createur-elite'] }
      }
    }
  },

  // Zones interdites (accès progressif)
  ZONES_INTERDITES: [
    {
      id: 'jardin-secret',
      nom: '🌹 Le Jardin Secret',
      description: 'Premier niveau des zones exclusives',
      niveauRequis: 15,
      conditions: {
        badges: ['EXPLORATEUR'],
        participations: 50
      },
      contenu: ['salons-prives', 'events-vip', 'creations-exclusives']
    },
    {
      id: 'cercle-intime',
      nom: '💎 Le Cercle Intime',
      description: 'Réservé aux membres de confiance',
      niveauRequis: 25,
      conditions: {
        badges: ['MEMBRE_CONFIANCE', 'CREATEUR'],
        participations: 200,
        anciennete: 90 // jours
      },
      contenu: ['acces-beta', 'votes-decisions', 'mentor-nouveaux']
    },
    {
      id: 'sanctuaire',
      nom: '🔮 Le Sanctuaire',
      description: 'L\'élite du serveur',
      niveauRequis: 40,
      conditions: {
        badges: ['LEGENDAIRE', 'LEADER'],
        participations: 1000,
        anciennete: 180,
        parrainage: 10
      },
      contenu: ['tout-acces', 'creation-events', 'moderation-communaute', 'revenus-partages']
    }
  ],

  // Système de classement
  CLASSEMENTS: {
    TYPES: [
      'xp-total',
      'xp-hebdo',
      'xp-mensuel',
      'creations',
      'votes-recus',
      'defis-completes',
      'streak-actuel'
    ],
    RECOMPENSES_TOP: {
      TOP_1: { xp: 5000, titre: 'Champion', badge: 'TOP_1' },
      TOP_3: { xp: 2500, titre: 'Élite', badge: 'TOP_3' },
      TOP_10: { xp: 1000, titre: 'Star', badge: 'TOP_10' },
      TOP_50: { xp: 500, badge: 'TOP_50' },
      TOP_100: { xp: 250, badge: 'TOP_100' }
    },
    RESET: {
      'xp-hebdo': 'dimanche 00:00',
      'xp-mensuel': 'premier du mois 00:00'
    }
  },

  // Configuration des permissions
  PERMISSIONS: {
    SALON_CREATION: {
      'public': ['MEMBRE_VERIFIE'],
      'prive': ['NIVEAU_15', 'BADGE_CREATEUR'],
      'equipe': ['NIVEAU_10', 'CHEF_EQUIPE'],
      'erotique': ['ADULTE_VERIFIE', 'NIVEAU_20']
    },
    MODERATION: {
      'avertissement': ['MODERATEUR', 'NIVEAU_30'],
      'timeout': ['MODERATEUR'],
      'ban-salon': ['MODERATEUR_SENIOR'],
      'ban-global': ['ADMIN']
    }
  },

  // Événements spéciaux
  EVENTS_SPECIAUX: {
    TYPES: [
      {
        id: 'soiree-theme',
        nom: 'Soirées à Thème',
        frequence: 'hebdomadaire',
        duree: 3, // heures
        xpBonus: 2.0,
        themes: [
          'Mascarade Vénitienne',
          'Nuit Tropicale',
          'Casino Royal',
          'Fantasmes Interdits',
          'Voyage dans le Temps'
        ]
      },
      {
        id: 'tournoi-creatif',
        nom: 'Tournoi Créatif',
        frequence: 'mensuel',
        duree: 168, // 1 semaine
        xpBonus: 3.0,
        prix: {
          1: { xp: 10000, titre: 'Maître Créateur', badge: 'TOURNOI_OR' },
          2: { xp: 5000, titre: 'Virtuose', badge: 'TOURNOI_ARGENT' },
          3: { xp: 2500, titre: 'Prodige', badge: 'TOURNOI_BRONZE' }
        }
      }
    ]
  }
};

// Fonctions utilitaires
export const calculerNiveau = (xp) => {
  const niveaux = ESPACES_JEUX.PROGRESSION.NIVEAUX;
  for (let i = niveaux.length - 1; i >= 0; i--) {
    if (xp >= niveaux[i].xpRequis) {
      return niveaux[i];
    }
  }
  return niveaux[0];
};

export const verifierAcces = (membre, zone) => {
  const niveau = calculerNiveau(membre.xp);
  if (niveau.niveau < zone.niveauRequis) return false;
  
  if (zone.conditions) {
    if (zone.conditions.badges) {
      const aBadges = zone.conditions.badges.every(badge => 
        membre.badges.includes(badge)
      );
      if (!aBadges) return false;
    }
    
    if (zone.conditions.participations) {
      if (membre.participations < zone.conditions.participations) return false;
    }
    
    if (zone.conditions.anciennete) {
      const joursAnciennete = Math.floor((Date.now() - membre.dateArrivee) / (1000 * 60 * 60 * 24));
      if (joursAnciennete < zone.conditions.anciennete) return false;
    }
  }
  
  return true;
};

export const calculerXpGagne = (action, contexte = {}) => {
  let xpBase = ESPACES_JEUX.PROGRESSION[`XP_PAR_${action.toUpperCase()}`] || 0;
  let multiplicateur = 1;
  
  // Bonus de contexte
  if (contexte.salon && contexte.salon.xpMultiplicateur) {
    multiplicateur *= contexte.salon.xpMultiplicateur;
  }
  
  // Bonus de streak
  if (contexte.streak) {
    const bonusStreak = ESPACES_JEUX.PROGRESSION.BONUS[`STREAK_${contexte.streak}_JOURS`];
    if (bonusStreak) multiplicateur *= bonusStreak;
  }
  
  // Bonus d'heure
  const heure = new Date().getHours();
  const bonusHeure = ESPACES_JEUX.PROGRESSION.BONUS.HEURE_BONUS;
  if (heure >= bonusHeure.start && heure <= bonusHeure.end) {
    multiplicateur *= bonusHeure.multiplicateur;
  }
  
  // Bonus weekend
  const jour = new Date().getDay();
  if (jour === 0 || jour === 6) {
    multiplicateur *= ESPACES_JEUX.PROGRESSION.BONUS.WEEKEND;
  }
  
  return Math.floor(xpBase * multiplicateur);
};
