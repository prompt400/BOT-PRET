const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { readdirSync } = require('node:fs');
const { join } = require('node:path');
const config = require('./config/config');
const logger = require('./utils/logger');

// Initialisation du client avec les intents configurés
const client = new Client({
    intents: config.intents.map(intent => GatewayIntentBits[intent])
});

// Collections pour stocker les commandes et événements
client.commands = new Collection();

// Chargement des commandes
const loadCommands = () => {
    const commandsPath = join(__dirname, 'commands');
    const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    
    for (const file of commandFiles) {
        const filePath = join(commandsPath, file);
        const command = require(filePath);

        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
            logger.info(`Commande chargée: ${command.data.name}`);
        } else {
            logger.warn(`La commande ${filePath} manque de propriétés requises`);
        }
    }
};

// Chargement des événements
const loadEvents = () => {
    const eventsPath = join(__dirname, 'events');
    const eventFiles = readdirSync(eventsPath).filter(file => file.endsWith('.js'));

    for (const file of eventFiles) {
        const filePath = join(eventsPath, file);
        const event = require(filePath);

        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args));
        } else {
            client.on(event.name, (...args) => event.execute(...args));
        }
        logger.info(`Événement chargé: ${event.name}`);
    }
};

// Gestion des erreurs non gérées
process.on('unhandledRejection', error => {
    logger.error('Erreur non gérée:', error);
});

process.on('uncaughtException', error => {
    logger.error('Exception non attrapée:', error);
    process.exit(1);
});

// Initialisation du bot
const initializeBot = async () => {
    try {
        // Chargement des commandes et événements
        loadCommands();
        loadEvents();

        // Connexion du bot
        await client.login(config.bot.token);
        logger.info(`Bot connecté en tant que ${client.user.tag}`);
    } catch (error) {
        logger.error('Erreur lors de l\'initialisation du bot:', error);
        process.exit(1);
    }
};

// Démarrage du bot
initializeBot();
