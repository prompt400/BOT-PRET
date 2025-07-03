# Bot Discord Professionnel

Bot Discord minimaliste avec architecture d'entreprise, conçu pour un déploiement sur Railway.

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
│   ├── services/             # Services (logger, etc.)
│   ├── utilitaires/          # Fonctions utilitaires
│   ├── validateurs/          # Validateurs
│   ├── constantes/           # Constantes
│   ├── config/               # Configuration
│   ├── middleware/           # Middleware (futur)
│   ├── modeles/              # Modèles de données (futur)
│   ├── types/                # Types TypeScript (futur)
│   ├── interfaces/           # Interfaces (futur)
│   ├── decorateurs/          # Décorateurs (futur)
│   └── exceptions/           # Exceptions personnalisées (futur)
├── config/                   # Configuration globale
├── tests/                    # Tests
├── scripts/                  # Scripts utilitaires
├── logs/                     # Logs (généré)
├── donnees/                  # Données persistantes
└── documentation/            # Documentation

```

## 🤖 Commandes

- `/status` - Affiche le statut et les informations du bot

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
- **Logging** : Système de logs complet avec rotation
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
