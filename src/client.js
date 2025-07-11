// coding: utf-8
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
        this.tentativesReconnexion = 0;
        this.maxTentativesReconnexion = 5;
        this.delaiReconnexion = 5000; // 5 secondes
        
        // Configuration des intents et partials
        this.client = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent,
                GatewayIntentBits.GuildMembers,
                GatewayIntentBits.GuildMessageReactions,
                GatewayIntentBits.GuildVoiceStates
            ],
            partials: [
                Partials.Channel,
                Partials.GuildMember,
                Partials.Message
            ],
            // Configuration pour la stabilité en production
            restRequestTimeout: 60000,
            retryLimit: 3,
            presence: {
                status: 'online',
                activities: [{
                    name: 'Commandes slash',
                    type: 2 // LISTENING
                }]
            },
            ...CONFIGURATION.clientOptions
        });
        
        // Collections pour stocker les commandes
        this.client.commands = new Collection();
        this.client.cooldowns = new Collection();
        
        // Gestionnaires
        this.gestionnaireEvenements = new GestionnaireEvenements(this.client);
        this.gestionnaireCommandes = new GestionnaireCommandes(this.client);
        
        
        // Configuration des écouteurs d'erreurs
        this.configurerGestionErreurs();
    }
    
    /**
     * Initialise le client et se connecte à Discord
     */
    async initialiser() {
        this.logger.debutOperation('Initialisation du client Discord');
        
        try {
            // ÉTAPE 1: Chargement des événements
            this.logger.etape('Chargement des gestionnaires d\'événements');
            try {
                await this.gestionnaireEvenements.charger();
                this.logger.succes('Gestionnaire d\'événements chargé');
            } catch (erreur) {
                this.logger.erreur('Échec du chargement des événements', erreur);
                throw erreur;
            }
            
            // ÉTAPE 2: Chargement des commandes
            this.logger.etape('Chargement des commandes slash');
            try {
                await this.gestionnaireCommandes.charger();
                this.logger.succes('Commandes slash chargées');
            } catch (erreur) {
                this.logger.erreur('Échec du chargement des commandes', erreur);
                throw erreur;
            }
            
            // ÉTAPE 3: Connexion à Discord
            this.logger.etape('Connexion à Discord...');
            try {
                await this.client.login(process.env.DISCORD_TOKEN);
                this.logger.succes('Connexion à Discord établie');
            } catch (erreur) {
                this.logger.erreur('Échec de la connexion à Discord', erreur);
                throw erreur;
            }
            
            this.logger.finOperation('Initialisation du client Discord', true);
        } catch (erreur) {
            this.logger.finOperation('Initialisation du client Discord', false);
            throw erreur;
        }
    }
    
    /**
     * Configure la gestion avancée des erreurs
     */
    configurerGestionErreurs() {
        // Gestion des erreurs WebSocket
        this.client.on('error', (erreur) => {
            this.logger.erreur('Erreur Discord.js', erreur);
        });
        
        // Gestion des avertissements
        this.client.on('warn', (avertissement) => {
            this.logger.avertissement('Avertissement Discord.js', avertissement);
        });
        
        // Gestion de la déconnexion
        this.client.on('disconnect', () => {
            this.logger.avertissement('Déconnexion détectée');
            this.tenterReconnexion();
        });
        
        // Gestion des erreurs de shard
        this.client.on('shardError', (erreur, shardId) => {
            this.logger.erreur(`Erreur sur le shard ${shardId}`, erreur);
        });
        
        // Gestion de la reconnexion
        this.client.on('shardReconnecting', (shardId) => {
            this.logger.info(`Reconnexion du shard ${shardId}...`);
        });
        
        // Gestion de la reprise
        this.client.on('shardResume', (shardId, replayedEvents) => {
            this.logger.info(`Shard ${shardId} reconnecté, ${replayedEvents} événements rejoués`);
            this.tentativesReconnexion = 0;
        });
        
        // Gestion du rate limit
        this.client.rest.on('rateLimited', (info) => {
            this.logger.avertissement(`Rate limit atteint: ${info.timeout}ms sur ${info.path}`);
        });
    }
    
    /**
     * Tente de reconnecter le bot après une déconnexion
     */
    async tenterReconnexion() {
        if (this.tentativesReconnexion >= this.maxTentativesReconnexion) {
            this.logger.erreur('Nombre maximum de tentatives de reconnexion atteint');
            process.exit(1);
        }
        
        this.tentativesReconnexion++;
        const delai = this.delaiReconnexion * this.tentativesReconnexion;
        
        this.logger.info(`Tentative de reconnexion ${this.tentativesReconnexion}/${this.maxTentativesReconnexion} dans ${delai}ms`);
        
        setTimeout(async () => {
            try {
                await this.client.login(process.env.DISCORD_TOKEN);
                this.logger.info('Reconnexion réussie');
                this.tentativesReconnexion = 0;
            } catch (erreur) {
                this.logger.erreur('Erreur lors de la reconnexion', erreur);
                this.tenterReconnexion();
            }
        }, delai);
    }
    
    /**
     * Arrête proprement le client
     */
    async arreter() {
        this.logger.info('Arrêt du client Discord...');
        
        
        // Nettoyer les écouteurs pour éviter les fuites mémoire
        this.client.removeAllListeners();
        
        // Détruire le client
        await this.client.destroy();
        
        this.logger.info('Client Discord arrêté proprement');
    }
}
