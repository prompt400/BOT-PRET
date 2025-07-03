# Documentation API - Commandes

## Vue d'ensemble

Ce document décrit l'API des commandes du bot Discord.

## Commandes disponibles

### /status

Affiche le statut et les informations du bot.

**Permissions requises** : Aucune

**Utilisation** :
```
/status
```

**Réponse** :
- Embed contenant :
  - Temps de fonctionnement
  - Utilisation mémoire
  - Latence
  - Nombre de serveurs
  - Nombre d'utilisateurs
  - Version du bot

**Exemple de réponse** :
```
📊 Statut du Bot
⏱️ Temps de fonctionnement: 2 heures, 34 minutes
💾 Utilisation mémoire: 45 / 128 MB
📡 Latence: 42ms
🖥️ Serveurs: 5
👥 Utilisateurs: 234
📌 Version: 1.0.0
```

---

## Commandes futures

### /help (À implémenter)
Affiche l'aide et la liste des commandes

### /config (À implémenter)
Configure les paramètres du bot pour le serveur

### /stats (À implémenter)
Affiche des statistiques détaillées

### /admin (À implémenter)
Commandes d'administration du bot

---

## Structure d'une commande

Chaque commande suit cette structure :

```javascript
{
  data: SlashCommandBuilder,
  execute: async (interaction) => {},
  cooldown?: number,
  permissions?: string[],
  guildOnly?: boolean
}
```

## Gestion des erreurs

Toutes les commandes doivent :
1. Utiliser `deferReply()` pour les opérations longues
2. Gérer les erreurs avec try/catch
3. Répondre avec un message d'erreur approprié
4. Logger les erreurs pour le debugging

## Ajout de nouvelles commandes

1. Créer un fichier dans `src/commandes/`
2. Exporter un objet avec `data` et `execute`
3. La commande sera automatiquement chargée
4. Tester la commande localement
5. Documenter la commande ici
