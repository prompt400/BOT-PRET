import { Client, Collection } from 'discord.js';
import { readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Command, CommandMeta } from '../types/commands.js';
import { CommandHandler as ICommandHandler, HandlerOptions } from '../types/handlers.js';
import logger from '../utils/logger.js';

export class CommandHandler implements ICommandHandler {
    public readonly commands: Collection<string, Command>;
    private readonly client: Client;
    private readonly directory: string;

    constructor(options: HandlerOptions) {
        this.client = options.client;
        this.directory = options.directory;
        this.commands = new Collection();
    }

    public async init(): Promise<void> {
        await this.loadCommands();
    }

    public async loadCommands(path = this.directory): Promise<void> {
        const commandFiles = this.getFiles(path);
        
        for (const file of commandFiles) {
            try {
                if (file.endsWith('.test.ts') || file.endsWith('.test.js')) continue;
                
                const { default: command } = await import(`file://${file}`);
                const meta = this.getCommandMeta(file);

                if (!command.data || !command.execute) {
                    logger.warn(`Commande invalide ignorée: ${file}`);
                    continue;
                }

                command.category = meta.category;
                this.commands.set(command.data.name, command);
                logger.info(`Commande chargée: ${command.data.name} (${meta.category})`);
            } catch (error) {
                logger.error(`Erreur lors du chargement de la commande ${file}:`, error);
            }
        }
    }

    public async reloadCommand(commandName: string): Promise<void> {
        const command = this.commands.get(commandName);
        if (!command) {
            throw new Error(`Commande "${commandName}" non trouvée`);
        }

        // Supprime la commande du cache
        this.commands.delete(commandName);
        delete require.cache[require.resolve(command.meta?.path)];

        // Recharge la commande
        await this.loadCommands();
        logger.info(`Commande rechargée: ${commandName}`);
    }

    private getFiles(path: string): string[] {
        const files: string[] = [];
        const items = readdirSync(path, { withFileTypes: true });

        for (const item of items) {
            const fullPath = join(path, item.name);
            if (item.isDirectory()) {
                files.push(...this.getFiles(fullPath));
            } else if (item.name.endsWith('.ts') || item.name.endsWith('.js')) {
                files.push(fullPath);
            }
        }

        return files;
    }

    private getCommandMeta(filePath: string): CommandMeta {
        const relativePath = filePath.replace(this.directory, '');
        const parts = relativePath.split(/[\\/]/);
        const name = parts.pop()?.replace(/\.(ts|js)$/, '') ?? '';
        const category = parts[0] ?? 'misc';

        return {
            name,
            category,
            path: filePath
        };
    }
}
