# Bot Discord Professionnel - BOT-PRET

Bot Discord d'entreprise avec architecture modulaire, conçu pour un déploiement sur Railway.

## 🚀 Démarrage Rapide

### Prérequis

- Node.js 18.0.0 ou supérieur
- Un token Discord Bot
- Un Client ID Discord

### Installation

1. Cloner le repository
2. Installer les dépendances :
```bash
npm install
```

### Configuration

Créer un fichier `.env` à la racine avec :
```env
DISCORD_TOKEN=votre_token_ici
DISCORD_CLIENT_ID=votre_client_id_ici
```

### Lancement

```bash
npm start
```

## 📁 Structure du Projet

```
.
├── src/
│   ├── index.js              # Point d'entrée
│   ├── client.js             # Client Discord personnalisé
│   ├── commandes/            # Commandes slash
│   ├── evenements/           # Événements Discord
│   ├── gestionnaires/        # Gestionnaires (commandes, événements)
│   ├── services/             # Services (logger, healthcheck)
│   ├── utilitaires/          # Fonctions utilitaires
│   ├── validateurs/          # Validateurs
│   ├── constantes/           # Constantes
│   └── config/               # Configuration
├── scripts/                  # Scripts utilitaires
├── package.json              # Dépendances
├── railway.json              # Configuration Railway
└── README.md                 # Documentation
```

## 🤖 Commandes Disponibles

### Commandes Système
- `/status` - Affiche le statut et les informations du bot
- `/badges` - Affiche vos badges ou ceux d'un autre membre
- `/roles` - Gestion des rôles (orientation, fun, progression, liste)

### 🎮 Jeux et Divertissement

#### Action ou Vérité (`/aov`)
- `/aov start` - Démarrer une nouvelle partie
- `/aov join` - Rejoindre la partie en cours
- `/aov spin` - Faire tourner la bouteille
- `/aov dare [niveau]` - Proposer une action (soft/medium/hard/extreme)
- `/aov truth [niveau]` - Proposer une vérité (soft/medium/hard/extreme)

#### Casino Virtuel (`/casino`)
- `/casino balance` - Voir votre solde
- `/casino daily` - Réclamer votre bonus quotidien (500-1000 jetons)
- `/casino slot [mise]` - Machine à sous (mise: 10-1000)
- `/casino blackjack [mise]` - Jouer au blackjack (mise: 50-5000)
- `/casino roulette [type] [mise]` - Roulette (rouge/noir/pair/impair/numéro)
- `/casino leaderboard` - Top 10 des joueurs les plus riches

#### Défis Quotidiens (`/defi`)
- `/defi list` - Voir les 3 défis du jour (facile/moyen/difficile)
- `/defi claim [id]` - Valider un défi complété
- `/defi progress` - Voir votre progression détaillée
- `/defi streak` - Voir votre série et les bonus associés

### 🏠 Salons Temporaires (`/salon-temp`)

#### Salons Personnalisés
- `/salon-temp creer [nom] [type] [duree] [prive?]` - Créer un salon (1-72h)
- `/salon-temp inviter @user` - Inviter quelqu'un dans votre salon
- `/salon-temp fermer` - Fermer votre salon temporaire

#### Salons Instantanés
- `/salon-temp popup [nom?] [limite?]` - Salon vocal auto-supprimé si vide
- `/salon-temp ephemere [inactivite]` - Salon texte auto-détruit après X minutes d'inactivité

## 🎯 Fonctionnalités Interactives par Zone

### Zone Accueil & Orientation
- **Système de rôles par réaction** - Sélection automatique
- **Messages de bienvenue personnalisés** - Avec compteur de membres
- **Vérification obligatoire** - Acceptation des règles pour accès

### Zones Sensuelles
- **Système d'XP** - 15-25 XP par message avec cooldown
- **Progression par niveaux** - Déblocage de salons selon le niveau
- **Mode confession anonyme** - Messages anonymes via bot
- **Happy Hours** - XP doublé/triplé à certaines heures

### Espaces de Jeux
- **Points et classements** - Système de score global
- **Récompenses automatiques** - XP, badges, jetons casino
- **Events programmés** - Tournois, concours, animations
- **Achievements débloquables** - Plus de 20 badges à collectionner

### Salons Secrets
- **VIP Lounge** - Accès automatique niveau 10+
- **Cercle Privilège** - Réservé aux Elite niveau 20+
- **Salons Mystères** - Déblocage par quêtes spéciales

## 📊 Système de Progression

### Niveaux et Récompenses
- **Niveau 0-4** : Nouveau/Nouvelle - Accès de base
- **Niveau 5-9** : Habitué(e) - Déblocage Hot Talks
- **Niveau 10-19** : VIP - Accès VIP Lounge + After Dark
- **Niveau 20+** : Elite - Tous les privilèges

### Formule XP
- Messages : 15-25 XP (cooldown 60s)
- Partage média : +50 XP
- Participation event : +100 XP
- Création contenu : +200 XP
- Défis quotidiens : 30-1000 XP

## 🧹 Nettoyage des commandes

Pour nettoyer toutes les commandes fantômes et ne garder que `/status` :

```bash
npm run clean-commands
```

Ce script supprime toutes les commandes enregistrées (globales et par serveur) et ne ré-enregistre que la commande `/status`.

**Note** : Discord peut prendre jusqu'à 1 heure pour actualiser son cache. Pour forcer l'actualisation, redémarrez Discord (Ctrl+R sur Windows/Linux, Cmd+R sur Mac).

## 🚄 Déploiement Railway

Ce bot est prêt pour un déploiement direct sur Railway :

1. Connecter votre repository GitHub à Railway
2. Ajouter les variables d'environnement dans Railway :
   - `DISCORD_TOKEN`
   - `DISCORD_CLIENT_ID`
3. Déployer

## 📝 Architecture

- **Modulaire** : Chaque fonctionnalité est isolée dans son propre module
- **Scalable** : Structure permettant l'ajout facile de nouvelles fonctionnalités
- **Professionnelle** : Patterns de développement d'entreprise
- **ES6 Modules** : Utilisation des modules JavaScript modernes
- **Logging** : Système de logs complet
- **Health Check** : Endpoint de santé pour Railway
- **Gestion d'erreurs** : Gestion centralisée des erreurs

## 🔒 Sécurité

- Validation des variables d'environnement au démarrage
- Gestion sécurisée des tokens
- Logs détaillés pour le debugging
- Gestion des erreurs robuste

## 📦 Dépendances

- `discord.js` ^14.14.1 - Library Discord
- `dotenv` ^16.3.1 - Gestion des variables d'environnement

## 📄 Licence

Propriétaire - Tous droits réservés

<!-- Déploiement réparé le 06/07/2025 -->
<!-- Test de déploiement automatique - 07/01/2025 -->
<!-- Vérification webhook Railway -->
<!-- Déploiement automatique confirmé - 07/01/2025 ✅ -->
