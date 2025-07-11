const { Client, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Initialisation du client Discord avec les intents nécessaires
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates
    ]
});

// Collection pour stocker les commandes
client.commands = new Collection();

// Fonction de logging
const log = {
    info: (message) => console.log(`[INFO] ${new Date().toISOString()} - ${message}`),
    error: (message) => console.error(`[ERROR] ${new Date().toISOString()} - ${message}`),
    warn: (message) => console.warn(`[WARN] ${new Date().toISOString()} - ${message}`),
    success: (message) => console.log(`[SUCCESS] ${new Date().toISOString()} - ${message}`)
};

// Chargement des commandes
const loadCommands = async () => {
    const commandsPath = path.join(__dirname, 'commands');
    
    // Créer le dossier commands s'il n'existe pas
    if (!fs.existsSync(commandsPath)) {
        fs.mkdirSync(commandsPath, { recursive: true });
        log.info('Dossier commands créé');
    }

    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        try {
            const command = require(filePath);
            
            // Vérification de la structure de la commande
            if ('data' in command && 'execute' in command) {
                client.commands.set(command.data.name, command);
                log.info(`Commande chargée: ${command.data.name}`);
            } else {
                log.warn(`La commande ${file} n'a pas la structure requise (data et execute)`);
            }
        } catch (error) {
            log.error(`Erreur lors du chargement de la commande ${file}: ${error.message}`);
        }
    }
};

// Déploiement des commandes slash
const deployCommands = async () => {
    const commands = [];
    client.commands.forEach(command => {
        commands.push(command.data.toJSON());
    });

    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

    try {
        log.info('Déploiement des commandes slash...');
        
        // Déploiement global
        await rest.put(
            Routes.applicationCommands(process.env.DISCORD_CLIENT_ID),
            { body: commands }
        );
        
        log.success(`${commands.length} commandes slash déployées avec succès`);
    } catch (error) {
        log.error(`Erreur lors du déploiement des commandes: ${error.message}`);
    }
};

// Gestionnaire d'événements - Bot prêt
client.once('ready', async () => {
    log.success(`Bot connecté en tant que ${client.user.tag}`);
    log.info(`Présent sur ${client.guilds.cache.size} serveur(s)`);
    
    // Définir le statut du bot
    client.user.setActivity('les commandes slash', { type: 2 }); // 2 = LISTENING
    
    // Charger et déployer les commandes
    await loadCommands();
    await deployCommands();
});

// Gestionnaire d'événements - Interaction (commandes slash)
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;
    
    const command = client.commands.get(interaction.commandName);
    
    if (!command) {
        log.warn(`Commande inconnue: ${interaction.commandName}`);
        return;
    }
    
    try {
        log.info(`Commande exécutée: ${interaction.commandName} par ${interaction.user.tag}`);
        await command.execute(interaction);
    } catch (error) {
        log.error(`Erreur lors de l'exécution de ${interaction.commandName}: ${error.message}`);
        
        // Réponse d'erreur à l'utilisateur
        const errorMessage = {
            content: '❌ Une erreur est survenue lors de l\'exécution de cette commande.',
            ephemeral: true
        };
        
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp(errorMessage);
        } else {
            await interaction.reply(errorMessage);
        }
    }
});

// Gestion des erreurs non capturées
process.on('unhandledRejection', error => {
    log.error(`Erreur non gérée: ${error.message}`);
    console.error(error);
});

process.on('uncaughtException', error => {
    log.error(`Exception non capturée: ${error.message}`);
    console.error(error);
    process.exit(1);
});

// Connexion du bot
const login = async () => {
    try {
        if (!process.env.DISCORD_TOKEN) {
            throw new Error('DISCORD_TOKEN non défini dans le fichier .env');
        }
        
        if (!process.env.DISCORD_CLIENT_ID) {
            throw new Error('DISCORD_CLIENT_ID non défini dans le fichier .env');
        }
        
        await client.login(process.env.DISCORD_TOKEN);
    } catch (error) {
        log.error(`Erreur de connexion: ${error.message}`);
        process.exit(1);
    }
};

// Démarrage du bot
login();

// Export du client pour utilisation dans d'autres modules si nécessaire
module.exports = { client, log };
