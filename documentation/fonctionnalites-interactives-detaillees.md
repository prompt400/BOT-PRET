# Spécification Complète des Fonctionnalités Interactives par Salon

## Table des Matières
1. [Zone Accueil & Orientation](#zone-accueil--orientation)
2. [Zones Sensuelles](#zones-sensuelles)
3. [Espaces de Jeux & Créations](#espaces-de-jeux--créations)
4. [Salons Secrets & Temporaires](#salons-secrets--temporaires)
5. [Zone Technique & Support](#zone-technique--support)

---

## Zone Accueil & Orientation

### 📋 règles-et-charte
- **Type**: Lecture seule
- **Fonctionnalités**:
  - Message épinglé avec règles du serveur
  - Réaction obligatoire ✅ pour accéder au reste du serveur
- **Triggers Bot**:
  - Détection automatique des nouveaux membres
  - Envoi d'un message privé avec rappel des règles
- **Commandes**: Aucune

### 👋 bienvenue
- **Type**: Messages automatiques uniquement
- **Fonctionnalités**:
  - Message de bienvenue personnalisé pour chaque nouveau membre
  - Affichage du nombre total de membres
  - Présentation interactive avec boutons
- **Triggers Bot**:
  - `guildMemberAdd`: Message de bienvenue avec embed
  - Création automatique du profil utilisateur
  - Attribution du rôle "Nouveau/Nouvelle"
- **Automatisations**:
  - Suppression des anciens messages de bienvenue après 24h
  - Mise à jour du compteur de membres

### 🎭 choix-des-rôles
- **Type**: Réactions uniquement
- **Fonctionnalités**:
  - Panels de sélection de rôles par réaction
  - Catégories: Orientation, Préférences, Centres d'intérêt
- **Commandes**:
  - `/roles orientation`: Choisir son orientation
  - `/roles fun`: Sélectionner des rôles fun
  - `/roles liste`: Voir tous les rôles disponibles
- **Triggers Bot**:
  - Ajout/retrait automatique des rôles selon les réactions
  - Vérification des rôles incompatibles
- **Automatisations**:
  - Mise à jour du profil utilisateur
  - Déblocage de salons selon les rôles choisis

---

## Zones Sensuelles

### 💬 Discussions Générales

#### 🌸 chat-général
- **Accès**: Membres vérifiés
- **Fonctionnalités**:
  - Chat libre avec modération douce
  - Système d'XP activé (15-25 XP par message)
  - Emojis personnalisés du serveur
- **Commandes**:
  - `/status`: Voir son statut et niveau
  - `/badges`: Afficher ses badges
- **Triggers Bot**:
  - Anti-spam (5 messages/10 secondes max)
  - Détection de mots-clés pour XP bonus
  - Niveau up automatique avec notification
- **Automatisations**:
  - Cooldown XP: 1 minute entre gains
  - Attribution de badges selon l'activité

#### 💭 confidences
- **Accès**: Membres vérifiés
- **Fonctionnalités**:
  - Mode slowmode 10 secondes
  - Messages anonymes possibles via bot
  - Réactions limitées aux emojis de soutien
- **Commandes**:
  - `/confession`: Envoyer une confession anonyme
  - `/support`: Demander du soutien en privé
- **Triggers Bot**:
  - Modération renforcée pour contenu sensible
  - Détection de détresse → suggestion d'aide
- **Automatisations**:
  - Suppression optionnelle après 48h
  - Archivage anonyme des confessions populaires

### 🔥 Hot Talks

#### 🌶️ discussions-hot
- **Accès**: Niveau 5+ requis
- **Fonctionnalités**:
  - Contenu NSFW autorisé
  - Media sharing activé
  - Threads automatiques pour conversations longues
- **Commandes**:
  - `/temperature`: Voir le niveau de "hotness" du salon
  - `/ice-breaker`: Obtenir un sujet de conversation hot
- **Triggers Bot**:
  - XP doublé pour participation active
  - Détection de contenu premium → rôle spécial
- **Automatisations**:
  - Rotation des sujets hot toutes les 6h
  - Events "Happy Hour" avec XP triplé

#### 🔞 after-dark
- **Accès**: Niveau 10+ ET rôle 18+ vérifié
- **Fonctionnalités**:
  - Salon privé ultra-exclusif
  - Commandes spéciales débloquées
  - Pas de logs publics
- **Commandes**:
  - `/vip-game`: Jeux exclusifs VIP
  - `/private-room`: Créer un salon privé temporaire
- **Triggers Bot**:
  - Vérification d'âge stricte
  - Mode "incognito" activable
- **Automatisations**:
  - Purge automatique des messages après 7 jours
  - Rotation des accès VIP mensuels

---

## Espaces de Jeux & Créations

### 🎲 Jeux et Défis

#### 🎯 action-ou-vérité
- **Type**: Jeu interactif
- **Fonctionnalités**:
  - Système de tours automatisé
  - Niveaux de difficulté (Soft/Medium/Hard/Extreme)
  - Points et récompenses
- **Commandes**:
  - `/aov start`: Lancer une partie
  - `/aov join`: Rejoindre la partie en cours
  - `/aov spin`: Faire tourner la bouteille
  - `/aov dare [niveau]`: Proposer un défi
  - `/aov truth [niveau]`: Proposer une vérité
- **Triggers Bot**:
  - Tour automatique toutes les 2 minutes
  - Attribution de points selon participation
  - Badges spéciaux pour défis complétés
- **Automatisations**:
  - Classement hebdomadaire
  - Récompenses automatiques top 3
  - Archive des meilleurs moments

#### 🎰 jeux-hasard
- **Type**: Casino virtuel
- **Fonctionnalités**:
  - Monnaie virtuelle du serveur
  - Mini-jeux: Slots, Blackjack, Roulette
  - Jackpot progressif
- **Commandes**:
  - `/casino balance`: Voir son solde
  - `/casino daily`: Réclamer bonus quotidien
  - `/casino slot [mise]`: Machine à sous
  - `/casino blackjack [mise]`: Partie de blackjack
  - `/casino roulette [type] [mise]`: Roulette
  - `/casino leaderboard`: Classement des plus riches
- **Triggers Bot**:
  - Bonus de connexion quotidienne
  - Jackpot annoncé à chaque palier
  - Protection anti-addiction (limites de mise)
- **Automatisations**:
  - Reset hebdomadaire avec bonus
  - Events casino double gains
  - Distribution de jetons gratuits aux actifs

#### 🏆 défis-quotidiens
- **Type**: Système de quêtes
- **Fonctionnalités**:
  - 3 défis par jour (Facile/Moyen/Difficile)
  - Défis hebdomadaires et mensuels
  - Système de streak
- **Commandes**:
  - `/defi list`: Voir les défis du jour
  - `/defi claim [id]`: Valider un défi complété
  - `/defi progress`: Voir sa progression
  - `/defi streak`: Voir sa série en cours
- **Triggers Bot**:
  - Reset automatique à minuit
  - Notification des nouveaux défis
  - Validation automatique de certains défis
- **Automatisations**:
  - XP et récompenses selon difficulté
  - Bonus de streak (7/30/100 jours)
  - Défis spéciaux événementiels

#### 🎪 animations-events
- **Type**: Hub d'événements
- **Fonctionnalités**:
  - Calendrier des events
  - Inscriptions aux tournois
  - Mini-events spontanés
- **Commandes**:
  - `/event list`: Voir les events à venir
  - `/event join [id]`: S'inscrire à un event
  - `/event host`: Proposer un event (niveau 10+)
  - `/event vote`: Voter pour le prochain event
- **Triggers Bot**:
  - Rappels automatiques avant events
  - Attribution de rôles temporaires pour participants
  - Récompenses automatiques post-event
- **Automatisations**:
  - Events récurrents programmés
  - Création de salons temporaires pour events
  - Système de brackets pour tournois

### 🎭 Roleplay (RP)

#### 📜 création-personnages
- **Type**: Création et gestion de personnages
- **Fonctionnalités**:
  - Fiches de personnages interactives
  - Galerie de personnages
  - Validation par la modération
- **Commandes**:
  - `/rp create`: Créer un nouveau personnage
  - `/rp edit [nom]`: Modifier un personnage
  - `/rp list`: Voir ses personnages
  - `/rp switch [nom]`: Changer de personnage actif
  - `/rp gallery`: Parcourir les personnages publics
- **Triggers Bot**:
  - Validation automatique des fiches complètes
  - Attribution du rôle RP
  - Notification des mises à jour
- **Automatisations**:
  - Template de fiche pré-rempli
  - Génération d'ID unique par personnage
  - Archivage des anciennes versions

#### 🏰 scénarios-publics
- **Type**: RP ouvert
- **Fonctionnalités**:
  - Scénarios rotatifs
  - Système de narration
  - Dice rolls intégrés
- **Commandes**:
  - `/scenario start [theme]`: Lancer un scénario
  - `/scenario join`: Rejoindre le scénario actif
  - `/roll [dés]`: Lancer des dés (ex: 2d6+3)
  - `/narrator [texte]`: Mode narrateur (modos)
- **Triggers Bot**:
  - Formatage automatique des actions (*action*)
  - Détection des dialogues et formatting
  - Logs de RP pour archives
- **Automatisations**:
  - Rotation des thèmes tous les 3 jours
  - Sauvegarde automatique des scénarios terminés
  - Attribution de points RP

#### 🗝️ rp-privés
- **Type**: Système de tickets
- **Fonctionnalités**:
  - Création de salons privés temporaires
  - Invitations de partenaires RP
  - Durée personnalisable
- **Commandes**:
  - `/rp-prive create [titre]`: Créer un RP privé
  - `/rp-prive invite @user`: Inviter quelqu'un
  - `/rp-prive close`: Fermer et archiver
  - `/rp-prive extend [heures]`: Prolonger la durée
- **Triggers Bot**:
  - Création automatique du salon privé
  - Permissions automatiques pour invités
  - Avertissement avant expiration
- **Automatisations**:
  - Suppression après inactivité (configurable)
  - Archivage optionnel en fichier texte
  - Limite de salons privés simultanés

### 🎨 Créations & Partages

#### 📸 photos-selfies
- **Accès**: Membres vérifiés
- **Fonctionnalités**:
  - Galerie photo avec réactions
  - Système de vote mensuel
  - Filtre automatique NSFW
- **Commandes**:
  - `/photo submit`: Guide de soumission
  - `/photo contest`: Participer au concours mensuel
  - `/photo top`: Voir les photos populaires
- **Triggers Bot**:
  - Vérification automatique du contenu
  - Attribution d'XP pour partages
  - Badge "Photographe" après 10 partages
- **Automatisations**:
  - Concours photo mensuel automatique
  - Rôle "Photo du mois" temporaire
  - Galerie best-of générée

---

## Salons Secrets & Temporaires

### 🗝️ Salons Secrets

#### 🌟 vip-lounge
- **Accès**: Niveau 10+ automatique
- **Fonctionnalités**:
  - Commandes VIP exclusives
  - Previews des nouvelles features
  - Events VIP only
- **Commandes**:
  - `/vip perks`: Voir les avantages VIP
  - `/vip invite`: Inviter temporairement (1h)
  - `/vip flex`: Afficher son statut VIP ailleurs
- **Triggers Bot**:
  - Message de bienvenue personnalisé VIP
  - XP boosté permanent (+50%)
  - Accès prioritaire aux events
- **Automatisations**:
  - Vérification quotidienne du niveau
  - Rotation des perks VIP mensuels
  - Sondages exclusifs VIP

#### 💎 cercle-privilège
- **Accès**: Niveau 20+ Elite only
- **Fonctionnalités**:
  - Salon ultra-privé
  - Décisions serveur
  - Beta testing
- **Commandes**:
  - `/elite vote [proposition]`: Voter sur les décisions
  - `/elite suggest`: Proposer des changements majeurs
  - `/elite crown`: Afficher sa couronne Elite
- **Triggers Bot**:
  - Notifications des votes importants
  - Rôle décisionnel dans la modération
  - Accès aux logs de modération
- **Automatisations**:
  - Réunions Elite bi-mensuelles
  - Rapport d'activité serveur exclusif
  - Attribution de "Elite du mois"

#### 🔐 salons-mystères
- **Accès**: Quêtes spéciales requises
- **Fonctionnalités**:
  - Énigmes et puzzles
  - ARG (Alternate Reality Game)
  - Récompenses uniques
- **Commandes**:
  - `/mystery hint`: Obtenir un indice (1/jour)
  - `/mystery solve [réponse]`: Proposer une solution
  - `/mystery progress`: Voir sa progression
- **Triggers Bot**:
  - Indices cachés dans d'autres salons
  - Déblocage progressif de salles
  - Events mystères aléatoires
- **Automatisations**:
  - Rotation des mystères mensuels
  - Collaboration requise entre joueurs
  - Trophées permanents pour résolution

### ⏳ Salons Temporaires

#### 🎪 événements-spéciaux
- **Type**: Event-driven
- **Durée**: Variable (1h à 1 semaine)
- **Fonctionnalités**:
  - Configuration dynamique selon event
  - Rôles et permissions temporaires
  - Récompenses limitées
- **Commandes**:
  - `/event-temp info`: Infos sur l'event actuel
  - `/event-temp participate`: S'inscrire/participer
  - `/event-temp leaderboard`: Classement live
- **Triggers Bot**:
  - Ouverture/fermeture automatique
  - Notifications de début/fin
  - Distribution de récompenses
- **Automatisations**:
  - Planification via calendrier
  - Thèmes saisonniers automatiques
  - Archive post-event

#### 💫 pop-up-rooms
- **Type**: Salons vocaux à la demande
- **Fonctionnalités**:
  - Création instantanée
  - Personnalisation du nom
  - Limite d'utilisateurs configurable
- **Commandes**:
  - `/popup create [nom]`: Créer un salon
  - `/popup limit [nombre]`: Définir la limite
  - `/popup lock`: Verrouiller l'accès
  - `/popup transfer @user`: Transférer la propriété
- **Triggers Bot**:
  - Suppression si vide pendant 5 minutes
  - Notification avant suppression
  - Logs de création/suppression
- **Automatisations**:
  - Limite de 5 pop-up simultanés
  - Noms par défaut si non spécifié
  - Statistiques d'utilisation

#### 🌠 salons-éphémères
- **Type**: Autodestruction programmée
- **Durée**: 24h par défaut
- **Fonctionnalités**:
  - Compte à rebours visible
  - Sauvegarde optionnelle avant suppression
  - Thèmes quotidiens
- **Commandes**:
  - `/ephemere create [durée]`: Créer (max 72h)
  - `/ephemere save`: Sauvegarder le contenu
  - `/ephemere extend`: Prolonger (+24h max)
- **Triggers Bot**:
  - Avertissements à -1h, -10min
  - Sauvegarde automatique si activée
  - Transfert des utilisateurs avant suppression
- **Automatisations**:
  - Thème du jour automatique
  - Génération de transcript
  - Recyclage des meilleurs éphémères

---

## Zone Technique & Support

### 🛠️ support-technique
- **Type**: Système de tickets
- **Fonctionnalités**:
  - Tickets catégorisés
  - File d'attente prioritaire
  - Base de connaissances intégrée
- **Commandes**:
  - `/ticket create [catégorie]`: Ouvrir un ticket
  - `/ticket close [raison]`: Fermer son ticket
  - `/ticket add @user`: Ajouter quelqu'un au ticket
  - `/faq [recherche]`: Chercher dans la FAQ
- **Triggers Bot**:
  - Attribution automatique au staff disponible
  - Escalade après 30min sans réponse
  - Satisfaction survey après fermeture
- **Automatisations**:
  - Réponses automatiques FAQ
  - Statistiques de résolution
  - Archive des tickets résolus

### 💡 suggestions
- **Type**: Boîte à idées
- **Fonctionnalités**:
  - Votes communautaires
  - Statuts de suggestion
  - Récompenses pour suggestions acceptées
- **Commandes**:
  - `/suggest [idée]`: Soumettre une suggestion
  - `/suggest status [id]`: Voir le statut
  - `/suggest top`: Top suggestions du mois
- **Triggers Bot**:
  - Création de thread pour discussion
  - Notification staff à 20 votes
  - Mise à jour de statut automatique
- **Automatisations**:
  - Review hebdomadaire par staff
  - Implementation tracking
  - Rewards pour contributeurs actifs

### 🐛 signaler-bug
- **Type**: Bug tracking
- **Fonctionnalités**:
  - Formulaire de bug structuré
  - Priorités et tags
  - Suivi de résolution
- **Commandes**:
  - `/bug report`: Signaler un bug
  - `/bug track [id]`: Suivre un bug
  - `/bug list`: Voir les bugs connus
- **Triggers Bot**:
  - Confirmation de réception
  - Attribution selon la gravité
  - Notification de résolution
- **Automatisations**:
  - Détection de doublons
  - Escalade des bugs critiques
  - Changelog automatique

### 📊 sondages-feedback
- **Type**: Feedback et analytics
- **Fonctionnalités**:
  - Sondages multi-choix
  - Résultats en temps réel
  - Anonymat optionnel
- **Commandes**:
  - `/poll create`: Créer un sondage (staff)
  - `/poll vote [id] [choix]`: Voter
  - `/poll results [id]`: Voir les résultats
  - `/feedback [texte]`: Feedback libre
- **Triggers Bot**:
  - Rappels de participation
  - Clôture automatique programmée
  - Génération de rapports
- **Automatisations**:
  - Sondages récurrents mensuels
  - Export des données
  - Tableau de bord analytics

---

## Système Global d'Automatisation

### Progression et Niveaux
```javascript
const progressionSystem = {
  xp: {
    messageBase: { min: 15, max: 25 },
    bonuses: {
      mediaShare: 50,
      eventParticipation: 100,
      dailyStreak: 75,
      roleplayPost: 40,
      helpfulReaction: 10
    },
    cooldown: 60 // secondes
  },
  levels: {
    formula: (level) => level * level * 100,
    rewards: {
      5: { roles: ['Habitué(e)'], unlock: ['hot-talks'] },
      10: { roles: ['VIP'], unlock: ['vip-lounge', 'after-dark'] },
      15: { roles: ['Veteran'], perks: ['custom-emoji', 'nickname-color'] },
      20: { roles: ['Elite'], unlock: ['cercle-privilege'], perks: ['all'] }
    }
  }
};
```

### Events Automatiques Programmés
```javascript
const scheduledEvents = {
  daily: {
    '00:00': 'resetDailyQuests',
    '12:00': 'lunchTimeBonus',
    '19:00': 'happyHourStart',
    '21:00': 'happyHourEnd'
  },
  weekly: {
    'monday-09:00': 'weeklyLeaderboardReset',
    'friday-20:00': 'weekendEventStart',
    'sunday-23:00': 'weekendEventEnd'
  },
  monthly: {
    '1st-00:00': 'monthlyRewards',
    '15th-12:00': 'midMonthSurvey',
    'last-20:00': 'monthlyContestResults'
  }
};
```

### Système de Badges et Achievements
```javascript
const achievementSystem = {
  categories: {
    social: {
      firstMessage: { name: 'Première Parole', condition: 'messages >= 1' },
      socialButterfly: { name: 'Papillon Social', condition: 'uniqueChannels >= 10' },
      popularPerson: { name: 'Populaire', condition: 'reactions >= 100' }
    },
    gaming: {
      gamer: { name: 'Joueur', condition: 'gamesPlayed >= 10' },
      winner: { name: 'Gagnant', condition: 'gamesWon >= 5' },
      champion: { name: 'Champion', condition: 'tournamentWins >= 1' }
    },
    creative: {
      artist: { name: 'Artiste', condition: 'creativeShares >= 5' },
      photographer: { name: 'Photographe', condition: 'photoShares >= 10' },
      writer: { name: 'Écrivain', condition: 'storyShares >= 3' }
    },
    loyalty: {
      veteran: { name: 'Vétéran', condition: 'daysActive >= 30' },
      dedicated: { name: 'Dévoué', condition: 'dailyStreak >= 7' },
      legend: { name: 'Légende', condition: 'daysActive >= 365' }
    }
  }
};
```

### Configuration des Permissions Dynamiques
```javascript
const dynamicPermissions = {
  levelBased: {
    5: ['VIEW_CHANNEL:hot-talks', 'SEND_MESSAGES:hot-talks'],
    10: ['VIEW_CHANNEL:vip-lounge', 'VIEW_CHANNEL:after-dark'],
    20: ['VIEW_CHANNEL:cercle-privilege', 'MANAGE_MESSAGES:public']
  },
  roleBased: {
    'verified': ['SEND_MESSAGES:general', 'ADD_REACTIONS:all'],
    '18+verified': ['VIEW_CHANNEL:nsfw-zones', 'ATTACH_FILES:nsfw-zones'],
    'creator': ['ATTACH_FILES:creative', 'CREATE_THREADS:creative'],
    'vip': ['USE_EXTERNAL_EMOJIS:all', 'CHANGE_NICKNAME:self']
  },
  conditional: {
    'eventParticipant': { during: 'event', permissions: ['SPEAK:event-voice'] },
    'tempVIP': { duration: '24h', permissions: ['VIEW_CHANNEL:vip-lounge'] }
  }
};
```

---

Cette documentation couvre l'ensemble des fonctionnalités interactives pour chaque salon du serveur Discord, avec tous les détails sur les commandes, triggers bot, et systèmes d'automatisation.
