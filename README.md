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

## 🤖 Commandes

- `/status` - Affiche le statut et les informations du bot

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
