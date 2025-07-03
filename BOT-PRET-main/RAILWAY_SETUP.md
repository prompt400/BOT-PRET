# Configuration Railway pour BOT-PRET

## Variables d'environnement requises sur Railway

### Variables Discord (OBLIGATOIRES)
```
DISCORD_TOKEN=votre_token_bot_discord
CLIENT_ID=votre_client_id_discord
```

### Variables Discord optionnelles
```
GUILD_ID=id_du_serveur_discord (pour les commandes de guilde)
```

### Configuration du bot
```
NODE_ENV=production
LOG_LEVEL=info
BOT_PREFIX=!
```

### Fonctionnalités
```
ENABLE_TICKETS=true
ENABLE_LOGGING=true
ENABLE_AUTOMOD=false
```

### Système de tickets
```
TICKET_CATEGORY_ID=(laissez vide pour création automatique)
SUPPORT_ROLE_ID=id_du_role_support
MAX_OPEN_TICKETS_PER_USER=1
TICKET_INACTIVE_HOURS=24
```

### Variables PostgreSQL (déjà configurées par Railway)
Les variables suivantes sont automatiquement configurées par Railway :
- `DATABASE_URL`
- `PGHOST`
- `PGPORT`
- `PGDATABASE`
- `PGUSER`
- `PGPASSWORD`

**IMPORTANT** : Le bot est déjà configuré pour utiliser ces variables automatiquement.

### Variables optionnelles

#### Redis (pour le cache - optionnel)
```
REDIS_URL=redis://default:password@host:port
```

#### Sentry (monitoring - optionnel)
```
SENTRY_DSN=votre_dsn_sentry
```

## Instructions de déploiement

1. **Forker ou cloner le repository sur GitHub**

2. **Créer un nouveau projet sur Railway**
   - Connectez-vous à Railway
   - Cliquez sur "New Project"
   - Choisissez "Deploy from GitHub repo"
   - Sélectionnez votre repository

3. **Ajouter PostgreSQL**
   - Dans votre projet Railway, cliquez sur "New"
   - Sélectionnez "Database" > "Add PostgreSQL"
   - Railway configurera automatiquement les variables de connexion

4. **Configurer les variables d'environnement**
   - Allez dans l'onglet "Variables" de votre service
   - Ajoutez les variables Discord obligatoires
   - Configurez les autres variables selon vos besoins

5. **Déployer**
   - Railway déploiera automatiquement votre bot
   - Les migrations de base de données s'exécuteront automatiquement
   - Les commandes Discord seront déployées automatiquement

## Vérification du déploiement

1. **Logs**
   - Vérifiez les logs dans l'onglet "Logs" de Railway
   - Vous devriez voir "Bot started successfully"

2. **Health Check**
   - Le bot expose un endpoint `/health` sur le port configuré
   - Railway utilisera cet endpoint pour vérifier la santé du service

3. **Base de données**
   - Les tables seront créées automatiquement
   - Vérifiez dans l'onglet "Data" de votre base PostgreSQL

## Dépannage

### Le bot ne se connecte pas à Discord
- Vérifiez que `DISCORD_TOKEN` est correct
- Assurez-vous que le bot a été invité sur votre serveur

### Erreurs de base de données
- Les variables PostgreSQL sont automatiquement configurées par Railway
- Le bot gère automatiquement la reconnexion en cas de perte de connexion

### Les commandes ne fonctionnent pas
- Attendez quelques minutes après le déploiement
- Pour les commandes globales, cela peut prendre jusqu'à 1 heure
- Utilisez `GUILD_ID` pour un déploiement instantané sur un serveur spécifique

### Limites de mémoire
- Le bot est optimisé pour fonctionner avec 512MB de RAM
- Si nécessaire, augmentez les ressources dans Railway

## Maintenance

### Mise à jour du bot
- Poussez vos changements sur GitHub
- Railway redéploiera automatiquement

### Migrations de base de données
- Les nouvelles migrations s'exécutent automatiquement au démarrage
- Placez les fichiers SQL dans le dossier `migrations/`

### Nettoyage automatique
- Les tickets inactifs sont fermés automatiquement
- Les cooldowns expirés sont nettoyés périodiquement

## Sécurité

- Ne commitez JAMAIS vos tokens ou secrets
- Utilisez toujours les variables d'environnement Railway
- Le bot gère automatiquement les reconnexions SSL pour PostgreSQL
