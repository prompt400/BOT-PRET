import logger from '../../utils/logger.js';
import { Client, ActivityType, REST, Routes } from 'discord.js';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default {
    name: 'ready',
    once: true,
    async execute(client: Client): Promise<void> {
        if (!client.user) return;
        
        logger.info(`Bot connecté comme ${client.user.tag}`);
        
        // Déploiement automatique des commandes
        try {
            const commands = [];
            // Charger la commande ping
            const pingCommand = await import('../../commands/utility/ping.js');
            if (pingCommand.default?.data) {
                commands.push(pingCommand.default.data.toJSON());
            }

            if (commands.length > 0 && process.env.DISCORD_TOKEN && process.env.DISCORD_CLIENT_ID) {
                const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
                await rest.put(
                    Routes.applicationCommands(process.env.DISCORD_CLIENT_ID),
                    { body: commands }
                );
                logger.info(`${commands.length} commande(s) déployée(s) avec succès!`);
            }
        } catch (error) {
            logger.error('Erreur lors du déploiement des commandes:', error);
        }
        
        // Status dynamique
        client.user.setPresence({
            activities: [{
                name: `${client.guilds.cache.size} serveurs`,
                type: ActivityType.Watching
            }],
            status: 'online'
        });

        // Mise à jour du statut toutes les 5 minutes
        setInterval(() => {
            client.user?.setPresence({
                activities: [{
                    name: `${client.guilds.cache.size} serveurs`,
                    type: ActivityType.Watching
                }],
                status: 'online'
            });
        }, 5 * 60 * 1000);
    }
};
