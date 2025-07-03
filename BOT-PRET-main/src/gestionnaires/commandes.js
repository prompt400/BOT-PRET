/**
 * Gestionnaire de commandes
 * Charge et gère toutes les commandes slash du bot
 */

import { REST, Routes } from 'discord.js';
import { readdirSync } from 'fs';
import { pathToFileURL } from 'url';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import Logger from '../services/logger.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Classe de gestion des commandes Discord
 */
export default class GestionnaireCommandes {
    constructor(client) {
        this.client = client;
        this.logger = new Logger('GestionnaireCommandes');
        this.rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    }
    
    /**
     * Charge toutes les commandes depuis le dossier commandes
     */
    async charger() {
        try {
            this.logger.info('Chargement des commandes...');
            
            const dossierCommandes = join(__dirname, '..', 'commandes');
            const fichiersCommandes = readdirSync(dossierCommandes)
                .filter(fichier => fichier.endsWith('.js'));
            
            const commandes = [];
            
            for (const fichier of fichiersCommandes) {
                const cheminFichier = join(dossierCommandes, fichier);
                const urlFichier = pathToFileURL(cheminFichier).href;
                
                try {
                    const commande = await import(urlFichier);
                    const commandeData = commande.default;
                    
                    if ('data' in commandeData && 'execute' in commandeData) {
                        this.client.commands.set(commandeData.data.name, commandeData);
                        commandes.push(commandeData.data.toJSON());
                        this.logger.info(`Commande chargée: ${commandeData.data.name}`);
                    } else {
                        this.logger.avertissement(`La commande ${fichier} est mal formée`);
                    }
                } catch (erreur) {
                    this.logger.erreur(`Erreur lors du chargement de ${fichier}`, erreur);
                }
            }
            
            // Enregistrement des commandes globales
            await this.enregistrerCommandes(commandes);
            
            this.logger.info(`${commandes.length} commandes chargées avec succès`);
            
        } catch (erreur) {
            this.logger.erreur('Erreur lors du chargement des commandes', erreur);
            throw erreur;
        }
    }
    
    /**
     * Enregistre les commandes sur Discord
     * @param {Array} commandes Liste des commandes à enregistrer
     */
    async enregistrerCommandes(commandes) {
        try {
            this.logger.info('Enregistrement des commandes sur Discord...');
            
            await this.rest.put(
                Routes.applicationCommands(process.env.DISCORD_CLIENT_ID),
                { body: commandes }
            );
            
            this.logger.info('Commandes enregistrées avec succès');
        } catch (erreur) {
            this.logger.erreur('Erreur lors de l\'enregistrement des commandes', erreur);
            throw erreur;
        }
    }
}
