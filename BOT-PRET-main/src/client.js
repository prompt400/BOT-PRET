/**
 * Client Discord personnalisé
 * Gère l'initialisation et la configuration du bot
 */

import { Client, Collection, GatewayIntentBits, Partials } from 'discord.js';
import GestionnaireEvenements from './gestionnaires/evenements.js';
import GestionnaireCommandes from './gestionnaires/commandes.js';
import Logger from './services/logger.js';
import { CONFIGURATION } from './config/bot.js';

/**
 * Classe principale du client Discord
 * Encapsule toute la logique du bot
 */
export default class ClientDiscord {
    constructor() {
        this.logger = new Logger('ClientDiscord');
        
        // Configuration des intents et partials
        this.client = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent,
                GatewayIntentBits.GuildMembers
            ],
            partials: [
                Partials.Channel,
                Partials.GuildMember,
                Partials.Message
            ],
            ...CONFIGURATION.clientOptions
        });
        
        // Collections pour stocker les commandes
        this.client.commands = new Collection();
        this.client.cooldowns = new Collection();
        
        // Gestionnaires
        this.gestionnaireEvenements = new GestionnaireEvenements(this.client);
        this.gestionnaireCommandes = new GestionnaireCommandes(this.client);
    }
    
    /**
     * Initialise le client et se connecte à Discord
     */
    async initialiser() {
        try {
            this.logger.info('Initialisation du client Discord...');
            
            // Chargement des gestionnaires
            await this.gestionnaireEvenements.charger();
            await this.gestionnaireCommandes.charger();
            
            // Connexion à Discord
            await this.client.login(process.env.DISCORD_TOKEN);
            
            this.logger.info('Client Discord initialisé avec succès');
        } catch (erreur) {
            this.logger.erreur('Erreur lors de l\'initialisation du client', erreur);
            throw erreur;
        }
    }
    
    /**
     * Arrête proprement le client
     */
    async arreter() {
        this.logger.info('Arrêt du client Discord...');
        await this.client.destroy();
        this.logger.info('Client Discord arrêté');
    }
}
