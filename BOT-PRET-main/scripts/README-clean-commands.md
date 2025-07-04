# Guide de nettoyage des commandes Discord

Ce guide explique comment utiliser le script de nettoyage pour supprimer toutes les commandes fantômes Discord et ne conserver que `/status`.

## Pourquoi ce script ?

Discord conserve parfois des commandes obsolètes dans son cache, même après qu'elles aient été supprimées du code. Cela peut créer de la confusion avec des commandes qui apparaissent mais ne fonctionnent pas.

## Prérequis

1. Variables d'environnement configurées :
   - `DISCORD_TOKEN` : Token du bot Discord
   - `DISCORD_CLIENT_ID` : ID client du bot Discord

2. Node.js 18+ installé

## Utilisation

### Méthode 1 : Via npm script (recommandé)
```bash
npm run clean-commands
```

### Méthode 2 : Exécution directe
```bash
node scripts/clean-commands.js
```

## Ce que fait le script

1. **Récupère toutes les commandes** enregistrées globalement
2. **Liste tous les serveurs** où le bot est présent
3. **Supprime toutes les commandes** (globales et par serveur)
4. **Ré-enregistre uniquement** la commande `/status`

## Résultat attendu

Après l'exécution :
- ✅ Toutes les anciennes commandes sont supprimées
- ✅ Seule `/status` est disponible
- ✅ Plus de commandes fantômes

## Notes importantes

⚠️ **Cache Discord** : Discord peut prendre jusqu'à 1 heure pour actualiser son cache. Pour forcer l'actualisation :
- Redémarrez Discord (Ctrl+R sur Windows/Linux, Cmd+R sur Mac)
- Ou attendez la propagation naturelle

⚠️ **Permissions** : Le script nécessite les permissions d'administration des commandes slash

## En cas d'erreur

Si vous obtenez une erreur :

1. **"Variables d'environnement manquantes"** : Vérifiez que `.env` contient `DISCORD_TOKEN` et `DISCORD_CLIENT_ID`
2. **"Unauthorized"** : Vérifiez que le token est valide
3. **"Missing Access"** : Le bot n'a pas les permissions nécessaires sur le serveur

## Commande finale disponible

Après le nettoyage, seule cette commande sera disponible :

- `/status` : Affiche le statut et les informations du bot
