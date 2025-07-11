# Bot Discord Minimal 🤖

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app)

Bot Discord minimaliste et professionnel, prêt pour production.

## ⚡ Installation

```bash
# Cloner le repo
git clone [votre-repo]
cd bot-discord

# Installer
npm install

# Configurer
cp .env.example .env
# Éditer .env avec vos tokens

# Lancer
npm start
```

## 🔧 Configuration

**Variables requises:**
- `DISCORD_TOKEN` - Token du bot
- `DISCORD_CLIENT_ID` - ID client Discord

## 📦 Commandes

- `/status` - Affiche le statut du bot
- `/reset-serveur` - Réinitialise les paramètres du serveur (uniquement pour les administrateurs). Cette commande supprimera tous les rôles (sauf '@everyone'), ainsi que toutes les catégories et canaux (texte, vocaux, stage, forum).

## 🚀 Railway

1. Fork ce repo
2. Déployer sur Railway
3. Ajouter les variables d'environnement
4. C'est tout!

---

Bot minimal, code propre, prêt pour vos projets.
