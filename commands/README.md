# Structure des Commandes

## Format d'une commande

Chaque commande doit être un fichier JavaScript séparé dans ce dossier et exporter un objet avec les propriétés suivantes :

```javascript
module.exports = {
    data: new SlashCommandBuilder()
        .setName('nom_commande')
        .setDescription('Description de la commande'),
    
    async execute(interaction) {
        // Logique de la commande ici
    }
};
```

## Propriétés requises

- **data** : Un objet `SlashCommandBuilder` de discord.js qui définit les métadonnées de la commande
- **execute** : Une fonction asynchrone qui sera appelée quand la commande est exécutée

## Exemple de commande avec options

```javascript
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('salut')
        .setDescription('Dit bonjour à quelqu\'un')
        .addUserOption(option =>
            option.setName('utilisateur')
                .setDescription('L\'utilisateur à saluer')
                .setRequired(false)),
    
    async execute(interaction) {
        const user = interaction.options.getUser('utilisateur') || interaction.user;
        await interaction.reply(`Bonjour ${user} ! 👋`);
    }
};
```

## Bonnes pratiques

1. **Gestion des erreurs** : Toujours utiliser try/catch dans les fonctions execute
2. **Réponses différées** : Pour les opérations longues, utiliser `interaction.deferReply()`
3. **Permissions** : Vérifier les permissions nécessaires avant d'exécuter des actions sensibles
4. **Validation** : Valider les entrées utilisateur avant de les traiter

## Ajout d'une nouvelle commande

1. Créer un nouveau fichier `.js` dans ce dossier
2. Suivre la structure définie ci-dessus
3. Redémarrer le bot pour charger la nouvelle commande
