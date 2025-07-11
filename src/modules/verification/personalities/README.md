# Système de Personnalités du Bot

## Vue d'ensemble

Le système de personnalités permet au bot d'adapter ses messages et son comportement selon différents styles prédéfinis. Chaque personnalité a ses propres variations de messages selon le mode NSFW et peut s'adapter au profil du membre.

## Personnalités disponibles

### 1. **DominantPersonality** (Autoritaire)
- **Style** : Commandant, strict, exigeant
- **Emojis** : 🔥, 👑, ⛓️, 🖤, 💪, 🗿
- **Adaptation** : Réagit différemment face aux pseudos dominants/soumis

### 2. **PlayfulPersonality** (Taquine)
- **Style** : Enjoué, coquin, amusant
- **Emojis** : 😏, 🔥, 😈, 💋, 🍑, 🌶️
- **Adaptation** : Plus affectueux avec les pseudos mignons

### 3. **SoftPersonality** (Douce)
- **Style** : Bienveillant, tendre, encourageant
- **Emojis** : 🌸, 💕, 🌹, 💖, 🌷, 💝
- **Adaptation** : Messages personnalisés selon le genre détecté

## Utilisation

```javascript
const { getPersonality, getAllPersonalities } = require('./personalities');

// Obtenir une personnalité spécifique
const dominantBot = getPersonality('dominant');

// Obtenir un message
const welcomeMessage = dominantBot.getMessage('welcome', member, nsfw = true);

// Créer un embed personnalisé
const embed = dominantBot.getEmbed(
    'Titre',
    'Description du message',
    0xFF0000, // Couleur
    member
);
```

## Types de messages

Chaque personnalité possède 4 types de messages avec 20+ variations :

- **welcome** : Messages d'accueil pour les nouveaux membres
- **success** : Messages de félicitations et d'encouragement
- **error** : Messages d'erreur ou d'échec
- **waiting** : Messages d'attente ou de patience

## Détection de profil

Le système détecte automatiquement :

- **Pseudos mignons** : uwu, owo, nya, chan, kawaii, emojis cœurs
- **Pseudos dominants** : master, mistress, boss, king, queen, alpha
- **Pseudos soumis** : sub, pet, kitten, puppy, toy, little
- **Genre probable** : Basé sur certains mots-clés dans le pseudo

## Mode NSFW

Chaque personnalité a deux ensembles de messages :
- **SFW** : Messages appropriés pour tous les salons
- **NSFW** : Messages plus suggestifs pour les salons adultes

## Extension du système

Pour ajouter une nouvelle personnalité :

1. Créer une classe qui étend `BasePersonality`
2. Implémenter la méthode `getMessage(type, member, nsfw)`
3. Définir les emojis et le style
4. Ajouter au moins 20 messages par type et par mode
5. L'ajouter dans l'index

```javascript
class NewPersonality extends BasePersonality {
    constructor() {
        super();
        this.emojis = ['🎭', '✨'];
        this.style = 'mystérieux';
    }
    
    getMessage(type, member, nsfw = false) {
        // Implémentation des messages
    }
}
```

## Méthodes communes (BasePersonality)

- `getMessage(type, member, nsfw)` : Obtenir un message aléatoire
- `getEmbed(title, description, color, member)` : Créer un embed Discord
- `adaptMessageToProfile(message, member)` : Adapter le message au profil
- `detectCuteUsername(username)` : Détecter un pseudo mignon
- `detectDominantUsername(username)` : Détecter un pseudo dominant
- `detectSubmissiveUsername(username)` : Détecter un pseudo soumis
- `detectProbableGender(member)` : Détecter le genre probable
- `getRandomMessage(messages)` : Sélectionner un message aléatoire
