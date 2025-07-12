const { Client, GatewayIntentBits, Collection, REST, Routes, ActivityType } = require('discord.js');
const { readdirSync } = require('node:fs');
const { join } = require('node:path');
require('dotenv').config();

// Configuration
const config = {
    token: process.env.DISCORD_TOKEN,
    clientId: process.env.DISCORD_CLIENT_ID
};

// Validation de l'environnement
if (!config.token || !config.clientId) {
    console.error('[ERREUR] Variables d\'environnement manquantes.');
    process.exit(1);
}

// Initialisation du client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.commands = new Collection();

// Chargement des commandes
const loadCommands = () => {
    const commandsPath = join(__dirname, 'commands');
    const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    
    for (const file of commandFiles) {
        const command = require(join(commandsPath, file));
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
            console.log(`[✓] Commande chargée: ${command.data.name}`);
        }
    }
};

// Déploiement des commandes
async function deployCommands() {
    const commands = Array.from(client.commands.values()).map(cmd => cmd.data.toJSON());
    const rest = new REST({ version: '10' }).setToken(config.token);

    try {
        console.log('[...] Déploiement des commandes...');
        await rest.put(
            Routes.applicationCommands(config.clientId),
            { body: commands }
        );
        console.log(`[✓] ${commands.length} commande(s) déployée(s)`);
    } catch (error) {
        console.error('[X] Erreur de déploiement:', error);
    }
}

// Événements
client.once('ready', async () => {
    console.log(`[✓] Connecté en tant que ${client.user.tag}`);
    console.log(`[✓] Actif sur ${client.guilds.cache.size} serveur(s)`);
    
    client.user.setActivity('/ping', { type: ActivityType.Playing });
    
    loadCommands();
    await deployCommands();
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;
    
    const command = client.commands.get(interaction.commandName);
    if (!command) return;
    
    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(`[X] Erreur commande ${interaction.commandName}:`, error);
        const reply = { content: 'Une erreur est survenue.', ephemeral: true };
        
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp(reply);
        } else {
            await interaction.reply(reply);
        }
    }
});

// Gestion d'erreurs
process.on('unhandledRejection', error => {
    console.error('[X] Erreur non gérée:', error);
});

// Connexion
client.login(config.token);
