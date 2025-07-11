# Bot Discord

Un bot Discord moderne utilisant Discord.js v14 avec support des commandes slash.

## 🚀 Fonctionnalités

- ✅ Commandes slash (Slash Commands)
- ✅ Architecture modulaire
- ✅ Gestion des erreurs robuste
- ✅ Système de logs intégré
- ✅ Déploiement automatique des commandes

## 📋 Prérequis

- Node.js 16.9.0 ou supérieur
- npm ou yarn
- Un bot Discord créé sur [Discord Developer Portal](https://discord.com/developers/applications)

## 🛠️ Installation

### 1. Cloner le repository

```bash
git clone <votre-repo>
cd BOT-PRET-main
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configuration

1. Copier le fichier `.env.example` en `.env` :
   ```bash
   cp .env.example .env
   ```

2. Remplir les variables d'environnement dans `.env` :
   - `DISCORD_TOKEN` : Le token de votre bot (obtenu depuis Discord Developer Portal)
   - `CLIENT_ID` : L'ID de votre application Discord

### 4. Lancer le bot en local

```bash
npm start
```

## 📁 Structure du projet

```
BOT-PRET-main/
├── commands/           # Dossier contenant les commandes du bot
├── index.js           # Point d'entrée principal
├── package.json       # Dépendances et scripts
├── .env.example       # Template des variables d'environnement
├── .gitignore        # Fichiers à ignorer par Git
├── railway.json      # Configuration Railway
└── README.md         # Ce fichier
```

## 🚀 Déploiement sur Railway

### 1. Préparer le déploiement

1. Créer un compte sur [Railway](https://railway.app)
2. Créer un nouveau projet
3. Connecter votre repository GitHub

### 2. Configurer les variables d'environnement

Dans Railway, ajouter les variables d'environnement suivantes :
- `DISCORD_TOKEN` : Votre token Discord
- `CLIENT_ID` : L'ID de votre application Discord

### 3. Déployer

Railway déploiera automatiquement votre bot à chaque push sur la branche principale.

## 🔧 Commandes disponibles

- `npm start` : Démarre le bot
- `npm run dev` : Démarre le bot en mode développement (si configuré)

## 📝 Créer une nouvelle commande

Pour ajouter une nouvelle commande, créez un fichier dans le dossier `commands/` :

```javascript
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('nom-commande')
        .setDescription('Description de la commande'),
    
    async execute(interaction) {
        await interaction.reply('Réponse de la commande');
    },
};
```

## 🐛 Résolution des problèmes

### Le bot ne se connecte pas
- Vérifiez que `DISCORD_TOKEN` et `CLIENT_ID` sont correctement définis
- Assurez-vous que le token est valide et n'a pas expiré

### Les commandes ne s'affichent pas
- Les commandes peuvent prendre jusqu'à 1 heure pour se propager globalement
- Vérifiez les logs pour d'éventuelles erreurs

## 📄 Licence

Ce projet est sous licence MIT.

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.
