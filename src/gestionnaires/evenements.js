// coding: utf-8
/**
 * Gestionnaire d'événements
 * Charge et gère tous les événements Discord
 */

import { readdirSync } from 'fs';
import { pathToFileURL } from 'url';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import Logger from '../services/logger.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Classe de gestion des événements Discord
 */
export default class GestionnaireEvenements {
    constructor(client) {
        this.client = client;
        this.logger = new Logger('GestionnaireEvenements');
    }
    
    /**
     * Charge tous les événements depuis le dossier evenements
     */
    async charger() {
        try {
            this.logger.info('Chargement des événements...');
            
            const dossierEvenements = join(__dirname, '..', 'evenements');
            const fichiersEvenements = readdirSync(dossierEvenements)
                .filter(fichier => fichier.endsWith('.js'));
            
            let compteur = 0;
            
            for (const fichier of fichiersEvenements) {
                const cheminFichier = join(dossierEvenements, fichier);
                const urlFichier = pathToFileURL(cheminFichier).href;
                
                try {
                    const evenement = await import(urlFichier);
                    const evenementData = evenement.default;
                    
                    if (evenementData.once) {
                        this.client.once(evenementData.name, (...args) => 
                            evenementData.execute(...args)
                        );
                    } else {
                        this.client.on(evenementData.name, (...args) => 
                            evenementData.execute(...args)
                        );
                    }
                    
                    compteur++;
                    this.logger.info(`Événement chargé: ${evenementData.name}`);
                    
                } catch (erreur) {
                    this.logger.erreur(`Erreur lors du chargement de ${fichier}`, erreur);
                }
            }
            
            this.logger.info(`${compteur} événements chargés avec succès`);
            
        } catch (erreur) {
            this.logger.erreur('Erreur lors du chargement des événements', erreur);
            throw erreur;
        }
    }
}
