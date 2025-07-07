# Guide du Système d'Onboarding

## 🎯 Objectif
Le système d'onboarding est conçu pour accueillir les nouveaux membres et leur permettre de comprendre la structure du serveur en moins de 2 minutes.

## 🚀 Fonctionnalités

### 1. **Salon d'Introduction avec Embed Illustré**
- Message de bienvenue personnalisé avec l'avatar du membre
- Guide en 4 étapes clair et visuel
- Couleurs et emojis pour une meilleure lisibilité

### 2. **Menus d'Orientation Interactifs**
- Menu de sélection permettant de choisir jusqu'à 3 rôles
- Boutons d'action pour :
  - Démarrer le tour guidé
  - Passer l'introduction
  - Demander de l'aide

### 3. **Tour Guidé Automatique**
- 5 étapes de présentation
- Durée totale : 2 minutes
- Messages contextualisés avec timing automatique

### 4. **Système de Badges**
- **Premier pas** : Attribué au choix du premier rôle
- **Tour complet** : Attribué à la fin du tour guidé
- **Onboarding complet** : Attribué une fois tout le processus terminé

### 5. **Messages Contextualisés**
- Guides privés envoyés en MP
- Guides spécifiques par rôle choisi
- Rappels automatiques pour les membres inactifs

## 📋 Configuration

### Variables d'Environnement Requises
```env
# IDs des rôles Discord
ROLE_GAMING_ID=123456789
ROLE_ART_ID=123456789
ROLE_MUSIC_ID=123456789
ROLE_TECH_ID=123456789
ROLE_MEDIA_ID=123456789
ROLE_NOUVEAU_ID=123456789
```

### Salons Requis
- `#bienvenue` ou `#welcome` : Salon principal d'accueil
- `#regles` : Salon des règles du serveur
- `#presentation` : Salon pour se présenter
- `#general` : Salon de discussion général

## 🛠️ Utilisation

### Pour les Administrateurs

#### Commande `/onboarding`
- `/onboarding test` : Teste le système sur vous-même
- `/onboarding simuler @membre` : Simule l'onboarding pour un membre
- `/onboarding configurer` : Affiche la configuration actuelle

### Pour les Nouveaux Membres

1. **À l'arrivée** :
   - Réception automatique du message de bienvenue
   - Guide privé envoyé en MP
   - Rôle "Nouveau" attribué après 5 secondes

2. **Choix des rôles** :
   - Sélection via le menu déroulant
   - Maximum 3 rôles
   - Accès immédiat aux salons correspondants

3. **Tour guidé** (optionnel) :
   - Cliquer sur "🚀 Commencer la visite"
   - 5 étapes de 5-10 secondes chacune
   - Badge "Tour complet" à la fin

## 🎨 Personnalisation

### Modifier les Rôles Disponibles
Éditez le fichier `src/config/onboarding.js` :
```javascript
roleMenu: {
    options: [
        {
            label: "🎮 Gaming",
            description: "Accès aux salons de jeux",
            value: "role_gaming",
            emoji: "🎮"
        },
        // Ajoutez vos rôles ici
    ]
}
```

### Modifier les Messages
Les messages sont configurables dans :
- `contextualMessages` : Messages de feedback
- `tourSteps` : Étapes du tour guidé
- `roleGuides` : Guides spécifiques par rôle

### Ajuster les Timings
```javascript
settings: {
    tourDuration: 120000,    // Durée totale du tour (ms)
    autoRoleDelay: 5000,     // Délai attribution rôle "Nouveau"
    reminderDelay: 60000     // Délai avant rappel
}
```

## 📊 Flux de l'Onboarding

```
Nouveau Membre
    ↓
Message de Bienvenue + Guide MP
    ↓
Attribution Rôle "Nouveau" (5s)
    ↓
┌─────────────┬──────────────┐
│ Tour Guidé  │ Choix Rôles  │
│ (optionnel) │ (1-3 rôles)  │
└─────────────┴──────────────┘
    ↓           ↓
Badge Tour   Badge Premier Pas
    ↓           ↓
    └─────┬─────┘
          ↓
  Badge Onboarding
      Complet
```

## 🔧 Dépannage

### Le système ne se déclenche pas
- Vérifiez que le bot a les permissions nécessaires
- Assurez-vous que les salons existent
- Contrôlez les logs pour les erreurs

### Les rôles ne s'attribuent pas
- Vérifiez les IDs dans les variables d'environnement
- Assurez-vous que le bot est au-dessus des rôles à attribuer
- Vérifiez les permissions du bot

### Les MP ne s'envoient pas
- Le membre a peut-être désactivé les MP
- Vérifiez les paramètres de confidentialité du serveur

## 🚦 Bonnes Pratiques

1. **Testez régulièrement** le système avec `/onboarding test`
2. **Personnalisez** les messages selon votre communauté
3. **Gardez le tour court** (< 2 minutes)
4. **Utilisez des emojis** pour la clarté visuelle
5. **Mettez à jour** les guides selon l'évolution du serveur

## 📈 Métriques de Succès

- Temps moyen de complétion : < 2 minutes
- Taux de choix de rôles : > 80%
- Taux de complétion du tour : > 50%
- Satisfaction des nouveaux membres
