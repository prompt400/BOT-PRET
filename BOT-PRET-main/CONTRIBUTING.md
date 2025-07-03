# Contributing to BOT-PRET

Nous sommes ravis que vous souhaitiez contribuer à BOT-PRET ! Ce document fournit des directives pour contribuer au projet.

## 🤝 Code de Conduite

En participant à ce projet, vous acceptez de respecter notre code de conduite : soyez respectueux, inclusif et constructif.

## 🔧 Configuration du Développement

1. **Fork le repository**
2. **Clone votre fork**
   ```bash
   git clone https://github.com/votre-username/BOT-PRET.git
   cd BOT-PRET
   ```
3. **Installer les dépendances**
   ```bash
   npm install
   ```
4. **Configurer l'environnement**
   ```bash
   cp .env.example .env
   # Éditer .env avec vos configurations
   ```

## 📝 Processus de Contribution

### 1. Créer une Issue

Avant de commencer à travailler sur une fonctionnalité ou un bug :
- Vérifiez que l'issue n'existe pas déjà
- Créez une nouvelle issue décrivant ce que vous voulez faire
- Attendez l'approbation avant de commencer

### 2. Créer une Branche

```bash
git checkout -b feature/ma-nouvelle-fonctionnalite
# ou
git checkout -b fix/correction-de-bug
```

### 3. Développer

- Suivez les conventions de code existantes
- Écrivez des tests pour votre code
- Assurez-vous que tous les tests passent
- Documentez votre code

### 4. Commit

Utilisez des messages de commit descriptifs :

```bash
git commit -m "feat: ajouter la commande /stats"
git commit -m "fix: corriger le bug de timeout dans les tickets"
git commit -m "docs: mettre à jour le README"
```

Format : `<type>: <description>`

Types :
- `feat`: Nouvelle fonctionnalité
- `fix`: Correction de bug
- `docs`: Documentation
- `style`: Formatage, point-virgules manquants, etc.
- `refactor`: Refactoring du code
- `test`: Ajout de tests
- `chore`: Maintenance, dépendances, etc.

### 5. Push et Pull Request

```bash
git push origin feature/ma-nouvelle-fonctionnalite
```

Puis créez une Pull Request sur GitHub avec :
- Un titre descriptif
- Une description détaillée des changements
- Les issues liées

## 📋 Standards de Code

### TypeScript

- Utilisez des types stricts (pas de `any`)
- Documentez les fonctions complexes avec JSDoc
- Préférez `const` et `let` à `var`
- Utilisez async/await plutôt que les callbacks

### Formatage

- Utilisez Prettier (configuration dans `.prettierrc`)
- Indentation : 2 espaces
- Guillemets simples pour les strings
- Point-virgule à la fin des instructions

### Structure

```typescript
// Bon exemple
import { SlashCommandBuilder } from 'discord.js';
import type { Command } from '../../types/Command.js';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('example')
    .setDescription('Un exemple de commande'),
  
  category: 'general',
  cooldown: 3,
  
  async execute(interaction) {
    // Logique de la commande
  },
};

export default command;
```

## 🧪 Tests

Avant de soumettre une PR :

```bash
# Lancer les tests
npm test

# Vérifier le linting
npm run lint

# Formater le code
npm run format

# Build TypeScript
npm run build
```

## 📚 Documentation

- Mettez à jour le README si nécessaire
- Documentez les nouvelles fonctionnalités
- Ajoutez des commentaires pour le code complexe
- Mettez à jour les types TypeScript

## 🚀 Review Process

1. Un mainteneur examinera votre PR
2. Des changements peuvent être demandés
3. Une fois approuvée, votre PR sera fusionnée

## ❓ Questions ?

Si vous avez des questions :
- Ouvrez une issue avec le label "question"
- Rejoignez notre serveur Discord
- Consultez la documentation existante

Merci de contribuer à BOT-PRET ! 🎉
