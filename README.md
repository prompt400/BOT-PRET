# BOT-PRET Discord

## ⚠️ SÉCURITÉ IMPORTANTE

**Le token Discord a été exposé et doit être régénéré immédiatement !**

### Actions urgentes à effectuer :

1. **Régénérer le token Discord**
   - Aller sur https://discord.com/developers/applications
   - Sélectionner votre application
   - Aller dans l'onglet "Bot"
   - Cliquer sur "Reset Token"
   - Copier le nouveau token

2. **Mettre à jour le token sur Railway**
   - Aller dans les variables d'environnement du service sur Railway
   - Remplacer la valeur de `DISCORD_TOKEN` par le nouveau token
   - Redéployer le service

3. **Ne jamais exposer le token**
   - Ne pas le commiter dans le code
   - Utiliser uniquement les variables d'environnement

## Installation locale

```bash
# Cloner le repository
git clone https://github.com/prompt400/BOT-PRET.git
cd BOT-PRET

# Installer les dépendances
npm install

# Copier le fichier d'environnement
cp .env.example .env

# Éditer .env avec vos valeurs
# Lancer le bot
npm start
```

## Déploiement sur Railway

1. Connecter le repository GitHub à Railway
2. Configurer les variables d'environnement
3. Déployer

## Structure corrigée

- ✅ `package.json` déplacé à la racine
- ✅ Configuration Railway mise à jour
- ✅ Variables d'environnement documentées
- ✅ Fichier .gitignore ajouté

## Support

Pour toute question, ouvrir une issue sur GitHub.