require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { readdirSync } = require('node:fs');
const { join } = require('node:path');

// Initialisation du client
const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

client.commands = new Collection();

// Chargement des commandes
readdirSync(join(__dirname, 'commands'))
    .filter(file => file.endsWith('.js'))
    .forEach(file => {
        const command = require(join(__dirname, 'commands', file));
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
            console.log(`[✓] Commande chargée: ${command.data.name}`);
        }
    });

// Gestion des interactions
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({
            content: 'Une erreur est survenue.',
            ephemeral: true
        }).catch(() => {});
    }
});

// Événement ready
client.once('ready', () => {
    console.log(`[✓] Connecté en tant que ${client.user.tag}`);
});

// Connexion
client.login(process.env.DISCORD_TOKEN);
