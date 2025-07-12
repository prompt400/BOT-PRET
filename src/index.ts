import 'dotenv/config';
import { Client, GatewayIntentBits, Collection, ChatInputCommandInteraction } from 'discord.js';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, '..');

interface BotClient extends Client {
    commands: Collection<string, Command>;
}

interface Command {
    data: {
        name: string;
        description: string;
    };
    execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}


const client = new Client({
    intents: [GatewayIntentBits.Guilds]
}) as BotClient;

client.commands = new Collection<string, Command>();

// Chargement des commandes
const loadCommands = async () => {
    const commandFiles = readdirSync(join(__dirname, 'commands'))
        .filter(file => file.endsWith('.js') && !file.endsWith('.test.js'));
    
    for (const file of commandFiles) {
        const { default: command } = await import(`./commands/${file}`);
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
            console.log(`[✓] Commande chargée: ${command.data.name}`);
        }
    }
};

// Appel de la fonction de chargement
loadCommands();

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
console.log(`[✓] Connecté en tant que ${client.user?.tag}`);
});

// Connexion
client.login(process.env.DISCORD_TOKEN);
