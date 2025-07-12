import { REST, Routes } from 'discord.js';
import { readdirSync, statSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import logger from '../utils/logger.js';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, '..');

interface CommandData {
    name: string;
    description: string;
    options?: any[];
}

export class CommandDeployer {
    private rest: REST;
    private clientId: string;
    private token: string;
    private commands: CommandData[] = [];

    constructor() {
        this.token = process.env.DISCORD_TOKEN || '';
        this.clientId = process.env.DISCORD_CLIENT_ID || '';
        
        if (!this.token || !this.clientId) {
            throw new Error('DISCORD_TOKEN et DISCORD_CLIENT_ID doivent être définis');
        }

        this.rest = new REST({ version: '10' }).setToken(this.token);
    }

    private async loadCommands(dir: string = join(__dirname, '../commands')): Promise<void> {
        const files = readdirSync(dir);

        for (const file of files) {
            const filePath = join(dir, file);
            const stat = statSync(filePath);

            if (stat.isDirectory()) {
                await this.loadCommands(filePath);
            } else if ((file.endsWith('.ts') || file.endsWith('.js')) && 
                      !file.includes('.test.') && 
                      !file.includes('index.')) {
                try {
                    const { default: command } = await import(`file://${filePath}`);
                    
                    if (command?.data) {
                        this.commands.push(command.data.toJSON());
                        logger.info(`Commande chargée: ${command.data.name}`);
                    }
                } catch (error) {
                    logger.error(`Erreur lors du chargement de ${file}:`, error);
                }
            }
        }
    }

    public async deployGlobal(): Promise<void> {
        try {
            await this.loadCommands();
            
            logger.info(`Déploiement de ${this.commands.length} commandes globalement...`);
            
            const data = await this.rest.put(
                Routes.applicationCommands(this.clientId),
                { body: this.commands }
            ) as any[];

            logger.info(`✅ ${data.length} commandes déployées avec succès!`);
        } catch (error) {
            logger.error('Erreur lors du déploiement global:', error);
            throw error;
        }
    }

    public async deployToGuild(guildId: string): Promise<void> {
        try {
            await this.loadCommands();
            
            logger.info(`Déploiement de ${this.commands.length} commandes sur le serveur ${guildId}...`);
            
            const data = await this.rest.put(
                Routes.applicationGuildCommands(this.clientId, guildId),
                { body: this.commands }
            ) as any[];

            logger.info(`✅ ${data.length} commandes déployées sur le serveur!`);
        } catch (error) {
            logger.error('Erreur lors du déploiement sur le serveur:', error);
            throw error;
        }
    }

    public async deleteAllCommands(guildId?: string): Promise<void> {
        try {
            const route = guildId 
                ? Routes.applicationGuildCommands(this.clientId, guildId)
                : Routes.applicationCommands(this.clientId);

            await this.rest.put(route, { body: [] });
            
            logger.info(`✅ Toutes les commandes supprimées ${guildId ? `du serveur ${guildId}` : 'globalement'}`);
        } catch (error) {
            logger.error('Erreur lors de la suppression des commandes:', error);
            throw error;
        }
    }
}

// Script CLI
if (import.meta.url === `file://${process.argv[1]}`) {
    const deployer = new CommandDeployer();
    const args = process.argv.slice(2);
    const command = args[0];
    const guildId = args[1];

    (async () => {
        try {
            switch (command) {
                case 'global':
                    await deployer.deployGlobal();
                    break;
                case 'guild':
                    if (!guildId) {
                        console.error('ID du serveur requis: npm run deploy guild <guildId>');
                        process.exit(1);
                    }
                    await deployer.deployToGuild(guildId);
                    break;
                case 'delete':
                    await deployer.deleteAllCommands(guildId);
                    break;
                default:
                    console.log('Usage:');
                    console.log('  npm run deploy global         - Déployer globalement');
                    console.log('  npm run deploy guild <id>     - Déployer sur un serveur');
                    console.log('  npm run deploy delete         - Supprimer toutes les commandes');
                    console.log('  npm run deploy delete <id>    - Supprimer les commandes d\'un serveur');
            }
        } catch (error) {
            logger.error('Erreur fatale:', error);
            process.exit(1);
        }
    })();
}

export default CommandDeployer;
