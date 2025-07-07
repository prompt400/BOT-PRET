# Bot Discord Professionnel

Bot Discord minimaliste avec architecture d'entreprise, conçu pour un déploiement sur Railway.

## 🚀 Installation

### Prérequis

- Node.js 18.0.0 ou supérieur
- Un token Discord Bot
- Un Client ID Discord

### Installation locale

1. Cloner le repository
2. Installer les dépendances :
```bash
npm install
```
3. Créer un fichier `.env` à la racine avec :
```env
DISCORD_TOKEN=votre_token_ici
DISCORD_CLIENT_ID=votre_client_id_ici
```
4. Lancer le bot :
```bash
npm start
```

## 🚄 Déploiement Railway

Ce bot est prêt pour un déploiement direct sur Railway :

1. Connecter votre repository GitHub à Railway
2. Ajouter les variables d'environnement dans Railway :
   - `DISCORD_TOKEN`
   - `DISCORD_CLIENT_ID`
3. Déployer

## 🤖 Commandes

### `/status`
Affiche le statut et les informations du bot :
- État du bot (en ligne)
- Latence de l'API Discord
- Nombre de serveurs
- Nombre d'utilisateurs
- Utilisation mémoire
- Temps de fonctionnement
