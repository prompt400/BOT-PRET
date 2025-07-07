/**
 * @file Événement messageCreate pour les espaces de détente
 * @module evenements/messageCreateDetente
 */

import { Events } from 'discord.js';
import Logger from '../services/logger.js';
import gestionnaireDetente from '../services/gestionnaireDetente.js';
import { CONFIG_DETENTE } from '../config/detente.js';

const logger = new Logger('MessageCreateDetente');

export default {
    name: Events.MessageCreate,
    
    /**
     * Exécute l'événement messageCreate pour les espaces de détente
     * @param {import('discord.js').Message} message 
     */
    async execute(message) {
        // Ignorer les messages des bots
        if (message.author.bot) return;
        
        // Vérifier si le message est dans un salon de détente
        const salonConfig = Object.values(CONFIG_DETENTE.SALONS).find(
            config => message.channel.name === config.nom
        );
        
        if (!salonConfig) return;
        
        try {
            // Vérifier le cooldown
            const cooldownInfo = gestionnaireDetente.verifierCooldown(
                message.author.id,
                message.channel.id,
                salonConfig.cooldown
            );
            
            if (cooldownInfo.enCooldown) {
                // Supprimer le message si en cooldown
                await message.delete().catch(() => {});
                
                // Envoyer un message éphémère à l'utilisateur
                const avertissement = await message.channel.send({
                    content: `${message.author}, merci de patienter encore ${cooldownInfo.tempsRestant.toFixed(1)} secondes avant de poster un nouveau message. 🕐`,
                    allowedMentions: { users: [message.author.id] }
                });
                
                // Supprimer l'avertissement après 3 secondes
                setTimeout(() => {
                    avertissement.delete().catch(() => {});
                }, 3000);
                
                return;
            }
            
            // Vérifier les auto-réponses
            await gestionnaireDetente.verifierAutoReponse(message);
            
            // Ajouter une réaction aléatoire occasionnellement (20% de chance)
            if (Math.random() < 0.2) {
                const emoji = CONFIG_DETENTE.EMOJIS_DETENTE[
                    Math.floor(Math.random() * CONFIG_DETENTE.EMOJIS_DETENTE.length)
                ];
                await message.react(emoji).catch(() => {});
            }
            
            // Nettoyer les cooldowns périodiquement
            if (Math.random() < 0.1) {
                gestionnaireDetente.nettoyerCooldowns();
            }
            
        } catch (erreur) {
            logger.erreur('Erreur dans la gestion des messages de détente', erreur);
        }
    }
};
