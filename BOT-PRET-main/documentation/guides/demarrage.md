# Guide de démarrage

## Introduction

Ce guide vous aidera à configurer et démarrer le bot Discord professionnel.

## Prérequis

- Node.js 18.0.0 ou supérieur
- Un compte Discord Developer
- Git (optionnel)

## Étape 1 : Créer une application Discord

1. Aller sur https://discord.com/developers/applications
2. Cliquer sur "New Application"
3. Donner un nom à votre bot
4. Dans l'onglet "Bot", cliquer sur "Add Bot"
5. Copier le token (gardez-le secret !)

## Étape 2 : Inviter le bot

1. Dans l'onglet "OAuth2" > "URL Generator"
2. Cocher "bot" et "applications.commands"
3. Sélectionner les permissions nécessaires
4. Copier l'URL générée et l'ouvrir dans votre navigateur
5. Sélectionner un serveur et inviter le bot

## Étape 3 : Configuration locale

1. Cloner le repository
```bash
git clone [URL_DU_REPO]
cd BOT-PRET-main
```

2. Installer les dépendances
```bash
npm install
```

3. Créer le fichier `.env`
```bash
cp .env.example .env
```

4. Éditer `.env` avec vos valeurs :
```
DISCORD_TOKEN=votre_token_ici
DISCORD_CLIENT_ID=votre_client_id_ici
```

## Étape 4 : Lancement

### Mode développement
```bash
npm run dev
```

### Mode production
```bash
npm start
```

## Étape 5 : Vérification

1. Le bot devrait apparaître en ligne sur Discord
2. Taper `/status` dans un canal
3. Le bot devrait répondre avec ses informations

## Dépannage

### Le bot n'apparaît pas en ligne
- Vérifier le token dans `.env`
- Vérifier les logs dans le dossier `logs/`
- S'assurer que Node.js est à jour

### Les commandes n'apparaissent pas
- Attendre jusqu'à 1 heure (cache Discord)
- Vérifier le CLIENT_ID
- Redémarrer Discord

### Erreurs de permissions
- Vérifier que le bot a les permissions nécessaires
- S'assurer qu'il peut voir et écrire dans le canal

## Prochaines étapes

- Lire la documentation des commandes
- Explorer la structure du code
- Ajouter de nouvelles fonctionnalités
- Déployer sur Railway
