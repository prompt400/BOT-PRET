# Bot Discord Pro

Un bot Discord moderne, optimisé et professionnel utilisant Discord.js v14.

## 🚀 Fonctionnalités

- ✅ **Commandes Slash** : Intégration complète avec l'API Discord
- ✅ **Architecture Modulaire** : Facile à maintenir et à étendre
- ✅ **Gestion des Erreurs Robuste** : Captures d'erreurs et réponses claires
- ✅ **Déploiement Automatisé** : Intégration continue avec Railway
- ✅ **Code Propre et Optimisé** : Respect des bonnes pratiques et standards modernes

## 📋 Prérequis

- **Node.js** : v18.x ou supérieur
- **Compte Discord** et un bot créé sur le [Portail Développeur Discord](https://discord.com/developers/applications)

## 🛠️ Installation Locale

1.  **Cloner le repository** :
    ```bash
    git clone <votre-repo>
    cd BOT-PRET-main
    ```

2.  **Installer les dépendances** :
    ```bash
    npm install
    ```

3.  **Configurer les variables d'environnement** :
    - Copier `.env.example` en `.env`
    - Remplir `DISCORD_TOKEN` et `DISCORD_CLIENT_ID`

4.  **Démarrer le bot** :
    ```bash
    npm start
    ```

## 🚀 Déploiement sur Railway

1.  **Forker le repository** sur votre compte GitHub.
2.  **Créer un nouveau projet** sur [Railway](https://railway.app) et le lier à votre fork.
3.  **Configurer les variables d'environnement** dans l'interface Railway :
    - `DISCORD_TOKEN`
    - `DISCORD_CLIENT_ID`
4.  Railway déploiera automatiquement à chaque `git push`.

## 📁 Structure du Projet

- `commands/` : Contient toutes les commandes slash
- `index.js` : Point d'entrée principal du bot
- `package.json` : Dépendances et scripts
- `railway.json` : Configuration de déploiement Railway
- `nixpacks.toml` : Configuration de build Nixpacks
- `.gitignore` : Fichiers ignorés par Git

## 📝 Créer une Nouvelle Commande

1.  Créer un fichier dans `commands/` (e.g., `salut.js`).
2.  Utiliser la structure suivante :

```javascript
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('salut')
        .setDescription('Dit bonjour !'),
    async execute(interaction) {
        await interaction.reply('Bonjour !');
    },
};
```

## 🤝 Contribution

Les contributions sont les bienvenues. N'hésitez pas à ouvrir une issue ou une pull request pour suggérer des améliorations.
