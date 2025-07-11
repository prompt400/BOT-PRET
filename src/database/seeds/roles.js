'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const roles = [
      {
        name: 'creature_curieuse',
        displayName: '🔍 Créature Curieuse',
        description: 'Explorateur timide des plaisirs interdits, commence à découvrir les mystères sensuels du serveur',
        emoji: '🔍',
        color: '#FF6B6B',
        nsfw_level: 1,
        permissions: JSON.stringify({
          canAccessPrivateRooms: false,
          canCreateEvents: false,
          canModerateContent: false,
          canAccessPremiumFeatures: false,
          canUseSpecialCommands: false,
          maxPrivateChannels: 0
        }),
        privateChannels: JSON.stringify([]),
        requirements: JSON.stringify({
          level: 1,
          kissCoins: 0,
          flameTokens: 0,
          achievements: [],
          verificationComplete: true
        }),
        rewards: JSON.stringify({
          dailyKissCoins: 5,
          weeklyFlameTokens: 0,
          experienceBonus: 1.0,
          exclusiveItems: []
        }),
        priority: 1,
        purchasable: false,
        price: JSON.stringify({
          kissCoins: 0,
          flameTokens: 0,
          gemLust: 0
        }),
        maxMembers: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'libido_libre',
        displayName: '🔥 Libido Libre',
        description: 'Libération du désir où chaque interaction attise la flamme passionnée',
        emoji: '🔥',
        color: '#FF4757',
        nsfw_level: 2,
        permissions: JSON.stringify({
          canAccessPrivateRooms: true,
          canCreateEvents: false,
          canModerateContent: false,
          canAccessPremiumFeatures: true,
          canUseSpecialCommands: false,
          maxPrivateChannels: 1
        }),
        privateChannels: JSON.stringify([]),
        requirements: JSON.stringify({
          level: 2,
          kissCoins: 50,
          flameTokens: 0,
          achievements: [],
          verificationComplete: true
        }),
        rewards: JSON.stringify({
          dailyKissCoins: 10,
          weeklyFlameTokens: 1,
          experienceBonus: 1.1,
          exclusiveItems: []
        }),
        priority: 2,
        purchasable: false,
        price: JSON.stringify({
          kissCoins: 0,
          flameTokens: 0,
          gemLust: 0
        }),
        maxMembers: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'epicurien_erotique',
        displayName: '🍷 Épicurien Érotique',
        description: 'Amateur raffinée des plaisirs sensuels, prêt à goûter aux délices du serveur',
        emoji: '🍷',
        color: '#A855F7',
        nsfw_level: 3,
        permissions: JSON.stringify({
          canAccessPrivateRooms: true,
          canCreateEvents: true,
          canModerateContent: false,
          canAccessPremiumFeatures: true,
          canUseSpecialCommands: true,
          maxPrivateChannels: 2
        }),
        privateChannels: JSON.stringify([]),
        requirements: JSON.stringify({
          level: 3,
          kissCoins: 150,
          flameTokens: 5,
          achievements: [],
          verificationComplete: true
        }),
        rewards: JSON.stringify({
          dailyKissCoins: 15,
          weeklyFlameTokens: 2,
          experienceBonus: 1.2,
          exclusiveItems: []
        }),
        priority: 3,
        purchasable: false,
        price: JSON.stringify({
          kissCoins: 0,
          flameTokens: 0,
          gemLust: 0
        }),
        maxMembers: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'hedoniste_hardi',
        displayName: '💋 Hédoniste Hardi',
        description: 'Infatigable séducteur avide de nouvelles expériences excitantes',
        emoji: '💋',
        color: '#E91E63',
        nsfw_level: 4,
        permissions: JSON.stringify({
          canAccessPrivateRooms: true,
          canCreateEvents: true,
          canModerateContent: true,
          canAccessPremiumFeatures: true,
          canUseSpecialCommands: true,
          maxPrivateChannels: 2
        }),
        privateChannels: JSON.stringify([]),
        requirements: JSON.stringify({
          level: 4,
          kissCoins: 300,
          flameTokens: 10,
          achievements: [],
          verificationComplete: true
        }),
        rewards: JSON.stringify({
          dailyKissCoins: 20,
          weeklyFlameTokens: 3,
          experienceBonus: 1.3,
          exclusiveItems: []
        }),
        priority: 4,
        purchasable: false,
        price: JSON.stringify({
          kissCoins: 0,
          flameTokens: 0,
          gemLust: 0
        }),
        maxMembers: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'sybarite_sensuel',
        displayName: '🌹 Sybarite Sensuel',
        description: 'Maître des arts sensuels, expert en séduction et en plaisirs raffinés',
        emoji: '🌹',
        color: '#FF1744',
        nsfw_level: 5,
        permissions: JSON.stringify({
          canAccessPrivateRooms: true,
          canCreateEvents: true,
          canModerateContent: true,
          canAccessPremiumFeatures: true,
          canUseSpecialCommands: true,
          maxPrivateChannels: 3
        }),
        privateChannels: JSON.stringify([]),
        requirements: JSON.stringify({
          level: 5,
          kissCoins: 500,
          flameTokens: 20,
          achievements: [],
          verificationComplete: true
        }),
        rewards: JSON.stringify({
          dailyKissCoins: 25,
          weeklyFlameTokens: 5,
          experienceBonus: 1.4,
          exclusiveItems: []
        }),
        priority: 5,
        purchasable: false,
        price: JSON.stringify({
          kissCoins: 0,
          flameTokens: 0,
          gemLust: 0
        }),
        maxMembers: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'voluptueux_veteran',
        displayName: '🔞 Voluptueux Vétéran',
        description: 'Aventurier aguerri des terres sensuelles, invincible aux charmes du désir',
        emoji: '🔞',
        color: '#D32F2F',
        nsfw_level: 5,
        permissions: JSON.stringify({
          canAccessPrivateRooms: true,
          canCreateEvents: true,
          canModerateContent: true,
          canAccessPremiumFeatures: true,
          canUseSpecialCommands: true,
          maxPrivateChannels: 4
        }),
        privateChannels: JSON.stringify([]),
        requirements: JSON.stringify({
          level: 6,
          kissCoins: 1000,
          flameTokens: 50,
          achievements: [],
          verificationComplete: true
        }),
        rewards: JSON.stringify({
          dailyKissCoins: 30,
          weeklyFlameTokens: 8,
          experienceBonus: 1.5,
          exclusiveItems: []
        }),
        priority: 6,
        purchasable: false,
        price: JSON.stringify({
          kissCoins: 0,
          flameTokens: 0,
          gemLust: 0
        }),
        maxMembers: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'libertin_legendaire',
        displayName: '👑 Libertin Légendaire',
        description: 'Figure mythique du serveur, l\'incarnation parfaite de la séduction et du plaisir',
        emoji: '👑',
        color: '#FFD700',
        nsfw_level: 5,
        permissions: JSON.stringify({
          canAccessPrivateRooms: true,
          canCreateEvents: true,
          canModerateContent: true,
          canAccessPremiumFeatures: true,
          canUseSpecialCommands: true,
          maxPrivateChannels: 5
        }),
        privateChannels: JSON.stringify([]),
        requirements: JSON.stringify({
          level: 7,
          kissCoins: 2000,
          flameTokens: 100,
          achievements: [],
          verificationComplete: true
        }),
        rewards: JSON.stringify({
          dailyKissCoins: 40,
          weeklyFlameTokens: 10,
          experienceBonus: 1.7,
          exclusiveItems: []
        }),
        priority: 7,
        purchasable: false,
        price: JSON.stringify({
          kissCoins: 0,
          flameTokens: 0,
          gemLust: 0
        }),
        maxMembers: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'charmeuse_charismatique',
        displayName: '💃 Charmeuse Charismatique',
        description: 'Enchanteresse aux pouvoirs de séduction irrésistibles',
        emoji: '💃',
        color: '#FF69B4',
        nsfw_level: 3,
        permissions: JSON.stringify({
          canAccessPrivateRooms: true,
          canCreateEvents: true,
          canModerateContent: false,
          canAccessPremiumFeatures: true,
          canUseSpecialCommands: true,
          maxPrivateChannels: 2
        }),
        privateChannels: JSON.stringify([]),
        requirements: JSON.stringify({
          level: 3,
          kissCoins: 100,
          flameTokens: 5,
          achievements: ['firstSeduction'],
          verificationComplete: true
        }),
        rewards: JSON.stringify({
          dailyKissCoins: 15,
          weeklyFlameTokens: 2,
          experienceBonus: 1.2,
          exclusiveItems: ['charm_boost']
        }),
        priority: 8,
        purchasable: true,
        price: JSON.stringify({
          kissCoins: 250,
          flameTokens: 10,
          gemLust: 0
        }),
        maxMembers: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'tentateur_temeraire',
        displayName: '😈 Tentateur Téméraire',
        description: 'Provocateur audacieux qui repousse toujours les limites du désir',
        emoji: '😈',
        color: '#8B0000',
        nsfw_level: 4,
        permissions: JSON.stringify({
          canAccessPrivateRooms: true,
          canCreateEvents: true,
          canModerateContent: true,
          canAccessPremiumFeatures: true,
          canUseSpecialCommands: true,
          maxPrivateChannels: 3
        }),
        privateChannels: JSON.stringify([]),
        requirements: JSON.stringify({
          level: 4,
          kissCoins: 250,
          flameTokens: 15,
          achievements: ['daredevil'],
          verificationComplete: true
        }),
        rewards: JSON.stringify({
          dailyKissCoins: 20,
          weeklyFlameTokens: 4,
          experienceBonus: 1.3,
          exclusiveItems: ['temptation_aura']
        }),
        priority: 9,
        purchasable: true,
        price: JSON.stringify({
          kissCoins: 500,
          flameTokens: 20,
          gemLust: 0
        }),
        maxMembers: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'aphrodite_amateur',
        displayName: '💖 Aphrodite Amateur',
        description: 'Apprentie de la déesse de l\'amour, rayonnante de charme et de douceur',
        emoji: '💖',
        color: '#FF1493',
        nsfw_level: 2,
        permissions: JSON.stringify({
          canAccessPrivateRooms: true,
          canCreateEvents: false,
          canModerateContent: false,
          canAccessPremiumFeatures: true,
          canUseSpecialCommands: false,
          maxPrivateChannels: 1
        }),
        privateChannels: JSON.stringify([]),
        requirements: JSON.stringify({
          level: 2,
          kissCoins: 75,
          flameTokens: 2,
          achievements: [],
          verificationComplete: true
        }),
        rewards: JSON.stringify({
          dailyKissCoins: 12,
          weeklyFlameTokens: 1,
          experienceBonus: 1.15,
          exclusiveItems: ['love_potion']
        }),
        priority: 10,
        purchasable: false,
        price: JSON.stringify({
          kissCoins: 0,
          flameTokens: 0,
          gemLust: 0
        }),
        maxMembers: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'dionysien_dechaine',
        displayName: '🍾 Dionysien Déchaîné',
        description: 'Esprit festif et débridé, maître des célébrations sensuelles',
        emoji: '🍾',
        color: '#9C27B0',
        nsfw_level: 5,
        permissions: JSON.stringify({
          canAccessPrivateRooms: true,
          canCreateEvents: true,
          canModerateContent: true,
          canAccessPremiumFeatures: true,
          canUseSpecialCommands: true,
          maxPrivateChannels: 4
        }),
        privateChannels: JSON.stringify([]),
        requirements: JSON.stringify({
          level: 5,
          kissCoins: 750,
          flameTokens: 30,
          achievements: ['party_animal'],
          verificationComplete: true
        }),
        rewards: JSON.stringify({
          dailyKissCoins: 28,
          weeklyFlameTokens: 6,
          experienceBonus: 1.45,
          exclusiveItems: ['dionysus_blessing']
        }),
        priority: 11,
        purchasable: true,
        price: JSON.stringify({
          kissCoins: 1000,
          flameTokens: 40,
          gemLust: 1
        }),
        maxMembers: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'eros_emerite',
        displayName: '💘 Éros Émérite',
        description: 'Virtuose de l\'amour et du désir, touché par la flèche divine',
        emoji: '💘',
        color: '#E91E63',
        nsfw_level: 5,
        permissions: JSON.stringify({
          canAccessPrivateRooms: true,
          canCreateEvents: true,
          canModerateContent: true,
          canAccessPremiumFeatures: true,
          canUseSpecialCommands: true,
          maxPrivateChannels: 5
        }),
        privateChannels: JSON.stringify([]),
        requirements: JSON.stringify({
          level: 6,
          kissCoins: 1500,
          flameTokens: 60,
          achievements: ['love_master'],
          verificationComplete: true
        }),
        rewards: JSON.stringify({
          dailyKissCoins: 35,
          weeklyFlameTokens: 8,
          experienceBonus: 1.6,
          exclusiveItems: ['eros_arrow', 'passion_wings']
        }),
        priority: 12,
        purchasable: true,
        price: JSON.stringify({
          kissCoins: 2000,
          flameTokens: 80,
          gemLust: 2
        }),
        maxMembers: 50,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'connaisseur_coquin',
        displayName: '🎭 Connaisseur Coquin',
        description: 'Expert en subtilités érotiques, collectionneur de moments intimes',
        emoji: '🎭',
        color: '#4A148C',
        nsfw_level: 3,
        permissions: JSON.stringify({
          canAccessPrivateRooms: true,
          canCreateEvents: true,
          canModerateContent: false,
          canAccessPremiumFeatures: true,
          canUseSpecialCommands: true,
          maxPrivateChannels: 2
        }),
        privateChannels: JSON.stringify([]),
        requirements: JSON.stringify({
          level: 3,
          kissCoins: 200,
          flameTokens: 10,
          achievements: ['collector'],
          verificationComplete: true
        }),
        rewards: JSON.stringify({
          dailyKissCoins: 18,
          weeklyFlameTokens: 3,
          experienceBonus: 1.25,
          exclusiveItems: ['mystery_mask']
        }),
        priority: 13,
        purchasable: false,
        price: JSON.stringify({
          kissCoins: 0,
          flameTokens: 0,
          gemLust: 0
        }),
        maxMembers: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'passionne_piquant',
        displayName: '🌶️ Passionné Piquant',
        description: 'Flamme ardente qui embrase tout sur son passage',
        emoji: '🌶️',
        color: '#FF5722',
        nsfw_level: 4,
        permissions: JSON.stringify({
          canAccessPrivateRooms: true,
          canCreateEvents: true,
          canModerateContent: true,
          canAccessPremiumFeatures: true,
          canUseSpecialCommands: true,
          maxPrivateChannels: 3
        }),
        privateChannels: JSON.stringify([]),
        requirements: JSON.stringify({
          level: 4,
          kissCoins: 400,
          flameTokens: 20,
          achievements: ['hot_streak'],
          verificationComplete: true
        }),
        rewards: JSON.stringify({
          dailyKissCoins: 22,
          weeklyFlameTokens: 4,
          experienceBonus: 1.35,
          exclusiveItems: ['spicy_aura', 'flame_trail']
        }),
        priority: 14,
        purchasable: false,
        price: JSON.stringify({
          kissCoins: 0,
          flameTokens: 0,
          gemLust: 0
        }),
        maxMembers: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'maestro_desir',
        displayName: '🎨 Maestro du Désir',
        description: 'Artiste suprême de la volupté, créateur d\'expériences sensorielles uniques',
        emoji: '🎨',
        color: '#FF00FF',
        nsfw_level: 5,
        permissions: JSON.stringify({
          canAccessPrivateRooms: true,
          canCreateEvents: true,
          canModerateContent: true,
          canAccessPremiumFeatures: true,
          canUseSpecialCommands: true,
          maxPrivateChannels: 10
        }),
        privateChannels: JSON.stringify([]),
        requirements: JSON.stringify({
          level: 7,
          kissCoins: 3000,
          flameTokens: 150,
          achievements: ['master_artist', 'legend'],
          verificationComplete: true
        }),
        rewards: JSON.stringify({
          dailyKissCoins: 50,
          weeklyFlameTokens: 15,
          experienceBonus: 2.0,
          exclusiveItems: ['maestro_palette', 'desire_brush', 'exclusive_gallery']
        }),
        priority: 15,
        purchasable: true,
        price: JSON.stringify({
          kissCoins: 5000,
          flameTokens: 200,
          gemLust: 5
        }),
        maxMembers: 10,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await queryInterface.bulkInsert('Roles', roles, {
      updateOnDuplicate: ['displayName', 'description', 'emoji', 'color', 'nsfw_level', 
                          'permissions', 'privateChannels', 'requirements', 'rewards', 
                          'priority', 'purchasable', 'price', 'maxMembers', 'isActive', 'updatedAt']
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Roles', null, {});
  }
};
